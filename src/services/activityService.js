import { supabase } from './supabase';

export const activityService = {
  // Log user activity for badge calculations
  async logActivity(userId, activityType, metadata = {}) {
    try {
      const now = new Date();
      const activityDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

      const { data, error } = await supabase
        .from('user_activity_log')
        .insert({
          user_id: userId,
          activity_type: activityType,
          activity_date: activityDate,
          activity_timestamp: now.toISOString(),
          metadata
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  },

  // Get user's activity for a date range
  async getActivity(userId, startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', userId)
        .gte('activity_date', startDate)
        .lte('activity_date', endDate)
        .order('activity_timestamp', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching activity:', error);
      throw error;
    }
  },

  // Get activity count for last N days
  async getActivityCount(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('user_activity_log')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .gte('activity_timestamp', startDate.toISOString());

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Error fetching activity count:', error);
      return 0;
    }
  }
};

// Export standalone function for easier imports
export const logActivity = (userId, activityType, metadata) => 
  activityService.logActivity(userId, activityType, metadata);
