import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "../css/components/FileUpload.css";
import { useNavigate } from 'react-router-dom';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
  }, []);

  const uploadFile = async (file, userId) => {
    const apiUrl = "http://localhost:5000/push_user_info_database";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
        mode: 'cors',  // Add this
        credentials: 'same-origin',  // Add this
        headers: {
          'Accept': 'application/json',  // Add these headers
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type if needed
      if (selectedFile.type === 'application/pdf' || 
          selectedFile.type === 'text/plain' ||
          selectedFile.type === 'application/msword' ||
          selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setFile(selectedFile);
        setMessage("");
      } else {
        setFile(null);
        setMessage("Please select a valid document file (PDF, TXT, DOC, DOCX)");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    if (!userId) {
      setMessage("Please login to upload files.");
      return;
    }

    setIsUploading(true);
    setMessage("Uploading file...");

    try {
      const result = await uploadFile(file, userId);
      setMessage(`File uploaded successfully! ${result.message || ''}`);
      setFile(null);
      navigate('/dashboard');
      // Reset file input
      e.target.reset();
    } catch (error) {
      setMessage(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      navigate('/dashboard');
    }
  };

  return (
    <div className="file-upload-container">
      <h1 className="file-upload-title">Upload Document</h1>
      <form onSubmit={handleSubmit}>
        <div className="file-upload-input-group">
          <input 
            type="file" 
            onChange={handleFileChange}
            accept=".pdf,.txt,.doc,.docx"
            disabled={isUploading}
            className="file-upload-input"
          />
          <button 
            type="submit" 
            disabled={!file || isUploading}
            className={`file-upload-button ${isUploading ? 'uploading' : ''}`}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
        <p className="file-upload-instruction">
          Supported formats: PDF, TXT, DOC, DOCX
        </p>
        {message && (
          <p className={`file-upload-message ${message.includes('failed') ? 'error' : 'success'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default FileUpload;

