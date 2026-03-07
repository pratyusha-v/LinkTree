import { FiExternalLink, FiBookOpen, FiVideo, FiHeadphones, FiUser, FiFile } from 'react-icons/fi';
import '../../styles/ItemCard.css';

const getItemIcon = (type) => {
  switch (type) {
    case 'article':
      return <FiFile size={16} />;
    case 'video':
      return <FiVideo size={16} />;
    case 'podcast':
      return <FiHeadphones size={16} />;
    case 'book':
      return <FiBookOpen size={16} />;
    case 'person':
      return <FiUser size={16} />;
    default:
      return <FiFile size={16} />;
  }
};

const getItemTypeLabel = (type) => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export default function ItemCard({ item, notes, onClick }) {
  const itemNotes = notes?.filter(note => note.item_id === item.id) || [];

  return (
    <div className="item-card" onClick={() => onClick?.(item)}>
      <div className="item-card-header">
        <div className="item-type">
          {getItemIcon(item.item_type)}
          <span>{getItemTypeLabel(item.item_type)}</span>
        </div>
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="item-external-link"
            onClick={(e) => e.stopPropagation()}
          >
            <FiExternalLink size={16} />
          </a>
        )}
      </div>

      <h3 className="item-title">{item.title}</h3>

      {item.description && (
        <p className="item-description">{item.description}</p>
      )}

      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="item-url"
          onClick={(e) => e.stopPropagation()}
        >
          {item.url}
        </a>
      )}

      {itemNotes.length > 0 && (
        <div className="item-notes-preview">
          <div className="note-icon">💬</div>
          <div className="note-content">
            {itemNotes[0].content}
          </div>
        </div>
      )}

      <div className="item-card-footer">
        <span className="item-date">Added {formatDate(item.created_at)}</span>
        {itemNotes.length > 1 && (
          <span className="item-notes-count">+{itemNotes.length - 1} more notes</span>
        )}
      </div>
    </div>
  );
}
