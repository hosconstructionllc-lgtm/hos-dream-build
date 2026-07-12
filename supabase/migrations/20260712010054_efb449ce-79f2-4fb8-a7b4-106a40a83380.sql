DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'employee', 'user');
  END IF;
END
$$;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Commercial Build-Out',
  description text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  size text NOT NULL DEFAULT '',
  completed_label text NOT NULL DEFAULT 'In Progress',
  project_start text,
  projected_completion text,
  status text NOT NULL DEFAULT 'current' CHECK (status IN ('current', 'completed')),
  cover_image_url text,
  cover_storage_path text,
  is_published boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published projects are public"
ON public.projects
FOR SELECT
TO anon, authenticated
USING (is_published = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'));

CREATE POLICY "Employees can create projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'));

CREATE POLICY "Employees can update projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'));

CREATE POLICY "Admins can delete projects"
ON public.projects
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.project_timeline_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  entry_date text NOT NULL,
  description text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.project_timeline_entries TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.project_timeline_entries TO authenticated;
GRANT ALL ON public.project_timeline_entries TO service_role;
ALTER TABLE public.project_timeline_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Timeline for published projects is public"
ON public.project_timeline_entries
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_timeline_entries.project_id
      AND (p.is_published = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'))
  )
);

CREATE POLICY "Employees can create timeline entries"
ON public.project_timeline_entries
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'));

CREATE POLICY "Employees can update timeline entries"
ON public.project_timeline_entries
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'));

CREATE POLICY "Admins can delete timeline entries"
ON public.project_timeline_entries
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.project_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  timeline_entry_id uuid REFERENCES public.project_timeline_entries(id) ON DELETE SET NULL,
  media_type text NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'youtube')),
  url text,
  storage_path text,
  alt_text text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  placement text NOT NULL DEFAULT 'gallery' CHECK (placement IN ('gallery', 'timeline')),
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT project_media_has_source CHECK (url IS NOT NULL OR storage_path IS NOT NULL)
);
GRANT SELECT ON public.project_media TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.project_media TO authenticated;
GRANT ALL ON public.project_media TO service_role;
ALTER TABLE public.project_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media for published projects is public"
ON public.project_media
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_media.project_id
      AND (p.is_published = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'))
  )
);

CREATE POLICY "Employees can create media"
ON public.project_media
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'));

CREATE POLICY "Employees can update media"
ON public.project_media
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'));

CREATE POLICY "Admins can delete media"
ON public.project_media
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_timeline_entries_updated_at
BEFORE UPDATE ON public.project_timeline_entries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_media_updated_at
BEFORE UPDATE ON public.project_media
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Project media files are readable"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'project-media');

CREATE POLICY "Employees can upload project media files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-media'
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'))
);

CREATE POLICY "Employees can update project media files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-media'
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'))
)
WITH CHECK (
  bucket_id = 'project-media'
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'))
);

CREATE POLICY "Admins can delete project media files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-media'
  AND public.has_role(auth.uid(), 'admin')
);