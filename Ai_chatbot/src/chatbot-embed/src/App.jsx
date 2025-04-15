import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

const App = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const script = document.currentScript;
    const chatbotId = script?.getAttribute('chatbotId');

    const fetchSettings = async () => {
      const docRef = doc(db, 'chatbots', chatbotId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    };

    fetchSettings();
  }, []);

  if (!settings) return null;

  return (
    <div style={{ background: settings.backgroundColor }}>
      <img src={settings.logoUrl} width={30} height={30} />
      <p>{settings.initialGreeting}</p>
      <ul>
        {settings.initialQuestions.map((q, i) => (
          <li key={i}>{q}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;