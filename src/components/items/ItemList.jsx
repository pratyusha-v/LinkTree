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
          <img 
            src="https://img.icons8.com/fluency/128/tree.png" 
            alt="Empty folder"
          />
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
