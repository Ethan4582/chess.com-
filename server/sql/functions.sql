-- Functions to safely increment user stats --

CREATE OR REPLACE FUNCTION public.increment_win(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET wins = COALESCE(wins, 0) + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_loss(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET losses = COALESCE(losses, 0) + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_draw(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET draws = COALESCE(draws, 0) + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_points(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET points = CASE 
    WHEN COALESCE(points, 1000) + amount < 0 THEN 0 
    ELSE COALESCE(points, 1000) + amount 
  END
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_rank(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    u_points INTEGER;
    u_rank INTEGER;
BEGIN
    SELECT points INTO u_points FROM public.profiles WHERE id = target_user_id;
    IF u_points IS NULL THEN
        RETURN 0;
    END IF;
    SELECT count(*) + 1 INTO u_rank FROM public.profiles WHERE points > u_points;
    RETURN u_rank;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
