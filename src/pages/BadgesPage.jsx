import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import BadgeCollection from '../components/badges/BadgeCollection';
import BadgeProgress from '../components/badges/BadgeProgress';
import ScholarBadgeDisplay from '../components/badges/ScholarBadgeDisplay';
import '../styles/BadgesPage.css';

export default function BadgesPage() {
  const user = { id: '00000000-0000-0000-0000-000000000001' };

  // Fetch user badges
  const { data: userBadges, isLoading: badgesLoading } = useQuery({
    queryKey: ['userBadges', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badge_definitions(*)
        `)
        .eq('user_id', user.id)
        .order('awarded_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch all badge definitions
  const { data: allBadges, isLoading: definitionsLoading } = useQuery({
    queryKey: ['badgeDefinitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badge_definitions')
        .select('*')
        .order('category', { ascending: true })
        .order('tier', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch streak stats
  const { data: streakStats } = useQuery({
    queryKey: ['streakStats', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_streak_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || { current_daily_streak: 0, longest_daily_streak: 0 };
    }
  });

  // Fetch milestone stats
  const { data: milestoneStats } = useQuery({
    queryKey: ['milestoneStats', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_milestone_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || { total_links_saved: 0 };
    }
  });

  // Fetch scholar stats
  const { data: scholarStats } = useQuery({
    queryKey: ['scholarStats', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_scholar_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || { total_saves_30d: 0, morning_saves_30d: 0, afternoon_saves_30d: 0, night_saves_30d: 0 };
    }
  });

  const isLoading = badgesLoading || definitionsLoading;

  return (
    <div className="badges-page">
      <div className="badges-header">
        <h1>Stats & Badges</h1>
        <p>Track your progress and celebrate your achievements</p>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <div className="loading-text">Loading your stats...</div>
          <div className="loading-bar">
            <div className="loading-bar-fill"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Progress Section */}
          <section className="progress-section">
            <h2>Your Progress</h2>
            <BadgeProgress 
              streakStats={streakStats}
              milestoneStats={milestoneStats}
              scholarStats={scholarStats}
              allBadges={allBadges}
              userBadges={userBadges}
            />
          </section>

          {/* Scholar Stats */}
          <section className="scholar-section">
            <h2>Time-of-Day Activity</h2>
            <ScholarBadgeDisplay 
              scholarStats={scholarStats}
              userBadges={userBadges}
            />
          </section>

          {/* Badges Collection */}
          <section className="badges-section">
            <h2>All Badges</h2>
            <BadgeCollection 
              userBadges={userBadges}
              allBadges={allBadges}
            />
          </section>
        </>
      )}
    </div>
  );
}
