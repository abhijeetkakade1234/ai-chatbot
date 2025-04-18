// src/components/ChatbotPreview.jsx
import React from 'react';
import '../css/components/ChatbotPreview.css'; // use the correct CSS!

function ChatbotPreview({
  chatbotSize,
  logoUrl,
  initialQuestions = [],
  backgroundColor,
  onQuestionClick,
  mode = 'dashboard'
}) {
  // Add visibility state
  const [isVisible, setIsVisible] = React.useState(true);

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

      <div className={`chatbot-preview ${chatbotSize || 'medium'}`} style={{ backgroundColor: backgroundColor || '#000000' }}>
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
              <div
                key={index}
                className="chatbot-question"
                onClick={() => onQuestionClick?.(question)}
              >
                {question || "What are some features?"}
              </div>
            ))}
          </div>
          <div className="chatbot-hint">Click one, or type your own</div>
          <div className="chatbot-input">
            <input type="text" placeholder="Type here..." />
            <button className="send-btn">➤</button>
          </div>
          <div className="chatbot-footer">Powered by </div>
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
