import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchResults.css';

const SearchResults = ({ results, filterType, searchQuery, isLoading }) => {
  const navigate = useNavigate();

  const handleItemClick = (item) => {
    navigate('/');
  };

  const handleNoteClick = (note) => {
    navigate('/');
  };

  const handleFolderClick = (folder) => {
    navigate('/');
  };

  const highlightText = (text, query) => {
    if (!query || !text) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={index}>{part}</mark>
        : part
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getItemTypeIcon = (type) => {
    const icons = {
      article: '📄',
      video: '🎥',
      podcast: '🎙️',
      book: '📚',
      person: '👤',
      other: '🔗'
    };
    return icons[type] || icons.other;
  };

  if (searchQuery.trim().length < 2) {
    return (
      <div className="search-empty-state">
        <div className="search-empty-icon">🔍</div>
        <h3>Start typing to search</h3>
        <p>Search across all your items, notes, and folders</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="search-loading">
        <div className="loading-spinner"></div>
        <p>Searching...</p>
      </div>
    );
  }

  const totalResults = results.items.length + results.notes.length + results.folders.length;

  if (totalResults === 0) {
    return (
      <div className="search-empty-state">
        <div className="search-empty-icon">😕</div>
        <h3>No results found</h3>
        <p>Try different keywords or check your spelling</p>
      </div>
    );
  }

  return (
    <div className="search-results">
      {/* Items Section */}
      {(filterType === 'all' || filterType === 'items') && results.items.length > 0 && (
        <div className="results-section">
          <h3 className="results-section-title">
            <span className="results-icon">📎</span>
            Items ({results.items.length})
          </h3>
          <div className="results-list">
            {results.items.map((item) => (
              <div
                key={item.id}
                className="result-item"
                onClick={() => handleItemClick(item)}
              >
                <div className="result-header">
                  <span className="result-type-icon">{getItemTypeIcon(item.item_type)}</span>
                  <h4 className="result-title">
                    {highlightText(item.title, searchQuery)}
                  </h4>
                </div>
                {item.description && (
                  <p className="result-description">
                    {highlightText(truncateText(item.description), searchQuery)}
                  </p>
                )}
                {item.url && (
                  <p className="result-url">
                    {highlightText(truncateText(item.url, 80), searchQuery)}
                  </p>
                )}
                <div className="result-meta">
                  {item.folders && (
                    <span 
                      className="result-folder"
                      style={{ 
                        backgroundColor: item.folders.color + '20',
                        color: item.folders.color 
                      }}
                    >
                      {item.folders.icon} {item.folders.name}
                    </span>
                  )}
                  <span className="result-date">{formatDate(item.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes Section */}
      {(filterType === 'all' || filterType === 'notes') && results.notes.length > 0 && (
        <div className="results-section">
          <h3 className="results-section-title">
            <span className="results-icon">📝</span>
            Notes ({results.notes.length})
          </h3>
          <div className="results-list">
            {results.notes.map((note) => (
              <div
                key={note.id}
                className="result-item"
                onClick={() => handleNoteClick(note)}
              >
                <div className="result-header">
                  <span className="result-type-icon">📝</span>
                  <h4 className="result-title">Note</h4>
                </div>
                <p className="result-description">
                  {highlightText(truncateText(note.content, 200), searchQuery)}
                </p>
                <div className="result-meta">
                  {note.items?.title && (
                    <span className="result-linked-item">
                      🔗 {note.items.title}
                    </span>
                  )}
                  {note.items?.folders && (
                    <span 
                      className="result-folder"
                      style={{ 
                        backgroundColor: note.items.folders.color + '20',
                        color: note.items.folders.color 
                      }}
                    >
                      {note.items.folders.icon} {note.items.folders.name}
                    </span>
                  )}
                  <span className="result-date">{formatDate(note.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Folders Section */}
      {(filterType === 'all' || filterType === 'folders') && results.folders.length > 0 && (
        <div className="results-section">
          <h3 className="results-section-title">
            <span className="results-icon">📁</span>
            Folders ({results.folders.length})
          </h3>
          <div className="results-list">
            {results.folders.map((folder) => (
              <div
                key={folder.id}
                className="result-item"
                onClick={() => handleFolderClick(folder)}
              >
                <div className="result-header">
                  <span className="result-type-icon" style={{ color: folder.color }}>
                    {folder.icon}
                  </span>
                  <h4 className="result-title">
                    {highlightText(folder.name, searchQuery)}
                  </h4>
                </div>
                {folder.description && (
                  <p className="result-description">
                    {highlightText(truncateText(folder.description), searchQuery)}
                  </p>
                )}
                <div className="result-meta">
                  <span className="result-date">{formatDate(folder.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
