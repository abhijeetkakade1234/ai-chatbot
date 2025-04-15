import React from 'react';
import LogoInput from './LogoInput';
import QuestionInput from './QuestionInput';
import '../css/Dashboard.css';
import GreetingInput from './GreetingInput';


function ChatbotCustomizationPanel({
  logoUrl,
  setLogoUrl,
  chatbotSize,
  setChatbotSize,
  initialQuestions,
  setInitialQuestions,
  initialGreeting,
  setInitialGreeting,
  backgroundColor,
  setBackgroundColor,
  onSave
}) {
  return (
    <div className="customization-panel">
      <h2>Customize your website chatbot</h2>

      <LogoInput logoUrl={logoUrl} setLogoUrl={setLogoUrl} />

      <div className="settings-group">
        <h3>Chatbot size</h3>
        <div className="radio-group">
          {['small', 'medium', 'large'].map(size => (
            <label key={size} className={chatbotSize === size ? 'active' : ''}>
              <input
                type="radio"
                name="size"
                value={size}
                checked={chatbotSize === size}
                onChange={() => setChatbotSize(size)}
              />
              <span className="radio-label">{size.charAt(0).toUpperCase() + size.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>

      <QuestionInput initialQuestions={initialQuestions} setInitialQuestions={setInitialQuestions} />

      <GreetingInput 
  initialGreeting={initialGreeting} 
  setInitialGreeting={setInitialGreeting} 
/>


      <div className="settings-group">
        <h3>Background colour</h3>
        <div className="color-picker">
          <div className="color-preview" style={{ backgroundColor }}></div>
          <input
            type="text"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            placeholder="#000000"
          />
        </div>
      </div>

      <button className="save-btn" onClick={onSave}>Save</button>
    </div>
  );
}

export default ChatbotCustomizationPanel;
