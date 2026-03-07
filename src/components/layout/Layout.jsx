import React from 'react';
import { Link } from 'react-router-dom';
import { FiAward, FiSearch } from 'react-icons/fi';
import './Layout.css';

const Layout = ({ children }) => {

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
