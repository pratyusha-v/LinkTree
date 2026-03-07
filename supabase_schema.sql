-- ============================================
-- LinkTree Database Schema
-- Complete database setup with badge system
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
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
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT DEFAULT '📁',
  review_enabled BOOLEAN DEFAULT false,
  review_interval_days INTEGER DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_folders_created_at ON folders(created_at DESC);

-- Items table
CREATE TABLE items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
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
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
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
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
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
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
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
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
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
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  total_links_saved INTEGER DEFAULT 0,
  total_links_active INTEGER DEFAULT 0,
  total_links_deleted INTEGER DEFAULT 0,
  first_save_at TIMESTAMP WITH TIME ZONE,
  last_save_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scholar badge statistics (pre-computed)
CREATE TABLE user_scholar_stats (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
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

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Folders policies
CREATE POLICY "Users can view their own folders"
  ON folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own folders"
  ON folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders"
  ON folders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders"
  ON folders FOR DELETE
  USING (auth.uid() = user_id);

-- Items policies
CREATE POLICY "Users can view their own items"
  ON items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own items"
  ON items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
  ON items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
  ON items FOR DELETE
  USING (auth.uid() = user_id);

-- Notes policies
CREATE POLICY "Users can view their own notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);

-- Badge definitions are public (read-only)
ALTER TABLE badge_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view badge definitions"
  ON badge_definitions FOR SELECT
  TO authenticated
  USING (true);

-- User badges policies
CREATE POLICY "Users can view their own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their badge view status"
  ON user_badges FOR UPDATE
  USING (auth.uid() = user_id);

-- Activity log policies
CREATE POLICY "Users can view their own activity"
  ON user_activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can log their own activity"
  ON user_activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Stats policies (read-only for users)
CREATE POLICY "Users can view their own streak stats"
  ON user_streak_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own milestone stats"
  ON user_milestone_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own scholar stats"
  ON user_scholar_stats FOR SELECT
  USING (auth.uid() = user_id);

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
