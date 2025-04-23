import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { auth } from './firebase';
import AuthForm from './AuthForm';
import Dashboard from './Dashboard';
import Settings from './Settings';
import KnowledgeBase from './KnowledgeBase';
import ProtectedRoute from './ProtectedRoute';
import WhatsAppPage from './WhatsAppPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const authInstance = getAuth();
  const userId = authInstance.currentUser?.uid;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/knowledgebase" element={
          <ProtectedRoute>
            <KnowledgeBase />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <AuthForm />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard userId={userId} />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        <Route path="/whatsapp" element={<WhatsAppPage />} />
      </Routes>
    </Router>
  );
}

export default App;