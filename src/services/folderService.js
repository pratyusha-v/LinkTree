import { supabase } from './supabase';

export const folderService = {
  // Get all folders for a user
  async getFolders(userId) {
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching folders:', error);
      throw error;
    }
  },

  // Get a single folder
  async getFolder(folderId) {
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('id', folderId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching folder:', error);
      throw error;
    }
  },

  // Create a new folder
  async createFolder(userId, folderData) {
    try {
      const { data, error } = await supabase
        .from('folders')
        .insert({
          user_id: userId,
          ...folderData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  },

  // Update a folder
  async updateFolder(folderId, updates) {
    try {
      const { data, error } = await supabase
        .from('folders')
        .update(updates)
        .eq('id', folderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating folder:', error);
      throw error;
    }
  },

  // Delete a folder
  async deleteFolder(folderId) {
    try {
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  },

  // Get folder with item count
  async getFolderWithCount(folderId) {
    try {
      const folder = await this.getFolder(folderId);
      
      const { count, error } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('folder_id', folderId);

      if (error) throw error;

      return {
        ...folder,
        itemCount: count || 0
      };
    } catch (error) {
      console.error('Error fetching folder with count:', error);
      throw error;
    }
  }
};

// Export standalone functions for easier imports
export const getFolders = (userId) => folderService.getFolders(userId);
export const getFolder = (folderId) => folderService.getFolder(folderId);
export const createFolder = (userId, folderData) => folderService.createFolder(userId, folderData);
export const updateFolder = (folderId, updates) => folderService.updateFolder(folderId, updates);
export const deleteFolder = (folderId) => folderService.deleteFolder(folderId);
