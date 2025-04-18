import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import ChatbotPreview from '../components/ChatbotPreview';
import '../css/components/ChatbotPreview.css';

function EmbeddedChatbot({ chatbotId }) {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'chatbots', chatbotId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data());
        }
      } catch (error) {
        console.error('Error fetching chatbot settings:', error);
      }
    };

    if (chatbotId) {
      fetchSettings();
    }
  }, [chatbotId]);

  if (!settings) return null; // 🛡️ Prevents rendering before data is ready

  console.log('settings from Firestore:', settings);
  return (
    <ChatbotPreview
      chatbotSize={settings.chatbotSize || 'medium'}
      logoUrl={settings.logoUrl || ''}
      initialQuestions={settings.initialQuestions || []}
      backgroundColor={settings.backgroundColor || '#000000'}
      mode="embed"
    />
  );
}

export default EmbeddedChatbot;
