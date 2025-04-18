import React from 'react';
import ReactDOM from 'react-dom/client';
import EmbeddedChatbot from './EmbeddedChatbot';
import './embed.css';

window.mountChatbot = (containerId, props) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <EmbeddedChatbot {...props} />
    </React.StrictMode>
  );
};

export default EmbeddedChatbot;