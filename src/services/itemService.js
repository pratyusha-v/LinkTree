import { supabase } from './supabase';

export const itemService = {
  // Get all items for a user
  async getItems(userId) {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  },

  // Get items for a specific folder
  async getItemsByFolder(folderId) {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching folder items:', error);
      throw error;
    }
  },

  // Get a single item
  async getItem(itemId) {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching item:', error);
      throw error;
    }
  },

  // Create a new item
  async createItem(userId, itemData) {
    try {
      const { data, error } = await supabase
        .from('items')
        .insert({
          user_id: userId,
          ...itemData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  },

  // Update an item
  async updateItem(itemId, updates) {
    try {
      const { data, error } = await supabase
        .from('items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  },

  // Delete an item
  async deleteItem(itemId) {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  },

  // Fetch URL metadata (basic version - can be enhanced with Edge Function)
  async fetchUrlMetadata(url) {
    try {
      // Simple extraction from URL
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace('www.', '');
      
      // Try to determine type from hostname
      let itemType = 'other';
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
        itemType = 'video';
      } else if (hostname.includes('spotify.com') || hostname.includes('soundcloud.com')) {
        itemType = 'podcast';
      }

      return {
        title: hostname,
        item_type: itemType,
        favicon_url: `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`
      };
    } catch (error) {
      console.error('Error fetching URL metadata:', error);
      return {
        title: url,
        item_type: 'other'
      };
    }
  }
};

// Export standalone functions for easier imports
export const getItems = (userId) => itemService.getItems(userId);
export const getItemsByFolder = (folderId) => itemService.getItemsByFolder(folderId);
export const createItem = (userId, itemData) => itemService.createItem(userId, itemData);
export const updateItem = (itemId, updates) => itemService.updateItem(itemId, updates);
export const deleteItem = (itemId) => itemService.deleteItem(itemId);
