-- supabase/migrations/002_rls_realtime.sql
-- Migration to enable Row Level Security, create policies, and configure Realtime

-- 1. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies (if any) and create SELECT policies
-- profiles
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profiles_delete_own ON public.profiles;
CREATE POLICY profiles_delete_own ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- daily_goals
DROP POLICY IF EXISTS daily_goals_select_own ON public.daily_goals;
CREATE POLICY daily_goals_select_own ON public.daily_goals
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS daily_goals_insert_own ON public.daily_goals;
CREATE POLICY daily_goals_insert_own ON public.daily_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS daily_goals_update_own ON public.daily_goals;
CREATE POLICY daily_goals_update_own ON public.daily_goals
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS daily_goals_delete_own ON public.daily_goals;
CREATE POLICY daily_goals_delete_own ON public.daily_goals
  FOR DELETE USING (auth.uid() = user_id);

-- meals
DROP POLICY IF EXISTS meals_select_own ON public.meals;
CREATE POLICY meals_select_own ON public.meals
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS meals_insert_own ON public.meals;
CREATE POLICY meals_insert_own ON public.meals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS meals_update_own ON public.meals;
CREATE POLICY meals_update_own ON public.meals
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS meals_delete_own ON public.meals;
CREATE POLICY meals_delete_own ON public.meals
  FOR DELETE USING (auth.uid() = user_id);

-- activities
DROP POLICY IF EXISTS activities_select_own ON public.activities;
CREATE POLICY activities_select_own ON public.activities
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS activities_insert_own ON public.activities;
CREATE POLICY activities_insert_own ON public.activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS activities_update_own ON public.activities;
CREATE POLICY activities_update_own ON public.activities
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS activities_delete_own ON public.activities;
CREATE POLICY activities_delete_own ON public.activities
  FOR DELETE USING (auth.uid() = user_id);

-- water_entries
DROP POLICY IF EXISTS water_entries_select_own ON public.water_entries;
CREATE POLICY water_entries_select_own ON public.water_entries
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS water_entries_insert_own ON public.water_entries;
CREATE POLICY water_entries_insert_own ON public.water_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS water_entries_update_own ON public.water_entries;
CREATE POLICY water_entries_update_own ON public.water_entries
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS water_entries_delete_own ON public.water_entries;
CREATE POLICY water_entries_delete_own ON public.water_entries
  FOR DELETE USING (auth.uid() = user_id);

-- sleep_records
DROP POLICY IF EXISTS sleep_records_select_own ON public.sleep_records;
CREATE POLICY sleep_records_select_own ON public.sleep_records
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS sleep_records_insert_own ON public.sleep_records;
CREATE POLICY sleep_records_insert_own ON public.sleep_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS sleep_records_update_own ON public.sleep_records;
CREATE POLICY sleep_records_update_own ON public.sleep_records
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS sleep_records_delete_own ON public.sleep_records;
CREATE POLICY sleep_records_delete_own ON public.sleep_records
  FOR DELETE USING (auth.uid() = user_id);

-- weight_records
DROP POLICY IF EXISTS weight_records_select_own ON public.weight_records;
CREATE POLICY weight_records_select_own ON public.weight_records
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS weight_records_insert_own ON public.weight_records;
CREATE POLICY weight_records_insert_own ON public.weight_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS weight_records_update_own ON public.weight_records;
CREATE POLICY weight_records_update_own ON public.weight_records
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS weight_records_delete_own ON public.weight_records;
CREATE POLICY weight_records_delete_own ON public.weight_records
  FOR DELETE USING (auth.uid() = user_id);

-- todos
DROP POLICY IF EXISTS todos_select_own ON public.todos;
CREATE POLICY todos_select_own ON public.todos
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS todos_insert_own ON public.todos;
CREATE POLICY todos_insert_own ON public.todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS todos_update_own ON public.todos;
CREATE POLICY todos_update_own ON public.todos
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS todos_delete_own ON public.todos;
CREATE POLICY todos_delete_own ON public.todos
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Configure Realtime publication (add tables if not already present)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_rel WHERE prpubid = (SELECT oid FROM pg_publication WHERE pubname = 'supabase_realtime') AND prrelid = 'public.profiles'::regclass) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_rel WHERE prpubid = (SELECT oid FROM pg_publication WHERE pubname = 'supabase_realtime') AND prrelid = 'public.daily_goals'::regclass) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_goals;
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_rel WHERE prpubid = (SELECT oid FROM pg_publication WHERE pubname = 'supabase_realtime') AND prrelid = 'public.meals'::regclass) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.meals;
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_rel WHERE prpubid = (SELECT oid FROM pg_publication WHERE pubname = 'supabase_realtime') AND prrelid = 'public.activities'::regclass) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_rel WHERE prpubid = (SELECT oid FROM pg_publication WHERE pubname = 'supabase_realtime') AND prrelid = 'public.water_entries'::regclass) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.water_entries;
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_rel WHERE prpubid = (SELECT oid FROM pg_publication WHERE pubname = 'supabase_realtime') AND prrelid = 'public.sleep_records'::regclass) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sleep_records;
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_rel WHERE prpubid = (SELECT oid FROM pg_publication WHERE pubname = 'supabase_realtime') AND prrelid = 'public.weight_records'::regclass) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.weight_records;
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_rel WHERE prpubid = (SELECT oid FROM pg_publication WHERE pubname = 'supabase_realtime') AND prrelid = 'public.todos'::regclass) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.todos;
  END IF;
END $$;

-- 4. Set REPLICA IDENTITY FULL for reliable realtime payloads
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.daily_goals REPLICA IDENTITY FULL;
ALTER TABLE public.meals REPLICA IDENTITY FULL;
ALTER TABLE public.activities REPLICA IDENTITY FULL;
ALTER TABLE public.water_entries REPLICA IDENTITY FULL;
ALTER TABLE public.sleep_records REPLICA IDENTITY FULL;
ALTER TABLE public.weight_records REPLICA IDENTITY FULL;
ALTER TABLE public.todos REPLICA IDENTITY FULL;

COMMIT;
