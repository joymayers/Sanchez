import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/SystemCard.css';

const SystemCard = ({ icon, title, description, link }) => {
  return (
    <Link to={link} className="system-card">
      <div className="card-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="card-arrow">→</div>
    </Link>
  );
};

export default SystemCard;
