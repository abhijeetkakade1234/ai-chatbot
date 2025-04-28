import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from './firebase';
import './css/AuthForm.css';

function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    setError('');
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      // ✅ Go to upload after auth
      navigate('/upload');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // ✅ Go to upload after Google sign-in
      navigate('/upload');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showResetForm) {
    return (
      <div className="auth-container">
        <div className="auth-form-container">
          <h2>Reset Password</h2>
          {resetEmailSent ? (
            <div className="success-message">
              <p>Password reset email sent! Please check your inbox.</p>
              <button 
                className="btn back-btn" 
                onClick={() => {
                  setShowResetForm(false);
                  setResetEmailSent(false);
                }}
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  id="email"
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" 
                  required 
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="buttons-container">
                <button 
                  type="submit" 
                  className="btn primary-btn" 
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </button>
                <button 
                  type="button" 
                  className="btn back-btn" 
                  onClick={() => setShowResetForm(false)}
                  disabled={loading}
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        <form onSubmit={handleEmailAuth}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              id="email"
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email" 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password" 
              required 
              minLength="6"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="buttons-container">
            <button 
              type="submit" 
              className="btn primary-btn" 
              disabled={loading}
            >
              {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
            </button>
          </div>
        </form>

        <div className="separator"><span>OR</span></div>

        <button 
          onClick={handleGoogleSignIn} 
          className="btn google-btn"
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"/>
          </svg>
          Sign in with Google
        </button>

        <div className="auth-links">
          <button 
            type="button" 
            className="link-btn" 
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
          </button>

          {isLogin && (
            <button 
              type="button" 
              className="link-btn" 
              onClick={() => setShowResetForm(true)}
            >
              Forgot Password?
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthForm;
