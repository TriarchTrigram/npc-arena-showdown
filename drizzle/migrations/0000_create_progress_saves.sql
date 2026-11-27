CREATE TABLE public.progress_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_hash TEXT NOT NULL UNIQUE,
  save JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.progress_saves TO service_role;

ALTER TABLE public.progress_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages progress saves"
  ON public.progress_saves
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);