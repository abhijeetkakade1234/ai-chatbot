// src/components/LogoInput.jsx
import React from 'react';

function LogoInput({ logoUrl, setLogoUrl }) {
  return (
    <div className="settings-group">
      <h3>Chatbot logo</h3>
      <div className="logo-input-container">
        <span className="image-icon">{logoUrl}</span>
        <input
          type="text"
          placeholder="Enter URL for chatbot icon"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
        />
      </div>
    </div>
  );
}

export default LogoInput;
