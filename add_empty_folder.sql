-- Add an empty folder with a random topic
-- Run this in your Supabase SQL Editor

INSERT INTO folders (id, user_id, name, description, color, icon, created_at) VALUES
('77777777-7777-7777-7777-777777777777', '00000000-0000-0000-0000-000000000001', 'Astronomy', 'Stars, planets, and space exploration resources', '#8b5cf6', '🌌', NOW());

-- This folder will appear empty and show the tree image with "Add your first link" button
