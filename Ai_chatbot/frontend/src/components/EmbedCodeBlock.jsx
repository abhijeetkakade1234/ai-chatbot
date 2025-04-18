// src/components/EmbedCodeBlock.jsx
import React from "react";
import "../css/components/EmbedCodeBlock.css"; // Optional styling

function EmbedCodeBlock({ chatbotId }) {
  if (!chatbotId) return null;

  const embedCode = `<script type="module" src="./chatbot.js"></script>
  <div id="chatbot-container"></div>
    <script>
      document.addEventListener('DOMContentLoaded', () => {
        mountChatbot('chatbot-container', {
          chatbotId: '${chatbotId}'
        });
      });
    </script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    alert("Embed code copied!");
  };

  return (
    <div className="embed-section">
      <h3>Embed Code</h3>
      <textarea readOnly value={embedCode} rows={8} style={{ width: "100%" }} />
      <button onClick={copyToClipboard}>📋 Copy to Clipboard</button>
    </div>
  );
}

export default EmbedCodeBlock;
