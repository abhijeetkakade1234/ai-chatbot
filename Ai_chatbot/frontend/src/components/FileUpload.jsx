import React, { useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "../css/components/FileUpload.css"; // 🆕 import CSS for styling

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState("");

  // Fetch the userId from Firebase
  React.useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid); // Set the userId from Firebase
      } else {
        setUserId(null); // User is not logged in
      }
    });
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    if (!userId) {
      setMessage("User is not authenticated.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

    try {
      const response = await fetch("http://localhost:5000/push_user_info_database", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("File uploaded successfully: " + JSON.stringify(data));
      } else {
        setMessage("Error: " + data.error);
      }
    } catch (error) {
      setMessage("An error occurred: " + error.message);
    }
  };

  return (
    <div className="file-upload-container">
      <h1 className="file-upload-title">Upload File</h1>
      <form onSubmit={handleSubmit}>
        <input className="file-upload-input" type="file" onChange={handleFileChange} />
        <button className="file-upload-button" type="submit">Upload</button>
        <p className="file-upload-instruction">Please select a file to upload.</p>
        {message && <p className="file-upload-message">{message}</p>}
      </form>
    </div>
  );
};

export default FileUpload;