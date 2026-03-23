-- ♟️ PRODUCTION GRADE CHESS SCHEMA --

-- 1. Enable Required Extensions --
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For gen_random_uuid() support

-- 2. Profiles Table (Linked to Supabase Auth) --
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  points INTEGER DEFAULT 1000,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Game Rooms Table --
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text) from 1 for 8),
  white_player_id UUID REFERENCES public.profiles(id),
  black_player_id UUID REFERENCES public.profiles(id),
  fen TEXT DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  status TEXT CHECK (status IN ('waiting', 'playing', 'finished')) DEFAULT 'waiting',
  pgn TEXT DEFAULT '',
  winner_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Move Logs Table --
CREATE TABLE IF NOT EXISTS public.moves (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.profiles(id),
  move_notation TEXT NOT NULL, 
  fen_after TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Spectator Chat Messages --
CREATE TABLE IF NOT EXISTS public.messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  guest_id TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Trigger: Auto-create Profile on Auth Signup --
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, split_part(new.email, '@', 1));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. Row Level Security (RLS) Enablement --
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 8. Policies --
-- 8. Policies (Re-runnable Safe)

-- Profiles
DROP POLICY IF EXISTS "Public Read Profiles" ON public.profiles;
CREATE POLICY "Public Read Profiles"
ON public.profiles FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Rooms
DROP POLICY IF EXISTS "Anyone view rooms" ON public.rooms;
CREATE POLICY "Anyone view rooms"
ON public.rooms FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Auth users create rooms" ON public.rooms;
CREATE POLICY "Auth users create rooms"
ON public.rooms FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Players join waiting rooms" ON public.rooms;
CREATE POLICY "Players join waiting rooms"
ON public.rooms FOR UPDATE
USING (status = 'waiting')
WITH CHECK (
(white_player_id IS NULL AND white_player_id = auth.uid()) OR
(black_player_id IS NULL AND black_player_id = auth.uid())
);

-- Moves
DROP POLICY IF EXISTS "Anyone view moves" ON public.moves;
CREATE POLICY "Anyone view moves"
ON public.moves FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow move inserts" ON public.moves;
CREATE POLICY "Allow move inserts"
ON public.moves FOR INSERT
WITH CHECK (true);

-- Messages
DROP POLICY IF EXISTS "Anyone view chat" ON public.messages;
CREATE POLICY "Anyone view chat"
ON public.messages FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Auth users send messages" ON public.messages;
CREATE POLICY "Auth users send messages"
ON public.messages FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
