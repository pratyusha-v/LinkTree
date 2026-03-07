import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFolders } from '../services/folderService';
import { getItemsByFolder } from '../services/itemService';
import { supabase } from '../services/supabase';
import ItemList from '../components/items/ItemList';
import AddItemModal from '../components/items/AddItemModal';
import EditItemModal from '../components/items/EditItemModal';
import DeleteConfirmDialog from '../components/items/DeleteConfirmDialog';
import ItemDetailModal from '../components/items/ItemDetailModal';
import FolderMenu from '../components/folders/FolderMenu';
import RenameFolderModal from '../components/folders/RenameFolderModal';
import DeleteFolderDialog from '../components/folders/DeleteFolderDialog';
import { FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import '../styles/FolderDetailPage.css';

export default function FolderDetailPage() {
  const { folderId } = useParams();
  const user = { id: '00000000-0000-0000-0000-000000000001' };
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [renamingFolder, setRenamingFolder] = useState(null);
  const [deletingFolder, setDeletingFolder] = useState(null);

  // Get folder details
  const { data: folders } = useQuery({
    queryKey: ['folders', user.id],
    queryFn: () => getFolders(user.id)
  });

  const folder = folders?.find(f => f.id === folderId);

  // Get items in this folder
  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ['items', folderId],
    queryFn: () => getItemsByFolder(folderId),
    enabled: !!folderId
  });

  // Get notes for items
  const { data: notes } = useQuery({
    queryKey: ['notes', folderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .in('item_id', items?.map(i => i.id) || []);
      
      if (error) throw error;
      return data;
    },
    enabled: !!items && items.length > 0
  });

  // Archive/Unarchive mutation
  const archiveMutation = useMutation({
    mutationFn: async (isArchived) => {
      const { error } = await supabase
        .from('folders')
        .update({ 
          is_archived: isArchived,
          updated_at: new Date().toISOString()
        })
        .eq('id', folderId);

      if (error) throw error;
    },
    onSuccess: (_, isArchived) => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast.success(isArchived ? 'Folder archived' : 'Folder unarchived');
    },
    onError: (error) => {
      toast.error('Failed to update folder: ' + error.message);
    }
  });

  const handleArchive = () => {
    archiveMutation.mutate(true);
  };

  const handleUnarchive = () => {
    archiveMutation.mutate(false);
  };

  if (!folder) {
    return (
      <div className="folder-detail-page">
        <div className="folder-not-found">
          <h2>Folder not found</h2>
          <p>The folder you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="folder-detail-page">
      <div className="folder-header">
        <div className="folder-header-content">
          <div className="folder-info">
            <h1 className="folder-title">{folder.name}</h1>
          </div>
        </div>
        <div className="folder-actions">
          <div className="folder-stats">
            <span className="stat-item">
              {items?.length || 0} {items?.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <FolderMenu
            folder={folder}
            onRename={() => setRenamingFolder(folder)}
            onDelete={() => setDeletingFolder(folder)}
            onArchive={handleArchive}
            onUnarchive={handleUnarchive}
          />
          <button className="add-item-btn" onClick={() => setShowAddModal(true)}>
            <FiPlus size={18} />
            Add
          </button>
        </div>
      </div>

      <ItemList
        items={items || []}
        notes={notes || []}
        isLoading={itemsLoading}
        onItemClick={(item) => setViewingItem(item)}
        onEdit={(item) => setEditingItem(item)}
        onDelete={(item) => setDeletingItem(item)}
      />

      {showAddModal && (
        <AddItemModal
          folderId={folderId}
          userId={user.id}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingItem && (
        <EditItemModal
          item={editingItem}
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
        />
      )}

      {deletingItem && (
        <DeleteConfirmDialog
          item={deletingItem}
          isOpen={!!deletingItem}
          onClose={() => setDeletingItem(null)}
        />
      )}

      {viewingItem && (
        <ItemDetailModal
          item={viewingItem}
          notes={notes}
          isOpen={!!viewingItem}
          onClose={() => setViewingItem(null)}
        />
      )}

      {renamingFolder && (
        <RenameFolderModal
          folder={renamingFolder}
          isOpen={!!renamingFolder}
          onClose={() => setRenamingFolder(null)}
        />
      )}

      {deletingFolder && (
        <DeleteFolderDialog
          folder={deletingFolder}
          isOpen={!!deletingFolder}
          onClose={() => setDeletingFolder(null)}
        />
      )}
    </div>
  );
}
