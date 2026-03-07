import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createItem } from '../../services/itemService';
import { logActivity } from '../../services/activityService';
import toast from 'react-hot-toast';
import { FiX, FiLink, FiFileText } from 'react-icons/fi';
import '../../styles/AddItemModal.css';

const ITEM_TYPES = [
  { value: 'article', label: 'Article', icon: '📄' },
  { value: 'video', label: 'Video', icon: '🎥' },
  { value: 'podcast', label: 'Podcast', icon: '🎙️' },
  { value: 'book', label: 'Book', icon: '📚' },
  { value: 'person', label: 'Person', icon: '👤' },
  { value: 'other', label: 'Other', icon: '📎' }
];

export default function AddItemModal({ folderId, userId, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    item_type: 'article',
    note_content: ''
  });

  const createItemMutation = useMutation({
    mutationFn: async (data) => {
      // Create the item
      const item = await createItem({
        user_id: userId,
        folder_id: folderId,
        title: data.title,
        url: data.url,
        description: data.description,
        item_type: data.item_type
      });

      // Log activity for badge tracking
      await logActivity(userId, 'link_saved', {
        item_id: item.id,
        folder_id: folderId
      });

      // Create note if provided
      if (data.note_content?.trim()) {
        const { supabase } = await import('../../services/supabase');
        await supabase.from('notes').insert({
          user_id: userId,
          item_id: item.id,
          content: data.note_content
        });
      }

      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['items', folderId]);
      queryClient.invalidateQueries(['notes', folderId]);
      toast.success('Item added successfully!');
      onClose();
    },
    onError: (error) => {
      console.error('Error creating item:', error);
      toast.error('Failed to add item');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.item_type) {
      toast.error('Please select an item type');
      return;
    }

    createItemMutation.mutate(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-item-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Item</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Item Type Selection */}
          <div className="form-group">
            <label>Type *</label>
            <div className="item-type-grid">
              {ITEM_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={`item-type-btn ${formData.item_type === type.value ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, item_type: type.value })}
                >
                  <span className="type-icon">{type.icon}</span>
                  <span className="type-label">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label>
              <FiFileText size={14} />
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., React 19 Features Overview"
              required
              autoFocus
            />
          </div>

          {/* URL */}
          <div className="form-group">
            <label>
              <FiLink size={14} />
              URL
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this item..."
              rows={3}
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={formData.note_content}
              onChange={(e) => setFormData({ ...formData, note_content: e.target.value })}
              placeholder="Your thoughts, takeaways, or highlights..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={createItemMutation.isPending}
            >
              {createItemMutation.isPending ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
