import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import './AuthForms.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      await signIn(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="8" r="4" fill="#10b981"/>
              <circle cx="10" cy="14" r="3" fill="#10b981"/>
              <circle cx="22" cy="14" r="3" fill="#10b981"/>
              <circle cx="7" cy="20" r="2.5" fill="#10b981"/>
              <circle cx="16" cy="20" r="2.5" fill="#10b981"/>
              <circle cx="25" cy="20" r="2.5" fill="#10b981"/>
              <line x1="16" y1="12" x2="16" y2="26" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"/>
              <line x1="16" y1="14" x2="10" y2="14" stroke="#8b5cf6" strokeWidth="1.5"/>
              <line x1="16" y1="14" x2="22" y2="14" stroke="#8b5cf6" strokeWidth="1.5"/>
              <line x1="10" y1="17" x2="7" y2="20" stroke="#8b5cf6" strokeWidth="1.5"/>
              <line x1="16" y1="17" x2="16" y2="20" stroke="#8b5cf6" strokeWidth="1.5"/>
              <line x1="22" y1="17" x2="25" y2="20" stroke="#8b5cf6" strokeWidth="1.5"/>
              <rect x="14" y="26" width="4" height="4" rx="1" fill="#92400e"/>
            </svg>
            Welcome to LinkTree
          </h1>
          <p className="text-secondary">Sign in to your knowledge library</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="link">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
