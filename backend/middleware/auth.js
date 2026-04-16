// Authentication Middleware - JWT verification and role-based access control
const jwt = require('jsonwebtoken');

// Verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};

// Optional: Verify if user can access their own data or is an admin
const canAccessEmployee = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const targetEmployeeId = parseInt(req.params.employeeId);
  const userEmployeeId = req.user.employeeId;
  const isAdmin = req.user.role === 'HR_ADMIN';
  const isManager = req.user.role === 'MANAGER';

  if (isAdmin) {
    // Admins can access all employees
    return next();
  }

  if (isManager || req.user.role === 'EMPLOYEE') {
    // Managers and employees can access their own records
    if (userEmployeeId === targetEmployeeId) {
      return next();
    }
    
    // Managers can also access their direct reports
    if (isManager) {
      // This would need to be verified against the database
      // For now, we allow it and the route handler will validate
      return next();
    }
  }

  return res.status(403).json({ message: 'You do not have permission to access this resource' });
};

module.exports = {
  authenticateToken,
  authorizeRole,
  canAccessEmployee,
};
