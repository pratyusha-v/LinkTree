import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { useDebounce } from '../../hooks/useDebounce';
import SearchResults from './SearchResults';
import './GlobalSearch.css';

const GlobalSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState({ items: [], notes: [], folders: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all', 'items', 'notes', 'folders'
  
  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults({ items: [], notes: [], folders: [] });
      return;
    }

    performSearch(debouncedQuery);
  }, [debouncedQuery]);

  const performSearch = async (query) => {
    setIsLoading(true);
    const searchPattern = `%${query}%`;
    const userId = '00000000-0000-0000-0000-000000000001'; // Demo user

    try {
      // Search items
      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select(`
          id,
          title,
          description,
          url,
          item_type,
          created_at,
          folder_id,
          folders (
            id,
            name,
            icon,
            color
          )
        `)
        .eq('user_id', userId)
        .or(`title.ilike.${searchPattern},description.ilike.${searchPattern},url.ilike.${searchPattern}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (itemsError) throw itemsError;

      // Search notes
      const { data: notes, error: notesError } = await supabase
        .from('notes')
        .select(`
          id,
          content,
          created_at,
          item_id,
          folder_id,
          items (
            id,
            title,
            folder_id,
            folders (
              id,
              name,
              icon,
              color
            )
          )
        `)
        .eq('user_id', userId)
        .ilike('content', searchPattern)
        .order('created_at', { ascending: false })
        .limit(20);

      if (notesError) throw notesError;

      // Search folders
      const { data: folders, error: foldersError } = await supabase
        .from('folders')
        .select(`
          id,
          name,
          description,
          icon,
          color,
          created_at
        `)
        .eq('user_id', userId)
        .or(`name.ilike.${searchPattern},description.ilike.${searchPattern}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (foldersError) throw foldersError;

      setResults({
        items: items || [],
        notes: notes || [],
        folders: folders || []
      });
    } catch (error) {
      console.error('Search error:', error);
      setResults({ items: [], notes: [], folders: [] });
    } finally {
      setIsLoading(false);
    }
  };

  const totalResults = results.items.length + results.notes.length + results.folders.length;

  return (
    <div className="global-search">
      <div className="search-header">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search items, notes, and folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button
              className="search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {searchQuery.trim().length >= 2 && (
          <div className="search-filters">
            <button
              className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All ({totalResults})
            </button>
            <button
              className={`filter-btn ${filterType === 'items' ? 'active' : ''}`}
              onClick={() => setFilterType('items')}
            >
              Items ({results.items.length})
            </button>
            <button
              className={`filter-btn ${filterType === 'notes' ? 'active' : ''}`}
              onClick={() => setFilterType('notes')}
            >
              Notes ({results.notes.length})
            </button>
            <button
              className={`filter-btn ${filterType === 'folders' ? 'active' : ''}`}
              onClick={() => setFilterType('folders')}
            >
              Folders ({results.folders.length})
            </button>
          </div>
        )}
      </div>

      <SearchResults
        results={results}
        filterType={filterType}
        searchQuery={searchQuery}
        isLoading={isLoading}
      />
    </div>
  );
};

export default GlobalSearch;
