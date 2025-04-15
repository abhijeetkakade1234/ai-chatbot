// src/utils/saveSettings.jsx
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export const saveUserSettings = async (settings) => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await setDoc(doc(db, 'chatbotSettings', user.uid), settings);
    console.log('Settings saved!');
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

export const fetchUserSettings = async () => {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const docRef = doc(db, 'chatbotSettings', user.uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
};
