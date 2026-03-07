import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiMenu, FiX, FiPlus, FiHome, FiSearch, FiAward } from 'react-icons/fi';
import '../../styles/Sidebar.css';

export default function Sidebar({ folders, onCreateFolder, isLoading }) {
  const [isOpen, setIsOpen] = useState(true);
  const { folderId } = useParams();

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Hamburger Button */}
      <button className="hamburger-btn" onClick={toggleSidebar}>
        {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-logo">LinkTree</h1>
        </div>

        {/* Main Navigation */}
        <nav className="sidebar-nav">
          <Link to="/" className={`nav-item ${!folderId ? 'active' : ''}`}>
            <FiHome size={18} />
            <span>All Folders</span>
          </Link>
          <Link to="/search" className="nav-item">
            <FiSearch size={18} />
            <span>Search</span>
          </Link>
          <Link to="/badges" className="nav-item">
            <FiAward size={18} />
            <span>Badges</span>
          </Link>
        </nav>

        {/* Folders Section */}
        <div className="sidebar-section">
          <div className="section-header">
            <h3>Folders</h3>
            <button 
              className="icon-btn" 
              onClick={onCreateFolder}
              title="Create new folder"
            >
              <FiPlus size={16} />
            </button>
          </div>

          <div className="folders-list">
            {isLoading ? (
              <div className="sidebar-loading">Loading folders...</div>
            ) : folders && folders.length > 0 ? (
              folders.map(folder => (
                <Link
                  key={folder.id}
                  to={`/folder/${folder.id}`}
                  className={`folder-item ${folderId === folder.id ? 'active' : ''}`}
                  style={{ '--folder-color': folder.color }}
                >
                  <span className="folder-icon">{folder.icon}</span>
                  <span className="folder-name">{folder.name}</span>
                </Link>
              ))
            ) : (
              <div className="sidebar-empty">
                <p>No folders yet</p>
                <button onClick={onCreateFolder} className="btn-link">
                  Create your first folder
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
