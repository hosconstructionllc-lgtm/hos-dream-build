CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
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

GRANT USAGE ON SCHEMA private TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Published projects and staff projects are visible to signed in users" ON public.projects;
DROP POLICY IF EXISTS "Employees can create projects" ON public.projects;
DROP POLICY IF EXISTS "Employees can update projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Published timeline entries and staff timeline entries are visible to signed in users" ON public.project_timeline_entries;
DROP POLICY IF EXISTS "Employees can create timeline entries" ON public.project_timeline_entries;
DROP POLICY IF EXISTS "Employees can update timeline entries" ON public.project_timeline_entries;
DROP POLICY IF EXISTS "Admins can delete timeline entries" ON public.project_timeline_entries;
DROP POLICY IF EXISTS "Published media and staff media are visible to signed in users" ON public.project_media;
DROP POLICY IF EXISTS "Employees can create media" ON public.project_media;
DROP POLICY IF EXISTS "Employees can update media" ON public.project_media;
DROP POLICY IF EXISTS "Admins can delete media" ON public.project_media;
DROP POLICY IF EXISTS "Employees can upload project media files" ON storage.objects;
DROP POLICY IF EXISTS "Employees can update project media files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete project media files" ON storage.objects;

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (private.has_role(auth.uid(), 'admin'))
WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Published projects and staff projects are visible to signed in users"
ON public.projects
FOR SELECT
TO authenticated
USING (is_published = true OR private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'employee'));

CREATE POLICY "Employees can create projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'employee'));

CREATE POLICY "Employees can update projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'employee'))
WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'employee'));

CREATE POLICY "Admins can delete projects"
ON public.projects
FOR DELETE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Published timeline entries and staff timeline entries are visible to signed in users"
ON public.project_timeline_entries
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_timeline_entries.project_id
      AND (p.is_published = true OR private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'employee'))
  )
);

CREATE POLICY "Employees can create timeline entries"
ON public.project_timeline_entries
FOR INSERT
TO authenticated
WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'employee'));

CREATE POLICY "Employees can update timeline entries"
ON public.project_timeline_entries
FOR UPDATE
TO authenticated
USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'employee'))
WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'employee'));

CREATE POLICY "Admins can delete timeline entries"
ON public.project_timeline_entries
FOR DELETE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Published media and staff media are visible to signed in users"
ON public.project_media
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_media.project_id
      AND (p.is_published = true OR private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'employee'))
  )
);

CREATE POLICY "Employees can create media"
ON public.project_media
FOR INSERT
TO authenticated
WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'employee'));

CREATE POLICY "Employees can update media"
ON public.project_media
FOR UPDATE
TO authenticated
USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'employee'))
WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'employee'));

CREATE POLICY "Admins can delete media"
ON public.project_media
FOR DELETE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Employees can upload project media files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-media'
  AND (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'employee'))
);

CREATE POLICY "Employees can update project media files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-media'
  AND (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'employee'))
)
WITH CHECK (
  bucket_id = 'project-media'
  AND (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'employee'))
);

CREATE POLICY "Admins can delete project media files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-media'
  AND private.has_role(auth.uid(), 'admin')
);

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);