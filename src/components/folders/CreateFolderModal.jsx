import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { folderService } from '../../services/folderService';
import toast from 'react-hot-toast';
import '../../styles/Modal.css';

export default function CreateFolderModal({ show, onClose, userId }) {
  const queryClient = useQueryClient();
  const [folderData, setFolderData] = useState({
    name: '',
    description: ''
  });

  // Create folder mutation
  const createFolder = useMutation({
    mutationFn: (data) => folderService.createFolder(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['folders']);
      toast.success('Folder created!');
      setFolderData({ name: '', description: '' });
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to create folder');
      console.error(error);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!folderData.name.trim()) {
      toast.error('Folder name is required');
      return;
    }
    createFolder.mutate(folderData);
  };

  const handleClose = () => {
    setFolderData({ name: '', description: '' });
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Create New Folder</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={folderData.name}
              onChange={(e) => setFolderData({ ...folderData, name: e.target.value })}
              placeholder="e.g., Web Development"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={folderData.description}
              onChange={(e) => setFolderData({ ...folderData, description: e.target.value })}
              placeholder="What will you save in this folder?"
              rows={3}
            />
          </div>
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={createFolder.isPending}>
              {createFolder.isPending ? 'Creating...' : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
