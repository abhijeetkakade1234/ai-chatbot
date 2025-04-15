// src/components/GreetingInput.jsx
import React from 'react';

function GreetingInput({ initialGreeting, setInitialGreeting }) {
  return (
    <div className="settings-group">
      <div className="setting-row">
        <h3>Initial greetings</h3>
        <label className="switch">
          <input type="checkbox" defaultChecked />
          <span className="slider round"></span>
        </label>
      </div>
      <textarea
        value={initialGreeting}
        onChange={(e) => setInitialGreeting(e.target.value)}
        placeholder="Enter initial greeting message"
      ></textarea>
    </div>
  );
}

export default GreetingInput;
