import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Sidebar from './Sidebar';
import { getFolders } from '../../services/folderService';
import './Layout.css';

const Layout = ({ children, onCreateFolder }) => {
  const user = { id: '00000000-0000-0000-0000-000000000001' };

  const { data: folders, isLoading } = useQuery({
    queryKey: ['folders', user.id],
    queryFn: () => getFolders(user.id)
  });

  return (
    <div className="layout-notion">
      <Sidebar 
        folders={folders || []}
        isLoading={isLoading}
        onCreateFolder={onCreateFolder}
      />
      
      <main className="main-content-notion">
        {children}
      </main>
    </div>
  );
};

export default Layout;
