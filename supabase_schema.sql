-- ============================================
-- LinkTree Database Schema
-- Complete database setup with badge system
-- ============================================

-- Drop existing tables (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS user_scholar_stats CASCADE;
DROP TABLE IF EXISTS user_milestone_stats CASCADE;
DROP TABLE IF EXISTS user_streak_stats CASCADE;
DROP TABLE IF EXISTS user_activity_log CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS badge_definitions CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS folders CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Profiles table (for demo - no auth required)
CREATE TABLE profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Folders table
CREATE TABLE folders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT DEFAULT '📁',
  review_enabled BOOLEAN DEFAULT false,
  review_interval_days INTEGER DEFAULT 7,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_folders_created_at ON folders(created_at DESC);
CREATE INDEX idx_folders_archived ON folders(user_id, is_archived);

-- Items table
CREATE TABLE items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  folder_id UUID REFERENCES folders ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT,
  description TEXT,
  item_type TEXT CHECK (item_type IN ('article', 'video', 'podcast', 'book', 'person', 'other')) DEFAULT 'other',
  thumbnail_url TEXT,
  favicon_url TEXT,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  next_review_date DATE,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_folder_id ON items(folder_id);
CREATE INDEX idx_items_next_review ON items(next_review_date) WHERE next_review_date IS NOT NULL;
CREATE INDEX idx_items_created_at ON items(created_at DESC);

-- Notes table
CREATE TABLE notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID REFERENCES items ON DELETE CASCADE,
  folder_id UUID REFERENCES folders ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: note belongs to either an item or folder, not both
  CONSTRAINT notes_belongs_to_check CHECK (
    (item_id IS NOT NULL AND folder_id IS NULL) OR
    (item_id IS NULL AND folder_id IS NOT NULL)
  )
);

CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_item_id ON notes(item_id);
CREATE INDEX idx_notes_folder_id ON notes(folder_id);

-- ============================================
-- BADGE SYSTEM TABLES
-- ============================================

-- Badge definitions
CREATE TABLE badge_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('streak', 'milestone', 'scholar')),
  tier TEXT CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  icon TEXT,
  criteria JSONB,
  points INTEGER DEFAULT 0,
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges (earned badges)
CREATE TABLE user_badges (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id TEXT REFERENCES badge_definitions(id) NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress_data JSONB,
  is_new BOOLEAN DEFAULT true,
  viewed_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_badges_earned ON user_badges(earned_at DESC);
CREATE INDEX idx_user_badges_new ON user_badges(user_id, is_new) WHERE is_new = true;

-- Activity log for badge calculations
CREATE TABLE user_activity_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('link_saved', 'link_deleted', 'link_updated')),
  activity_date DATE NOT NULL,
  activity_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB,
  
  CONSTRAINT activity_date_matches_timestamp CHECK (activity_date = DATE(activity_timestamp))
);

CREATE INDEX idx_activity_user_date ON user_activity_log(user_id, activity_date DESC);
CREATE INDEX idx_activity_user_timestamp ON user_activity_log(user_id, activity_timestamp DESC);
CREATE INDEX idx_activity_type_date ON user_activity_log(activity_type, activity_date);

