// src/components/WhatsAppWebChat.jsx
import React, { useEffect, useState } from 'react';
import '../css/components/WhatsAppWebChat.css';

function WhatsAppWebChat() {
    const [qrUrl, setQrUrl] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchQRCode = async () => {
            try {
                console.log('Fetching QR code...'); // Debug log
                const response = await fetch('http://localhost:5000/generate_qr', {
                    method: 'GET',
                    headers: {
                        'Accept': 'image/png',
                    }
                });

                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }

                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setQrUrl(url);
                setError(null);
            } catch (err) {
                console.error('QR Code Error:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchQRCode();

        return () => {
            if (qrUrl) {
                URL.revokeObjectURL(qrUrl);
            }
        };
    }, []);

    if (isLoading) {
        return <div className="loading">Loading QR Code...</div>;
    }

    if (error) {
        return (
            <div className="error">
                <p>Error: {error}</p>
                <button onClick={() => window.location.reload()}>
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="whatsapp-qr-container">
            <h2>Scan to Chat on WhatsApp</h2>
            {qrUrl && (
                <div className="qr-content">
                    <img src={qrUrl} alt="WhatsApp QR Code" />
                    <p>Scan this QR code with your phone's camera</p>
                </div>
            )}
        </div>
    );
}

export default WhatsAppWebChat;
