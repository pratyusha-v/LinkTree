import { supabase } from './supabase';

export const badgeService = {
  // Get all badge definitions
  async getBadgeDefinitions() {
    try {
      const { data, error } = await supabase
        .from('badge_definitions')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching badge definitions:', error);
      throw error;
    }
  },

  // Get user's earned badges
  async getUserBadges(userId) {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badge_definitions(*)
        `)
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user badges:', error);
      throw error;
    }
  },

  // Get new (unviewed) badges
  async getNewBadges(userId) {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badge_definitions(*)
        `)
        .eq('user_id', userId)
        .eq('is_new', true)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching new badges:', error);
      return [];
    }
  },

  // Mark badge as viewed
  async markBadgeAsViewed(userId, badgeId) {
    try {
      const { error } = await supabase
        .from('user_badges')
        .update({ 
          is_new: false,
          viewed_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('badge_id', badgeId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking badge as viewed:', error);
      throw error;
    }
  },

  // Award a badge to a user
  async awardBadge(userId, badgeId, progressData = {}) {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_id: badgeId,
          progress_data: progressData,
          is_new: true
        })
        .select(`
          *,
          badge:badge_definitions(*)
        `)
        .single();

      if (error) {
        // Check if badge already exists (unique constraint violation)
        if (error.code === '23505') {
          return null; // Badge already awarded
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error awarding badge:', error);
      throw error;
    }
  },

  // Remove a badge (for scholar badge transitions)
  async removeBadge(userId, badgeId) {
    try {
      const { error } = await supabase
        .from('user_badges')
        .delete()
        .eq('user_id', userId)
        .eq('badge_id', badgeId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing badge:', error);
      throw error;
    }
  },

  // Update or create streak stats
  async updateStreakStats(userId, streakData) {
    try {
      const { data, error } = await supabase
        .from('user_streak_stats')
        .upsert({
          user_id: userId,
          ...streakData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating streak stats:', error);
      throw error;
    }
  },

  // Get streak stats
  async getStreakStats(userId) {
    try {
      const { data, error } = await supabase
        .from('user_streak_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No record found, return defaults
          return {
            current_daily_streak: 0,
            longest_daily_streak: 0,
            current_weekly_streak: 0,
            longest_weekly_streak: 0,
            current_monthly_streak: 0,
            longest_monthly_streak: 0
          };
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching streak stats:', error);
      throw error;
    }
  },

  // Update or create milestone stats
  async updateMilestoneStats(userId, milestoneData) {
    try {
      const { data, error } = await supabase
        .from('user_milestone_stats')
        .upsert({
          user_id: userId,
          ...milestoneData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating milestone stats:', error);
      throw error;
    }
  },

  // Get milestone stats
  async getMilestoneStats(userId) {
    try {
      const { data, error } = await supabase
        .from('user_milestone_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            total_links_saved: 0,
            total_links_active: 0,
            total_links_deleted: 0
          };
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching milestone stats:', error);
      throw error;
    }
  },

  // Get scholar stats
  async getScholarStats(userId) {
    try {
      const { data, error } = await supabase
        .from('user_scholar_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            morning_saves_30d: 0,
            afternoon_saves_30d: 0,
            night_saves_30d: 0,
            total_saves_30d: 0,
            morning_share: 0,
            afternoon_share: 0,
            night_share: 0,
            current_scholar_badge: null
          };
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching scholar stats:', error);
      throw error;
    }
  },

  // Calculate and award badges (main orchestration function)
  async checkAndAwardBadges(userId) {
    try {
      const newBadges = [];

      // Calculate streak badges
      const streakBadges = await this.calculateStreakBadges(userId);
      newBadges.push(...streakBadges);

      // Calculate milestone badges
      const milestoneBadges = await this.calculateMilestoneBadges(userId);
      newBadges.push(...milestoneBadges);

      // Note: Scholar badges are calculated via background job (expensive 30-day query)
      // but we can trigger a lightweight check here

      return newBadges.filter(Boolean);
    } catch (error) {
      console.error('Error checking badges:', error);
      return [];
    }
  },

  // Calculate streak badges
  async calculateStreakBadges(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const currentWeek = this.getISOWeek(now);
      const currentMonth = now.toISOString().substring(0, 7); // YYYY-MM

      // Get current streak stats
      let stats = await this.getStreakStats(userId);
      const lastDate = stats.last_activity_date;

      let updatedStats = { ...stats };

      // Calculate daily streak
      if (!lastDate || lastDate !== today) {
        const daysDiff = lastDate ? this.dateDiff(lastDate, today) : 1;

        if (daysDiff === 1) {
          // Consecutive day
          updatedStats.current_daily_streak = (stats.current_daily_streak || 0) + 1;
          updatedStats.longest_daily_streak = Math.max(
            updatedStats.current_daily_streak,
            stats.longest_daily_streak || 0
          );
        } else if (daysDiff > 1) {
          // Streak broken
          updatedStats.current_daily_streak = 1;
        }

        updatedStats.last_activity_date = today;
      }

      // Calculate weekly streak
      if (!stats.last_activity_week || stats.last_activity_week !== currentWeek) {
        const weeksDiff = stats.last_activity_week 
          ? this.weekDiff(stats.last_activity_week, currentWeek) 
          : 1;

        if (weeksDiff === 1) {
          updatedStats.current_weekly_streak = (stats.current_weekly_streak || 0) + 1;
          updatedStats.longest_weekly_streak = Math.max(
            updatedStats.current_weekly_streak,
            stats.longest_weekly_streak || 0
          );
        } else if (weeksDiff > 1) {
          updatedStats.current_weekly_streak = 1;
        }

        updatedStats.last_activity_week = currentWeek;
      }

      // Calculate monthly streak
      if (!stats.last_activity_month || stats.last_activity_month !== currentMonth) {
        const monthsDiff = stats.last_activity_month 
          ? this.monthDiff(stats.last_activity_month, currentMonth) 
          : 1;

        if (monthsDiff === 1) {
          updatedStats.current_monthly_streak = (stats.current_monthly_streak || 0) + 1;
          updatedStats.longest_monthly_streak = Math.max(
            updatedStats.current_monthly_streak,
            stats.longest_monthly_streak || 0
          );
        } else if (monthsDiff > 1) {
          updatedStats.current_monthly_streak = 1;
        }

        updatedStats.last_activity_month = currentMonth;
      }

      // Update streak stats
      await this.updateStreakStats(userId, updatedStats);

      // Check for badge eligibility
      const newBadges = [];
      const badges = await this.getBadgeDefinitions();
      const streakBadges = badges.filter(b => b.category === 'streak');

      for (const badge of streakBadges) {
        const criteria = badge.criteria;
        let qualifies = false;

        if (criteria.type === 'daily_streak') {
          qualifies = updatedStats.current_daily_streak >= criteria.days;
        } else if (criteria.type === 'weekly_streak') {
          qualifies = updatedStats.current_weekly_streak >= criteria.weeks;
        } else if (criteria.type === 'monthly_streak') {
          qualifies = updatedStats.current_monthly_streak >= criteria.months;
        }

        if (qualifies) {
          const awarded = await this.awardBadge(userId, badge.id, {
            streak: updatedStats.current_daily_streak,
            date: today
          });
          if (awarded) newBadges.push(awarded);
        }
      }

      return newBadges;
    } catch (error) {
      console.error('Error calculating streak badges:', error);
      return [];
    }
  },

  // Calculate milestone badges
  async calculateMilestoneBadges(userId) {
    try {
      // Get current item count
      const { count, error } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;

      const totalSaved = count || 0;

      // Update milestone stats
      await this.updateMilestoneStats(userId, {
        total_links_saved: totalSaved,
        total_links_active: totalSaved,
        last_save_at: new Date().toISOString()
      });

      // Check for badge eligibility
      const newBadges = [];
      const badges = await this.getBadgeDefinitions();
      const milestoneBadges = badges.filter(b => b.category === 'milestone');

      for (const badge of milestoneBadges) {
        const criteria = badge.criteria;
        if (totalSaved >= criteria.count) {
          const awarded = await this.awardBadge(userId, badge.id, {
            count: totalSaved
          });
          if (awarded) newBadges.push(awarded);
        }
      }

      return newBadges;
    } catch (error) {
      console.error('Error calculating milestone badges:', error);
      return [];
    }
  },

  // Helper: Calculate date difference in days
  dateDiff(date1Str, date2Str) {
    const d1 = new Date(date1Str);
    const d2 = new Date(date2Str);
    const diffTime = d2.getTime() - d1.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  },

  // Helper: Get ISO week (YYYY-WXX format)
  getISOWeek(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  },

  // Helper: Calculate week difference
  weekDiff(week1, week2) {
    const [year1, w1] = week1.split('-W').map(Number);
    const [year2, w2] = week2.split('-W').map(Number);
    return (year2 - year1) * 52 + (w2 - w1);
  },

  // Helper: Calculate month difference
  monthDiff(month1, month2) {
    const [year1, m1] = month1.split('-').map(Number);
    const [year2, m2] = month2.split('-').map(Number);
    return (year2 - year1) * 12 + (m2 - m1);
  }
};
