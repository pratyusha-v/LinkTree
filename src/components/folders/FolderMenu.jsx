import React, { useState, useRef, useEffect } from 'react';
import { FiMoreVertical, FiEdit2, FiTrash2, FiArchive, FiRefreshCw } from 'react-icons/fi';
import './FolderMenu.css';

const FolderMenu = ({ folder, onRename, onDelete, onArchive, onUnarchive }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (action) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="folder-menu" ref={menuRef}>
      <button
        className="folder-menu-trigger"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        title="More options"
      >
        <FiMoreVertical size={20} />
      </button>

      {isOpen && (
        <div className="folder-menu-dropdown">
          <button
            className="folder-menu-item"
            onClick={() => handleAction(onRename)}
          >
            <FiEdit2 size={16} />
            <span>Rename</span>
          </button>

          {folder.is_archived ? (
            <button
              className="folder-menu-item"
              onClick={() => handleAction(onUnarchive)}
            >
              <FiRefreshCw size={16} />
              <span>Unarchive</span>
            </button>
          ) : (
            <button
              className="folder-menu-item"
              onClick={() => handleAction(onArchive)}
            >
              <FiArchive size={16} />
              <span>Archive</span>
            </button>
          )}

          <button
            className="folder-menu-item delete"
            onClick={() => handleAction(onDelete)}
          >
            <FiTrash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FolderMenu;
