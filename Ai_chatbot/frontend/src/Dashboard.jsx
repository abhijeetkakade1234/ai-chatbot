import React, { useState, useEffect, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, getAuth } from "firebase/auth";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import "./css/Dashboard.css";
import { saveUserSettings, fetchUserSettings } from "./utils/saveSettings";
import FileUpload from "./components/FileUpload";

// Convert regular imports to lazy imports
const Sidebar = lazy(() => import("./components/Sidebar"));
const TopHeader = lazy(() => import("./components/TopHeader"));
const CustomizationPanel = lazy(() =>
  import("./components/CustomizationPanel")
);
const ChatbotPreview = lazy(() => import("./components/ChatbotPreview"));
const EmbedCodeBlock = lazy(() => import("./components/EmbedCodeBlock"));

// Add loading fallback
const LoadingFallback = () => <div>Loading...</div>;

function Dashboard() {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  React.useEffect(() => {
    console.log('Current auth state:', {
      isAuthenticated: !!auth.currentUser,
      userId: auth.currentUser?.uid
    });
  }, [auth.currentUser]);

  const navigate = useNavigate();
  const [chatbotSize, setChatbotSize] = useState("medium");
  const [logoUrl, setLogoUrl] = useState("");
  const [initialGreeting, setInitialGreeting] = useState(
    "Have questions? Ask me anything!"
  );
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [initialQuestions, setInitialQuestions] = useState([
    "What are some of the main features?",
    "How do I change my password?",
  ]);
  const [updateKey, setUpdateKey] = useState(0); // Add this line at the top with other states

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const savedSettings = await fetchUserSettings(user.uid);
        if (savedSettings) {
          setChatbotSize(savedSettings.chatbotSize || "medium");
          setLogoUrl(savedSettings.logoUrl || "");
          setInitialGreeting(savedSettings.initialGreeting || "");
          setBackgroundColor(savedSettings.backgroundColor || "#000000");
          setInitialQuestions(savedSettings.initialQuestions || []);
        }
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSave = async () => {
    const settings = {
      chatbotSize,
      logoUrl,
      initialGreeting,
      backgroundColor,
      initialQuestions,
    };
    await saveUserSettings(userId, settings);
    setUpdateKey(prev => prev + 1); // Force re-render of ChatbotPreview
    alert("Settings saved!");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    alert("Embed code copied!");
  };

  if (!userId) {
    return <div>Please log in to view the dashboard</div>;
  }

  return (
    <div className="dashboard-container">
      <Suspense fallback={<LoadingFallback />}>
        <Sidebar onLogout={handleLogout} />
        <main className="main-content">
          <TopHeader />
          <section className="content-area">
            <CustomizationPanel
              chatbotSize={chatbotSize}
              setChatbotSize={setChatbotSize}
              logoUrl={logoUrl}
              setLogoUrl={setLogoUrl}
              initialGreeting={initialGreeting}
              setInitialGreeting={setInitialGreeting}
              backgroundColor={backgroundColor}
              setBackgroundColor={setBackgroundColor}
              initialQuestions={initialQuestions}
              setInitialQuestions={setInitialQuestions}
              fileUpload={FileUpload}
              onSave={handleSave}
              chatbotId={userId} 
            />

            <ChatbotPreview
              key={updateKey} // Add this line
              chatbotId={userId}
              initialQuestions={initialQuestions}
              backgroundColor={backgroundColor}
              chatbotSize={chatbotSize}
              logoUrl={logoUrl}
              initialGreeting={initialGreeting}
              forceUpdate={updateKey} // Add this line
            />
          </section>
        </main>
      </Suspense>
    </div>
  );
}

export default Dashboard;
