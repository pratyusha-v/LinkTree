import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFolders, createFolder } from '../../services/folderService';
import { createItem } from '../../services/itemService';
import { logActivity } from '../../services/activityService';
import { checkAndAwardBadges } from '../../services/badgeService';
import { supabase } from '../../services/supabase';
import BadgeNotification from '../badges/BadgeNotification';
import toast from 'react-hot-toast';
import { FiPlus, FiX, FiLink, FiFileText, FiUpload, FiFolder } from 'react-icons/fi';
import '../../styles/AddItemFab.css';

const ITEM_TYPES = [
  { value: 'article', label: 'Article', icon: '📄' },
  { value: 'video', label: 'Video', icon: '🎥' },
  { value: 'podcast', label: 'Podcast', icon: '🎙️' },
  { value: 'book', label: 'Book', icon: '📚' },
  { value: 'person', label: 'Person', icon: '👤' },
  { value: 'other', label: 'Other', icon: '📎' }
];

export default function AddItemFab({ userId }) {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [newBadge, setNewBadge] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    item_type: 'article',
    note_content: '',
    thumbnail_url: '',
    folder_id: '',
    new_folder_name: ''
  });

  const { data: folders } = useQuery({
    queryKey: ['folders', userId],
    queryFn: () => getFolders(userId),
    enabled: showModal
  });

  const createFolderMutation = useMutation({
    mutationFn: (data) => createFolder(userId, data),
    onSuccess: (newFolder) => {
      queryClient.invalidateQueries(['folders']);
      setFormData({ ...formData, folder_id: newFolder.id });
      setShowNewFolder(false);
      toast.success('Folder created!');
    }
  });

  const createItemMutation = useMutation({
    mutationFn: async (data) => {
      let folderId = data.folder_id;

      // Create folder if needed
      if (showNewFolder && data.new_folder_name) {
        const newFolder = await createFolder(userId, {
          name: data.new_folder_name
        });
        folderId = newFolder.id;
      }

      // Create item
      const item = await createItem(userId, {
        folder_id: folderId,
        title: data.title,
        url: data.url,
        description: data.description,
        item_type: data.item_type,
        thumbnail_url: data.thumbnail_url
      });

      // Log activity
      await logActivity(userId, 'link_saved', {
        item_id: item.id,
        folder_id: folderId
      });

      // Check and award badges
      const badges = await checkAndAwardBadges(userId);
      if (badges && badges.length > 0) {
        setNewBadge(badges[0].badge);
      }

      // Create note if provided
      if (data.note_content?.trim()) {
        await supabase.from('notes').insert({
          user_id: userId,
          item_id: item.id,
          content: data.note_content
        });
      }

      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['folders']);
      queryClient.invalidateQueries(['items']);
      toast.success('Item added successfully!');
      handleClose();
    },
    onError: (error) => {
      console.error('Error creating item:', error);
      toast.error('Failed to add item');
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload an image or video');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setUploadingFile(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      setFormData({ ...formData, thumbnail_url: publicUrl });
      toast.success('File uploaded!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.folder_id && !showNewFolder) {
      toast.error('Please select a folder');
      return;
    }

    if (showNewFolder && !formData.new_folder_name.trim()) {
      toast.error('New folder name is required');
      return;
    }

    createItemMutation.mutate(formData);
  };

  const handleClose = () => {
    setShowModal(false);
    setShowNewFolder(false);
    setFormData({
      title: '',
      url: '',
      description: '',
      item_type: 'article',
      note_content: '',
      thumbnail_url: '',
      folder_id: '',
      new_folder_name: ''
    });
  };

  return (
    <>
      {newBadge && (
        <BadgeNotification 
          badge={newBadge} 
          onClose={() => setNewBadge(null)} 
        />
      )}
      <button className="add-fab" onClick={() => setShowModal(true)} title="Add new item">
        <FiPlus size={24} />
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content add-item-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Item</h2>
              <button className="close-btn" onClick={handleClose}>
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Folder Selection */}
              <div className="form-group">
                <label>
                  <FiFolder size={14} />
                  Folder *
                </label>
                {!showNewFolder ? (
                  <div className="folder-select-container">
                    <select
                      value={formData.folder_id}
                      onChange={(e) => setFormData({ ...formData, folder_id: e.target.value })}
                      required
                    >
                      <option value="">Select a folder...</option>
                      {folders?.map((folder) => (
                        <option key={folder.id} value={folder.id}>
                          {folder.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() => setShowNewFolder(true)}
                    >
                      + New Folder
                    </button>
                  </div>
                ) : (
                  <div className="new-folder-form">
                    <div className="folder-input-row">
                      <input
                        type="text"
                        value={formData.new_folder_name}
                        onChange={(e) => setFormData({ ...formData, new_folder_name: e.target.value })}
                        placeholder="Folder name"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() => setShowNewFolder(false)}
                    >
                      ← Choose existing
                    </button>
                  </div>
                )}
              </div>

              {/* Item Type */}
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
                  placeholder="e.g., React 19 Features"
                  required
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

              {/* File Upload */}
              <div className="form-group">
                <label>
                  <FiUpload size={14} />
                  Upload Image/Video
                </label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    id="fab-file-upload"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="fab-file-upload" className="file-upload-label">
                    {uploadingFile ? 'Uploading...' : formData.thumbnail_url ? '✓ File uploaded' : 'Choose file'}
                  </label>
                  {formData.thumbnail_url && (
                    <button
                      type="button"
                      className="clear-file-btn"
                      onClick={() => setFormData({ ...formData, thumbnail_url: '' })}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description..."
                  rows={3}
                />
              </div>

              {/* Notes */}
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.note_content}
                  onChange={(e) => setFormData({ ...formData, note_content: e.target.value })}
                  placeholder="Your thoughts..."
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={handleClose}>
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
      )}
    </>
  );
}
