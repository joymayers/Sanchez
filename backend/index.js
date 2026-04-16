// Main Express Server
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ============================================
// Middleware
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// Database Connection Check
// ============================================
const pool = require('./database/connection');

// ============================================
// API Routes (will be implemented in Phase 2)
// ============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'HR Workforce Management System Backend',
    timestamp: new Date().toISOString()
  });
});

// Placeholder routes (to be implemented)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/leave', require('./routes/leave'));
app.use('/api/performance', require('./routes/performance'));
app.use('/api/payroll', require('./routes/payroll'));
app.use('/api/training', require('./routes/training'));
app.use('/api/recruitment', require('./routes/recruitment'));

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ============================================
// Error Handler
// ============================================
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

// ============================================
// Start Server
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n╔═══════════════════════════════════════════════════════╗`);
  console.log(`║  HR Workforce Management System - Backend Server     ║`);
  console.log(`║  Running on: http://localhost:${PORT}`);
  console.log(`║  Environment: ${process.env.NODE_ENV}`);
  console.log(`╚═══════════════════════════════════════════════════════╝\n`);
});

module.exports = app;
