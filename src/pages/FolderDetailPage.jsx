import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getFolders } from '../services/folderService';
import { getItemsByFolder } from '../services/itemService';
import { supabase } from '../services/supabase';
import ItemList from '../components/items/ItemList';
import '../styles/FolderDetailPage.css';

export default function FolderDetailPage() {
  const { folderId } = useParams();
  const user = { id: '00000000-0000-0000-0000-000000000001' };

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
          <div className="folder-icon-large" style={{ color: folder.color }}>
            {folder.icon}
          </div>
          <div>
            <h1 className="folder-title">{folder.name}</h1>
            {folder.description && (
              <p className="folder-description">{folder.description}</p>
            )}
          </div>
        </div>
        <div className="folder-stats">
          <span className="stat-item">
            {items?.length || 0} {items?.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      <ItemList
        items={items || []}
        notes={notes || []}
        isLoading={itemsLoading}
        onItemClick={(item) => {
          if (item.url) {
            window.open(item.url, '_blank', 'noopener,noreferrer');
          }
        }}
      />
    </div>
  );
}
