import React from 'react';
import { createRoot } from 'react-dom/client';
import EmbeddedChatbot from './EmbeddedChatbot';

// Create and expose the mount function
window.mountChatbot = (containerId, config) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id "${containerId}" not found`);
    return;
  }

  const root = createRoot(container);
  root.render(<EmbeddedChatbot {...config} />);
};