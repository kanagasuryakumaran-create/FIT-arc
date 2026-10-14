# FIT-arc

FIT-arc is a personal health, nutrition, activity, and task-tracking web application built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

- **User Authentication**: Secure sign-up, sign-in, and sign-out powered by Supabase Auth.
- **Meal & Calorie Tracker**: Log meals, specify calories, edit/delete meals, and view today's total calories.
- **Activity Tracking**: Record workouts with duration in minutes and view activity history.
- **To-Do List**: Create, edit, complete, and delete tasks with pending and completed progress tracking.
- **Unified Dashboard**: View summary metrics for calories, active time, task progress, and recent logs in one place.
- **Supabase Realtime**: Multi-device real-time state synchronization for instant UI updates.
- **Row Level Security (RLS)**: Enforces complete user isolation at the database level.

---

## 🛠️ Setup Instructions

### 1. Database Setup (Supabase)
Run the contents of [`supabase/schema.sql`](./supabase/schema.sql) in your Supabase SQL Editor. This will:
- Create the `meals`, `activities`, and `todos` tables.
- Enable Row Level Security (RLS) policies for user data isolation.
- Enable Supabase Realtime subscriptions.

### 2. Environment Variables
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Local Development
Install dependencies and launch the dev server:
```bash
npm install
npm run dev
```

### 4. Build for Production
```bash
npm run build
```
