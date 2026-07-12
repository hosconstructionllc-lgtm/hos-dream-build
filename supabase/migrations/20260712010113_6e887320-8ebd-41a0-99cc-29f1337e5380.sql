DROP POLICY IF EXISTS "Published projects are public" ON public.projects;
DROP POLICY IF EXISTS "Timeline for published projects is public" ON public.project_timeline_entries;
DROP POLICY IF EXISTS "Media for published projects is public" ON public.project_media;

CREATE POLICY "Published projects are visible to visitors"
ON public.projects
FOR SELECT
TO anon
USING (is_published = true);

CREATE POLICY "Published projects and staff projects are visible to signed in users"
ON public.projects
FOR SELECT
TO authenticated
USING (is_published = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'));

CREATE POLICY "Published timeline entries are visible to visitors"
ON public.project_timeline_entries
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_timeline_entries.project_id
      AND p.is_published = true
  )
);

CREATE POLICY "Published timeline entries and staff timeline entries are visible to signed in users"
ON public.project_timeline_entries
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_timeline_entries.project_id
      AND (p.is_published = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'))
  )
);

CREATE POLICY "Published media is visible to visitors"
ON public.project_media
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_media.project_id
      AND p.is_published = true
  )
);

CREATE POLICY "Published media and staff media are visible to signed in users"
ON public.project_media
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_media.project_id
      AND (p.is_published = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'))
  )
);

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;