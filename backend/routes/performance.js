// Performance Review & 360° Feedback Routes
const express = require('express');
const router = express.Router();
const pool = require('../database/connection');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// ============================================
// PERFORMANCE REVIEW ENDPOINTS
// ============================================

// Get all performance reviews (paginated)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, employee_id, status } = req.query;
    const offset = (page - 1) * limit;
    const user = req.user;

    let query = `SELECT pr.*, e.first_name, e.last_name, r.first_name as reviewer_first, r.last_name as reviewer_last
                 FROM PERFORMANCE_REVIEW pr
                 JOIN EMPLOYEE e ON pr.employee_id = e.id
                 JOIN EMPLOYEE r ON pr.reviewed_by = r.id
                 WHERE 1=1`;
    let countQuery = 'SELECT COUNT(*) FROM PERFORMANCE_REVIEW WHERE 1=1';
    const params = [];

    // Role-based filtering
    if (user.role === 'EMPLOYEE') {
      query += ` AND pr.employee_id = $${params.length + 1}`;
      countQuery += ` AND employee_id = $${params.length + 1}`;
      params.push(user.employeeId);
    }

    if (employee_id) {
      query += ` AND pr.employee_id = $${params.length + 1}`;
      countQuery += ` AND employee_id = $${params.length + 1}`;
      params.push(employee_id);
    }

    if (status) {
      query += ` AND pr.status = $${params.length + 1}`;
      countQuery += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY pr.review_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const [reviewsResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2)),
    ]);

    res.json({
      data: reviewsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
      },
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single performance review
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT pr.*, e.first_name, e.last_name, r.first_name as reviewer_first, r.last_name as reviewer_last
       FROM PERFORMANCE_REVIEW pr
       JOIN EMPLOYEE e ON pr.employee_id = e.id
       JOIN EMPLOYEE r ON pr.reviewed_by = r.id
       WHERE pr.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Performance review not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create performance review
router.post('/', authenticateToken, authorizeRole('HR_ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { employee_id, review_period_start, review_period_end, rating, comments } = req.body;
    const user = req.user;

    if (!employee_id || !review_period_start || !review_period_end) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Manager can only review their direct reports
    if (user.role === 'MANAGER') {
      const empResult = await pool.query('SELECT manager_id FROM EMPLOYEE WHERE id = $1', [employee_id]);
      if (empResult.rows.length === 0 || empResult.rows[0].manager_id !== user.employeeId) {
        return res.status(403).json({ message: 'Managers can only review their direct reports' });
      }
    }

    const result = await pool.query(
      `INSERT INTO PERFORMANCE_REVIEW (employee_id, review_period_start, review_period_end, reviewed_by, rating, comments, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'DRAFT')
       RETURNING *`,
      [employee_id, review_period_start, review_period_end, user.employeeId, rating || null, comments || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update performance review
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comments, status, review_date } = req.body;
    const user = req.user;

    const reviewResult = await pool.query('SELECT * FROM PERFORMANCE_REVIEW WHERE id = $1', [id]);
    if (reviewResult.rows.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const review = reviewResult.rows[0];

    // Only the reviewer or HR_ADMIN can update
    if (user.role !== 'HR_ADMIN' && review.reviewed_by !== user.employeeId) {
      return res.status(403).json({ message: 'Only the reviewer can update this review' });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (rating !== undefined) {
      updates.push(`rating = $${paramCount++}`);
      values.push(rating);
    }
    if (comments !== undefined) {
      updates.push(`comments = $${paramCount++}`);
      values.push(comments);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (review_date !== undefined) {
      updates.push(`review_date = $${paramCount++}`);
      values.push(review_date);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updates.push(`updated_at = $${paramCount++}`);
    values.push(new Date());
    values.push(id);

    const query = `UPDATE PERFORMANCE_REVIEW SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// 360° FEEDBACK ENDPOINTS
// ============================================

// Get feedback for a performance review
router.get('/:id/feedback', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify review exists
    const reviewResult = await pool.query('SELECT * FROM PERFORMANCE_REVIEW WHERE id = $1', [id]);
    if (reviewResult.rows.length === 0) {
      return res.status(404).json({ message: 'Performance review not found' });
    }

    const feedbackResult = await pool.query(
      `SELECT f.*, e.first_name, e.last_name
       FROM FEEDBACK f
       JOIN EMPLOYEE e ON f.feedback_from_id = e.id
       WHERE f.performance_review_id = $1
       ORDER BY f.feedback_type, f.submitted_date DESC`,
      [id]
    );

    // Aggregate feedback by type
    const aggregated = {};
    feedbackResult.rows.forEach(fb => {
      if (!aggregated[fb.feedback_type]) {
        aggregated[fb.feedback_type] = {
          type: fb.feedback_type,
          count: 0,
          avg_rating: 0,
          feedback_list: [],
        };
      }
      aggregated[fb.feedback_type].count++;
      aggregated[fb.feedback_type].avg_rating += fb.rating;
      aggregated[fb.feedback_type].feedback_list.push(fb);
    });

    // Calculate averages
    Object.keys(aggregated).forEach(type => {
      aggregated[type].avg_rating /= aggregated[type].count;
    });

    res.json({
      review_id: id,
      all_feedback: feedbackResult.rows,
      aggregated_feedback: Object.values(aggregated),
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit feedback for a performance review (360° feedback)
router.post('/:id/feedback', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback_type, rating, feedback_text, is_anonymous } = req.body;
    const user = req.user;

    if (!feedback_type || !rating || !feedback_text) {
      return res.status(400).json({ message: 'Missing required fields: feedback_type, rating, feedback_text' });
    }

    if (!['PEER', 'MANAGER', 'SELF', 'SUBORDINATE'].includes(feedback_type)) {
      return res.status(400).json({ message: 'Invalid feedback type' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Verify review exists
    const reviewResult = await pool.query('SELECT employee_id FROM PERFORMANCE_REVIEW WHERE id = $1', [id]);
    if (reviewResult.rows.length === 0) {
      return res.status(404).json({ message: 'Performance review not found' });
    }

    const review = reviewResult.rows[0];

    // Validate feedback type rules
    if (feedback_type === 'SELF' && review.employee_id !== user.employeeId) {
      return res.status(400).json({ message: 'SELF feedback can only be submitted by the reviewed employee' });
    }

    // Insert feedback
    const result = await pool.query(
      `INSERT INTO FEEDBACK (performance_review_id, feedback_from_id, feedback_type, rating, feedback_text, is_anonymous)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, user.employeeId, feedback_type, rating, feedback_text, is_anonymous || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all feedback submitted by a user (for tracking)
router.get('/feedback-by/:employee_id', authenticateToken, async (req, res) => {
  try {
    const { employee_id } = req.params;

    // Users can see their own feedback, HR_ADMIN sees all
    if (req.user.role !== 'HR_ADMIN' && req.user.employeeId !== parseInt(employee_id)) {
      return res.status(403).json({ message: 'You can only view your own feedback' });
    }

    const result = await pool.query(
      `SELECT f.*, pr.employee_id as reviewed_employee_id, e.first_name, e.last_name
       FROM FEEDBACK f
       JOIN PERFORMANCE_REVIEW pr ON f.performance_review_id = pr.id
       JOIN EMPLOYEE e ON pr.employee_id = e.id
       WHERE f.feedback_from_id = $1
       ORDER BY f.submitted_date DESC`,
      [employee_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get submitted feedback error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
