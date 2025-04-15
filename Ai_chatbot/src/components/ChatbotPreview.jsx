// src/components/ChatbotPreview.jsx
import React from 'react';
import '../css/Dashboard.css';

function ChatbotPreview({ chatbotSize, logoUrl, initialQuestions, backgroundColor }) {
  return (
    <div className="preview-panel">
      <div className="preview-header">
        <span>Preview Widget</span>
        <div className="preview-actions">
          <span>Open</span>
          <span className="dropdown-icon">▼</span>
        </div>
      </div>

      <div className={`chatbot-preview ${chatbotSize}`} style={{ backgroundColor: backgroundColor || '#000000' }}>
        <div className="chatbot-header">
          <div className="chatbot-icon">
            {logoUrl ? <img src={logoUrl} alt="Bot" /> : <span>🤖</span>}
          </div>
          <div className="chatbot-title">abc</div>
        </div>

        <div className="chatbot-body">
          <div className="chatbot-message">Select relevant question to start</div>
          <div className="chatbot-questions">
            {initialQuestions.map((question, index) => (
              <div key={index} className="chatbot-question">
                {question || "What are some features?"}
              </div>
            ))}
          </div>
          <div className="chatbot-hint">Click one, or type your own</div>
          <div className="chatbot-input">
            <input type="text" placeholder="Type here..." />
            <button className="send-btn">➤</button>
          </div>
          <div className="chatbot-footer">Powered by</div>
        </div>
      </div>

      <button className="test-btn">Test</button>
    </div>
  );
}

export default ChatbotPreview;
