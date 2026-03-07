import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import './DeleteFolderDialog.css';

const DeleteFolderDialog = ({ folder, isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      // Delete folder (items and notes will cascade delete)
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folder.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Folder deleted successfully');
      onClose();
      navigate('/');
    },
    onError: (error) => {
      toast.error('Failed to delete folder: ' + error.message);
    }
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  if (!isOpen || !folder) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content delete-folder-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="delete-dialog-header">
          <div className="delete-icon">⚠️</div>
          <h2>Delete Folder?</h2>
        </div>

        <div className="delete-dialog-body">
          <p>Are you sure you want to delete <strong>"{folder.name}"</strong>?</p>
          <p className="delete-warning">
            This will permanently delete all items and notes in this folder. This action cannot be undone.
          </p>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Folder'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteFolderDialog;
