// src/utils/saveSettings.jsx
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // no need for `auth` here

export const saveUserSettings = async (userId, settings) => {
  if (!userId) return;
  try {
    await setDoc(doc(db, 'chatbotSettings', userId), settings, { merge: true }); // 🛠 merge!
    console.log('Settings saved!');
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

export const fetchUserSettings = async (userId) => {
  if (!userId) return null;
  try {
    const docRef = doc(db, 'chatbotSettings', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
};
