import React from 'react';
import LogoInput from './LogoInput';
import QuestionInput from './QuestionInput';
import '../css/Dashboard.css';
import GreetingInput from './GreetingInput';
import EmbedCodeBlock from './EmbedCodeBlock'; 
import FileUpload from './FileUpload'; 

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
  onSave,
  chatbotId // 🆕 accept chatbotId
}) {
  return (
    <div className="customization-panel">
      <h2>Customize your website chatbot</h2>

      <LogoInput logoUrl={logoUrl} setLogoUrl={setLogoUrl} />

      <div className="settings-group">
        <h3>Chatbot size</h3>
        <select 
          value={chatbotSize} 
          onChange={(e) => setChatbotSize(e.target.value)}
          className="size-selector"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
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

      {/* File Upload pdf*/}
      {/* <FileUpload /> */}

      {/* 🆕 Embed Code */}
      {chatbotId && (
        <div style={{ marginTop: '20px' }}>
          <EmbedCodeBlock chatbotId={chatbotId} />
        </div>
      )}
    </div>
  );
}

export default ChatbotCustomizationPanel;
