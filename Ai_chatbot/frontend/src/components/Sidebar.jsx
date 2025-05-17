import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import '../css/components/Sidebar.css';
import Settings from '../Settings';

// Icons from react-icons
import { FaHome, FaFileAlt, FaComments, FaCog, FaGlobe, FaWhatsapp, FaLifeRing, FaSignOutAlt } from 'react-icons/fa';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <FaHome className="logo-icon" />
        <span className="logo-text">{Settings.botName || 'Chatbot'}</span>
        <button className="collapse-btn">▼</button>
      </div>
      <nav className="nav-menu">
        <ul>
          <li className={isActive('/knowledgebase') ? 'active' : ''} onClick={() => navigate('/knowledgebase')}>
            <FaFileAlt className="nav-icon" /> Knowledge base
          </li>
          <li className="with-submenu">
            <FaComments className="nav-icon" /> Chats
          </li>
          <li className={isActive('/settings') ? 'active' : ''} onClick={() => navigate('/settings')}>
            <FaCog className="nav-icon" /> Settings
          </li>
          <li className={isActive('/dashboard') ? 'active' : ''} onClick={() => navigate('/dashboard')}>
            <FaGlobe className="nav-icon" /> Website Chatbot
          </li>
          <li className={isActive('/whatsapp') ? 'active' : ''} onClick={() => navigate('/whatsapp')}>
            <FaWhatsapp className="nav-icon" /> WhatsApp Chatbot
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <div className="support-link">
          <FaLifeRing className="nav-icon" /> Help and support
        </div>
        <button className="logout-link" onClick={handleLogout}>
          <FaSignOutAlt className="nav-icon" /> Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
