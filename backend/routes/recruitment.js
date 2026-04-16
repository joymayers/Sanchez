// Recruitment & Job Posting Routes
const express = require('express');
const router = express.Router();
const pool = require('../database/connection');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// ============================================
// JOB POSTING ENDPOINTS
// ============================================

// Get all job postings (public listing)
router.get('/postings', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'OPEN', department_id, location } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT jp.*, d.name as department_name, e.first_name as posted_by_first, e.last_name as posted_by_last
                 FROM JOB_POSTING jp
                 JOIN DEPARTMENT d ON jp.department_id = d.id
                 LEFT JOIN EMPLOYEE e ON jp.created_by = e.id
                 WHERE 1=1`;
    let countQuery = 'SELECT COUNT(*) FROM JOB_POSTING WHERE 1=1';
    const params = [];

    if (status) {
      query += ` AND jp.status = $${params.length + 1}`;
      countQuery += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    if (department_id) {
      query += ` AND jp.department_id = $${params.length + 1}`;
      countQuery += ` AND department_id = $${params.length + 1}`;
      params.push(department_id);
    }

    if (location) {
      query += ` AND jp.location ILIKE $${params.length + 1}`;
      countQuery += ` AND location ILIKE $${params.length + 1}`;
      params.push(`%${location}%`);
    }

    query += ` ORDER BY jp.posted_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const [postingsResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2)),
    ]);

    res.json({
      data: postingsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
      },
    });
  } catch (error) {
    console.error('Get job postings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single job posting
router.get('/postings/:posting_id', authenticateToken, async (req, res) => {
  try {
    const { posting_id } = req.params;
    const result = await pool.query(
      `SELECT jp.*, d.name as department_name
       FROM JOB_POSTING jp
       JOIN DEPARTMENT d ON jp.department_id = d.id
       WHERE jp.id = $1`,
      [posting_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get job posting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create job posting (RECRUITER or HR_ADMIN)
router.post('/postings', authenticateToken, authorizeRole('HR_ADMIN', 'RECRUITER'), async (req, res) => {
  try {
    const {
      job_title, job_description, department_id,
      location, employment_type, salary_min, salary_max,
      closing_date, requirements, benefits
    } = req.body;

    if (!job_title || !job_description || !department_id || !closing_date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify department exists
    const deptResult = await pool.query('SELECT id FROM DEPARTMENT WHERE id = $1', [department_id]);
    if (deptResult.rows.length === 0) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const result = await pool.query(
      `INSERT INTO JOB_POSTING (
        job_title, job_description, department_id,
        location, employment_type, salary_min, salary_max,
        closing_date, status, created_by, requirements, benefits
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'OPEN', $9, $10, $11)
       RETURNING *`,
      [
        job_title, job_description, department_id,
        location || null, employment_type || null, salary_min || null, salary_max || null,
        closing_date, req.user.employeeId, requirements || null, benefits || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create job posting error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update job posting (close, reopen, etc.)
router.put('/postings/:id', authenticateToken, authorizeRole('HR_ADMIN', 'RECRUITER'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, job_description, requirements, benefits, salary_min, salary_max, closing_date } = req.body;

    const result = await pool.query('SELECT * FROM JOB_POSTING WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (status !== undefined) {
      if (!['OPEN', 'CLOSED', 'FILLED', 'CANCELLED'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (job_description !== undefined) {
      updates.push(`job_description = $${paramCount++}`);
      values.push(job_description);
    }

    if (requirements !== undefined) {
      updates.push(`requirements = $${paramCount++}`);
      values.push(requirements);
    }

    if (benefits !== undefined) {
      updates.push(`benefits = $${paramCount++}`);
      values.push(benefits);
    }

    if (salary_min !== undefined) {
      updates.push(`salary_min = $${paramCount++}`);
      values.push(salary_min);
    }

    if (salary_max !== undefined) {
      updates.push(`salary_max = $${paramCount++}`);
      values.push(salary_max);
    }

    if (closing_date !== undefined) {
      updates.push(`closing_date = $${paramCount++}`);
      values.push(closing_date);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updates.push(`updated_at = $${paramCount++}`);
    values.push(new Date());
    values.push(id);

    const query = `UPDATE JOB_POSTING SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const updateResult = await pool.query(query, values);

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Update job posting error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// APPLICATION ENDPOINTS
// ============================================

// Get all applications (HR/RECRUITER only)
router.get('/applications', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, job_posting_id, status } = req.query;
    const offset = (page - 1) * limit;
    const user = req.user;

    // Only HR_ADMIN and RECRUITER can view all applications
    if (!['HR_ADMIN', 'RECRUITER'].includes(user.role)) {
      return res.status(403).json({ message: 'Only HR and Recruiters can view applications' });
    }

    let query = `SELECT app.*, jp.job_title
                 FROM APPLICATION app
                 JOIN JOB_POSTING jp ON app.job_posting_id = jp.id
                 WHERE 1=1`;
    let countQuery = 'SELECT COUNT(*) FROM APPLICATION WHERE 1=1';
    const params = [];

    if (job_posting_id) {
      query += ` AND app.job_posting_id = $${params.length + 1}`;
      countQuery += ` AND job_posting_id = $${params.length + 1}`;
      params.push(job_posting_id);
    }

    if (status) {
      query += ` AND app.status = $${params.length + 1}`;
      countQuery += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY app.applied_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const [appsResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2)),
    ]);

    res.json({
      data: appsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
      },
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single application
router.get('/applications/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT app.*, jp.job_title, jp.department_id, e.first_name as hired_first, e.last_name as hired_last
       FROM APPLICATION app
       JOIN JOB_POSTING jp ON app.job_posting_id = jp.id
       LEFT JOIN EMPLOYEE e ON app.hired_employee_id = e.id
       WHERE app.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit job application (public - no auth required)
router.post('/applications', async (req, res) => {
  try {
    const { job_posting_id, first_name, last_name, email, phone, cover_letter, resume_url } = req.body;

    if (!job_posting_id || !first_name || !last_name || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify job posting exists and is open
    const jobResult = await pool.query('SELECT status FROM JOB_POSTING WHERE id = $1', [job_posting_id]);
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    if (jobResult.rows[0].status !== 'OPEN') {
      return res.status(400).json({ message: 'This position is no longer accepting applications' });
    }

    const result = await pool.query(
      `INSERT INTO APPLICATION (job_posting_id, first_name, last_name, email, phone, cover_letter, resume_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'NEW')
       RETURNING *`,
      [job_posting_id, first_name, last_name, email, phone || null, cover_letter || null, resume_url || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update application status (HR/RECRUITER)
router.put('/applications/:id', authenticateToken, authorizeRole('HR_ADMIN', 'RECRUITER'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    if (!['NEW', 'UNDER_REVIEW', 'INTERVIEWED', 'OFFERED', 'HIRED', 'REJECTED', 'WITHDRAWN'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appResult = await pool.query('SELECT * FROM APPLICATION WHERE id = $1', [id]);
    if (appResult.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const result = await pool.query(
      `UPDATE APPLICATION SET status = $1, notes = COALESCE($2, notes), updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, notes || null, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Hire applicant - Convert to EMPLOYEE (HR_ADMIN only)
router.post('/applications/:id/hire', authenticateToken, authorizeRole('HR_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      employee_id, job_title, department_id, manager_id,
      employment_type, hire_date, salary
    } = req.body;

    // Get application
    const appResult = await pool.query('SELECT * FROM APPLICATION WHERE id = $1', [id]);
    if (appResult.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const app = appResult.rows[0];

    if (app.status === 'HIRED') {
      return res.status(400).json({ message: 'This applicant has already been hired' });
    }

    // Create new employee record using application data
    const empResult = await pool.query(
      `INSERT INTO EMPLOYEE (
        first_name, last_name, email, employee_id, job_title,
        department_id, manager_id, employment_type, hire_date, salary, employment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'ACTIVE')
       RETURNING id`,
      [
        app.first_name, app.last_name, app.email,
        employee_id || `EMP${Date.now()}`,
        job_title || 'Employee',
        department_id || 1,
        manager_id || null,
        employment_type || 'FULL_TIME',
        hire_date || new Date(),
        salary || 0
      ]
    );

    const newEmployeeId = empResult.rows[0].id;

    // Update application with hired reference
    await pool.query(
      `UPDATE APPLICATION SET hired_employee_id = $1, status = 'HIRED', hire_date = CURRENT_DATE
       WHERE id = $2`,
      [newEmployeeId, id]
    );

    // Update job posting status if all positions filled
    // (simplified - in real app would track positions count)

    res.json({
      message: 'Applicant hired successfully',
      employee_id: newEmployeeId,
      application: app,
    });
  } catch (error) {
    console.error('Hire applicant error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject application
router.post('/applications/:id/reject', authenticateToken, authorizeRole('HR_ADMIN', 'RECRUITER'), async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const result = await pool.query(
      `UPDATE APPLICATION SET status = 'REJECTED', notes = COALESCE($1, notes), updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [notes || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Reject application error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
