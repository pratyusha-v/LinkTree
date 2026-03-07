import React from 'react';
import NotesList from '../notes/NotesList';
import './ItemDetailModal.css';

const ItemDetailModal = ({ item, notes, isOpen, onClose }) => {
  if (!isOpen || !item) return null;

  const itemNotes = notes?.filter(note => note.item_id === item.id) || [];

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content item-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="item-detail-header">
            <span className="item-type-icon">{getItemTypeIcon(item.item_type)}</span>
            <h2>{item.title}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="item-detail-body">
          {item.description && (
            <div className="item-detail-section">
              <h3>Description</h3>
              <p>{item.description}</p>
            </div>
          )}

          {item.url && (
            <div className="item-detail-section">
              <h3>URL</h3>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="item-detail-url"
              >
                {item.url}
              </a>
            </div>
          )}

          <div className="item-detail-section">
            <NotesList notes={itemNotes} itemId={item.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailModal;
