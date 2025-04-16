import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './css/Dashboard.css';
import { saveUserSettings, fetchUserSettings } from './utils/saveSettings';

// Convert regular imports to lazy imports
const Sidebar = lazy(() => import('./components/Sidebar'));
const TopHeader = lazy(() => import('./components/TopHeader'));
const CustomizationPanel = lazy(() => import('./components/CustomizationPanel'));
const ChatbotPreview = lazy(() => import('./components/ChatbotPreview'));
const EmbedCodeBlock = lazy(() => import('./components/EmbedCodeBlock'));

// Add loading fallback
const LoadingFallback = () => <div>Loading...</div>;

function Dashboard() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null); // 🆕 store UID
  const [chatbotSize, setChatbotSize] = useState('medium');
  const [logoUrl, setLogoUrl] = useState('');
  const [initialGreeting, setInitialGreeting] = useState('Have questions? Ask me anything!');
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [initialQuestions, setInitialQuestions] = useState([
    'What are some of the main features?',
    'How do I change my password?',
  ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid); // store UID as chatbotId
        const savedSettings = await fetchUserSettings(user.uid);
        if (savedSettings) {
          setChatbotSize(savedSettings.chatbotSize || 'medium');
          setLogoUrl(savedSettings.logoUrl || '');
          setInitialGreeting(savedSettings.initialGreeting || '');
          setBackgroundColor(savedSettings.backgroundColor || '#000000');
          setInitialQuestions(savedSettings.initialQuestions || []);
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSave = async () => {
    const settings = {
      chatbotSize,
      logoUrl,
      initialGreeting,
      backgroundColor,
      initialQuestions,
    };
    await saveUserSettings(userId, settings);
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    alert('Embed code copied!');
  };

  return (
    <div className="dashboard-layout">
      <Suspense fallback={<LoadingFallback />}>
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
            {userId && (
              <div style={{ marginTop: '20px' }}>
                <EmbedCodeBlock chatbotId={userId} />
              </div>
            )}
            <ChatbotPreview
              chatbotSize={chatbotSize}
              logoUrl={logoUrl}
              initialQuestions={initialQuestions}
              backgroundColor={backgroundColor}
            />
          </section>
        </main>
      </Suspense>
    </div>
  );
}  

export default Dashboard;

