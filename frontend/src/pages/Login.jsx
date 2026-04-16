import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [username, setUsername] = useState('john.smith');
  const [password, setPassword] = useState('any_password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>HR Workforce Management System</h1>
        <h2>Login</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="test-credentials">
          <h3>Test Credentials:</h3>
          <ul>
            <li><strong>HR Admin:</strong> john.smith / any_password</li>
            <li><strong>Manager:</strong> robert.wilson / any_password</li>
            <li><strong>Employee:</strong> alex.taylor / any_password</li>
            <li><strong>Recruiter:</strong> jessica.martinez / any_password</li>
            <li><strong>Payroll Officer:</strong> mike.johnson / any_password</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
