import project2 from "@/assets/project-2.jpg";
import { projects as fallbackProjects, type Project as StaticProject } from "@/data/projects";
import { supabase } from "@/integrations/supabase/client";

export type SiteMediaItem = {
  id?: string;
  type: "image" | "youtube";
  src: string;
  alt?: string;
  caption?: string;
};

export type SiteTimelineEntry = {
  id?: string;
  date: string;
  title?: string;
  image?: string;
  text: string;
};

export type SiteProject = Omit<StaticProject, "media" | "timeline"> & {
  id?: string;
  media: SiteMediaItem[];
  timeline?: SiteTimelineEntry[];
  isPublished?: boolean;
  displayOrder?: number;
};

type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  location: string;
  size: string;
  completed_label: string;
  project_start: string | null;
  projected_completion: string | null;
  status: string;
  cover_image_url: string | null;
  cover_storage_path: string | null;
  is_published: boolean;
  display_order: number;
};

type TimelineRow = {
  id: string;
  project_id: string;
  title: string;
  entry_date: string;
  description: string;
  display_order: number;
};

type MediaRow = {
  id: string;
  project_id: string;
  timeline_entry_id: string | null;
  media_type: string;
  url: string | null;
  storage_path: string | null;
  alt_text: string;
  caption: string;
  placement: string;
  display_order: number;
};

const signedUrlCache = new Map<string, string>();

const normalizeYouTubeUrl = (url: string) => {
  if (!url || url.includes("/embed/")) return url;
  const match = url.match(/(?:youtu\.be\/|watch\?v=|shorts\/)([a-zA-Z0-9_-]+)/);
  return match
    ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1`
    : url;
};

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getStorageUrl = async (path: string | null | undefined) => {
  if (!path) return undefined;
  if (signedUrlCache.has(path)) return signedUrlCache.get(path);

  const { data, error } = await supabase.storage.from("project-media").createSignedUrl(path, 60 * 60 * 24);
  if (error || !data?.signedUrl) return undefined;

  signedUrlCache.set(path, data.signedUrl);
  return data.signedUrl;
};

const mediaSource = async (media: Pick<MediaRow, "url" | "storage_path" | "media_type">) => {
  const src = media.url || (await getStorageUrl(media.storage_path)) || "";
  return media.media_type === "youtube" ? normalizeYouTubeUrl(src) : src;
};

const fallbackBySlug = (slug: string) => fallbackProjects.find((project) => project.slug === slug);

const normalizeProject = async (
  project: ProjectRow,
  mediaRows: MediaRow[],
  timelineRows: TimelineRow[],
): Promise<SiteProject> => {
  const fallback = fallbackBySlug(project.slug);
  const galleryRows = mediaRows
    .filter((media) => media.project_id === project.id && media.placement === "gallery")
    .sort((a, b) => a.display_order - b.display_order);

  const media = (
    await Promise.all(
      galleryRows.map(async (row) => ({
        id: row.id,
        type: row.media_type === "youtube" ? ("youtube" as const) : ("image" as const),
        src: await mediaSource(row),
        alt: row.alt_text || project.title,
        caption: row.caption,
      })),
    )
  ).filter((item) => item.src);

  const coverFromStorage = await getStorageUrl(project.cover_storage_path);
  const image = project.cover_image_url || coverFromStorage || media[0]?.src || fallback?.image || project2;

  const timelines = await Promise.all(
    timelineRows
      .filter((entry) => entry.project_id === project.id)
      .sort((a, b) => a.display_order - b.display_order)
      .map(async (entry) => {
        const imageMedia = mediaRows
          .filter((media) => media.timeline_entry_id === entry.id && media.placement === "timeline")
          .sort((a, b) => a.display_order - b.display_order)[0];

        return {
          id: entry.id,
          date: entry.entry_date,
          title: entry.title,
          image: imageMedia ? await mediaSource(imageMedia) : undefined,
          text: entry.description,
        };
      }),
  );

  return {
    id: project.id,
    slug: project.slug,
    image,
    media: media.length ? media : [{ type: "image", src: image, alt: project.title }],
    title: project.title,
    category: project.category,
    description: project.description,
    location: project.location,
    size: project.size,
    completed: project.completed_label,
    projectStart: project.project_start || undefined,
    projectedCompletion: project.projected_completion || undefined,
    status: project.status === "completed" ? "completed" : "current",
    timeline: timelines.length ? timelines : fallback?.timeline,
    isPublished: project.is_published,
    displayOrder: project.display_order,
  };
};

export const fetchManagedProjects = async (includeUnpublished = false): Promise<SiteProject[]> => {
  let query = supabase.from("projects").select("*").order("display_order", { ascending: true });
  if (!includeUnpublished) query = query.eq("is_published", true);

  const { data: projectRows, error: projectError } = await query;
  if (projectError) throw projectError;
  if (!projectRows?.length) return fallbackProjects as SiteProject[];

  const projectIds = projectRows.map((project) => project.id);
  const [{ data: mediaRows, error: mediaError }, { data: timelineRows, error: timelineError }] = await Promise.all([
    supabase.from("project_media").select("*").in("project_id", projectIds).order("display_order", { ascending: true }),
    supabase
      .from("project_timeline_entries")
      .select("*")
      .in("project_id", projectIds)
      .order("display_order", { ascending: true }),
  ]);

  if (mediaError) throw mediaError;
  if (timelineError) throw timelineError;

  return Promise.all(
    (projectRows as ProjectRow[]).map((project) =>
      normalizeProject(project, (mediaRows || []) as MediaRow[], (timelineRows || []) as TimelineRow[]),
    ),
  );
};

export const fetchManagedProjectBySlug = async (slug: string): Promise<SiteProject | undefined> => {
  const projects = await fetchManagedProjects(false);
  return projects.find((project) => project.slug === slug) || (fallbackBySlug(slug) as SiteProject | undefined);
};