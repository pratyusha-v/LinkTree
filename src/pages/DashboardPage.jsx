import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { folderService } from '../services/folderService';
import { getItems } from '../services/itemService';
import { supabase } from '../services/supabase';
import AddItemFab from '../components/items/AddItemFab';
import { FiFolder, FiLink, FiAward } from 'react-icons/fi';
import '../styles/DashboardWelcome.css';

const DashboardPage = () => {
  const user = { id: '00000000-0000-0000-0000-000000000001' };

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

  const { data: recentBadges } = useQuery({
    queryKey: ['recent-badges', user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge_definitions (*)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })
        .limit(3);
      return data;
    }
  });

  const stats = [
    { label: 'Folders', value: folders?.length || 0, icon: FiFolder, color: '#3b82f6' },
    { label: 'Total Items', value: items?.length || 0, icon: FiLink, color: '#10b981' },
    { label: 'Badges Earned', value: badges?.length || 0, icon: FiAward, color: '#f59e0b' }
  ];

  return (
    <div className="dashboard-welcome">
      <div className="welcome-header">
        <div className="welcome-content">
          <h1 className="welcome-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="8" r="4" fill="#10b981"/>
              <circle cx="10" cy="14" r="3" fill="#10b981"/>
              <circle cx="22" cy="14" r="3" fill="#10b981"/>
              <circle cx="7" cy="20" r="2.5" fill="#10b981"/>
              <circle cx="16" cy="20" r="2.5" fill="#10b981"/>
              <circle cx="25" cy="20" r="2.5" fill="#10b981"/>
              <line x1="16" y1="12" x2="16" y2="26" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"/>
              <line x1="16" y1="14" x2="10" y2="14" stroke="#8b5cf6" strokeWidth="1.5"/>
              <line x1="16" y1="14" x2="22" y2="14" stroke="#8b5cf6" strokeWidth="1.5"/>
              <line x1="10" y1="17" x2="7" y2="20" stroke="#8b5cf6" strokeWidth="1.5"/>
              <line x1="16" y1="17" x2="16" y2="20" stroke="#8b5cf6" strokeWidth="1.5"/>
              <line x1="22" y1="17" x2="25" y2="20" stroke="#8b5cf6" strokeWidth="1.5"/>
              <rect x="14" y="26" width="4" height="4" rx="1" fill="#92400e"/>
            </svg>
            Welcome to LinkTree
          </h1>
          <p className="welcome-subtitle">
            Organize your knowledge. Save links, articles, and notes in folders.
          </p>
        </div>
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

      {recentBadges && recentBadges.length > 0 && (
        <div className="recent-badges-section">
          <h2 className="section-title">Recently Earned Badges</h2>
          <div className="recent-badges-grid">
            {recentBadges.map((userBadge) => (
              <div key={userBadge.id} className="recent-badge-card">
                <img 
                  src={userBadge.badge_definitions.icon} 
                  alt={userBadge.badge_definitions.name}
                  className="recent-badge-icon"
                />
                <div className="badge-info">
                  <h3>{userBadge.badge_definitions.name}</h3>
                  <p>{userBadge.badge_definitions.description}</p>
                  <span className="badge-date">
                    {new Date(userBadge.earned_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddItemFab userId={user.id} />
    </div>
  );
};

export default DashboardPage;
