import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import './RenameFolderModal.css';

const RenameFolderModal = ({ folder, isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');

  useEffect(() => {
    if (folder) {
      setName(folder.name || '');
    }
  }, [folder]);

  const renameMutation = useMutation({
    mutationFn: async (newName) => {
      const { error } = await supabase
        .from('folders')
        .update({ 
          name: newName,
          updated_at: new Date().toISOString()
        })
        .eq('id', folder.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast.success('Folder renamed!');
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to rename folder: ' + error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Folder name cannot be empty');
      return;
    }

    if (trimmedName === folder.name) {
      onClose();
      return;
    }

    renameMutation.mutate(trimmedName);
  };

  if (!isOpen || !folder) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content rename-folder-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Rename Folder</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="rename-folder-form">
          <div className="form-group">
            <label htmlFor="folder-name">Folder Name</label>
            <input
              type="text"
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name"
              autoFocus
              maxLength={50}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={renameMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={renameMutation.isPending}
            >
              {renameMutation.isPending ? 'Renaming...' : 'Rename'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenameFolderModal;
