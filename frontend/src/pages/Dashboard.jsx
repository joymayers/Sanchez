import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SystemCard from '../components/SystemCard';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const modules = [
    {
      id: 1,
      title: 'Employee Management',
      description: 'Manage employee records, hierarchy, and profiles',
      icon: '👥',
      link: '/employees',
    },
    {
      id: 2,
      title: 'Leave Management',
      description: 'Request, approve, and track leave requests',
      icon: '📅',
      link: '/leave',
    },
    {
      id: 3,
      title: 'Performance Reviews',
      description: 'Create reviews and collect 360° feedback',
      icon: '⭐',
      link: '/performance',
    },
    {
      id: 4,
      title: 'Payroll Management',
      description: 'Manage compensation and payment processing',
      icon: '💰',
      link: '/payroll',
    },
    {
      id: 5,
      title: 'Training & Development',
      description: 'Enroll in training and track certifications',
      icon: '🎓',
      link: '/training',
    },
    {
      id: 6,
      title: 'Recruitment',
      description: 'Post jobs, manage applications, and hire',
      icon: '🎯',
      link: '/recruitment',
    },
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>HR Workforce Management System</h1>
          <div className="user-info">
            <span className="user-details">
              {user?.firstName} {user?.lastName}
              <small className="role-badge">{user?.role}</small>
            </span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="welcome-section">
          <h2>Welcome to the HR System</h2>
          <p>Select a module below to begin managing your workforce</p>
        </section>

        <div className="modules-grid">
          {modules.map((module) => (
            <SystemCard
              key={module.id}
              icon={module.icon}
              title={module.title}
              description={module.description}
              link={module.link}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
