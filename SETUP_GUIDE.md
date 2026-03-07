# LinkTree Setup Guide

## Quick Start

Follow these steps to get your LinkTree app running:

### 1. Install Dependencies

```bash
npm install
```

### 2. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details:
   - Name: LinkTree
   - Database Password: (save this securely)
   - Region: Choose closest to you
4. Wait for project to be created (~2 minutes)

### 3. Get Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### 4. Configure Environment Variables

1. Copy the example env file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and paste your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 5. Set Up Database

1. In Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Open the `supabase_schema.sql` file in this project
4. Copy ALL the contents and paste into the SQL Editor
5. Click **Run** (bottom right)
6. Wait for completion message: "Success. No rows returned"

This creates:
- ✅ All database tables (folders, items, notes, badges, etc.)
- ✅ Row Level Security policies
- ✅ Badge definitions (pre-seeded)
- ✅ Triggers for auto-updating timestamps

### 6. Start Development Server

```bash
npm run dev
```

The app will open at [http://localhost:3000](http://localhost:3000)

### 7. Create Your Account

1. Click "Sign up"
2. Enter your email, name, and password
3. You'll be automatically logged in
4. Start creating folders and saving links!

---

## What's Implemented

### ✅ Completed Features

1. **Authentication System**
   - Sign up with email/password
   - Login/logout
   - Protected routes
   - Session persistence

2. **Folder Management**
   - Create folders with name, description, icon, color
   - View all folders on dashboard
   - Navigate to folder detail pages

3. **Badge System (Backend)**
   - Comprehensive badge calculation service
   - Streak tracking (daily/weekly/monthly)
   - Milestone tracking (1, 10, 50, 100, 250 items)
   - Scholar badge logic (Morning/Afternoon/Night)
   - Activity logging
   - Pre-computed stats tables

4. **Database Schema**
   - Complete database with all tables
   - Row Level Security enabled
   - Badge definitions seeded
   - Optimized indexes

5. **Core Services**
   - Supabase client setup
   - Auth service
   - Folder service
   - Item service (basic)
   - Badge service (complete)
   - Activity tracking service

6. **UI Foundation**
   - Responsive layout
   - Navigation bar
   - Authentication pages
   - Dashboard with folder grid
   - CSS variables for theming
   - Mobile-responsive design

### 🚧 To Be Implemented

1. **Item Management UI**
   - Add item form within folders
   - Item cards/list display
   - Edit/delete items
   - URL metadata fetching display
   - Integration with activity tracking

2. **Badge UI Components**
   - Badge collection page
   - Badge notifications with animations
   - Badge progress indicators
   - Scholar badge time-of-day chart
   - "New badge" toast notifications

3. **Notes System**
   - Add notes to items
   - Add notes to folders
   - Note editor component
   - Display notes in item/folder detail

4. **Search Functionality**
   - Global search bar
   - Search across items and notes
   - Filter by folder/type
   - Search results display

5. **Review/Resurface Feature**
   - Review widget on dashboard
   - Spaced repetition scheduler
   - Mark items as reviewed
   - Next review date calculation

---

## Testing the Badge System

### Test Streak Badges

1. Save an item (once item UI is implemented)
2. The `useActivityTracking` hook will automatically:
   - Log activity to `user_activity_log`
   - Update `user_streak_stats`
   - Check for new streak badges
3. Repeat daily to earn streak badges

### Test Milestone Badges

1. Save 1 item → Earn "First Link" badge
2. Save 10 items → Earn "Collector" badge
3. Save 50 items → Earn "Curator" badge
4. And so on...

### Test Scholar Badge (Advanced)

The scholar badge requires 30 days of data and runs via background calculation.

**Manual Testing:**

1. In Supabase SQL Editor, run:
   ```sql
   -- Insert test activity data spanning 30 days with morning dominance
   -- (Adjust user_id to your actual user ID)
   ```

2. Then run the scholar badge calculation (would normally be a cron job):
   ```sql
   -- Calculate scholar stats for user
   -- (See supabase_schema.sql for calculation logic)
   ```

3. Query results:
   ```sql
   SELECT * FROM user_scholar_stats WHERE user_id = 'your-user-id';
   SELECT * FROM user_badges WHERE user_id = 'your-user-id' AND badge_id LIKE '%_scholar';
   ```

---

## Folder Structure

```
LinkTree/
├── src/
│   ├── components/
│   │   ├── auth/               ✅ Login, Signup, ProtectedRoute
│   │   ├── layout/             ✅ Layout, Navbar
│   │   ├── folders/            🚧 (To be built)
│   │   ├── items/              🚧 (To be built)
│   │   ├── badges/             🚧 (To be built)
│   │   ├── notes/              🚧 (To be built)
│   │   └── search/             🚧 (To be built)
│   ├── contexts/
│   │   └── AuthContext.jsx     ✅ Authentication state
│   ├── hooks/
│   │   └── useActivityTracking.js  ✅ Activity tracking
│   ├── services/
│   │   ├── supabase.js         ✅ Supabase client
│   │   ├── authService.js      ✅ Auth operations
│   │   ├── folderService.js    ✅ Folder CRUD
│   │   ├── itemService.js      ✅ Item CRUD (basic)
│   │   ├── badgeService.js     ✅ Badge calculations
│   │   └── activityService.js  ✅ Activity logging
│   ├── pages/
│   │   ├── LoginPage.jsx       ✅ Login
│   │   ├── SignupPage.jsx      ✅ Signup
│   │   ├── DashboardPage.jsx   ✅ Main dashboard with folders
│   │   ├── FolderPage.jsx      🚧 Placeholder
│   │   ├── ProfilePage.jsx     🚧 Placeholder
│   │   └── SearchPage.jsx      🚧 Placeholder
│   ├── styles/
│   │   ├── index.css           ✅ Global styles
│   │   └── variables.css       ✅ CSS custom properties
│   ├── App.jsx                 ✅ Main app with routing
│   └── index.jsx               ✅ Entry point
├── supabase_schema.sql         ✅ Complete database schema
├── package.json                ✅ Dependencies
├── vite.config.js              ✅ Vite configuration
├── index.html                  ✅ HTML template
├── .env.example                ✅ Environment variables template
└── README.md                   ✅ Documentation

✅ = Fully implemented
🚧 = Needs implementation
```

---

## Next Steps for Development

### Phase 1: Complete Item Management (Priority)

1. Create `ItemForm.jsx` component
2. Create `ItemList.jsx` and `ItemCard.jsx`
3. Integrate with `FolderPage.jsx`
4. Connect to activity tracking
5. Test badge awarding on item save

### Phase 2: Badge UI

1. Create `BadgeCollection.jsx` page
2. Create `BadgeNotification.jsx` with Framer Motion
3. Create `BadgeProgress.jsx` widgets
4. Create `ScholarBadgeDisplay.jsx` with time chart
5. Integrate into `ProfilePage.jsx`

### Phase 3: Notes & Search

1. Create `NoteEditor.jsx` component
2. Add notes to item and folder detail pages
3. Create global search functionality
4. Implement search results display

### Phase 4: Review System

1. Create review widget
2. Implement spaced repetition logic
3. Add "mark as reviewed" action
4. Calculate next review dates

---

## Common Issues & Solutions

### Issue: "Missing Supabase environment variables"

**Solution:** 
- Ensure `.env.local` exists in project root
- Check that variables start with `VITE_` prefix
- Restart dev server after creating/modifying `.env.local`

### Issue: Can't see created folders

**Solution:**
- Check Supabase dashboard → Table Editor → folders table
- Verify Row Level Security policies are applied
- Check browser console for errors
- Ensure user_id matches your authenticated user

### Issue: Badges not being awarded

**Solution:**
- Check `user_activity_log` table for logged activities
- Verify `badge_definitions` table has seed data
- Check browser console for badge service errors
- Manually test `badgeService.checkAndAwardBadges(userId)`

### Issue: Scholar badge not calculating

**Solution:**
- Scholar badges require 30 days of data + background job
- Currently needs manual trigger via SQL or server-side cron
- For testing, insert sample data spanning 30 days
- Run calculation query manually in Supabase SQL Editor

---

## Deployment (Optional)

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

When prompted:
- Set up and deploy: Yes
- Link to existing project: No (create new)
- Project name: linktree (or your choice)
- Directory: ./ (root)
- Override settings: No

After deployment:
1. Go to Vercel dashboard → Your project → Settings → Environment Variables
2. Add:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
3. Redeploy

---

## Need Help?

- Check Supabase logs in dashboard
- Check browser console for errors
- Verify `.env.local` is configured
- Ensure database schema is fully applied
- Check that you're signed in

---

**Happy coding! 🚀**
