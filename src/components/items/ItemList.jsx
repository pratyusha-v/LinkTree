import ItemCard from './ItemCard';
import '../../styles/ItemList.css';

export default function ItemList({ items, notes, isLoading, onItemClick, onEdit, onDelete, onAddClick }) {
  if (isLoading) {
    return (
      <div className="items-loading">
        <div className="spinner"></div>
        <p>Loading items...</p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="items-empty">
        <div className="empty-tree-image">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="35" r="12" fill="#10b981"/>
            <circle cx="40" cy="55" r="10" fill="#10b981"/>
            <circle cx="80" cy="55" r="10" fill="#10b981"/>
            <circle cx="30" cy="75" r="8" fill="#10b981"/>
            <circle cx="60" cy="75" r="8" fill="#10b981"/>
            <circle cx="90" cy="75" r="8" fill="#10b981"/>
            <line x1="60" y1="47" x2="60" y2="90" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round"/>
            <line x1="60" y1="55" x2="40" y2="55" stroke="#8b5cf6" strokeWidth="3"/>
            <line x1="60" y1="55" x2="80" y2="55" stroke="#8b5cf6" strokeWidth="3"/>
            <line x1="40" y1="65" x2="30" y2="75" stroke="#8b5cf6" strokeWidth="2"/>
            <line x1="60" y1="65" x2="60" y2="75" stroke="#8b5cf6" strokeWidth="2"/>
            <line x1="80" y1="65" x2="90" y2="75" stroke="#8b5cf6" strokeWidth="2"/>
            <rect x="55" y="90" width="10" height="15" rx="2" fill="#92400e"/>
          </svg>
        </div>
        <h3>No items yet</h3>
        <p>Start saving links, articles, books, and more to this folder.</p>
        {onAddClick && (
          <button className="empty-add-button" onClick={onAddClick}>
            Add your first link
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="items-list">
      {items.map(item => (
        <ItemCard
          key={item.id}
          item={item}
          notes={notes}
          onClick={onItemClick}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
