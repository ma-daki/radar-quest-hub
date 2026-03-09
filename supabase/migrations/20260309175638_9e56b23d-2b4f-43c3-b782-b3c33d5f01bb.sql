
ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS level text,
  ADD COLUMN IF NOT EXISTS funding text;
