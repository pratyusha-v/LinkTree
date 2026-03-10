import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Sidebar from './Sidebar';
import CreateFolderModal from '../folders/CreateFolderModal';
import { getFolders } from '../../services/folderService';
import './Layout.css';

const Layout = ({ children }) => {
  const user = { id: '00000000-0000-0000-0000-000000000001' };
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  const { data: folders, isLoading } = useQuery({
    queryKey: ['folders', user.id],
    queryFn: () => getFolders(user.id)
  });

  return (
    <div className="layout-notion">
      <Sidebar 
        folders={folders || []}
        isLoading={isLoading}
        onCreateFolder={() => setShowCreateFolder(true)}
      />
      
      <main className="main-content-notion">
        {children}
      </main>

      <CreateFolderModal 
        show={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        userId={user.id}
      />
    </div>
  );
};

export default Layout;
