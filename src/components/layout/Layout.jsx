import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiLogOut, FiAward, FiUser, FiSearch } from 'react-icons/fi';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/dashboard" className="navbar-brand">
            📚 LinkTree
          </Link>

          <div className="navbar-actions">
            <Link to="/search" className="nav-link" title="Search">
              <FiSearch size={20} />
            </Link>
            <Link to="/profile" className="nav-link" title="Badges & Profile">
              <FiAward size={20} />
            </Link>
            <div className="nav-user">
              <FiUser size={18} />
              <span className="nav-user-name">{user?.email}</span>
            </div>
            <button 
              onClick={handleSignOut} 
              className="btn-icon" 
              title="Sign Out"
            >
              <FiLogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
