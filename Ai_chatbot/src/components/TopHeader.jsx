// src/components/TopHeader.jsx
import React from 'react';
import '../css/Dashboard.css';

function TopHeader() {
  return (
    <header className="top-header">
      <h1>Dashboard</h1>
      <div className="user-menu">
        <span className="notification-icon">🔔</span>
      </div>
    </header>
  );
}

export default TopHeader;