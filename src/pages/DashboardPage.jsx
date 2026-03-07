import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { folderService } from '../services/folderService';
import { getItems } from '../services/itemService';
import { supabase } from '../services/supabase';
import AddItemFab from '../components/items/AddItemFab';
import toast from 'react-hot-toast';
import { FiPlus, FiFolder, FiLink, FiAward } from 'react-icons/fi';
import '../styles/DashboardWelcome.css';

const DashboardPage = ({ showCreateFolder, setShowCreateFolder }) => {
  const user = { id: '00000000-0000-0000-0000-000000000001' };
  const queryClient = useQueryClient();
  const [folderData, setFolderData] = useState({
    name: '',
    description: ''
  });

  // Fetch data
  const { data: folders } = useQuery({
    queryKey: ['folders', user.id],
    queryFn: () => folderService.getFolders(user.id)
  });

  const { data: items } = useQuery({
    queryKey: ['items', user.id],
    queryFn: () => getItems(user.id)
  });

  const { data: badges } = useQuery({
    queryKey: ['badges', user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id);
      return data;
    }
  });

  // Create folder mutation
  const createFolder = useMutation({
    mutationFn: (data) => folderService.createFolder(user.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['folders']);
      toast.success('Folder created!');
      setShowCreateFolder(false);
      setFolderData({ name: '', description: '' });
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

  const stats = [
    { label: 'Folders', value: folders?.length || 0, icon: FiFolder, color: '#3b82f6' },
    { label: 'Total Items', value: items?.length || 0, icon: FiLink, color: '#10b981' },
    { label: 'Badges Earned', value: badges?.length || 0, icon: FiAward, color: '#f59e0b' }
  ];

  return (
    <div className="dashboard-welcome">
      <div className="welcome-header">
        <div className="welcome-content">
          <h1 className="welcome-title">Welcome to LinkTree</h1>
          <p className="welcome-subtitle">
            Your personal knowledge management system. Organize links, articles, books, and more into folders.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card" style={{ '--stat-color': stat.color }}>
            <div className="stat-icon">
              <stat.icon size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="getting-started">
        <h2 className="section-title">Getting Started</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Select a Folder</h3>
            <p>Click on a folder in the sidebar to view its content.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Explore Your Items</h3>
            <p>See all your saved links, articles, books, and videos organized by folder.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Track Progress</h3>
            <p>Build streaks, hit milestones, and earn scholar badges by saving regularly.</p>
          </div>
        </div>
      </div>

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="modal-overlay" onClick={() => setShowCreateFolder(false)}>
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
                  onClick={() => setShowCreateFolder(false)}
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
      )}

      <AddItemFab userId={user.id} />
    </div>
  );
};

export default DashboardPage;
