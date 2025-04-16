// src/components/EmbedCodeBlock.jsx
import React from 'react';
import '../css/components/EmbedCodeBlock.css'; // Optional styling

function EmbedCodeBlock({ chatbotId }) {
  if (!chatbotId) return null;

  const embedCode = `<div id="chatbot-container"></div>
<script src="https://ai-chatbot-eight-umber.vercel.app/chatbot.bundle.js"></script>
<script>
  mountChatbot('chatbot-container', {
    chatbotId: "${chatbotId}"
  });
</script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    alert('Embed code copied!');
  };

  return (
    <div className="embed-section">
      <h3>Embed Code</h3>
      <textarea readOnly value={embedCode} rows={8} style={{ width: '100%' }} />
      <button onClick={copyToClipboard}>📋 Copy to Clipboard</button>
    </div>
  );
}

export default EmbedCodeBlock;
