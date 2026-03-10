import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import FolderDetailPage from './pages/FolderDetailPage';
import BadgesPage from './pages/BadgesPage';
import SearchPage from './pages/SearchPage';
import FindBookPage from './pages/FindBookPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout onCreateFolder={() => setShowCreateFolder(true)}>
          <Routes>
            <Route 
              path="/" 
              element={<DashboardPage showCreateFolder={showCreateFolder} setShowCreateFolder={setShowCreateFolder} />} 
            />
            <Route path="/folder/:folderId" element={<FolderDetailPage />} />
            <Route path="/badges" element={<BadgesPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/find-book" element={<FindBookPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
        <Toaster position="top-right" />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
