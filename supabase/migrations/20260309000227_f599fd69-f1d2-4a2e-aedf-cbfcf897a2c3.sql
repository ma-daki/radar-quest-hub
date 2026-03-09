
-- Email subscribers table
CREATE TABLE public.email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert)
CREATE POLICY "Anyone can subscribe"
  ON public.email_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Opportunities table (for scraped/aggregated data)
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  deadline DATE NOT NULL,
  location TEXT NOT NULL DEFAULT 'Remote',
  description TEXT NOT NULL DEFAULT '',
  apply_link TEXT NOT NULL,
  organization TEXT NOT NULL DEFAULT '',
  eligibility TEXT NOT NULL DEFAULT '',
  amount TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(title, deadline)
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can read opportunities"
  ON public.opportunities
  FOR SELECT
  TO anon, authenticated
  USING (true);
