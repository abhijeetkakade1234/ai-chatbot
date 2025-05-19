// chatbot.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// 1. Firebase config

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2. Inject ChatbotPreview-style CSS
function injectStyles() {
  const style = document.createElement("style");
  style.innerHTML = `
    .chatbot-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }

    .chatbot-preview {
      transition: all 0.3s ease-in-out;
      width: 350px;
      min-height: 500px;
      border-radius: 10px;
      font-family: Arial, sans-serif;
      color: #fff;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
    }

    .chatbot-preview.small {
      min-height: 400px !important;
      font-size: 0.9em;
    }

    .chatbot-preview.medium {
      min-height: 500px !important;
      font-size: 1em;
    }

    .chatbot-preview.large {
      min-height: 600px !important;
      font-size: 1.1em;
    }

    .chatbot-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      font-weight: bold;
      background-color: rgba(0,0,0,0.3);
    }

    .chatbot-icon img {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      object-fit: cover;
    }

    .chatbot-title {
      font-size: 1rem;
      flex-grow: 1;
    }

    .chatbot-close-btn {
      background: transparent;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
    }

    .chatbot-body {
      height: calc(100% - 60px);
      flex: 1;
      background-color: #f5f5f5;
      color: #000;
      padding: 10px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      max-height: 100%;
    }

    .chatbot-messages {
  flex: 1;
  overflow-y: auto;
  max-height: 300px; /* You can adjust this value */
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scrollbar-color: #888 #f5f5f5;
  scrollbar-width: thin;
}


    .message {
      padding: 8px 12px;
      border-radius: 8px;
      max-width: 80%;
    }

    .message.user {
      background-color: #007bff;
      color: white;
      align-self: flex-end;
    }

    .message.bot {
      background-color: #f0f0f0;
      color: #333;
      align-self: flex-start;
    }

    .message.error {
      background-color: #ffebee;
      color: #c62828;
      align-self: center;
    }

    .message.loading {
      background-color: #f0f0f0;
      color: #666;
      align-self: center;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }

    .sources {
      font-size: 0.8em;
      margin-top: 4px;
      color: #666;
    }

    .chatbot-questions {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .chatbot-question {
      padding: 8px 12px;
      background-color: #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .chatbot-question:hover {
      background-color: #d0d0d0;
    }

    .chatbot-input {
      margin-top: 10px;
      display: flex;
      gap: 5px;
    }

    .chatbot-input input {
      flex: 1;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 6px;
    }

    .send-btn {
      padding: 0 10px;
      border: none;
      background-color: #222;
      color: #fff;
      border-radius: 6px;
      cursor: pointer;
    }

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
      position: absolute;
      bottom: 0;
      right: 0;
    }

    .chatbot-toggle-button img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }

    .hidden {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}

// 3. Render Chatbot UI
function renderChatbot(container, data) {
  const wrapper = document.createElement("div");
  wrapper.className = "chatbot-container";

  const chatbotHTML = `
    <div class="chatbot-preview ${
      data.chatbotSize || "medium"
    }" style="background-color: ${data.backgroundColor || "#000"}">
      <div class="chatbot-header">
        <div class="chatbot-icon">
          ${
            data.logoUrl
              ? `<img src="${data.logoUrl}" alt="Bot" />`
              : `<span>🤖</span>`
          }
        </div>
        <div class="chatbot-title">${data.botName || "Your Bot"}</div>
        <button class="chatbot-close-btn">×</button>
      </div>

      <div class="chatbot-body">
        <div class="chatbot-messages">
          <div class="message bot">${
            data.initialGreeting || "Hello! How can I assist you today?"
          }</div>
        </div>

        <div class="chatbot-questions">
          ${data.initialQuestions
            ?.map((q) => `<div class="chatbot-question">${q}</div>`)
            .join("")}
        </div>

        <form class="chatbot-input">
          <input type="text" placeholder="Type here..." />
          <button type="submit" class="send-btn">➤</button>
        </form>
      </div>
    </div>

    <div class="chatbot-toggle-button hidden">
      <img src="${data.logoUrl || "🤖"}" alt="Bot" />
    </div>
  `;

  wrapper.innerHTML = chatbotHTML;
  container.appendChild(wrapper);

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

  const inputEl = wrapper.querySelector(".chatbot-input input");
  const form = wrapper.querySelector(".chatbot-input");
  const questions = wrapper.querySelectorAll(".chatbot-question");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = inputEl.value.trim();
    if (text) {
      sendMessage(wrapper, data.chatbotId);
    }
  });

  questions.forEach((q) => {
    q.addEventListener("click", () => {
      inputEl.value = q.innerText;
      sendMessage(wrapper, data.chatbotId);
      q.parentElement.style.display = "none";
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

    const chatbotData = {
      ...snap.data(),
      chatbotId,
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
        Accept: "application/json",
      },
      mode: "cors",
      credentials: "include",
      body: JSON.stringify({
        query: query.trim(),
        userId: chatbotId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();

    if (typeof data === "object") {
      if (typeof data === "string") return { response: data };
      if (data.response) return { response: data.response };
      if (data.message) return { response: data.message };
      if (data.answer) return { response: data.answer };
      return { response: JSON.stringify(data, null, 2) };
    }

    throw new Error("Invalid response format");
  } catch (error) {
    console.error("Error in askQuestion:", error);
    throw error;
  }
}

function addMessage(container, message) {
  const messageEl = document.createElement("div");
  messageEl.className = `message ${message.type}`;
  messageEl.innerText = message.text;

  if (message.sources) {
    const sources = document.createElement("div");
    sources.className = "sources";
    sources.innerText = `Sources: ${message.sources.join(", ")}`;
    messageEl.appendChild(sources);
  }

  const messagesContainer = container.querySelector(".chatbot-messages");
  messagesContainer.appendChild(messageEl);
}

const sendMessage = async (container, chatbotId) => {
  const inputEl = container.querySelector(".chatbot-input input");
  const messagesContainer = container.querySelector(".chatbot-messages");
  const text = inputEl.value.trim();

  if (!text) return;

  try {
    addMessage(container, {
      type: "user",
      text: text,
    });

    inputEl.value = "";
    const loadingEl = document.createElement("div");
    loadingEl.className = "message loading";
    loadingEl.innerText = "Thinking...";
    messagesContainer.appendChild(loadingEl);

    const data = await askQuestion(text, chatbotId);

    messagesContainer.removeChild(loadingEl);

    addMessage(container, {
      type: "bot",
      text: data.response,
      sources: data.sources,
    });
  } catch (error) {
    console.error("sendMessage error:", error);
    addMessage(container, {
      type: "error",
      text: error.message || "Something went wrong. Try again.",
    });
  }
};
