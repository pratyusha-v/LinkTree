import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import './DeleteConfirmDialog.css';

const DeleteConfirmDialog = ({ item, isOpen, onClose, onConfirm }) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      // Log activity before deletion
      await supabase.from('user_activity_log').insert({
        user_id: '00000000-0000-0000-0000-000000000001',
        activity_type: 'link_deleted',
        activity_date: new Date().toISOString().split('T')[0],
        metadata: { item_id: item.id, title: item.title }
      });

      // Delete item (notes will cascade delete)
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', item.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Item deleted successfully');
      onConfirm?.();
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to delete item: ' + error.message);
    }
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  if (!isOpen || !item) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content delete-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="delete-dialog-header">
          <div className="delete-icon">⚠️</div>
          <h2>Delete Item?</h2>
        </div>

        <div className="delete-dialog-body">
          <p>Are you sure you want to delete <strong>"{item.title}"</strong>?</p>
          <p className="delete-warning">
            This will also delete all associated notes. This action cannot be undone.
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
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmDialog;
