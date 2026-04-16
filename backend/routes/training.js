// Training & Development Routes
const express = require('express');
const router = express.Router();
const pool = require('../database/connection');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get all training enrollments (paginated, filtered)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, employee_id, status } = req.query;
    const offset = (page - 1) * limit;
    const user = req.user;

    let query = `SELECT t.*, e.first_name, e.last_name
                 FROM TRAINING_ENROLLMENT t
                 JOIN EMPLOYEE e ON t.employee_id = e.id
                 WHERE 1=1`;
    let countQuery = 'SELECT COUNT(*) FROM TRAINING_ENROLLMENT WHERE 1=1';
    const params = [];

    // Role-based filtering
    if (user.role === 'EMPLOYEE') {
      query += ` AND t.employee_id = $${params.length + 1}`;
      countQuery += ` AND employee_id = $${params.length + 1}`;
      params.push(user.employeeId);
    }

    if (employee_id) {
      query += ` AND t.employee_id = $${params.length + 1}`;
      countQuery += ` AND employee_id = $${params.length + 1}`;
      params.push(employee_id);
    }

    if (status) {
      query += ` AND t.status = $${params.length + 1}`;
      countQuery += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY t.start_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const [trainingResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2)),
    ]);

    res.json({
      data: trainingResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
      },
    });
  } catch (error) {
    console.error('Get training error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single training enrollment
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT t.*, e.first_name, e.last_name
       FROM TRAINING_ENROLLMENT t
       JOIN EMPLOYEE e ON t.employee_id = e.id
       WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Training enrollment not found' });
    }

    const training = result.rows[0];

    // Employees can only view their own trainings
    if (req.user.role === 'EMPLOYEE' && training.employee_id !== req.user.employeeId) {
      return res.status(403).json({ message: 'You do not have permission to view this training' });
    }

    res.json(training);
  } catch (error) {
    console.error('Get training error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Enroll employee in training
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { employee_id, training_name, training_description, start_date, end_date, duration_hours, provider, location, cost } = req.body;
    const user = req.user;

    if (!training_name || !start_date) {
      return res.status(400).json({ message: 'Missing required fields: training_name, start_date' });
    }

    // Employees can only enroll themselves, others need HR
    if (user.role === 'EMPLOYEE') {
      if (!employee_id || employee_id !== user.employeeId) {
        return res.status(403).json({ message: 'Employees can only enroll themselves in training' });
      }
    } else if (!employee_id) {
      return res.status(400).json({ message: 'HR/Manager must specify employee_id' });
    }

    // Verify employee exists
    const empResult = await pool.query('SELECT id FROM EMPLOYEE WHERE id = $1', [employee_id]);
    if (empResult.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const result = await pool.query(
      `INSERT INTO TRAINING_ENROLLMENT (
        employee_id, training_name, training_description,
        start_date, end_date, duration_hours, provider, location, cost, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ENROLLED')
       RETURNING *`,
      [
        employee_id, training_name, training_description || null,
        start_date, end_date || null, duration_hours || null, provider || null,
        location || null, cost || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create training enrollment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update training enrollment (status, completion date)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, completion_date, certificate_issued } = req.body;
    const user = req.user;

    const trainingResult = await pool.query('SELECT * FROM TRAINING_ENROLLMENT WHERE id = $1', [id]);
    if (trainingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Training enrollment not found' });
    }

    const training = trainingResult.rows[0];

    // Employees can update their own status
    if (user.role === 'EMPLOYEE' && training.employee_id !== user.employeeId) {
      return res.status(403).json({ message: 'You can only update your own training records' });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (status !== undefined) {
      if (!['ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (completion_date !== undefined) {
      updates.push(`completion_date = $${paramCount++}`);
      values.push(completion_date);
    }

    if (certificate_issued !== undefined) {
      updates.push(`certificate_issued = $${paramCount++}`);
      values.push(certificate_issued);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updates.push(`updated_at = $${paramCount++}`);
    values.push(new Date());
    values.push(id);

    const query = `UPDATE TRAINING_ENROLLMENT SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const updateResult = await pool.query(query, values);

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Update training error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get training history for an employee
router.get('/employee/:employee_id/history', authenticateToken, async (req, res) => {
  try {
    const { employee_id } = req.params;
    const user = req.user;

    // Employees can only view their own history
    if (user.role === 'EMPLOYEE' && parseInt(employee_id) !== user.employeeId) {
      return res.status(403).json({ message: 'You can only view your own training history' });
    }

    const result = await pool.query(
      `SELECT * FROM TRAINING_ENROLLMENT
       WHERE employee_id = $1
       ORDER BY start_date DESC`,
      [employee_id]
    );

    // Calculate statistics
    const stats = {
      total_trainings: result.rows.length,
      completed: result.rows.filter(t => t.status === 'COMPLETED').length,
      in_progress: result.rows.filter(t => t.status === 'IN_PROGRESS').length,
      enrolled: result.rows.filter(t => t.status === 'ENROLLED').length,
      certificates: result.rows.filter(t => t.certificate_issued).length,
      total_hours: result.rows.reduce((sum, t) => sum + (t.duration_hours || 0), 0),
      total_cost: result.rows.reduce((sum, t) => sum + (t.cost || 0), 0),
    };

    res.json({
      training_records: result.rows,
      statistics: stats,
    });
  } catch (error) {
    console.error('Get training history error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get training programs available (distinct training names)
router.get('/programs/available', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT training_name, training_description, provider
       FROM TRAINING_ENROLLMENT
       WHERE status IN ('COMPLETED', 'IN_PROGRESS')
       ORDER BY training_name`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get available programs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
