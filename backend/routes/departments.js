// Department Routes
const express = require('express');
const router = express.Router();
const pool = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');

// Get all departments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM DEPARTMENT ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get department by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM DEPARTMENT WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
