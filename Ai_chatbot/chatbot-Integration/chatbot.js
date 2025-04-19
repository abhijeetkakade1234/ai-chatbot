// chatbot.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// 1. Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB-0TL358O140wB7PeuA_NIEBvQaoFHM9A",
  authDomain: "whatsapp-chatbot-33551.firebaseapp.com",
  projectId: "whatsapp-chatbot-33551",
  storageBucket: "whatsapp-chatbot-33551.firebasestorage.app",
  messagingSenderId: "340832961461",
  appId: "1:340832961461:web:27141c87178c87cdff8ffc",
  measurementId: "G-53HFLMV94E"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2. Inject Chatbot CSS
function injectStyles() {
  const style = document.createElement("style");
  style.innerHTML = `
    .chatbot-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
    }

    .chatbot-preview {
      border-radius: 10px;
      padding: 16px;
      font-family: sans-serif;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      height: 400px;
      width: 300px;
      background-color: #000;
      color: white;
      transition: all 0.3s ease-in-out;
    }

    .chatbot-preview.small {
      height: 400px;
    }

    .chatbot-preview.medium {
      height: 500px;
    }

    .chatbot-preview.large {
      height: 600px;
    }

    .chatbot-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }

    .chatbot-icon img {
      width: 30px;
      height: 30px;
      border-radius: 50%;
    }

    .chatbot-title {
      flex-grow: 1;
    }

    .chatbot-close-btn {
      background: transparent;
      color: white;
      border: none;
      font-size: 20px;
      cursor: pointer;
    }

    .chatbot-body {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .chatbot-message {
      margin-bottom: 8px;
      font-weight: bold;
    }

    .chatbot-questions {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;
    }

    .chatbot-question {
      background: white;
      color: black;
      padding: 6px 12px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
    }

    .chatbot-hint {
      font-size: 12px;
      margin-bottom: 8px;
      opacity: 0.7;
    }

    .chatbot-input {
      display: flex;
      gap: 6px;
      margin-top: auto;
    }

    .chatbot-input input {
      flex: 1;
      padding: 6px 10px;
      border-radius: 4px;
      border: none;
    }

    .chatbot-input .send-btn {
      background: white;
      color: black;
      border: none;
      border-radius: 4px;
      padding: 6px 10px;
      cursor: pointer;
    }

    .chatbot-footer {
      font-size: 11px;
      opacity: 0.6;
      margin-top: auto;
      text-align: center;
      padding-top: 10px;
    }

    /* 🔘 Minimized icon style */
    .chatbot-toggle-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      overflow: hidden;
      cursor: pointer;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }

    .chatbot-toggle-button img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }

    .hidden {
      display: none !important;
    }
    .chatbot-typing {
    font-style: italic;
    font-size: 13px;
    color: #ccc;
    margin-bottom: 10px;
    animation: blink 1.2s infinite;
  }

  @keyframes blink {
    0% { opacity: 0.2; }
    50% { opacity: 1; }
    100% { opacity: 0.2; }
  }
  `;
  document.head.appendChild(style);
}

// 3. Render Chatbot UI
function renderChatbot(container, data) {
  const wrapper = document.createElement("div");
  wrapper.className = "chatbot-container";

  // 🧩 Main chatbot HTML block
  const chatbotHTML = `
    <div class="chatbot-preview ${data.chatbotSize || 'medium'}" style="background-color: ${data.backgroundColor || '#000'}">
      <div class="chatbot-header">
        <div class="chatbot-icon">
          <img src="${data.logoUrl || '🤖'}" alt="Bot" />
        </div>
        <div class="chatbot-title">${data.title || 'abc'}</div>
        <button class="chatbot-close-btn">×</button>
      </div>

      <div class="chatbot-body">
        <div class="chatbot-message">${data.initialGreeting || 'How can I help?'}</div>
        <div class="chatbot-questions">
          ${data.initialQuestions.map(q => `<div class="chatbot-question">${q}</div>`).join('')}
        </div>
        <div class="chatbot-hint">Click one, or type your own</div>
        <div class="chatbot-input">
          <input type="text" placeholder="Type here..." />
          <button class="send-btn">➤</button>
        </div>
      </div>

      <div class="chatbot-footer">Powered by</div>
    </div>

    <!-- 🔘 Minimized logo-only button -->
    <div class="chatbot-toggle-button hidden">
      <img src="${data.logoUrl || '🤖'}" alt="Bot" />
    </div>
  `;

  wrapper.innerHTML = chatbotHTML;
  container.appendChild(wrapper);

  // 💡 Logic for minimize and restore
  const chatbotBox = wrapper.querySelector(".chatbot-preview");
  const toggleBtn = wrapper.querySelector(".chatbot-toggle-button");
  const closeBtn = wrapper.querySelector(".chatbot-close-btn");

  closeBtn.addEventListener("click", () => {
    chatbotBox.classList.add("hidden");
    toggleBtn.classList.remove("hidden");
  });

  toggleBtn.addEventListener("click", () => {
    chatbotBox.classList.remove("hidden");
    toggleBtn.classList.add("hidden");
  });

  // 💬 Future Chat Logic (Enable when ready)
  /*
  const inputEl = container.querySelector(".chatbot-input input");
  const sendBtn = container.querySelector(".send-btn");

  const sendMessage = async () => {
    const text = inputEl.value.trim();
    if (!text) return;

    const res = await fetch("https://your-api-endpoint.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    console.log("Bot reply:", data.reply);
  };

  sendBtn.addEventListener("click", sendMessage);
  inputEl.addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
  });
  */
}

// 4. Mount Function
window.mountChatbot = async (containerId, { chatbotId }) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  injectStyles();

  const ref = doc(db, "chatbotSettings", chatbotId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    container.innerHTML = "<p>Chatbot not found.</p>";
    return;
  }

  renderChatbot(container, snap.data());
};

function showTypingIndicator(container, show = true) {
  const typingEl = container.querySelector(".chatbot-typing");
  if (show) {
    if (!typingEl) {
      const newTypingEl = document.createElement("div");
      newTypingEl.className = "chatbot-typing";
      newTypingEl.innerText = "Bot is typing...";
      const body = container.querySelector(".chatbot-body");
      body.insertBefore(newTypingEl, body.querySelector(".chatbot-hint"));
    }
  } else {
    typingEl?.remove();
  }
}

const body = container.querySelector(".chatbot-body");
const hintEl = container.querySelector(".chatbot-hint");

const sendMessage = async () => {
  const text = inputEl.value.trim();
  if (!text) return;

  // Show user message
  const msgDiv = document.createElement("div");
  msgDiv.className = "chatbot-message";
  msgDiv.innerText = text;
  body.insertBefore(msgDiv, hintEl);

  inputEl.value = "";

  // ✨ Show Typing
  showTypingIndicator(container, true);

  // Simulate delay (e.g., API call)
  setTimeout(() => {
    showTypingIndicator(container, false);
    
    const botMsg = document.createElement("div");
    botMsg.className = "chatbot-message";
    botMsg.innerText = "This is a fake reply! 👋"; // replace with real API reply later
    body.insertBefore(botMsg, hintEl);
  }, 2000);
};
