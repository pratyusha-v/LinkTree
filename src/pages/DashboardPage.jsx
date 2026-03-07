import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { folderService } from '../services/folderService';
import Layout from '../components/layout/Layout';
import toast from 'react-hot-toast';
import { FiPlus, FiFolder } from 'react-icons/fi';
import './DashboardPage.css';

const DashboardPage = () => {
  const user = { id: 'demo-user' }; // Demo user for testing without auth
  const queryClient = useQueryClient();
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [folderData, setFolderData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    icon: '📁'
  });

  // Fetch folders
  const { data: folders, isLoading } = useQuery({
    queryKey: ['folders', user.id],
    queryFn: () => folderService.getFolders(user.id)
  });

  // Create folder mutation
  const createFolder = useMutation({
    mutationFn: (data) => folderService.createFolder(user.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['folders']);
      toast.success('Folder created!');
      setShowFolderForm(false);
      setFolderData({ name: '', description: '', color: '#3b82f6', icon: '📁' });
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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center" style={{ minHeight: '50vh' }}>
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Your Library</h1>
            <p className="text-secondary">Organize your knowledge into folders</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowFolderForm(!showFolderForm)}
          >
            <FiPlus /> Create Folder
          </button>
        </div>

        {showFolderForm && (
          <div className="folder-form-card">
            <h3>Create New Folder</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={folderData.name}
                    onChange={(e) => setFolderData({ ...folderData, name: e.target.value })}
                    placeholder="e.g., Web Development"
                    required
                  />
                </div>
                <div className="form-group form-group-small">
                  <label>Icon</label>
                  <input
                    type="text"
                    value={folderData.icon}
                    onChange={(e) => setFolderData({ ...folderData, icon: e.target.value })}
                    placeholder="📁"
                    maxLength={2}
                  />
                </div>
                <div className="form-group form-group-small">
                  <label>Color</label>
                  <input
                    type="color"
                    value={folderData.color}
                    onChange={(e) => setFolderData({ ...folderData, color: e.target.value })}
                  />
                </div>
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
                  className="btn btn-secondary"
                  onClick={() => setShowFolderForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={createFolder.isPending}>
                  {createFolder.isPending ? 'Creating...' : 'Create Folder'}
                </button>
              </div>
            </form>
          </div>
        )}

        {folders?.length === 0 ? (
          <div className="empty-state">
            <FiFolder size={64} />
            <h2>No folders yet</h2>
            <p>Create your first folder to start organizing your knowledge</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowFolderForm(true)}
            >
              <FiPlus /> Create Your First Folder
            </button>
          </div>
        ) : (
          <div className="folders-grid">
            {folders?.map((folder) => (
              <a 
                key={folder.id} 
                href={`/folder/${folder.id}`}
                className="folder-card"
                style={{ borderLeftColor: folder.color }}
              >
                <div className="folder-icon" style={{ color: folder.color }}>
                  {folder.icon}
                </div>
                <div className="folder-content">
                  <h3>{folder.name}</h3>
                  {folder.description && (
                    <p className="text-secondary">{folder.description}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;
