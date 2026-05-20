CREATE TABLE IF NOT EXISTS public.case_studies (
  id text PRIMARY KEY,
  specialty text NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  detail_title text NOT NULL,
  detail text NOT NULL,
  icon text NOT NULL DEFAULT 'smile',
  metric text NOT NULL,
  metric_label text NOT NULL,
  before text NOT NULL,
  after text NOT NULL,
  image text NOT NULL,
  image_alt text NOT NULL,
  featured boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public case studies are viewable by everyone" ON public.case_studies;
CREATE POLICY "Public case studies are viewable by everyone"
  ON public.case_studies
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage case studies" ON public.case_studies;
CREATE POLICY "Admins can manage case studies"
  ON public.case_studies
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

DROP TRIGGER IF EXISTS handle_case_studies_updated_at ON public.case_studies;
CREATE TRIGGER handle_case_studies_updated_at
  BEFORE UPDATE ON public.case_studies
  FOR EACH ROW
  EXECUTE PROCEDURE moddatetime(updated_at);
