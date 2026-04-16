// Payroll Management Routes
const express = require('express');
const router = express.Router();
const pool = require('../database/connection');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get all payroll records (paginated, filtered)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, employee_id, period_start, period_end, status } = req.query;
    const offset = (page - 1) * limit;
    const user = req.user;

    let query = `SELECT p.*, e.first_name, e.last_name, e.employee_id as emp_id_number
                 FROM PAYROLL p
                 JOIN EMPLOYEE e ON p.employee_id = e.id
                 WHERE 1=1`;
    let countQuery = 'SELECT COUNT(*) FROM PAYROLL WHERE 1=1';
    const params = [];

    // Role-based filtering
    if (user.role === 'EMPLOYEE') {
      // Employees see only their own payroll
      query += ` AND p.employee_id = $${params.length + 1}`;
      countQuery += ` AND employee_id = $${params.length + 1}`;
      params.push(user.employeeId);
    }
    // HR_ADMIN and PAYROLL_OFFICER see all

    if (employee_id) {
      query += ` AND p.employee_id = $${params.length + 1}`;
      countQuery += ` AND employee_id = $${params.length + 1}`;
      params.push(employee_id);
    }

    if (period_start) {
      query += ` AND p.payroll_period_start >= $${params.length + 1}`;
      countQuery += ` AND payroll_period_start >= $${params.length + 1}`;
      params.push(period_start);
    }

    if (period_end) {
      query += ` AND p.payroll_period_end <= $${params.length + 1}`;
      countQuery += ` AND payroll_period_end <= $${params.length + 1}`;
      params.push(period_end);
    }

    if (status) {
      query += ` AND p.status = $${params.length + 1}`;
      countQuery += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY p.payroll_period_start DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const [payrollResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2)),
    ]);

    res.json({
      data: payrollResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
      },
    });
  } catch (error) {
    console.error('Get payroll error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single payroll record
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.*, e.first_name, e.last_name, e.employee_id as emp_id_number
       FROM PAYROLL p
       JOIN EMPLOYEE e ON p.employee_id = e.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    const payroll = result.rows[0];

    // Employees can only view their own payroll
    if (req.user.role === 'EMPLOYEE' && payroll.employee_id !== req.user.employeeId) {
      return res.status(403).json({ message: 'You do not have permission to view this payroll record' });
    }

    res.json(payroll);
  } catch (error) {
    console.error('Get payroll record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create payroll record (PAYROLL_OFFICER or HR_ADMIN only)
router.post('/', authenticateToken, authorizeRole('HR_ADMIN', 'PAYROLL_OFFICER'), async (req, res) => {
  try {
    const {
      employee_id, payroll_period_start, payroll_period_end,
      base_salary, bonus, overtime_pay, other_earnings,
      tax_deduction, social_security, health_insurance, retirement_contribution, other_deductions,
      payment_method, payment_date
    } = req.body;

    if (!employee_id || !payroll_period_start || !payroll_period_end || base_salary === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify employee exists
    const empResult = await pool.query('SELECT id FROM EMPLOYEE WHERE id = $1', [employee_id]);
    if (empResult.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const result = await pool.query(
      `INSERT INTO PAYROLL (
        employee_id, payroll_period_start, payroll_period_end,
        base_salary, bonus, overtime_pay, other_earnings,
        tax_deduction, social_security, health_insurance, retirement_contribution, other_deductions,
        payment_method, payment_date, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'PENDING')
       RETURNING *`,
      [
        employee_id, payroll_period_start, payroll_period_end,
        base_salary, bonus || 0, overtime_pay || 0, other_earnings || 0,
        tax_deduction, social_security || 0, health_insurance || 0, retirement_contribution || 0, other_deductions || 0,
        payment_method || null, payment_date || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create payroll error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update payroll record (change status or payment details)
router.put('/:id', authenticateToken, authorizeRole('HR_ADMIN', 'PAYROLL_OFFICER'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_date, payment_method, notes } = req.body;

    const result = await pool.query('SELECT * FROM PAYROLL WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (status !== undefined) {
      if (!['PENDING', 'PROCESSED', 'PAID', 'DISPUTED'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (payment_date !== undefined) {
      updates.push(`payment_date = $${paramCount++}`);
      values.push(payment_date);
    }

    if (payment_method !== undefined) {
      updates.push(`payment_method = $${paramCount++}`);
      values.push(payment_method);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updates.push(`updated_at = $${paramCount++}`);
    values.push(new Date());
    values.push(id);

    const query = `UPDATE PAYROLL SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const updateResult = await pool.query(query, values);

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Update payroll error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get payroll history for an employee
router.get('/employee/:employee_id/history', authenticateToken, async (req, res) => {
  try {
    const { employee_id } = req.params;
    const { limit = 12 } = req.query;
    const user = req.user;

    // Employees can only view their own history
    if (user.role === 'EMPLOYEE' && parseInt(employee_id) !== user.employeeId) {
      return res.status(403).json({ message: 'You can only view your own payroll history' });
    }

    const result = await pool.query(
      `SELECT * FROM PAYROLL
       WHERE employee_id = $1
       ORDER BY payroll_period_start DESC
       LIMIT $2`,
      [employee_id, limit]
    );

    // Calculate YTD totals
    let ytdGross = 0;
    let ytdDeductions = 0;
    let ytdNet = 0;

    result.rows.forEach(p => {
      ytdGross += parseFloat(p.gross_pay);
      ytdDeductions += parseFloat(p.total_deductions);
      ytdNet += parseFloat(p.net_pay);
    });

    res.json({
      payroll_records: result.rows,
      ytd_summary: {
        gross_pay: ytdGross.toFixed(2),
        total_deductions: ytdDeductions.toFixed(2),
        net_pay: ytdNet.toFixed(2),
      },
    });
  } catch (error) {
    console.error('Get payroll history error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
