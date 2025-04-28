// src/WhatsAppPage.jsx
import React, { Suspense, useState, useEffect } from 'react';
import { collection, getDoc, setDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';  // Fixed import
import Sidebar from './components/Sidebar';
import WhatsAppWebChat from './components/WhatsAppWebChat';
import { db } from './firebase';
import './css/WhatsAppPage.css';

function WhatsAppPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState('');
  const [savedNumber, setSavedNumber] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const fetchUserPhoneNumber = async () => {
      try {
        if (!auth.currentUser) {
          throw new Error('User not authenticated');
        }

        const phoneNumbersCollection = collection(db, 'phone_numbers');
        const querySnapshot = await getDocs(query(
          phoneNumbersCollection, 
          where('uid', '==', auth.currentUser.uid)
        ));

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setSavedNumber({
            phoneNumber: doc.id
          });
        }
      } catch (error) {
        console.error('Error fetching phone number:', error);
        setStatus('Error: Unable to load phone number');
      }
    };

    fetchUserPhoneNumber();
  }, [auth.currentUser]);

  const handleNumberSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      if (!phoneNumber.match(/^\+?[1-9]\d{1,14}$/)) {
        throw new Error('Invalid phone number format');
      }

      const formattedNumber = `whatsapp:+${phoneNumber.replace(/\D/g, '')}`;
      
      // Use formatted phone number as document ID and store only the UID
      const phoneNumberRef = doc(db, 'phone_numbers', formattedNumber);
      await setDoc(phoneNumberRef, {
        uid: auth.currentUser.uid
      });

      // Update local state
      setSavedNumber({
        phoneNumber: formattedNumber
      });

      setStatus('WhatsApp number updated successfully!');
      setPhoneNumber('');
    } catch (error) {
      console.error('Error managing WhatsApp number:', error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Suspense fallback={<div>Loading...</div>}>
        <Sidebar />
        <main className="main-content">
          <section className="content-area">
            <h1>🔗 WhatsApp Integration</h1>
            
            <div className="phone-number-form">
              <h2>WhatsApp Number Configuration</h2>
              {!auth.currentUser && (
                <div className="error-message">
                  ⚠️ Please log in to configure WhatsApp
                </div>
              )}
              
              {savedNumber ? (
                <div className="current-number">
                  <h3>Current WhatsApp Number</h3>
                  <p>{savedNumber.phoneNumber}</p>
                  <button 
                    className="change-number-btn"
                    onClick={() => setPhoneNumber(savedNumber.phoneNumber)}
                  >
                    Change Number
                  </button>
                </div>
              ) : (
                <p>No WhatsApp number configured</p>
              )}

              <form onSubmit={handleNumberSubmit}>
                <div className="input-group">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={savedNumber ? "Enter new number" : "Enter WhatsApp number"}
                    pattern="^\+?[1-9]\d{1,14}$"
                    required
                    className="phone-input"
                    disabled={isLoading || !auth.currentUser}
                  />
                  <button 
                    type="submit" 
                    className="add-button"
                    disabled={isLoading || !auth.currentUser}
                  >
                    {!auth.currentUser ? 'Please Login' : 
                      isLoading ? 'Processing...' : 
                      savedNumber ? 'Update Number' : 'Add Number'}
                  </button>
                </div>
                {status && (
                  <p className={status.includes('Error') ? 'error-message' : 'success-message'}>
                    {status}
                  </p>
                )}
              </form>

              <WhatsAppWebChat />
            </div>
          </section>
        </main>
      </Suspense>
    </div>
  );
}

export default WhatsAppPage;
