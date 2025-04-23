// chatbot.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// 1. Firebase config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
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
      overflow: hidden; /* Prevent double scrollbars */
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
      transition: all 0.3s ease;
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

    .user-message {
      background-color: #007bff;
      color: white;
      padding: 8px 12px;
      border-radius: 8px;
      margin-left: auto;
      max-width: 80%;
    }

    .bot-message {
      background-color: #f0f0f0;
      color: #333;
      padding: 8px 12px;
      border-radius: 8px;
      margin-right: auto;
      max-width: 80%;
    }

    .error-message {
      background-color: #ffebee;
      color: #c62828;
      padding: 8px 12px;
      border-radius: 8px;
      text-align: center;
      margin: 8px auto;
    }

    .sources {
      font-size: 0.8em;
      margin-top: 4px;
      color: #666;
    }

    .chatbot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 10px;
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
        <div class="chatbot-title">${data.botName || 'abc'}</div>
        <button class="chatbot-close-btn">×</button>
      </div>

      <div class="chatbot-body">
        <div class="chatbot-messages">
          <div class="chatbot-message bot-message">${data.initialGreeting || 'How can I help?'}</div>
        </div>
        <div class="chatbot-questions">
          ${data.initialQuestions.map(q => `<div class="chatbot-question">${q}</div>`).join('')}
        </div>
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

  // Update event listeners for chat
  const inputEl = wrapper.querySelector(".chatbot-input input");
  const sendBtn = wrapper.querySelector(".chatbot-input .send-btn");

  if (!data.chatbotId) {
    console.error("No chatbotId provided in chatbot data");
    return;
  }

  const handleSend = () => {
    const text = inputEl.value.trim();
    if (text) {
      sendMessage(wrapper, data.chatbotId);
    }
  };

  // Add click event listener to send button
  sendBtn.addEventListener("click", handleSend);
  
  // Add enter key event listener to input
  inputEl.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  });

  // Update question click handlers
  const questions = wrapper.querySelectorAll(".chatbot-question");
  questions.forEach(q => {
    q.addEventListener("click", () => {
      inputEl.value = q.innerText;
      handleSend();
      q.parentElement.style.display = 'none';
    });
  });
}

// 4. Mount Function
window.mountChatbot = async (containerId, { chatbotId }) => {
  if (!chatbotId) {
    console.error("chatbotId is required");
    return;
  }

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id ${containerId} not found`);
    return;
  }

  injectStyles();

  try {
    const ref = doc(db, "chatbotSettings", chatbotId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      container.innerHTML = "<p>Chatbot not found.</p>";
      return;
    }

    // Pass chatbotId along with the Firestore data
    const chatbotData = {
      ...snap.data(),
      chatbotId  // Add chatbotId to the data object
    };

    renderChatbot(container, chatbotData);
  } catch (error) {
    console.error("Error mounting chatbot:", error);
    container.innerHTML = "<p>Error loading chatbot.</p>";
  }
};

async function askQuestion(query, chatbotId) {
  if (!query || !chatbotId) {
    console.error("Missing parameters:", { query, chatbotId });
    throw new Error("Missing query or userId");
  }

  try {
    const response = await fetch("http://localhost:5000/question_asked", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      mode: 'cors',
      credentials: 'include', 
      body: JSON.stringify({
        query: query.trim(),
        userId: chatbotId
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data); // Debug log

    // Handle different response formats
    if (typeof data === 'object') {
      // If data is directly the response string
      if (typeof data === 'string') {
        return { response: data };
      }
      // If data is an object with response property
      if (data.response) {
        return { response: data.response };
      }
      // If data is an object with message property
      if (data.message) {
        return { response: data.message };
      }
      // If data is an object with answer property
      if (data.answer) {
        return { response: data.answer };
      }
      // If none of the above, stringify the object
      return { 
        response: JSON.stringify(data, null, 2)
      };
    }

    throw new Error('Invalid response format');

  } catch (error) {
    console.error("Error in askQuestion:", error);
    throw error;
  }
}

function addMessage(container, message) {
  const messageEl = document.createElement("div");
  messageEl.className = `chatbot-message ${message.type}-message`;
  
  // Format the message text if it's an object
  let text = message.text;
  if (typeof text === 'object') {
    text = JSON.stringify(text, null, 2);
  }
  
  let html = text;
  if (message.sources) {
    html += `<div class="sources">Sources: ${message.sources.join(', ')}</div>`;
  }
  
  messageEl.innerHTML = html;
  container.appendChild(messageEl);
}

const sendMessage = async (container, chatbotId) => {
  if (!chatbotId) {
    console.error("No chatbotId provided to sendMessage");
    return;
  }

  const inputEl = container.querySelector(".chatbot-input input");
  const messagesContainer = container.querySelector(".chatbot-messages");
  const text = inputEl.value.trim();
  
  if (!text) return;

  try {
    // Add user message immediately
    addMessage(messagesContainer, {
      type: 'user',
      text: text
    });

    // Clear input and show loading
    inputEl.value = "";
    showTypingIndicator(container, true);

    // Get response from API
    const data = await askQuestion(text, chatbotId);

    // Format the response text
    const responseText = typeof data.response === 'object' 
      ? JSON.stringify(data.response, null, 2)
      : String(data.response);

    // Add bot response
    addMessage(messagesContainer, {
      type: 'bot',
      text: responseText,
      sources: data.sources
    });

  } catch (error) {
    console.error("Error in sendMessage:", error);
    addMessage(messagesContainer, {
      type: 'error',
      text: error.message || 'Sorry, I encountered an error. Please try again.'
    });
  } finally {
    showTypingIndicator(container, false);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
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