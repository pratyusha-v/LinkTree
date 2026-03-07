import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import './NotesList.css';

const NotesList = ({ notes, itemId }) => {
  const queryClient = useQueryClient();
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');

  const updateMutation = useMutation({
    mutationFn: async ({ noteId, content }) => {
      const { error } = await supabase
        .from('notes')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note updated!');
      setEditingNoteId(null);
    },
    onError: (error) => {
      toast.error('Failed to update note: ' + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (noteId) => {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete note: ' + error.message);
    }
  });

  const createMutation = useMutation({
    mutationFn: async (content) => {
      const { error } = await supabase
        .from('notes')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000001',
          item_id: itemId,
          content
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note created!');
      setIsCreating(false);
      setNewNoteContent('');
    },
    onError: (error) => {
      toast.error('Failed to create note: ' + error.message);
    }
  });

  const startEditing = (note) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditContent('');
  };

  const saveEdit = () => {
    if (!editContent.trim()) {
      toast.error('Note content cannot be empty');
      return;
    }
    updateMutation.mutate({ noteId: editingNoteId, content: editContent });
  };

  const deleteNote = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteMutation.mutate(noteId);
    }
  };

  const createNote = () => {
    if (!newNoteContent.trim()) {
      toast.error('Note content cannot be empty');
      return;
    }
    createMutation.mutate(newNoteContent);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="notes-list">
      <div className="notes-header">
        <h3>Notes ({notes?.length || 0})</h3>
        {!isCreating && (
          <button
            className="btn-add-note"
            onClick={() => setIsCreating(true)}
          >
            + Add Note
          </button>
        )}
      </div>

      {isCreating && (
        <div className="note-editor new-note">
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Write your note..."
            rows="4"
            autoFocus
          />
          <div className="note-editor-actions">
            <button
              className="btn-save"
              onClick={createNote}
              disabled={createMutation.isPending}
            >
              <FiSave size={16} />
              {createMutation.isPending ? 'Saving...' : 'Save'}
            </button>
            <button
              className="btn-cancel"
              onClick={() => {
                setIsCreating(false);
                setNewNoteContent('');
              }}
            >
              <FiX size={16} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {notes && notes.length > 0 ? (
        <div className="notes-items">
          {notes.map((note) => (
            <div key={note.id} className="note-item">
              {editingNoteId === note.id ? (
                <div className="note-editor">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows="4"
                    autoFocus
                  />
                  <div className="note-editor-actions">
                    <button
                      className="btn-save"
                      onClick={saveEdit}
                      disabled={updateMutation.isPending}
                    >
                      <FiSave size={16} />
                      {updateMutation.isPending ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={cancelEditing}
                    >
                      <FiX size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="note-content">{note.content}</div>
                  <div className="note-footer">
                    <span className="note-date">{formatDate(note.created_at)}</span>
                    <div className="note-actions">
                      <button
                        className="note-action-btn"
                        onClick={() => startEditing(note)}
                        title="Edit note"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        className="note-action-btn delete"
                        onClick={() => deleteNote(note.id)}
                        title="Delete note"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        !isCreating && (
          <div className="notes-empty">
            <p>No notes yet. Add your first note!</p>
          </div>
        )
      )}
    </div>
  );
};

export default NotesList;
