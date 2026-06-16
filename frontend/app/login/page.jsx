"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '../../utils/api';
import './page.css';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect to home if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/');
    }
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await apiService.login(username, password);
      } else {
        await apiService.signup(username, password);
      }
      router.push('/');
    } catch (err) {
      console.error('Auth error:', err);
      const errMsg = err.response?.data?.message || 'Authentication failed. Please try again.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authContainer">
      <div className="authCard">
        <div className="authHeader">
          <h1>SelfMony</h1>
          <p>{isLogin ? 'Sign in to access your finances' : 'Create an account to track expenses'}</p>
        </div>

        <form onSubmit={handleSubmit} className="authForm">
          {error && <div className="errorMessage">{error}</div>}

          <div className="formGroup">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <button type="submit" className="authBtn" disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'SIGN IN' : 'SIGN UP'}
          </button>
        </form>

        <div className="authToggle">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
