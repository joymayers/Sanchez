import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Employee Management Routes */}
          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <Employees />
              </ProtectedRoute>
            }
          />

          {/* Leave Management Routes */}
          <Route
            path="/leave"
            element={
              <ProtectedRoute>
                <div className="placeholder">Leave Management Module - Coming Soon</div>
              </ProtectedRoute>
            }
          />

          {/* Performance Review Routes */}
          <Route
            path="/performance"
            element={
              <ProtectedRoute>
                <div className="placeholder">Performance Reviews Module - Coming Soon</div>
              </ProtectedRoute>
            }
          />

          {/* Payroll Routes */}
          <Route
            path="/payroll"
            element={
              <ProtectedRoute>
                <div className="placeholder">Payroll Management Module - Coming Soon</div>
              </ProtectedRoute>
            }
          />

          {/* Training Routes */}
          <Route
            path="/training"
            element={
              <ProtectedRoute>
                <div className="placeholder">Training & Development Module - Coming Soon</div>
              </ProtectedRoute>
            }
          />

          {/* Recruitment Routes */}
          <Route
            path="/recruitment"
            element={
              <ProtectedRoute>
                <div className="placeholder">Recruitment Module - Coming Soon</div>
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
