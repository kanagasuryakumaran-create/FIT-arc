-- supabase/migrations/003_todo_daily_completions.sql
-- Migration to support spreadsheet-style 7-day routine tracker with daily task completions

-- 1. Create todo_completions table for date-specific task completion records
CREATE TABLE IF NOT EXISTS public.todo_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  todo_id UUID NOT NULL REFERENCES public.todos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT unique_todo_user_date UNIQUE (todo_id, user_id, completed_date)
);

-- 2. Performance indexes for fast date-range queries and foreign key cascades
CREATE INDEX IF NOT EXISTS idx_todo_completions_user_date
  ON public.todo_completions (user_id, completed_date);

CREATE INDEX IF NOT EXISTS idx_todo_completions_todo_id
  ON public.todo_completions (todo_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.todo_completions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies (Users can only access and modify their own records)
DROP POLICY IF EXISTS "Users can read own todo completions" ON public.todo_completions;
CREATE POLICY "Users can read own todo completions" ON public.todo_completions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own todo completions" ON public.todo_completions;
CREATE POLICY "Users can insert own todo completions" ON public.todo_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own todo completions" ON public.todo_completions;
CREATE POLICY "Users can delete own todo completions" ON public.todo_completions
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Enable Realtime updates for live multi-device synchronization
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel
    WHERE prpubid = (SELECT oid FROM pg_publication WHERE pubname = 'supabase_realtime')
      AND prrelid = 'public.todo_completions'::regclass
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.todo_completions;
  END IF;
END $$;
