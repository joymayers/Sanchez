// Employee Routes - CRUD operations for employee management
const express = require('express');
const router = express.Router();
const pool = require('../database/connection');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get all employees (paginated)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, department_id, search } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM EMPLOYEE WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM EMPLOYEE WHERE 1=1';
    const params = [];

    if (department_id) {
      query += ` AND department_id = $${params.length + 1}`;
      countQuery += ` AND department_id = $${params.length + 1}`;
      params.push(department_id);
    }

    if (search) {
      query += ` AND (first_name ILIKE $${params.length + 1} OR last_name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1})`;
      countQuery += ` AND (first_name ILIKE $${params.length + 1} OR last_name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1})`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const [employeesResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2)),
    ]);

    res.json({
      data: employeesResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
      },
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single employee by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM EMPLOYEE WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get employee's direct reports (team members)
router.get('/:id/reports', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, first_name, last_name, email, job_title, department_id FROM EMPLOYEE WHERE manager_id = $1 ORDER BY first_name',
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new employee (HR_ADMIN only)
router.post('/', authenticateToken, authorizeRole('HR_ADMIN'), async (req, res) => {
  try {
    const {
      first_name, last_name, email, phone, date_of_birth, gender,
      address, city, state, postal_code, country,
      employee_id, job_title, department_id, manager_id, employment_type, hire_date, salary
    } = req.body;

    const result = await pool.query(
      `INSERT INTO EMPLOYEE (
        first_name, last_name, email, phone, date_of_birth, gender,
        address, city, state, postal_code, country,
        employee_id, job_title, department_id, manager_id, employment_type, hire_date, salary
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        first_name, last_name, email, phone, date_of_birth, gender,
        address, city, state, postal_code, country,
        employee_id, job_title, department_id, manager_id || null, employment_type, hire_date, salary
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update employee (HR_ADMIN only)
router.put('/:id', authenticateToken, authorizeRole('HR_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const allowedFields = [
      'first_name', 'last_name', 'phone', 'date_of_birth', 'gender',
      'address', 'city', 'state', 'postal_code', 'country',
      'job_title', 'department_id', 'manager_id', 'employment_status', 'employment_type', 'salary'
    ];

    const setClause = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (setClause.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    setClause.push(`updated_at = $${paramCount}`);
    values.push(new Date());
    paramCount++;
    values.push(id);

    const query = `UPDATE EMPLOYEE SET ${setClause.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete employee (HR_ADMIN only)
router.delete('/:id', authenticateToken, authorizeRole('HR_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete: mark as terminated
    const result = await pool.query(
      'UPDATE EMPLOYEE SET employment_status = $1, termination_date = $2, updated_at = $3 WHERE id = $4 RETURNING *',
      ['TERMINATED', new Date(), new Date(), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee terminated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
