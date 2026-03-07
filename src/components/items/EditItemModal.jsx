import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import './EditItemModal.css';

const EditItemModal = ({ item, isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    item_type: 'other',
    folder_id: ''
  });

  // Fetch folders for dropdown
  const { data: folders } = useQuery({
    queryKey: ['folders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', '00000000-0000-0000-0000-000000000001')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Initialize form with item data
  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        url: item.url || '',
        description: item.description || '',
        item_type: item.item_type || 'other',
        folder_id: item.folder_id || ''
      });
    }
  }, [item]);

  const updateMutation = useMutation({
    mutationFn: async (updatedData) => {
      const { error } = await supabase
        .from('items')
        .update({
          ...updatedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id);

      if (error) throw error;

      // Log activity
      await supabase.from('user_activity_log').insert({
        user_id: '00000000-0000-0000-0000-000000000001',
        activity_type: 'link_updated',
        activity_date: new Date().toISOString().split('T')[0],
        metadata: { item_id: item.id, changes: updatedData }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item updated successfully!');
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to update item: ' + error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    if (!formData.folder_id) {
      toast.error('Please select a folder');
      return;
    }

    updateMutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Item</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-item-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter item title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="url">URL</label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add a description..."
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="item_type">Type</label>
              <select
                id="item_type"
                name="item_type"
                value={formData.item_type}
                onChange={handleChange}
              >
                <option value="article">Article</option>
                <option value="video">Video</option>
                <option value="podcast">Podcast</option>
                <option value="book">Book</option>
                <option value="person">Person</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="folder_id">Folder *</label>
              <select
                id="folder_id"
                name="folder_id"
                value={formData.folder_id}
                onChange={handleChange}
                required
              >
                <option value="">Select folder...</option>
                {folders?.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.icon} {folder.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={updateMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemModal;
