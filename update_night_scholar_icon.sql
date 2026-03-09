-- Update Night Scholar badge icon
-- Run this in your Supabase SQL Editor

UPDATE badge_definitions
SET icon = 'https://img.icons8.com/fluency/96/crescent-moon.png'
WHERE badge_id = 'night_scholar';
