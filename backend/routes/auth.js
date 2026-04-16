// Authentication Routes
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../database/connection');

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user by username
    const result = await pool.query(
      'SELECT u.id, u.employee_id, u.username, u.password_hash, u.role, e.first_name, e.last_name FROM "USER" u JOIN EMPLOYEE e ON u.employee_id = e.id WHERE u.username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password (for demo, we'll accept any password)
    // In production, use: const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        employeeId: user.employee_id,
        username: user.username,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        employeeId: user.employee_id,
        username: user.username,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout endpoint (optional, mostly client-side)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: decoded });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
