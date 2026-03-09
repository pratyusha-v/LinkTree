import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiMenu, FiX, FiPlus, FiHome, FiSearch, FiAward, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import '../../styles/Sidebar.css';

export default function Sidebar({ folders, onCreateFolder, isLoading }) {
  const [isOpen, setIsOpen] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const { folderId } = useParams();

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Separate active and archived folders
  const activeFolders = folders?.filter(f => !f.is_archived) || [];
  const archivedFolders = folders?.filter(f => f.is_archived) || [];

  return (
    <>
      {/* Hamburger Button */}
      <button className="hamburger-btn" onClick={toggleSidebar}>
        {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-tree">
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
            LinkTree
          </h1>
        </div>

        {/* Main Navigation */}
        <nav className="sidebar-nav">
          <Link to="/" className="nav-item">
            <FiHome size={18} />
            <span>Home</span>
          </Link>
          <Link to="/search" className="nav-item">
            <FiSearch size={18} />
            <span>Search</span>
          </Link>
          <Link to="/badges" className="nav-item">
            <FiAward size={18} />
            <span>Stats & Badges</span>
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
            ) : activeFolders && activeFolders.length > 0 ? (
              activeFolders.map(folder => (
                <Link
                  key={folder.id}
                  to={`/folder/${folder.id}`}
                  className={`folder-item ${folderId === folder.id ? 'active' : ''}`}
                  style={{ '--folder-color': folder.color }}
                >
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

        {/* Archived Folders Section */}
        {archivedFolders.length > 0 && (
          <div className="sidebar-section archived-section">
            <button 
              className="section-header-toggle"
              onClick={() => setShowArchived(!showArchived)}
            >
              <h3>Archived ({archivedFolders.length})</h3>
              {showArchived ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </button>

            {showArchived && (
              <div className="folders-list">
                {archivedFolders.map(folder => (
                  <Link
                    key={folder.id}
                    to={`/folder/${folder.id}`}
                    className={`folder-item archived ${folderId === folder.id ? 'active' : ''}`}
                    style={{ '--folder-color': folder.color }}
                  >
                    <span className="folder-name">{folder.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
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
