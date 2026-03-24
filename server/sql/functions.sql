-- Functions to safely increment user stats --

CREATE OR REPLACE FUNCTION public.increment_win(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET wins = wins + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_loss(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET losses = losses + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_draw(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET draws = draws + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_points(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET points = CASE 
    WHEN points + amount < 0 THEN 0 
    ELSE points + amount 
  END
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
