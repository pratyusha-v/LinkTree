import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { activityService } from '../services/activityService';
import { badgeService } from '../services/badgeService';

export const useActivityTracking = () => {
  const { user } = useAuth();

  const trackLinkSaved = useCallback(async (linkData) => {
    if (!user) return;

    try {
      // Log the activity
      await activityService.logActivity(user.id, 'link_saved', {
        link_id: linkData.id,
        folder_id: linkData.folder_id,
        item_type: linkData.item_type
      });

      // Trigger badge calculations
      await badgeService.checkAndAwardBadges(user.id);
    } catch (error) {
      console.error('Error tracking link saved:', error);
    }
  }, [user]);

  const trackLinkDeleted = useCallback(async (linkId) => {
    if (!user) return;

    try {
      await activityService.logActivity(user.id, 'link_deleted', {
        link_id: linkId
      });
    } catch (error) {
      console.error('Error tracking link deleted:', error);
    }
  }, [user]);

  const trackLinkUpdated = useCallback(async (linkId) => {
    if (!user) return;

    try {
      await activityService.logActivity(user.id, 'link_updated', {
        link_id: linkId
      });
    } catch (error) {
      console.error('Error tracking link updated:', error);
    }
  }, [user]);

  return {
    trackLinkSaved,
    trackLinkDeleted,
    trackLinkUpdated
  };
};
