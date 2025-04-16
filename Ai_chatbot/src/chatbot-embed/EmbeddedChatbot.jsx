import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

function EmbeddedChatbot({ 
  chatbotId, // Add this prop to identify which chatbot settings to fetch
  initialGreeting = "Hello! How can I help you?",
  backgroundColor = "#000000",
  chatbotSize = "medium",
  logoUrl = "",
  initialQuestions = []
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    initialGreeting,
    backgroundColor,
    chatbotSize,
    logoUrl,
    initialQuestions
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'chatbots', chatbotId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettings({
            initialGreeting: data.initialGreeting || initialGreeting,
            backgroundColor: data.backgroundColor || backgroundColor,
            chatbotSize: data.chatbotSize || chatbotSize,
            logoUrl: data.logoUrl || logoUrl,
            initialQuestions: data.initialQuestions || initialQuestions
          });
        }
      } catch (error) {
        console.error('Error fetching chatbot settings:', error);
      }
    };

    if (chatbotId) {
      fetchSettings();
    }
  }, [chatbotId]);

  return (
    <div className={`embedded-chatbot ${settings.chatbotSize} ${isOpen ? 'open' : ''}`}>
      <button 
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: settings.backgroundColor }}
      >
        <img src={settings.logoUrl || '/default-bot-icon.png'} alt="Chatbot" />
      </button>
      
      {isOpen && (
        <div className="chatbot-window" style={{ backgroundColor: settings.backgroundColor }}>
          <div className="chatbot-header">
            <span>{settings.initialGreeting}</span>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>
          <div className="chatbot-body">
            {settings.initialQuestions.map((question, index) => (
              <button key={index} className="question-button">
                {question}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default EmbeddedChatbot;