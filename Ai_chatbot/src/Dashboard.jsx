// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { signOut } from 'firebase/auth';
// import { auth } from './firebase';
// import './css/AuthForm.css';

// function Dashboard() {
//   const navigate = useNavigate();
//   const user = auth.currentUser;

//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       navigate('/login');
//     } catch (error) {
//       console.error('Error signing out:', error);
//     }
//   };

//   return (
//     <div className="dashboard-container">
//       <div className="dashboard-content">
//         <h2>Dashboard</h2>
//         <div className="user-info">
//           <p><strong>Email:</strong> {user?.email}</p>
//           <p><strong>UID:</strong> {user?.uid}</p>
//           <p><strong>Account created:</strong> {user?.metadata.creationTime}</p>
//           <p><strong>Last login:</strong> {user?.metadata.lastSignInTime}</p>
//         </div>
//         <button onClick={handleLogout} className="btn logout-btn">
//           Logout
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Dashboard;

// src/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import CustomizationPanel from './components/CustomizationPanel';
import ChatbotPreview from './components/ChatbotPreview';
import './css/Dashboard.css';
import { saveUserSettings, fetchUserSettings } from './utils/saveSettings';

function Dashboard() {
  const navigate = useNavigate();

  const [chatbotSize, setChatbotSize] = useState('medium');
  const [logoUrl, setLogoUrl] = useState('');
  const [initialGreeting, setInitialGreeting] = useState('Have questions? Ask me anything!');
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [initialQuestions, setInitialQuestions] = useState([
    'What are some of the main features?',
    'How do I change my password?',
  ]);

  // ✅ useEffect moved here
  useEffect(() => {
    const loadSettings = async () => {
      const savedSettings = await fetchUserSettings();
      if (savedSettings) {
        setChatbotSize(savedSettings.chatbotSize || 'medium');
        setLogoUrl(savedSettings.logoUrl || '');
        setInitialGreeting(savedSettings.initialGreeting || '');
        setBackgroundColor(savedSettings.backgroundColor || '#000000');
        setInitialQuestions(savedSettings.initialQuestions || []);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    const settings = {
      chatbotSize,
      logoUrl,
      initialGreeting,
      backgroundColor,
      initialQuestions,
    };
    await saveUserSettings(settings);
    alert('Settings saved!');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar onLogout={handleLogout} />
      <main className="main-content">
        <TopHeader />
        <section className="content-area">
          <CustomizationPanel
            chatbotSize={chatbotSize}
            setChatbotSize={setChatbotSize}
            logoUrl={logoUrl}
            setLogoUrl={setLogoUrl}
            initialGreeting={initialGreeting}
            setInitialGreeting={setInitialGreeting}
            backgroundColor={backgroundColor}
            setBackgroundColor={setBackgroundColor}
            initialQuestions={initialQuestions}
            setInitialQuestions={setInitialQuestions}
            onSave={handleSave}
          />
          <ChatbotPreview
            chatbotSize={chatbotSize}
            logoUrl={logoUrl}
            initialQuestions={initialQuestions}
            backgroundColor={backgroundColor}
          />
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
