import project2 from "@/assets/project-2.jpg";
import { projects as fallbackProjects, type Project as StaticProject } from "@/data/projects";
import { supabase } from "@/integrations/supabase/client";

export type ProjectStatus = "planning" | "current" | "completed" | "on_hold" | "cancelled";

export const STATUS_META: Record<ProjectStatus, { label: string; badgeClass: string; textClass: string }> = {
  planning: { label: "Planning", badgeClass: "bg-blue-500 text-white", textClass: "text-blue-500" },
  current: { label: "In Progress", badgeClass: "bg-cta-yellow text-cta-yellow-foreground", textClass: "text-cta-yellow" },
  completed: { label: "Completed", badgeClass: "bg-emerald-600 text-white", textClass: "text-emerald-500" },
  on_hold: { label: "On Hold", badgeClass: "bg-orange-500 text-white", textClass: "text-orange-500" },
  cancelled: { label: "Cancelled", badgeClass: "bg-red-600 text-white", textClass: "text-red-500" },
};

export const GALLERY_CATEGORIES = [
  { value: "general", label: "All" },
  { value: "interior", label: "Interior" },
  { value: "exterior", label: "Exterior" },
  { value: "progress", label: "Progress" },
  { value: "completed", label: "Completed" },
  { value: "equipment", label: "Equipment" },
  { value: "drone", label: "Drone Photos" },
  { value: "floor_plans", label: "Floor Plans" },
  { value: "finished", label: "Finished" },
  { value: "video", label: "Videos" },
] as const;

export type GalleryCategory = typeof GALLERY_CATEGORIES[number]["value"];

export type SiteMediaItem = {
  id?: string;
  type: "image" | "youtube" | "video";
  src: string;
  alt?: string;
  caption?: string;
  category?: GalleryCategory;
};

export type SiteTimelineEntry = {
  id?: string;
  date: string;
  title?: string;
  text: string;
  media?: SiteMediaItem[];
  image?: string;
};

export type SiteProject = Omit<StaticProject, "media" | "timeline" | "status"> & {
  id?: string;
  media: SiteMediaItem[];
  timeline?: SiteTimelineEntry[];
  status: ProjectStatus;
  isPublished?: boolean;
  displayOrder?: number;
  client?: string;
  projectType?: string;
  shortDescription?: string;
  fullDescription?: string;
  services?: string[];
  heroImage?: string;
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
  hero_image_url: string | null;
  hero_storage_path: string | null;
  is_published: boolean;
  display_order: number;
  client: string;
  project_type: string;
  short_description: string;
  full_description: string;
  services: string[];
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
  category: string;
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
  const { data } = await supabase.storage.from("project-media").createSignedUrl(path, 60 * 60 * 24);
  if (!data?.signedUrl) return undefined;
  signedUrlCache.set(path, data.signedUrl);
  return data.signedUrl;
};

const mediaSource = async (media: Pick<MediaRow, "url" | "storage_path" | "media_type">) => {
  const src = media.url || (await getStorageUrl(media.storage_path)) || "";
  return media.media_type === "youtube" ? normalizeYouTubeUrl(src) : src;
};

const toMediaItem = async (row: MediaRow, title: string): Promise<SiteMediaItem> => ({
  id: row.id,
  type: row.media_type === "youtube" ? "youtube" : row.media_type === "video" ? "video" : "image",
  src: await mediaSource(row),
  alt: row.alt_text || title,
  caption: row.caption,
  category: (row.category as GalleryCategory) || "general",
});

const fallbackBySlug = (slug: string) => fallbackProjects.find((project) => project.slug === slug);

const normalizeProject = async (
  project: ProjectRow,
  mediaRows: MediaRow[],
  timelineRows: TimelineRow[],
): Promise<SiteProject> => {
  const fallback = fallbackBySlug(project.slug);
  const galleryRows = mediaRows
    .filter((m) => m.project_id === project.id && m.placement === "gallery")
    .sort((a, b) => a.display_order - b.display_order);

  const media = (await Promise.all(galleryRows.map((row) => toMediaItem(row, project.title)))).filter(
    (item) => item.src,
  );

  const coverFromStorage = await getStorageUrl(project.cover_storage_path);
  const heroFromStorage = await getStorageUrl(project.hero_storage_path);
  const image = project.cover_image_url || coverFromStorage || media[0]?.src || fallback?.image || project2;
  const heroImage = project.hero_image_url || heroFromStorage || image;

  const timelines = await Promise.all(
    timelineRows
      .filter((entry) => entry.project_id === project.id)
      .sort((a, b) => a.display_order - b.display_order)
      .map(async (entry) => {
        const rows = mediaRows
          .filter((m) => m.timeline_entry_id === entry.id && m.placement === "timeline")
          .sort((a, b) => a.display_order - b.display_order);
        const timelineMedia = await Promise.all(rows.map((row) => toMediaItem(row, entry.title || project.title)));
        const firstImage = timelineMedia.find((m) => m.type === "image");
        return {
          id: entry.id,
          date: entry.entry_date,
          title: entry.title,
          text: entry.description,
          media: timelineMedia,
          image: firstImage?.src,
        };
      }),
  );

  const status = (["planning", "current", "completed", "on_hold", "cancelled"].includes(project.status)
    ? project.status
    : "current") as ProjectStatus;

  return {
    id: project.id,
    slug: project.slug,
    image,
    heroImage,
    media: media.length ? media : [{ type: "image", src: image, alt: project.title, category: "general" }],
    title: project.title,
    category: project.category,
    description: project.description,
    location: project.location,
    size: project.size,
    completed: project.completed_label,
    projectStart: project.project_start || undefined,
    projectedCompletion: project.projected_completion || undefined,
    status,
    timeline: timelines.length ? timelines : undefined,
    isPublished: project.is_published,
    displayOrder: project.display_order,
    client: project.client || undefined,
    projectType: project.project_type || undefined,
    shortDescription: project.short_description || undefined,
    fullDescription: project.full_description || undefined,
    services: project.services || [],
  };
};

export const fetchManagedProjects = async (includeUnpublished = false): Promise<SiteProject[]> => {
  let query = supabase.from("projects").select("*").order("display_order", { ascending: true });
  if (!includeUnpublished) query = query.eq("is_published", true);

  const { data: projectRows, error: projectError } = await query;
  if (projectError) throw projectError;
  if (!projectRows?.length) return [];

  const projectIds = projectRows.map((project) => project.id);
  const [{ data: mediaRows, error: mediaError }, { data: timelineRows, error: timelineError }] = await Promise.all([
    supabase.from("project_media").select("*").in("project_id", projectIds).order("display_order", { ascending: true }),
    supabase.from("project_timeline_entries").select("*").in("project_id", projectIds).order("display_order", { ascending: true }),
  ]);
  if (mediaError) throw mediaError;
  if (timelineError) throw timelineError;

  return Promise.all(
    (projectRows as unknown as ProjectRow[]).map((project) =>
      normalizeProject(project, (mediaRows || []) as unknown as MediaRow[], (timelineRows || []) as TimelineRow[]),
    ),
  );
};

export const fetchManagedProjectBySlug = async (slug: string, includeUnpublished = false): Promise<SiteProject | undefined> => {
  const projects = await fetchManagedProjects(includeUnpublished);
  return projects.find((project) => project.slug === slug);
};
