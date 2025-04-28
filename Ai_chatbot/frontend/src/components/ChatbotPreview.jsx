// src/components/ChatbotPreview.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../css/components/ChatbotPreview.css'; 
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; 

function ChatbotPreview({ chatbotId, chatbotSize, backgroundColor, logoUrl, initialGreeting, initialQuestions, forceUpdate, mode }) {
  if (!chatbotId) {
    console.error("ChatbotPreview: chatbotId is required");
    return <div>Error: Chatbot ID is required</div>;
  }

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showInitialQuestions, setShowInitialQuestions] = useState(true);
  const [chatbotSettings, setChatbotSettings] = useState({
    chatbotSize: chatbotSize || 'medium',
    backgroundColor: backgroundColor || '#000000',
    botName: 'Your Bot',
    answerLength: 'medium',
    companyInfo: '',
    customInstructions: [],
    fallbackMessage: '',
    forbiddenWords: [],
    gender: 'male',
    initialGreeting: initialGreeting || 'Hello! How can I assist you today?',
    logoUrl: logoUrl || '',
    initialQuestions: initialQuestions || []
  });

  useEffect(() => {
    setChatbotSettings(prevSettings => ({
      ...prevSettings,
      chatbotSize: chatbotSize || prevSettings.chatbotSize,
      backgroundColor,
      logoUrl,
      initialGreeting,
      initialQuestions
    }));
  }, [chatbotSize, backgroundColor, logoUrl, initialGreeting, initialQuestions, forceUpdate]);

  useEffect(() => {
    if (initialGreeting) {
      setMessages([{
        type: 'bot',
        text: initialGreeting
      }]);
    }
  }, [initialGreeting, forceUpdate]);

  useEffect(() => {
    const fetchChatbotSettings = async () => {
      if (!chatbotId) return;

      try {
        const chatbotRef = doc(db, 'chatbotSettings', chatbotId);
        const docSnap = await getDoc(chatbotRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const settings = {
            chatbotSize: data.chatbotSize || 'medium',
            backgroundColor: data.backgroundColor || '#000000',
            botName: data.botName || 'Your Bot',
            answerLength: data.answerLength || 'medium',
            companyInfo: data.companyInfo || '',
            customInstructions: data.customInstructions || [],
            fallbackMessage: data.fallbackMessage || '',
            forbiddenWords: data.forbiddenWords || [],
            gender: data.gender || 'male',
            initialGreeting: data.initialGreeting || 'Hello! How can I assist you today?',
            logoUrl: data.logoUrl || '🤖',
            initialQuestions: data.initialQuestions || []
          };
          
          setChatbotSettings(settings);
          setMessages([{
            type: 'bot',
            text: settings.initialGreeting
          }]);
        }
      } catch (error) {
        console.error('Error fetching chatbot settings:', error);
      }
    };

    fetchChatbotSettings();
  }, [chatbotId]);

  const askQuestion = async (query) => {
    const apiUrl = "http://localhost:5000/question_asked";

    if (!query || !chatbotId) {
      console.error("Missing required parameters:", { query, chatbotId });
      throw new Error("Missing query or chatbotId");
    }

    try {
      setIsLoading(true);
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        mode: 'cors',
        credentials: 'same-origin',
        body: JSON.stringify({
          query: query.trim(),
          userId: chatbotId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (typeof data === 'object') {
        if (typeof data === 'string') return { response: data };
        if (data.response) return { response: data.response };
        if (data.message) return { response: data.message };
        if (data.answer) return { response: data.answer };
        return { response: JSON.stringify(data, null, 2) };
      }

      throw new Error('Invalid response format');

    } catch (error) {
      console.error("Error in askQuestion:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputSubmit = async (e) => {
    e.preventDefault();
    const query = inputText.trim();
    if (!query) return;

    setMessages(prev => [...prev, {
      type: 'user',
      text: query
    }]);

    try {
      setIsLoading(true);
      const data = await askQuestion(query);
      const responseText = typeof data.response === 'object' 
        ? JSON.stringify(data.response, null, 2)
        : String(data.response);

      setMessages(prev => [...prev, {
        type: 'bot',
        text: responseText,
        sources: data.sources
      }]);

      setInputText('');
    } catch (error) {
      console.error("Error submitting question:", error);
      setMessages(prev => [...prev, { type: 'error', text: error.message || 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionClick = async (question) => {
    setMessages(prev => [...prev, { type: 'user', text: question }]);
    setShowInitialQuestions(false);
    try {
      setIsLoading(true);
      const data = await askQuestion(question);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: typeof data.response === 'object' 
          ? JSON.stringify(data.response, null, 2)
          : String(data.response),
        sources: data.sources
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'error',
        text: error.message || 'Something went wrong.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) {
    return (
      <div className="chatbot-toggle-button" onClick={() => setIsVisible(true)}>
        {chatbotSettings.logoUrl ? (
          <img src={chatbotSettings.logoUrl} alt="Bot" />
        ) : (
          <span>🤖</span>
        )}
      </div>
    );
  }

  return (
    <div className={mode === 'dashboard' ? 'preview-panel' : ''} style={{ display: isVisible ? 'block' : 'none' }}>
      {mode === 'dashboard' && (
        <div className="preview-header">
          <span>Preview Widget</span>
          <div className="preview-actions">
            <span>Open</span>
            <span className="dropdown-icon">▼</span>
          </div>
        </div>
      )}

      <div className={`chatbot-preview ${chatbotSettings.chatbotSize}`} style={{ backgroundColor: chatbotSettings.backgroundColor }}>
        <div className="chatbot-header">
          <div className="chatbot-icon">
            {chatbotSettings.logoUrl ? (
              <img src={chatbotSettings.logoUrl} alt="Bot" />
            ) : (
              <span>🤖</span>
            )}
          </div>
          <div className="chatbot-title">{chatbotSettings.botName}</div>
          <button className="chatbot-close-btn" onClick={() => setIsVisible(false)}>×</button>
        </div>

        <div className="chatbot-body">
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.type}`}>
                {message.text}
                {message.sources && (
                  <div className="sources">
                    Sources: {message.sources.join(', ')}
                  </div>
                )}
              </div>
            ))}
            {isLoading && <div className="message loading">Thinking...</div>}
          </div>

          {showInitialQuestions && (
            <div className="chatbot-questions">
              {chatbotSettings.initialQuestions.map((question, index) => (
                <div key={index} className="chatbot-question" onClick={() => handleQuestionClick(question)}>
                  {question}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleInputSubmit} className="chatbot-input">
            <input 
              type="text" 
              placeholder="Type here..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" className="send-btn" disabled={isLoading}>
              ➤
            </button>
          </form>
        </div>
      </div>

      {mode === 'dashboard' && <button className="test-btn">Test</button>}
    </div>
  );
}

ChatbotPreview.propTypes = {
  chatbotId: PropTypes.string.isRequired,
  chatbotSize: PropTypes.oneOf(['small', 'medium', 'large']).isRequired,
  logoUrl: PropTypes.string,
  initialQuestions: PropTypes.arrayOf(PropTypes.string),
  backgroundColor: PropTypes.string,
  initialGreeting: PropTypes.string,
  forceUpdate: PropTypes.number,
  mode: PropTypes.oneOf(['dashboard', 'embed'])
};

ChatbotPreview.defaultProps = {
  chatbotSize: 'medium',
  initialQuestions: [],
  backgroundColor: '#000000',
  mode: 'dashboard'
};

export default ChatbotPreview;

if (typeof window !== 'undefined') {
  window.mountChatbot = (containerId, config) => {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with id ${containerId} not found`);
      return;
    }
    const root = ReactDOM.createRoot(container);
    root.render(
      <ChatbotPreview
        chatbotId={config.chatbotId}
        initialQuestions={config.initialQuestions || []}
        backgroundColor={config.backgroundColor || '#000000'}
        mode="embed"
      />
    );
  };
}
