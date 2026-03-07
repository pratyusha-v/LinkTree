# LinkTree - Personal Knowledge Tracking System

A responsive client-side web app for tracking and organizing your knowledge. Save articles, videos, podcasts, books, and more into custom folders, add notes, search globally, and earn achievement badges based on your activity.

## Features

### Core Functionality
- **📁 Folder Management**: Create custom folders/topics to organize your knowledge
- **🔗 Item Saving**: Save links (articles, videos, podcasts, books, people) with automatic metadata fetching
- **📝 Notes System**: Add notes to items and folders for contextual information
- **🔍 Global Search**: Search across all items and notes
- **📅 Review System**: Optional spaced repetition for reviewing saved items

### Gamification & Badges
- **🔥 Streak Badges**: Daily, weekly, and monthly streak tracking
- **🎯 Milestone Badges**: Achievement badges at 1, 10, 50, 100, 250 items saved
- **🌟 Scholar Badges**: Earn Morning/Afternoon/Night Scholar based on your saving patterns
  - Morning Scholar: Most active 4am-11:59am (requires ≥10 saves in 30 days, ≥40% share)
  - Afternoon Scholar: Most active 12pm-7:59pm (requires ≥10 saves in 30 days, ≥40% share)
  - Night Scholar: Most active 8pm-3:59am (requires ≥10 saves in 30 days, ≥40% share)

## Tech Stack

- **Frontend**: React 18 + JavaScript (Vite)
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **State Management**: React Context API + React Query
- **Styling**: CSS with CSS Custom Properties
- **Animations**: Framer Motion
- **Routing**: React Router v6

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm/yarn
- Supabase account

### 1. Clone and Install

```bash
cd LinkTree
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy your project URL and anon/public key

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Database Migrations

In your Supabase dashboard:
1. Go to SQL Editor
2. Create a new query
3. Copy and paste the contents of `supabase_schema.sql`
4. Run the query

This will create all necessary tables with Row Level Security enabled.

### 5. Start Development Server

```bash
npm run dev
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
LinkTree/
├── src/
│   ├── components/         # React components
│   ├── contexts/          # React contexts (Auth, etc.)
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services (Supabase)
│   ├── pages/             # Page components
│   ├── styles/            # Global styles
│   └── utils/             # Utility functions
├── supabase_schema.sql    # Database schema
└── package.json
```

## Usage Guide

### Creating Your First Folder
1. Sign up for an account
2. Click "Create Folder" on the dashboard
3. Give it a name, description, color, and icon

### Saving Items
1. Open a folder
2. Click "Add Item"
3. Paste a URL or manually enter details
4. Save to folder

### Earning Badges
- **First Link**: Automatically earned when you save your first item
- **Streaks**: Save at least one link per day/week/month
- **Milestones**: Reach 10, 50, 100, 250 saved items
- **Scholar Badge**: Save consistently at the same time of day

## License

MIT