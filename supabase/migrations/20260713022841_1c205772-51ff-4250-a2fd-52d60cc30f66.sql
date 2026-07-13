
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS client text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS project_type text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS short_description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS full_description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS services text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS hero_storage_path text;

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE public.projects
  ADD CONSTRAINT projects_status_check
  CHECK (status = ANY (ARRAY['planning','current','completed','on_hold','cancelled']));

ALTER TABLE public.project_media
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'general';

ALTER TABLE public.project_media DROP CONSTRAINT IF EXISTS project_media_media_type_check;
ALTER TABLE public.project_media
  ADD CONSTRAINT project_media_media_type_check
  CHECK (media_type = ANY (ARRAY['image','youtube','video']));

ALTER TABLE public.project_media DROP CONSTRAINT IF EXISTS project_media_category_check;
ALTER TABLE public.project_media
  ADD CONSTRAINT project_media_category_check
  CHECK (category = ANY (ARRAY['general','interior','exterior','progress','completed','equipment','drone','video','floor_plans','finished']));
