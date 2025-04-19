// src/components/ChatbotPreview.jsx
import React, { useState } from 'react';
import '../css/components/ChatbotPreview.css'; // use the correct CSS!
import Settings from '../Settings';

function ChatbotPreview({
  chatbotSize,
  logoUrl,
  initialQuestions = [],
  backgroundColor,
  onQuestionClick,
  mode = 'dashboard',
  chatbotId
}) {
  const [isVisible, setIsVisible] = React.useState(true);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const askQuestion = async (query) => {
    const apiUrl = "http://localhost:5000/question_asked";

    try {
      setIsLoading(true);
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          userId: chatbotId, // Using chatbotId as userId
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      // Add both question and response to messages
      setMessages(prev => [...prev, 
        { type: 'user', text: query },
        { type: 'bot', text: data.response, sources: data.sources }
      ]);

    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, 
        { type: 'error', text: 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    await askQuestion(inputText);
    setInputText('');
  };

  // Early return if not visible
  if (!isVisible) return null;

  return (
    <div className={mode === 'dashboard' ? 'preview-panel' : ''} 
         style={{ display: isVisible ? 'block' : 'none' }}>
      {mode === 'dashboard' && (
        <div className="preview-header">
          <span>Preview Widget</span>
          <div className="preview-actions">
            <span>Open</span>
            <span className="dropdown-icon">▼</span>
          </div>
        </div>
      )}

      <div className={`chatbot-preview ${chatbotSize || 'medium'}`} 
           style={{ backgroundColor: backgroundColor || '#000000' }}>
        <div className="chatbot-header">
          <div className="chatbot-icon">
            {logoUrl ? <img src={logoUrl} alt="Bot" /> : <span>🤖</span>}
          </div>
          <div className="chatbot-title">{Settings.botname || "Your Bot"}</div>
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

          <div className="chatbot-questions">
            {initialQuestions.map((question, index) => (
              <div
                key={index}
                className="chatbot-question"
                onClick={() => askQuestion(question)}
              >
                {question}
              </div>
            ))}
          </div>

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

// Export both the component and the mount function
export default ChatbotPreview;

// Add this to make mountChatbot available globally
if (typeof window !== 'undefined') {
  window.mountChatbot = (containerId, config) => {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with id ${containerId} not found`);
      return;
    }
    // Create and render the chatbot
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
