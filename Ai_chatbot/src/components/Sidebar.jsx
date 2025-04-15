// components/Sidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import '../css/components/Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <span className="logo-icon">⌂</span>
        <span className="logo-text">abc</span>
        <button className="collapse-btn">▼</button>
      </div>
      <nav className="nav-menu">
        <ul>
          <li><span className="nav-icon">📄</span> Knowledge base</li>
          <li className="with-submenu"><span className="nav-icon">💬</span> Chats</li>
          <li onClick={() => navigate('/settings')}><span className="nav-icon">⚙️</span> Settings</li>
          <li><span className="nav-icon">🔴</span> Go live</li>
          <li className="active"><span className="nav-icon">🌐</span> Website Chatbot</li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <div className="test-chatbot"><span className="nav-icon">🤖</span> Test Chatbot</div>
        <div className="support-link"><span className="nav-icon">🛟</span> Help and support</div>
        <button className="logout-link" onClick={handleLogout}><span className="nav-icon">↪</span> Logout</button>
      </div>
    </aside>
  );
}

export default Sidebar;
