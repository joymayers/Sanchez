// Leave Management Routes - Full leave request workflow
const express = require('express');
const router = express.Router();
const pool = require('../database/connection');
const { authenticateToken, authorizeRole, canAccessEmployee } = require('../middleware/auth');

// Get all leave requests (paginated, filterable)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, employee_id, status, from_date, to_date } = req.query;
    const offset = (page - 1) * limit;
    const user = req.user;

    let query = 'SELECT lr.*, e.first_name, e.last_name, a.first_name as approver_first, a.last_name as approver_last FROM LEAVE_REQUEST lr JOIN EMPLOYEE e ON lr.employee_id = e.id LEFT JOIN EMPLOYEE a ON lr.approved_by = a.id WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM LEAVE_REQUEST WHERE 1=1';
    const params = [];

    // Role-based filtering
    if (user.role === 'EMPLOYEE') {
      // Employees see only their own leaves
      query += ` AND lr.employee_id = $${params.length + 1}`;
      countQuery += ` AND employee_id = $${params.length + 1}`;
      params.push(user.employeeId);
    } else if (user.role === 'MANAGER') {
      // Managers see their team's leaves
      query += ` AND e.manager_id = $${params.length + 1}`;
      countQuery += ` AND employee_id IN (SELECT id FROM EMPLOYEE WHERE manager_id = $${params.length + 1})`;
      params.push(user.employeeId);
    }
    // HR_ADMIN sees all

    if (employee_id) {
      query += ` AND lr.employee_id = $${params.length + 1}`;
      countQuery += ` AND employee_id = $${params.length + 1}`;
      params.push(employee_id);
    }

    if (status) {
      query += ` AND lr.status = $${params.length + 1}`;
      countQuery += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    if (from_date) {
      query += ` AND lr.start_date >= $${params.length + 1}`;
      countQuery += ` AND start_date >= $${params.length + 1}`;
      params.push(from_date);
    }

    if (to_date) {
      query += ` AND lr.end_date <= $${params.length + 1}`;
      countQuery += ` AND end_date <= $${params.length + 1}`;
      params.push(to_date);
    }

    query += ` ORDER BY lr.requested_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const [leavesResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2)),
    ]);

    res.json({
      data: leavesResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
      },
    });
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single leave request
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT lr.*, e.first_name, e.last_name, a.first_name as approver_first, a.last_name as approver_last FROM LEAVE_REQUEST lr JOIN EMPLOYEE e ON lr.employee_id = e.id LEFT JOIN EMPLOYEE a ON lr.approved_by = a.id WHERE lr.id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    const leave = result.rows[0];

    // Check authorization
    if (req.user.role === 'EMPLOYEE' && leave.employee_id !== req.user.employeeId) {
      return res.status(403).json({ message: 'You do not have permission to view this leave request' });
    }

    res.json(leave);
  } catch (error) {
    console.error('Get leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit new leave request
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { employee_id, leave_type, start_date, end_date, reason } = req.body;
    const user = req.user;

    // Validate required fields
    if (!employee_id || !leave_type || !start_date || !end_date) {
      return res.status(400).json({ message: 'Missing required fields: employee_id, leave_type, start_date, end_date' });
    }

    // Employees can only submit for themselves
    if (user.role === 'EMPLOYEE' && employee_id !== user.employeeId) {
      return res.status(403).json({ message: 'Employees can only submit leave for themselves' });
    }

    // Validate date range
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    if (endDate < startDate) {
      return res.status(400).json({ message: 'End date must be after or equal to start date' });
    }

    // Calculate number of days
    const timeDiff = endDate.getTime() - startDate.getTime();
    const numberDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    // Check leave balance (for annual leave only)
    if (leave_type === 'ANNUAL') {
      const empResult = await pool.query('SELECT annual_leave_balance FROM EMPLOYEE WHERE id = $1', [employee_id]);
      if (empResult.rows.length === 0) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      const balance = empResult.rows[0].annual_leave_balance;
      if (balance < numberDays) {
        return res.status(400).json({ message: `Insufficient leave balance. Available: ${balance} days, Requested: ${numberDays} days` });
      }
    }

    // Create leave request
    const result = await pool.query(
      `INSERT INTO LEAVE_REQUEST (employee_id, leave_type, start_date, end_date, number_of_days, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
       RETURNING *`,
      [employee_id, leave_type, start_date, end_date, numberDays, reason || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create leave error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve/Reject leave request
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;

    // Validate status
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Status must be APPROVED or REJECTED' });
    }

    // Get leave request
    const leaveResult = await pool.query('SELECT * FROM LEAVE_REQUEST WHERE id = $1', [id]);
    if (leaveResult.rows.length === 0) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    const leave = leaveResult.rows[0];

    // Only PENDING leaves can be approved/rejected
    if (leave.status !== 'PENDING') {
      return res.status(400).json({ message: `Cannot change status of a ${leave.status} leave request` });
    }

    // Check authorization - only manager of the employee or HR_ADMIN can approve
    const empResult = await pool.query('SELECT manager_id FROM EMPLOYEE WHERE id = $1', [leave.employee_id]);
    const employee = empResult.rows[0];

    if (user.role !== 'HR_ADMIN' && user.employeeId !== employee.manager_id) {
      return res.status(403).json({ message: 'Only the employee\'s manager or HR admin can approve this leave' });
    }

    // Update leave request
    const updateResult = await pool.query(
      `UPDATE LEAVE_REQUEST 
       SET status = $1, approved_by = $2, approval_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, user.employeeId, id]
    );

    // If approved, deduct from annual leave balance (for annual leave only)
    if (status === 'APPROVED' && leave.leave_type === 'ANNUAL') {
      await pool.query(
        'UPDATE EMPLOYEE SET annual_leave_balance = annual_leave_balance - $1 WHERE id = $2',
        [leave.number_of_days, leave.employee_id]
      );
    }

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Update leave error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel leave request (employee or HR_ADMIN only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const leaveResult = await pool.query('SELECT * FROM LEAVE_REQUEST WHERE id = $1', [id]);
    if (leaveResult.rows.length === 0) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    const leave = leaveResult.rows[0];

    // Employee can only cancel their own pending leave
    if (user.role === 'EMPLOYEE' && leave.employee_id !== user.employeeId) {
      return res.status(403).json({ message: 'Employees can only cancel their own leave requests' });
    }

    if (user.role === 'EMPLOYEE' && leave.status !== 'PENDING') {
      return res.status(400).json({ message: 'Employees can only cancel pending leave requests' });
    }

    // Update status to CANCELLED
    const result = await pool.query(
      'UPDATE LEAVE_REQUEST SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['CANCELLED', id]
    );

    // If it was approved annual leave, restore balance
    if (leave.status === 'APPROVED' && leave.leave_type === 'ANNUAL') {
      await pool.query(
        'UPDATE EMPLOYEE SET annual_leave_balance = annual_leave_balance + $1 WHERE id = $2',
        [leave.number_of_days, leave.employee_id]
      );
    }

    res.json({ message: 'Leave request cancelled successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Cancel leave error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