-- Streak statistics (pre-computed)
CREATE TABLE user_streak_stats (
  user_id UUID PRIMARY KEY,
  current_daily_streak INTEGER DEFAULT 0,
  longest_daily_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  current_weekly_streak INTEGER DEFAULT 0,
  longest_weekly_streak INTEGER DEFAULT 0,
  last_activity_week TEXT,
  current_monthly_streak INTEGER DEFAULT 0,
  longest_monthly_streak INTEGER DEFAULT 0,
  last_activity_month TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_streak_stats_updated ON user_streak_stats(updated_at);

-- Milestone statistics (pre-computed)
CREATE TABLE user_milestone_stats (
  user_id UUID PRIMARY KEY,
  total_links_saved INTEGER DEFAULT 0,
  total_links_active INTEGER DEFAULT 0,
  total_links_deleted INTEGER DEFAULT 0,
  first_save_at TIMESTAMP WITH TIME ZONE,
  last_save_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scholar badge statistics (pre-computed)
CREATE TABLE user_scholar_stats (
  user_id UUID PRIMARY KEY,
  morning_saves_30d INTEGER DEFAULT 0,
  afternoon_saves_30d INTEGER DEFAULT 0,
  night_saves_30d INTEGER DEFAULT 0,
  total_saves_30d INTEGER DEFAULT 0,
  morning_share DECIMAL(5,4),
  afternoon_share DECIMAL(5,4),
  night_share DECIMAL(5,4),
  current_scholar_badge TEXT REFERENCES badge_definitions(id),
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_scholar_stats_calculated ON user_scholar_stats(last_calculated_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streak_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_milestone_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_scholar_stats ENABLE ROW LEVEL SECURITY;

-- Allow all operations without authentication (for demo/testing)
CREATE POLICY "Allow all on profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on folders" ON folders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on items" ON items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on notes" ON notes FOR ALL USING (true) WITH CHECK (true);

-- Badge definitions are public
ALTER TABLE badge_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on badge_definitions" ON badge_definitions FOR ALL USING (true) WITH CHECK (true);

-- Badge system - allow all
CREATE POLICY "Allow all on user_badges" ON user_badges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on user_activity_log" ON user_activity_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on user_streak_stats" ON user_streak_stats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on user_milestone_stats" ON user_milestone_stats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on user_scholar_stats" ON user_scholar_stats FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- SEED DATA: Badge Definitions
-- ============================================

INSERT INTO badge_definitions (id, name, description, category, tier, criteria, points, rarity, display_order) VALUES
-- Streak badges
('streak_daily_7', '7-Day Streak', 'Save links for 7 consecutive days', 'streak', 'bronze', '{"type":"daily_streak","days":7}', 50, 'common', 10),
('streak_daily_30', '30-Day Streak', 'Save links for 30 consecutive days', 'streak', 'gold', '{"type":"daily_streak","days":30}', 300, 'epic', 11),
('streak_daily_100', '100-Day Streak', 'Save links for 100 consecutive days', 'streak', 'platinum', '{"type":"daily_streak","days":100}', 1000, 'legendary', 12),
('streak_weekly_4', '4-Week Streak', 'Save links for 4 consecutive weeks', 'streak', 'silver', '{"type":"weekly_streak","weeks":4}', 150, 'rare', 20),
('streak_weekly_12', '12-Week Streak', 'Save links for 12 consecutive weeks', 'streak', 'gold', '{"type":"weekly_streak","weeks":12}', 400, 'epic', 21),
('streak_monthly_3', '3-Month Streak', 'Save links for 3 consecutive months', 'streak', 'silver', '{"type":"monthly_streak","months":3}', 200, 'rare', 30),
('streak_monthly_6', '6-Month Streak', 'Save links for 6 consecutive months', 'streak', 'gold', '{"type":"monthly_streak","months":6}', 500, 'epic', 31),

-- Milestone badges
('milestone_1', 'First Link', 'Save your first link', 'milestone', 'bronze', '{"type":"milestone","count":1}', 10, 'common', 40),
('milestone_10', 'Collector', 'Save 10 links', 'milestone', 'bronze', '{"type":"milestone","count":10}', 50, 'common', 41),
('milestone_50', 'Curator', 'Save 50 links', 'milestone', 'silver', '{"type":"milestone","count":50}', 250, 'rare', 42),
('milestone_100', 'Archivist', 'Save 100 links', 'milestone', 'gold', '{"type":"milestone","count":100}', 500, 'epic', 43),
('milestone_250', 'Master Collector', 'Save 250 links', 'milestone', 'platinum', '{"type":"milestone","count":250}', 1000, 'legendary', 44),

-- Scholar badges
('morning_scholar', 'Morning Scholar', 'Most active in mornings (4am-11:59am) - requires 10+ saves in 30 days with 40%+ share', 'scholar', 'gold', '{"type":"scholar","time_bucket":"morning","min_saves":10,"min_share":0.40}', 300, 'epic', 50),
('afternoon_scholar', 'Afternoon Scholar', 'Most active in afternoons (12pm-7:59pm) - requires 10+ saves in 30 days with 40%+ share', 'scholar', 'gold', '{"type":"scholar","time_bucket":"afternoon","min_saves":10,"min_share":0.40}', 300, 'epic', 51),
('night_scholar', 'Night Scholar', 'Most active at night (8pm-3:59am) - requires 10+ saves in 30 days with 40%+ share', 'scholar', 'gold', '{"type":"scholar","time_bucket":"night","min_saves":10,"min_share":0.40}', 300, 'epic', 52);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SYNTHETIC DATA (Demo User)
-- ============================================

-- Insert folders for demo user (UUID: 00000000-0000-0000-0000-000000000001)
INSERT INTO folders (id, user_id, name, description, color, icon, created_at) VALUES
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Web Development', 'Articles and resources about frontend and backend development', '#3b82f6', '💻', '2025-12-01 09:30:00+00'),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Design Inspiration', 'Beautiful UI/UX designs and creative ideas', '#8b5cf6', '🎨', '2025-12-05 14:20:00+00'),
('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'AI & Machine Learning', 'Latest in AI, ML, and data science', '#10b981', '🤖', '2025-12-10 11:45:00+00'),
('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', 'Productivity', 'Tips and tools for better productivity', '#f59e0b', '⚡', '2025-12-15 16:10:00+00'),
('55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000001', 'Books to Read', 'Book recommendations and reviews', '#ef4444', '📚', '2026-01-05 10:00:00+00'),
('66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000001', 'Personal Growth', 'Self-improvement and mindfulness content', '#ec4899', '🌱', '2026-01-20 13:30:00+00');

-- Insert items (links) across folders
INSERT INTO items (id, user_id, folder_id, title, url, item_type, description, created_at) VALUES
-- Web Development folder
('a1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'React 19 Features Overview', 'https://react.dev/blog/2024/react-19', 'article', 'Deep dive into React 19 new features and improvements', '2025-12-02 08:15:00+00'),
('a2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'CSS Grid Mastery', 'https://css-tricks.com/snippets/css/complete-guide-grid/', 'article', 'Complete guide to CSS Grid layout', '2025-12-08 19:30:00+00'),
('a3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'TypeScript Best Practices', 'https://typescript-guide.dev', 'article', 'Advanced TypeScript patterns and practices', '2025-12-15 07:45:00+00'),
('a4444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Building APIs with Node.js', 'https://nodejs.org/en/docs/', 'article', 'RESTful API design and implementation', '2026-01-10 21:20:00+00'),
('a5555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'WebAssembly Tutorial', 'https://webassembly.org', 'video', 'Introduction to WebAssembly and its use cases', '2026-01-25 06:30:00+00'),

-- Design folder
('b1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Dribbble Top Designs 2024', 'https://dribbble.com/shots/popular', 'article', 'Collection of the best UI designs', '2025-12-07 15:00:00+00'),
('b2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Color Theory for Developers', 'https://colortheory.dev', 'article', 'Understanding color psychology in design', '2025-12-20 10:30:00+00'),
('b3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Figma Advanced Techniques', 'https://figma.com/resources', 'video', 'Pro tips for Figma design workflow', '2026-01-08 22:15:00+00'),
('b4444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Microinteractions Guide', 'https://microinteractions.com', 'article', 'Creating delightful user interactions', '2026-02-01 08:45:00+00'),

-- AI & ML folder
('c1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'GPT-4 Architecture Explained', 'https://openai.com/research', 'article', 'How GPT-4 works under the hood', '2025-12-12 09:00:00+00'),
('c2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'Machine Learning Crash Course', 'https://developers.google.com/machine-learning', 'video', 'Google ML course for beginners', '2025-12-28 20:00:00+00'),
('c3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'Neural Networks from Scratch', 'https://nnfs.io', 'article', 'Building neural networks without libraries', '2026-01-15 07:15:00+00'),
('c4444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'Stable Diffusion Tutorial', 'https://stability.ai', 'video', 'Creating AI art with Stable Diffusion', '2026-01-30 23:00:00+00'),

-- Productivity folder
('d1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'Getting Things Done Method', 'https://gettingthingsdone.com', 'article', 'David Allen GTD productivity system', '2025-12-18 11:20:00+00'),
('d2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'Deep Work by Cal Newport', 'https://calnewport.com/books/deep-work/', 'book', 'Rules for focused success in a distracted world', '2026-01-03 05:30:00+00'),
('d3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'Notion Setup Guide', 'https://notion.so/guides', 'article', 'Organizing your life with Notion', '2026-01-18 14:45:00+00'),
('d4444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'Pomodoro Technique Explained', 'https://francescocirillo.com/pages/pomodoro-technique', 'article', 'Time management using 25-minute intervals', '2026-02-05 09:30:00+00'),

-- Books folder
('e1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555555', 'Atomic Habits - James Clear', 'https://jamesclear.com/atomic-habits', 'book', 'How to build better habits', '2026-01-06 12:00:00+00'),
('e2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555555', 'The Pragmatic Programmer', 'https://pragprog.com', 'book', 'Essential reading for software developers', '2026-01-22 17:30:00+00'),
('e3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555555', 'Thinking, Fast and Slow', 'https://www.goodreads.com/book/show/11468377', 'book', 'Daniel Kahneman on decision making', '2026-02-08 06:45:00+00'),

-- Personal Growth folder
('f1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', '66666666-6666-6666-6666-666666666666', 'Meditation for Beginners', 'https://headspace.com/meditation', 'video', 'Getting started with mindfulness meditation', '2026-01-21 07:00:00+00'),
('f2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', '66666666-6666-6666-6666-666666666666', 'Stoic Philosophy Guide', 'https://dailystoic.com', 'article', 'Practical wisdom from ancient stoics', '2026-02-03 20:30:00+00'),
('f3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', '66666666-6666-6666-6666-666666666666', 'The Power of Now', 'https://eckharttolle.com', 'book', 'Spiritual enlightenment and presence', '2026-02-15 10:15:00+00');

-- Insert some notes
INSERT INTO notes (user_id, item_id, content, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'a1111111-1111-1111-1111-111111111111', 'React Server Components look really promising! Need to try this in my next project.', '2025-12-02 08:20:00+00'),
('00000000-0000-0000-0000-000000000001', 'c1111111-1111-1111-1111-111111111111', 'Fascinating breakdown of transformer architecture. The attention mechanism is key to understanding GPT.', '2025-12-12 09:15:00+00'),
('00000000-0000-0000-0000-000000000001', 'd2222222-2222-2222-2222-222222222222', 'Started reading this. Chapter 1 on deep work rules is mind-blowing. No more shallow work!', '2026-01-03 06:00:00+00'),
('00000000-0000-0000-0000-000000000001', 'e1111111-1111-1111-1111-111111111111', 'The 1% improvement principle is so powerful. Small changes compound over time.', '2026-01-06 12:30:00+00'),
('00000000-0000-0000-0000-000000000001', 'b3333333-3333-3333-3333-333333333333', 'Auto-layout and components are game changers. Shared this with the design team.', '2026-01-08 22:30:00+00');

-- Insert activity log (spanning 3 months with varied times for scholar badges)
INSERT INTO user_activity_log (user_id, activity_type, activity_date, activity_timestamp, metadata) VALUES
-- December 2025 (Morning heavy - 12 saves, 8 morning)
('00000000-0000-0000-0000-000000000001', 'link_saved', '2025-12-02', '2025-12-02 08:15:00+00', '{"link_id":"a1111111-1111-1111-1111-111111111111"}'),
('00000000-0000-0000-0000-000000000001', 'link_saved', '2025-12-05', '2025-12-05 14:20:00+00', '{"link_id":"22222222-2222-2222-2222-222222222222"}'),
('00000000-0000-0000-0000-000000000001', 'link_saved', '2025-12-07', '2025-12-07 15:00:00+00', '{"link_id":"b1111111-1111-1111-1111-111111111111"}'),
('00000000-0000-0000-0000-000000000001', 'link_saved', '2025-12-08', '2025-12-08 19:30:00+00', '{"link_id":"a2222222-2222-2222-2222-222222222222"}'),
('00000000-0000-0000-0000-000000000001', 'link_saved', '2025-12-10', '2025-12-10 11:45:00+00', '{"link_id":"33333333-3333-3333-3333-333333333333"}'),
('00000000-0000-0000-0000-000000000001', 'link_saved', '2025-12-12', '2025-12-12 09:00:00+00', '{"link_id":"c1111111-1111-1111-1111-111111111111"}'),
('00000000-0000-0000-0000-000000000001', 'link_saved', '2025-12-15', '2025-12-15 07:45:00+00', '{"link_id":"a3333333-3333-3333-3333-333333333333"}'),
('00000000-0000-0000-0000-000000000001', 'link_saved', '2025-12-15', '2025-12-15 16:10:00+00', '{"link_id":"44444444-4444-4444-4444-444444444444"}'),
('00000000-0000-0000-0000-000000000001', 'link_saved', '2025-12-18', '2025-12-18 11:20:00+00', '{"link_id":"d1111111-1111-1111-1111-111111111111"}'),
('00000000-0000-0000-0000-000000000001', 'link_saved', '2025-12-20', '2025-12-20 10:30:00+00', '{"link_id":"b2222222-2222-2222-2222-222222222222"}'),
('00000000-0000-0000-0000-000000000001', 'link_saved', '2025-12-28', '2025-12-28 20:00:00+00', '{"link_id":"c2222222-2222-2222-2222-222222222222"}'),

-- January 2026 (Mixed times - 15 saves)
('00000000-0000-0000-0000-000000000001', 'link_saved', '2026-01-03', '2026-01-03 05:30:00+00', '{"link_id":"d2222222-2222-2222-2222-222222222222"}'),
('00000000-0000-0000-0000-000000000001', 'link_saved', '2026-01-05', '2026-01-05 10:00:00+00', '{"link_id":"55555555-5555-5555-5555-555555555555"}'),
('00000000-0000-0000-0000-000000000001', 'link_saved', '2026-01-06', '2026-01-06 12:00:00+00', '{"link_id":"e1111111-1111-1111-1111-111111111111"}'),
('00000000-0000-0000-0000-000000000001', 'link_saved', '2026-01-08', '2026-01-08 22:15:00+00', '{"link_id":"b3333333-3333-3333-3333-333333333333"}'),
('00000000-0000-0000-0000-000000000001', 'link_saved', '2026-01-10', '2026-01-10 21:20:00+00', '{"link_id":"a4444444-4444-4444-4444-444444444444"}'),
('00000000-0000-0000-0000-000000000001', 'link_saved', '2026-01-15', '2026-01-15 07:15:00+00', '{"link_id":"c3333333-3333-3333-3333-333333333333"}'),
('00000000-0000-0000-0000-000000000001', 'link_saved', '2026-01-18', '2026-01-18 14:45:00+00', '{"link_id":"d3333333-3333-3333-3333-333333333333"}'),
('00000000-0000-0000-0000-000000000001', 'link_saved', '2026-01-20', '2026-01-20 13:30:00+00', '{"link_id":"66666666-6666-6666-6666-666666666666"}'),
('00000000-0000-0000-0000-000000000001', 'link_saved', '2026-01-21', '2026-01-21 07:00:00+00', '{"link_id":"f1111111-1111-1111-1111-111111111111"}'),
('00000000-0000-0000-0000-000000000001', 'link_saved', '2026-01-22', '2026-01-22 17:30:00+00', '{"link_id":"e2222222-2222-2222-2222-222222222222"}'),
('00000000-0000-0000-0000-000000000001', 'link_saved', '2026-01-25', '2026-01-25 06:30:00+00', '{"link_id":"a5555555-5555-5555-5555-555555555555"}'),
('00000000-0000-0000-0000-000000000001', 'link_saved', '2026-01-30', '2026-01-30 23:00:00+00', '{"link_id":"c4444444-4444-4444-4444-444444444444"}'),

-- February 2026 (Recent - 6 saves)
('00000000-0000-0000-0000-000000000001', 'link_saved', '2026-02-01', '2026-02-01 08:45:00+00', '{"link_id":"b4444444-4444-4444-4444-444444444444"}'),
('00000000-0000-0000-0000-000000000001', 'link_saved', '2026-02-03', '2026-02-03 20:30:00+00', '{"link_id":"f2222222-2222-2222-2222-222222222222"}'),
('00000000-0000-0000-0000-000000000001', 'link_saved', '2026-02-05', '2026-02-05 09:30:00+00', '{"link_id":"d4444444-4444-4444-4444-444444444444"}'),
('00000000-0000-0000-0000-000000000001', 'link_saved', '2026-02-08', '2026-02-08 06:45:00+00', '{"link_id":"e3333333-3333-3333-3333-333333333333"}'),
('00000000-0000-0000-0000-000000000001', 'link_saved', '2026-02-15', '2026-02-15 10:15:00+00', '{"link_id":"f3333333-3333-3333-3333-333333333333"}'),
('00000000-0000-0000-0000-000000000001', 'link_saved', '2026-02-25', '2026-02-25 23:30:00+00', '{"link_id":"d7777777-7777-7777-7777-777777777777"}');

-- Update stats for demo user
INSERT INTO user_milestone_stats (user_id, total_links_saved, total_links_active, first_save_at, last_save_at) VALUES
('00000000-0000-0000-0000-000000000001', 35, 27, '2025-12-02 08:15:00+00', '2026-02-25 23:30:00+00');

INSERT INTO user_streak_stats (user_id, current_daily_streak, longest_daily_streak, last_activity_date) VALUES
('00000000-0000-0000-0000-000000000001', 7, 12, '2026-02-25');

INSERT INTO user_scholar_stats (user_id, morning_saves_30d, afternoon_saves_30d, night_saves_30d, total_saves_30d, morning_share, afternoon_share, night_share, current_scholar_badge) VALUES
('00000000-0000-0000-0000-000000000001', 8, 9, 18, 35, 0.2286, 0.2571, 0.5143, 'night_scholar');

-- Award badges to demo user (based on their activity pattern)
INSERT INTO user_badges (user_id, badge_id, earned_at, progress_data, is_new) VALUES
('00000000-0000-0000-0000-000000000001', 'milestone_1', '2025-12-02 08:15:00+00', '{"count":1}', false),
('00000000-0000-0000-0000-000000000001', 'milestone_10', '2026-01-06 12:00:00+00', '{"count":10}', false),
('00000000-0000-0000-0000-000000000001', 'streak_daily_7', '2026-01-13 14:30:00+00', '{"streak":7}', false),
('00000000-0000-0000-0000-000000000001', 'night_scholar', '2026-02-01 20:30:00+00', '{"night_saves":18,"total_saves":35,"percentage":51}', false);
