import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import Sidebar from "./components/Sidebar";
import "./css/Settings.css";

// React icons
import { FaCog, FaRobot, FaBullseye, FaSave, FaTrashAlt, FaPlus, FaPenFancy } from "react-icons/fa";

function Settings() {
  const [activeTab, setActiveTab] = useState("answerFormat");
  const [settings, setSettings] = useState({
    answerLength: "medium",
    tone: "friendly",
    gender: "neutral",
    botName: "",
    companyInfo: "",
    fallbackMessage: "",
    forbiddenWords: "",
    customInstructions: [],
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const docRef = doc(db, "chatbotSettings", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettings({
            answerLength: data.answerLength || "medium",
            tone: data.tone || "friendly",
            gender: data.gender || "neutral",
            botName: data.botName || "",
            companyInfo: data.companyInfo || "",
            fallbackMessage: data.fallbackMessage || "",
            forbiddenWords: data.forbiddenWords || "",
            customInstructions: Array.isArray(data.customInstructions)
              ? data.customInstructions
              : [],
          });
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please login to save settings");
      return;
    }

    setIsSaving(true);
    try {
      await setDoc(doc(db, "chatbotSettings", user.uid), {
        ...settings,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const saveSettings = async (newSettings) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await setDoc(doc(db, "chatbotSettings", user.uid), newSettings, { merge: true });
      // Call the API here after successful save
      callSettingsAPI(newSettings);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
    }
  };

  const handleInputChange = (field, value) => {
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Function to call the API
  const callSettingsAPI = async (settingsData) => {
    try {
      const response = await fetch("http://localhost:5000/update_settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settingsData),
      });

      if (!response.ok) {
        console.error("API call failed:", response.status, response.statusText);
      } else {
        console.log("API call successful");
      }
    } catch (error) {
      console.error("Error calling API:", error);
    }
  };

  const renderAnswerFormatTab = () => (
    <div className="settings-section">
      <h3><FaBullseye /> Answer Format</h3>
      <div className="option-group">
        <h4>• Length</h4>
        <select
          value={settings.answerLength}
          onChange={(e) => handleInputChange("answerLength", e.target.value)}
        >
          <option value="descriptive">Descriptive</option>
          <option value="medium">Medium</option>
          <option value="short">Short</option>
        </select>
      </div>

      <div className="option-group">
        <h4>• Chatbot Tone</h4>
        <select
          value={settings.tone}
          onChange={(e) => handleInputChange("tone", e.target.value)}
        >
          <option value="matter-of-fact">Matter of fact</option>
          <option value="friendly">Friendly</option>
          <option value="humorous">Humorous</option>
          <option value="neutral">Neutral</option>
          <option value="professional">Professional</option>
        </select>
      </div>

      <div className="option-group">
        <h4>• Chatbot Gender</h4>
        <select
          value={settings.gender}
          onChange={(e) => handleInputChange("gender", e.target.value)}
        >
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="neutral">Neutral</option>
        </select>
      </div>
    </div>
  );

  const renderBotDefaultsTab = () => (
    <div className="settings-section">
      <h3><FaRobot /> Bot Defaults</h3>
      <div className="input-group">
        <label>• AI Agent Name</label>
        <input
          type="text"
          value={settings.botName}
          onChange={(e) => handleInputChange("botName", e.target.value)}
          placeholder="Enter bot name"
          onKeyDown={(e) => e.key === "Enter" && saveSettings(settings)}
        />
      </div>

      <div className="input-group">
        <label>• Company Description</label>
        <textarea
          value={settings.companyInfo}
          onChange={(e) => handleInputChange("companyInfo", e.target.value)}
          placeholder="What is your company about?"
          onKeyDown={(e) => e.key === "Enter" && saveSettings(settings)}
        />
      </div>

      <div className="input-group">
        <label>• Fallback Response</label>
        <textarea
          value={settings.fallbackMessage}
          onChange={(e) => handleInputChange("fallbackMessage", e.target.value)}
          placeholder="What should the bot say when it doesn't know the answer?"
          onKeyDown={(e) => e.key === "Enter" && saveSettings(settings)}
        />
      </div>

      <div className="input-group">
        <label>• Forbidden Words</label>
        <textarea
          value={settings.forbiddenWords}
          onChange={(e) => handleInputChange("forbiddenWords", e.target.value)}
          placeholder="Enter words to avoid (comma-separated)"
          onKeyDown={(e) => e.key === "Enter" && saveSettings(settings)}
        />
      </div>
    </div>
  );

  const renderCustomInstructionsTab = () => {
    const updateInstructions = (newInstructions) => {
      const updatedSettings = {
        ...settings,
        customInstructions: newInstructions,
      };
      setSettings(updatedSettings);
      saveSettings(updatedSettings);
    };

    return (
      <div className="settings-section">
        <h3><FaPenFancy /> Custom Instructions</h3>
        <div className="instructions-list">
          {(settings.customInstructions || []).map((instruction, index) => (
            <div key={index} className="instruction-item">
              <input
                type="text"
                value={instruction}
                onChange={(e) => {
                  const newInstructions = [...settings.customInstructions];
                  newInstructions[index] = e.target.value;
                  updateInstructions(newInstructions);
                }}
              />
              <button
                onClick={() => {
                  const newInstructions = settings.customInstructions.filter(
                    (_, i) => i !== index
                  );
                  updateInstructions(newInstructions);
                }}
              >
                <FaTrashAlt />
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newInstructions = [
                ...(settings.customInstructions || []),
                "",
              ];
              updateInstructions(newInstructions);
            }}
          >
            <FaPlus /> Add Instruction
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="settings-container">
      <Sidebar />
      <main className="settings-content">
        <div className="settings-header">
          <h2><FaCog /> Settings</h2>
          <button
            className="save-button"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : <><FaSave style={{ marginRight: "6px" }} /> Save Settings</>}
          </button>
        </div>
        <div className="tabs">
          <button
            className={activeTab === "answerFormat" ? "active" : ""}
            onClick={() => setActiveTab("answerFormat")}
          >
            Answer Format
          </button>
          <button
            className={activeTab === "botDefaults" ? "active" : ""}
            onClick={() => setActiveTab("botDefaults")}
          >
            Bot Defaults
          </button>
          <button
            className={activeTab === "customInstructions" ? "active" : ""}
            onClick={() => setActiveTab("customInstructions")}
          >
            Custom Instructions
          </button>
        </div>

        {activeTab === "answerFormat" && renderAnswerFormatTab()}
        {activeTab === "botDefaults" && renderBotDefaultsTab()}
        {activeTab === "customInstructions" && renderCustomInstructionsTab()}
      </main>
    </div>
  );
}

export default Settings;