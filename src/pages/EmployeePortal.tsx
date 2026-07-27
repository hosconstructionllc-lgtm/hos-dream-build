import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, ImagePlus, LogOut, Pencil, Plus, ShieldCheck, Trash2, Upload, X, ChevronRight, Save, Eye, EyeOff, Play } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { fetchManagedProjects, GALLERY_CATEGORIES, getStorageUrl, slugify, STATUS_META, type SiteProject } from "@/lib/projectsRepository";

type SessionUser = { id: string; email?: string } | null;
type TimelineRow = { id: string; project_id: string; title: string; entry_date: string; description: string; display_order: number };
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

const STATUS_OPTIONS = [
  { value: "planning", label: "Planning" },
  { value: "current", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
  { value: "cancelled", label: "Cancelled" },
];

const emptyProject = {
  title: "",
  category: "Commercial Build-Out",
  project_type: "Commercial Build-Out",
  client: "",
  short_description: "",
  full_description: "",
  location: "",
  size: "",
  services: "",
  project_start: "",
  projected_completion: "",
  status: "current",
  is_published: true,
};

type EditableProject = typeof emptyProject;

const MediaThumb = ({
  row,
  onDelete,
  timelineOptions,
  onAttach,
  attachedTimelineLabels = [],
}: {
  row: MediaRow;
  onDelete: () => void;
  timelineOptions?: TimelineRow[];
  onAttach?: (timelineId: string) => void;
  attachedTimelineLabels?: string[];
}) => {
  const [url, setUrl] = useState<string | undefined>(row.url || undefined);
  const isAttachedToTimeline = row.placement === "timeline" || attachedTimelineLabels.length > 0;
  useEffect(() => {
    if (!row.url && row.storage_path) getStorageUrl(row.storage_path).then(setUrl);
  }, [row.url, row.storage_path]);

  return (
    <div className="relative rounded-md overflow-hidden border border-border bg-muted">
      <div className="relative aspect-square group">
        {row.media_type === "youtube" ? (
          <div className="w-full h-full flex items-center justify-center bg-black text-white">
            <Play size={28} />
          </div>
        ) : row.media_type === "video" ? (
          url ? <video src={url} className="w-full h-full object-cover" muted /> : <div className="w-full h-full bg-muted" />
        ) : (
          url ? <img src={url} alt={row.alt_text} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-muted" />
        )}
        {isAttachedToTimeline && (
          <div className="absolute left-1.5 top-1.5 max-w-[calc(100%-12px)] rounded-full bg-emerald-600 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white shadow-md flex items-center gap-1">
            <CheckCircle2 size={11} />
            <span className="truncate">On timeline</span>
          </div>
        )}
        {attachedTimelineLabels.length > 0 && (
          <div className="absolute inset-x-1.5 bottom-1.5 rounded bg-black/75 px-2 py-1 text-[9px] font-semibold text-white shadow-md">
            {attachedTimelineLabels.slice(0, 2).join(", ")}{attachedTimelineLabels.length > 2 ? ` +${attachedTimelineLabels.length - 2}` : ""}
          </div>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="absolute right-1.5 top-1.5 rounded-full bg-black/70 hover:bg-red-600 p-1.5 text-white opacity-0 group-hover:opacity-100 transition"
          aria-label="Delete media"
        >
          <Trash2 size={12} />
        </button>
      </div>
      <div className="p-1.5 space-y-1 bg-card">
        <div className="text-[9px] uppercase tracking-wide text-muted-foreground truncate">
          {row.placement} · {row.category}
        </div>
        {timelineOptions && onAttach && timelineOptions.length > 0 && (
          <select
            className="w-full text-[10px] bg-background border border-border rounded px-1 py-1"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                onAttach(e.target.value);
                e.target.value = "";
              }
            }}
          >
            <option value="">+ Attach to timeline…</option>
            {timelineOptions.map((t) => (
              <option key={t.id} value={t.id}>{t.entry_date} — {t.title || "Update"}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

const PickerThumb = ({ row, selected, onToggle }: { row: MediaRow; selected: boolean; onToggle: () => void }) => {
  const [url, setUrl] = useState<string | undefined>(row.url || undefined);
  useEffect(() => {
    if (!row.url && row.storage_path) getStorageUrl(row.storage_path).then(setUrl);
  }, [row.url, row.storage_path]);
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative aspect-square rounded-md overflow-hidden border-2 transition ${selected ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/50"}`}
    >
      {row.media_type === "youtube" ? (
        <div className="w-full h-full flex items-center justify-center bg-black text-white"><Play size={20} /></div>
      ) : row.media_type === "video" ? (
        url ? <video src={url} className="w-full h-full object-cover" muted /> : <div className="w-full h-full bg-muted" />
      ) : (
        url ? <img src={url} alt={row.alt_text} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-muted" />
      )}
      {selected && (
        <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">✓</div>
      )}
    </button>
  );
};

const EmployeePortal = () => {
  const [user, setUser] = useState<SessionUser>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const [message, setMessage] = useState("");
  const [projects, setProjects] = useState<SiteProject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddProject, setShowAddProject] = useState(false);

  const [newProject, setNewProject] = useState<EditableProject>(emptyProject);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [editForm, setEditForm] = useState<EditableProject>(emptyProject);
  const [editHeroFile, setEditHeroFile] = useState<File | null>(null);
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);

  const [timelineRows, setTimelineRows] = useState<TimelineRow[]>([]);
  const [mediaRows, setMediaRows] = useState<MediaRow[]>([]);
  const [editingTimelineId, setEditingTimelineId] = useState<string | null>(null);
  const [timelineDraft, setTimelineDraft] = useState({ entry_date: "", title: "", description: "" });

  const [mediaPlacement, setMediaPlacement] = useState<"gallery" | "timeline">("gallery");
  const [mediaCategory, setMediaCategory] = useState<string>("general");
  const [mediaTimelineId, setMediaTimelineId] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [reuseIds, setReuseIds] = useState<string[]>([]);
  const [timelineUploadState, setTimelineUploadState] = useState<Record<string, { status: "uploading" | "success" | "error"; message: string }>>({});
  const [busy, setBusy] = useState(false);

  const selectedProject = useMemo(() => projects.find((p) => p.id === selectedId) || null, [projects, selectedId]);

  const timelineLabelById = useMemo(() => {
    return new Map(
      timelineRows.map((row) => [row.id, `${row.entry_date} — ${row.title || "Update"}`]),
    );
  }, [timelineRows]);

  const loadProjects = async () => {
    const managed = await fetchManagedProjects(true);
    setProjects(managed);
  };

  const loadDetail = async (projectId: string) => {
    const [{ data: t }, { data: m }] = await Promise.all([
      supabase.from("project_timeline_entries").select("*").eq("project_id", projectId).order("display_order", { ascending: true }),
      supabase.from("project_media").select("*").eq("project_id", projectId).order("display_order", { ascending: true }),
    ]);
    setTimelineRows((t || []) as TimelineRow[]);
    setMediaRows((m || []) as MediaRow[]);
  };

  const checkAccess = async (userId: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).in("role", ["admin", "employee"]);
    const allowed = Boolean(data?.length);
    setHasAccess(allowed);
    if (allowed) await loadProjects();
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const currentUser = data.user ? { id: data.user.id, email: data.user.email || undefined } : null;
      setUser(currentUser);
      if (currentUser) checkAccess(currentUser.id);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ? { id: session.user.id, email: session.user.email || undefined } : null;
      setUser(currentUser);
      setHasAccess(false);
      if (currentUser) setTimeout(() => checkAccess(currentUser.id), 0);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // When a project is selected, hydrate edit form + detail data
  useEffect(() => {
    if (!selectedProject?.id) return;
    setEditForm({
      title: selectedProject.title || "",
      category: selectedProject.category || "Commercial Build-Out",
      project_type: selectedProject.projectType || selectedProject.category || "",
      client: selectedProject.client || "",
      short_description: selectedProject.shortDescription || "",
      full_description: selectedProject.fullDescription || "",
      location: selectedProject.location || "",
      size: selectedProject.size || "",
      services: (selectedProject.services || []).join(", "),
      project_start: selectedProject.projectStart || "",
      projected_completion: selectedProject.projectedCompletion || "",
      status: selectedProject.status || "current",
      is_published: selectedProject.isPublished !== false,
    });
    setEditHeroFile(null);
    setEditCoverFile(null);
    loadDetail(selectedProject.id);
  }, [selectedProject?.id]);

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
  };

  const signUp = async () => {
    setMessage("");
    const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/employee-portal" } });
    setMessage(error ? error.message : "Account created. If confirmation is required, check your email, then sign in.");
  };

  const signInWithGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/employee-portal" });
    if (result.error) setMessage(result.error.message);
  };

  const activateAdmin = async () => {
    if (!user) return;
    const { error } = await supabase.from("user_roles").insert({ user_id: user.id, role: "admin" });
    if (error) {
      setMessage("Portal access is already controlled by an admin. Ask the owner to add your account.");
      return;
    }
    setMessage("Admin access activated.");
    await checkAccess(user.id);
  };

  const uploadFile = async (file: File, projectId: string) => {
    const path = `${projectId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-")}`;
    const { error } = await supabase.storage.from("project-media").upload(path, file);
    if (error) throw error;
    return path;
  };

  const logTimelineAttachment = (source: string, timelineId: string | null, mediaCount: number) => {
    if (!timelineId) return;
    const timeline = timelineRows.find((row) => row.id === timelineId);
    console.info("Attached media to timeline update", {
      source,
      project: selectedProject?.title,
      projectId: selectedProject?.id,
      timelineId,
      timelineDate: timeline?.entry_date,
      timelineTitle: timeline?.title || "Update",
      mediaCount,
    });
  };

  const nextMediaDisplayOrder = (placement: "gallery" | "timeline", timelineId?: string | null) => {
    const maxOrder = mediaRows
      .filter((media) => media.placement === placement && (placement !== "timeline" || media.timeline_entry_id === timelineId))
      .reduce((max, media) => Math.max(max, media.display_order || 0), 0);
    return maxOrder + 1;
  };

  const saveNewProject = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const slug = slugify(newProject.title);
      if (!slug) return;
      const services = newProject.services.split(",").map((s) => s.trim()).filter(Boolean);
      const { data: created, error } = await supabase
        .from("projects")
        .insert({
          slug,
          title: newProject.title,
          category: newProject.category || newProject.project_type || "Commercial Build-Out",
          project_type: newProject.project_type,
          client: newProject.client,
          short_description: newProject.short_description,
          full_description: newProject.full_description,
          description: newProject.short_description || newProject.full_description.slice(0, 240),
          location: newProject.location,
          size: newProject.size,
          services,
          project_start: newProject.project_start || null,
          projected_completion: newProject.projected_completion || null,
          status: newProject.status,
          completed_label: STATUS_OPTIONS.find((o) => o.value === newProject.status)?.label || "",
          is_published: newProject.is_published,
          display_order: projects.length + 1,
          created_by: user?.id,
        })
        .select("id")
        .single();

      if (error || !created) {
        setMessage(error?.message || "Could not create project.");
        return;
      }

      const updates: { hero_storage_path?: string; cover_storage_path?: string } = {};
      if (heroFile) updates.hero_storage_path = await uploadFile(heroFile, created.id);
      if (coverFile) updates.cover_storage_path = await uploadFile(coverFile, created.id);
      if (Object.keys(updates).length) await supabase.from("projects").update(updates).eq("id", created.id);

      setMessage("Project added.");
      setNewProject(emptyProject);
      setHeroFile(null);
      setCoverFile(null);
      setShowAddProject(false);
      await loadProjects();
      setSelectedId(created.id);
    } finally {
      setBusy(false);
    }
  };

  const saveProjectEdits = async () => {
    if (!selectedProject?.id || busy) return;
    setBusy(true);
    try {
      const services = editForm.services.split(",").map((s) => s.trim()).filter(Boolean);
      const heroPath = editHeroFile ? await uploadFile(editHeroFile, selectedProject.id) : undefined;
      const coverPath = editCoverFile ? await uploadFile(editCoverFile, selectedProject.id) : undefined;
      const { error } = await supabase.from("projects").update({
        title: editForm.title,
        category: editForm.category || editForm.project_type,
        project_type: editForm.project_type,
        client: editForm.client,
        short_description: editForm.short_description,
        full_description: editForm.full_description,
        description: editForm.short_description || editForm.full_description.slice(0, 240),
        location: editForm.location,
        size: editForm.size,
        services,
        project_start: editForm.project_start || null,
        projected_completion: editForm.projected_completion || null,
        status: editForm.status,
        completed_label: STATUS_OPTIONS.find((o) => o.value === editForm.status)?.label || "",
        is_published: editForm.is_published,
        ...(heroPath ? { hero_storage_path: heroPath } : {}),
        ...(coverPath ? { cover_storage_path: coverPath } : {}),
      }).eq("id", selectedProject.id);
      if (error) { setMessage(error.message); return; }
      setMessage("Project updated.");
      setEditHeroFile(null);
      setEditCoverFile(null);
      await loadProjects();
    } finally {
      setBusy(false);
    }
  };

  const addTimeline = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProject?.id) return;
    const form = new FormData(event.currentTarget);
    const { error } = await supabase.from("project_timeline_entries").insert({
      project_id: selectedProject.id,
      entry_date: String(form.get("entry_date") || ""),
      title: String(form.get("title") || ""),
      description: String(form.get("description") || ""),
      display_order: timelineRows.length + 1,
    });
    if (error) { setMessage(error.message); return; }
    setMessage("Timeline update added.");
    event.currentTarget.reset();
    await loadDetail(selectedProject.id);
  };

  const startEditTimeline = (row: TimelineRow) => {
    setEditingTimelineId(row.id);
    setTimelineDraft({ entry_date: row.entry_date, title: row.title, description: row.description });
  };

  const saveTimelineEdit = async () => {
    if (!editingTimelineId || !selectedProject?.id) return;
    const { error } = await supabase.from("project_timeline_entries")
      .update({ entry_date: timelineDraft.entry_date, title: timelineDraft.title, description: timelineDraft.description })
      .eq("id", editingTimelineId);
    if (error) { setMessage(error.message); return; }
    setEditingTimelineId(null);
    await loadDetail(selectedProject.id);
  };

  const deleteTimeline = async (id: string) => {
    if (!confirm("Delete this timeline update? Media attached to it will also be removed.") || !selectedProject?.id) return;
    const { error } = await supabase.from("project_timeline_entries").delete().eq("id", id);
    if (error) { setMessage(error.message); return; }
    await loadDetail(selectedProject.id);
  };

  const moveTimeline = async (row: TimelineRow, dir: -1 | 1) => {
    const sorted = [...timelineRows].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex((r) => r.id === row.id);
    const swap = sorted[idx + dir];
    if (!swap || !selectedProject?.id) return;
    await Promise.all([
      supabase.from("project_timeline_entries").update({ display_order: swap.display_order }).eq("id", row.id),
      supabase.from("project_timeline_entries").update({ display_order: row.display_order }).eq("id", swap.id),
    ]);
    await loadDetail(selectedProject.id);
  };

  const addMedia = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || !selectedProject?.id) return;
    if (mediaPlacement === "timeline" && !mediaTimelineId) {
      setMessage("Choose which timeline update these photos belong to.");
      return;
    }
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const files = form.getAll("files") as File[];
    const linkedTimelineId = mediaPlacement === "timeline" ? mediaTimelineId : null;
    try {
      let added = 0;
      const insertedRows: MediaRow[] = [];
      let displayOrder = nextMediaDisplayOrder(mediaPlacement, linkedTimelineId);
      const existingTimelineKeys = linkedTimelineId
        ? new Set(
            mediaRows
              .filter((m) => m.placement === "timeline" && m.timeline_entry_id === linkedTimelineId)
              .map((m) => m.storage_path || m.url)
              .filter(Boolean),
          )
        : new Set<string>();

      // Duplicate selected existing gallery items into this timeline update
      if (linkedTimelineId && reuseIds.length) {
        const sources = mediaRows.filter((m) => {
          const mediaKey = m.storage_path || m.url;
          return reuseIds.includes(m.id) && (!mediaKey || !existingTimelineKeys.has(mediaKey));
        });
        const rowsToInsert = sources.map((src, i) => ({
          project_id: selectedProject.id,
          timeline_entry_id: linkedTimelineId,
          media_type: src.media_type,
          url: src.url,
          storage_path: src.storage_path,
          placement: "timeline",
          category: mediaCategory,
          alt_text: src.alt_text || selectedProject.title,
          caption: src.caption || "",
          display_order: displayOrder + i,
        }));
        if (rowsToInsert.length) {
          const { data, error } = await supabase.from("project_media").insert(rowsToInsert).select("*");
          if (error) throw error;
          insertedRows.push(...((data || []) as MediaRow[]));
          added += rowsToInsert.length;
          displayOrder += rowsToInsert.length;
        }
      }

      if (youtubeUrl) {
        const { data, error } = await supabase.from("project_media").insert({
          project_id: selectedProject.id,
          timeline_entry_id: linkedTimelineId,
          media_type: "youtube",
          url: youtubeUrl,
          placement: mediaPlacement,
          category: mediaCategory,
          alt_text: selectedProject.title,
          display_order: displayOrder,
        }).select("*").single();
        if (error) throw error;
        if (data) insertedRows.push(data as MediaRow);
        added += 1;
        displayOrder += 1;
      }
      const validFiles = files.filter((f) => f && f.size > 0);
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const path = await uploadFile(file, selectedProject.id);
        const kind = file.type.startsWith("video/") ? "video" : "image";
        const { data, error } = await supabase.from("project_media").insert({
          project_id: selectedProject.id,
          timeline_entry_id: linkedTimelineId,
          media_type: kind,
          storage_path: path,
          placement: mediaPlacement,
          category: mediaCategory,
          alt_text: selectedProject.title,
          display_order: displayOrder + i,
        }).select("*").single();
        if (error) throw error;
        if (data) insertedRows.push(data as MediaRow);
        added += 1;
      }
      if (added === 0) {
        setMessage(reuseIds.length ? "Those photo(s) are already attached to that timeline update." : "Add a file, YouTube link, or pick existing photos to attach.");
      } else {
        if (insertedRows.length) setMediaRows((prev) => [...prev, ...insertedRows]);
        logTimelineAttachment("upload-form", linkedTimelineId, added);
        const timelineLabel = linkedTimelineId ? timelineLabelById.get(linkedTimelineId) : null;
        setMessage(timelineLabel ? `Added ${added} item(s) to timeline: ${timelineLabel}.` : `Added ${added} item(s).`);
      }
      setYoutubeUrl("");
      setReuseIds([]);
      event.currentTarget.reset();
      await loadDetail(selectedProject.id);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const deleteMedia = async (row: MediaRow) => {
    if (!confirm("Delete this media item?") || !selectedProject?.id) return;
    if (row.storage_path) await supabase.storage.from("project-media").remove([row.storage_path]);
    const { error } = await supabase.from("project_media").delete().eq("id", row.id);
    if (error) { setMessage(error.message); return; }
    await loadDetail(selectedProject.id);
  };

  const deleteProject = async (id?: string) => {
    if (!id || !confirm("Delete this project? All timeline entries and media will be removed.")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) { setMessage(error.message); return; }
    setMessage("Project deleted.");
    setSelectedId(null);
    await loadProjects();
  };

  const togglePublish = async (project: SiteProject) => {
    if (!project.id) return;
    const { error } = await supabase.from("projects").update({ is_published: !project.isPublished }).eq("id", project.id);
    if (error) { setMessage(error.message); return; }
    await loadProjects();
  };

  const attachToTimeline = async (row: MediaRow, timelineId: string) => {
    if (!selectedProject?.id || !timelineId) return;
    const mediaKey = row.storage_path || row.url;
    const alreadyAttached = mediaKey && mediaRows.some((media) => (
      media.timeline_entry_id === timelineId &&
      media.placement === "timeline" &&
      (media.storage_path || media.url) === mediaKey
    ));
    const timelineLabel = timelineLabelById.get(timelineId) || "selected update";

    if (alreadyAttached) {
      setMessage(`That photo is already on timeline: ${timelineLabel}.`);
      return;
    }

    const { data, error } = await supabase.from("project_media").insert({
      project_id: selectedProject.id,
      timeline_entry_id: timelineId,
      media_type: row.media_type,
      url: row.url,
      storage_path: row.storage_path,
      placement: "timeline",
      category: row.category || "progress",
      alt_text: row.alt_text || selectedProject.title,
      caption: row.caption || "",
      display_order: nextMediaDisplayOrder("timeline", timelineId),
    }).select("*").single();
    if (error) { setMessage(error.message); return; }
    if (data) setMediaRows((prev) => [...prev, data as MediaRow]);
    logTimelineAttachment("gallery-thumbnail", timelineId, 1);
    setMessage(`Photo attached to timeline: ${timelineLabel}.`);
    await loadDetail(selectedProject.id);
  };

  const uploadTimelineFiles = async (timelineId: string, files: File[]) => {
    if (!selectedProject?.id || !timelineId || busy) return;
    const validFiles = files.filter((file) => file && file.size > 0);
    if (!validFiles.length) {
      setTimelineUploadState((prev) => ({
        ...prev,
        [timelineId]: { status: "error", message: "No file was selected." },
      }));
      return;
    }

    setBusy(true);
    setTimelineUploadState((prev) => ({
      ...prev,
      [timelineId]: { status: "uploading", message: `Uploading ${validFiles.length} file${validFiles.length === 1 ? "" : "s"}…` },
    }));
    try {
      const rowsToInsert = [];
      const displayOrder = nextMediaDisplayOrder("timeline", timelineId);
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const path = await uploadFile(file, selectedProject.id);
        rowsToInsert.push({
          project_id: selectedProject.id,
          timeline_entry_id: timelineId,
          media_type: file.type.startsWith("video/") ? "video" : "image",
          storage_path: path,
          placement: "timeline",
          category: "progress",
          alt_text: selectedProject.title,
          display_order: displayOrder + i,
        });
      }

      const { data, error } = await supabase.from("project_media").insert(rowsToInsert).select("*");
      if (error) throw error;
      if (data?.length) setMediaRows((prev) => [...prev, ...(data as MediaRow[])]);

      const timelineLabel = timelineLabelById.get(timelineId) || "selected update";
      logTimelineAttachment("timeline-quick-upload", timelineId, rowsToInsert.length);
      setTimelineUploadState((prev) => ({
        ...prev,
        [timelineId]: { status: "success", message: `Uploaded ${rowsToInsert.length} item${rowsToInsert.length === 1 ? "" : "s"}.` },
      }));
      setMessage(`Uploaded ${rowsToInsert.length} photo/video item(s) to timeline: ${timelineLabel}.`);
      await loadDetail(selectedProject.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Timeline upload failed.";
      setTimelineUploadState((prev) => ({
        ...prev,
        [timelineId]: { status: "error", message: errorMessage },
      }));
      setMessage(errorMessage);
    } finally {
      setBusy(false);
    }
  };

  const galleryMedia = mediaRows.filter((m) => m.placement === "gallery");
  const timelineMediaFor = (tid: string) => mediaRows.filter((m) => m.placement === "timeline" && m.timeline_entry_id === tid);
  const attachedTimelineLabelsFor = (row: MediaRow) => {
    const sourceKey = row.storage_path || row.url;
    if (!sourceKey) return [];

    return mediaRows
      .filter((media) => {
        if (media.placement !== "timeline" || !media.timeline_entry_id) return false;
        const mediaKey = media.storage_path || media.url;
        return mediaKey === sourceKey;
      })
      .map((media) => timelineLabelById.get(media.timeline_entry_id || "") || "Timeline update");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-[150px] px-6 md:px-12 pb-16">
        <div className="max-w-6xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-primary font-semibold mb-8">
            <ArrowLeft size={16} /> Back to Website
          </Link>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">
            <div>
              <p className="font-heading uppercase tracking-[0.35em] text-primary text-xs mb-3">Employee Portal</p>
              <h1 className="font-heading text-4xl md:text-5xl uppercase text-foreground">Project Manager</h1>
            </div>
            {user && (
              <Button variant="outline" onClick={() => supabase.auth.signOut()}>
                <LogOut size={16} /> Sign Out
              </Button>
            )}
          </div>

          {message && (
            <div className="mb-6 rounded-md border border-border bg-muted p-4 text-sm text-foreground flex items-center justify-between">
              <span>{message}</span>
              <button onClick={() => setMessage("")} aria-label="Dismiss"><X size={14} /></button>
            </div>
          )}

          {!user ? (
            <form onSubmit={signIn} className="max-w-md bg-card border border-border rounded-md p-6 space-y-4">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
              <Label>Password</Label>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="submit">Sign In</Button>
                <Button type="button" variant="outline" onClick={signUp}>Create Account</Button>
              </div>
              <Button type="button" variant="secondary" onClick={signInWithGoogle}>Continue with Google</Button>
            </form>
          ) : !hasAccess ? (
            <div className="max-w-xl bg-card border border-border rounded-md p-6">
              <ShieldCheck className="text-primary mb-4" />
              <h2 className="font-heading text-2xl uppercase mb-3">Activate Access</h2>
              <p className="text-muted-foreground mb-5">If this is the first portal account, activate admin access. Otherwise, ask the owner to add you as an employee.</p>
              <Button onClick={activateAdmin}>Activate First Admin</Button>
            </div>
          ) : selectedProject ? (
            /* ===== PROJECT DETAIL / EDIT VIEW ===== */
            <motion.div key={selectedProject.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button onClick={() => setSelectedId(null)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                  <ArrowLeft size={14} /> All Projects
                </button>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/projects/${selectedProject.slug}`} target="_blank" className="inline-flex items-center gap-1 text-xs text-primary underline">View live page →</Link>
                  <Button size="sm" variant="outline" onClick={() => togglePublish(selectedProject)}>
                    {selectedProject.isPublished ? <><EyeOff size={14} /> Unpublish</> : <><Eye size={14} /> Publish</>}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteProject(selectedProject.id)}><Trash2 size={14} /> Delete Project</Button>
                </div>
              </div>

              <div className="bg-card border border-border rounded-md p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-heading text-2xl uppercase flex items-center gap-2"><Pencil size={18} /> {selectedProject.title}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_META[selectedProject.status].badgeClass}`}>{STATUS_META[selectedProject.status].label}</span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2"><Label>Project Name</Label><Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /></div>
                  <div><Label>Project Type</Label><Input value={editForm.project_type} onChange={(e) => setEditForm({ ...editForm, project_type: e.target.value, category: e.target.value })} /></div>
                  <div><Label>Client</Label><Input value={editForm.client} onChange={(e) => setEditForm({ ...editForm, client: e.target.value })} /></div>
                  <div><Label>Location</Label><Input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} /></div>
                  <div><Label>Square Feet</Label><Input value={editForm.size} onChange={(e) => setEditForm({ ...editForm, size: e.target.value })} /></div>
                  <div>
                    <Label>Status</Label>
                    <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Project Start</Label><Input value={editForm.project_start} onChange={(e) => setEditForm({ ...editForm, project_start: e.target.value })} /></div>
                  <div><Label>Estimated / Completed Date</Label><Input value={editForm.projected_completion} onChange={(e) => setEditForm({ ...editForm, projected_completion: e.target.value })} /></div>
                  <div className="md:col-span-2"><Label>Services Performed (comma separated)</Label><Input value={editForm.services} onChange={(e) => setEditForm({ ...editForm, services: e.target.value })} /></div>
                  <div className="md:col-span-2"><Label>Short Description</Label><Textarea value={editForm.short_description} onChange={(e) => setEditForm({ ...editForm, short_description: e.target.value })} rows={2} /></div>
                  <div className="md:col-span-2"><Label>Full Description</Label><Textarea value={editForm.full_description} onChange={(e) => setEditForm({ ...editForm, full_description: e.target.value })} rows={6} /></div>
                  <div><Label>Replace Hero Banner</Label><Input type="file" accept="image/*" onChange={(e) => setEditHeroFile(e.target.files?.[0] || null)} /></div>
                  <div><Label>Replace Gallery Cover</Label><Input type="file" accept="image/*" onChange={(e) => setEditCoverFile(e.target.files?.[0] || null)} /></div>
                  <label className="md:col-span-2 flex items-center gap-3 text-sm"><Checkbox checked={editForm.is_published} onCheckedChange={(c) => setEditForm({ ...editForm, is_published: Boolean(c) })} /> Publish on website</label>
                  <div className="md:col-span-2"><Button onClick={saveProjectEdits} disabled={busy}><Save size={16} /> {busy ? "Saving…" : "Save Changes"}</Button></div>
                </div>
              </div>

              {/* TIMELINE */}
              <div className="bg-card border border-border rounded-md p-6">
                <h2 className="font-heading text-2xl uppercase mb-5">Timeline ({timelineRows.length})</h2>
                <div className="space-y-3 mb-6">
                  {timelineRows.map((row, idx) => (
                    <div key={row.id} className="border border-border rounded-md p-4">
                      {editingTimelineId === row.id ? (
                        <div className="space-y-3">
                          <div className="grid md:grid-cols-2 gap-3">
                            <div><Label>Date Label</Label><Input value={timelineDraft.entry_date} onChange={(e) => setTimelineDraft({ ...timelineDraft, entry_date: e.target.value })} /></div>
                            <div><Label>Title</Label><Input value={timelineDraft.title} onChange={(e) => setTimelineDraft({ ...timelineDraft, title: e.target.value })} /></div>
                          </div>
                          <div><Label>Description</Label><Textarea value={timelineDraft.description} onChange={(e) => setTimelineDraft({ ...timelineDraft, description: e.target.value })} rows={3} /></div>
                          <div className="flex gap-2"><Button size="sm" onClick={saveTimelineEdit}><Save size={14} /> Save</Button><Button size="sm" variant="outline" onClick={() => setEditingTimelineId(null)}>Cancel</Button></div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex-1 min-w-[240px]">
                            <p className="text-xs uppercase tracking-widest text-primary">{row.entry_date}</p>
                            <p className="font-heading uppercase text-sm">{row.title || "Update"}</p>
                            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{row.description}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                              {timelineMediaFor(row.id).length > 0 ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                                  <CheckCircle2 size={12} /> On timeline · {timelineMediaFor(row.id).length} media
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">No timeline media yet</span>
                              )}
                              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition">
                                <Upload size={12} /> Add photo here
                                <input
                                  type="file"
                                  accept="image/*,video/*"
                                  multiple
                                  className="sr-only"
                                  disabled={busy}
                                  onChange={(event) => {
                                    const files = Array.from(event.target.files || []);
                                    uploadTimelineFiles(row.id, files);
                                    event.target.value = "";
                                  }}
                                />
                              </label>
                              {timelineUploadState[row.id] && (
                                <span className={`text-xs font-semibold ${timelineUploadState[row.id].status === "error" ? "text-destructive" : timelineUploadState[row.id].status === "success" ? "text-emerald-600" : "text-primary"}`}>
                                  {timelineUploadState[row.id].message}
                                </span>
                              )}
                            </div>
                            {timelineMediaFor(row.id).length > 0 && (
                              <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-2">
                                {timelineMediaFor(row.id).slice(0, 6).map((media) => (
                                  <MediaThumb
                                    key={media.id}
                                    row={media}
                                    onDelete={() => deleteMedia(media)}
                                    attachedTimelineLabels={media.timeline_entry_id ? [timelineLabelById.get(media.timeline_entry_id) || "Timeline update"] : []}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button size="sm" variant="ghost" onClick={() => moveTimeline(row, -1)} disabled={idx === 0}>↑</Button>
                            <Button size="sm" variant="ghost" onClick={() => moveTimeline(row, 1)} disabled={idx === timelineRows.length - 1}>↓</Button>
                            <Button size="sm" variant="outline" onClick={() => startEditTimeline(row)}><Pencil size={12} /></Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteTimeline(row.id)}><Trash2 size={12} /></Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {timelineRows.length === 0 && <p className="text-sm text-muted-foreground">No timeline updates yet.</p>}
                </div>
                <form onSubmit={addTimeline} className="border-t border-border pt-5 space-y-3">
                  <h3 className="font-heading uppercase text-sm flex items-center gap-2"><Plus size={14} /> Add Update</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div><Label>Date Label</Label><Input name="entry_date" placeholder="June 2026" required /></div>
                    <div><Label>Title</Label><Input name="title" placeholder="Electrical Rough-In Completed" /></div>
                  </div>
                  <div><Label>Description</Label><Textarea name="description" required rows={3} /></div>
                  <Button type="submit">Add Update</Button>
                </form>
              </div>

              {/* MEDIA */}
              <div className="bg-card border border-border rounded-md p-6">
                <h2 className="font-heading text-2xl uppercase mb-5 flex items-center gap-2"><ImagePlus size={18} /> Media ({mediaRows.length})</h2>
                {galleryMedia.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Gallery</p>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                      {galleryMedia.map((row) => (
                        <MediaThumb
                          key={row.id}
                          row={row}
                          onDelete={() => deleteMedia(row)}
                          timelineOptions={timelineRows}
                          onAttach={(tid) => attachToTimeline(row, tid)}
                          attachedTimelineLabels={attachedTimelineLabelsFor(row)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {timelineRows.map((t) => {
                  const items = timelineMediaFor(t.id);
                  if (!items.length) return null;
                  return (
                    <div key={t.id} className="mb-6">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Timeline — {t.entry_date} · {t.title}</p>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                        {items.map((row) => (
                          <MediaThumb
                            key={row.id}
                            row={row}
                            onDelete={() => deleteMedia(row)}
                            attachedTimelineLabels={row.timeline_entry_id ? [timelineLabelById.get(row.timeline_entry_id) || "Timeline update"] : []}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
                {mediaRows.length === 0 && <p className="text-sm text-muted-foreground mb-6">No media yet.</p>}

                <form onSubmit={addMedia} className="border-t border-border pt-5 space-y-3">
                  <h3 className="font-heading uppercase text-sm flex items-center gap-2"><Upload size={14} /> Upload Photos / Videos</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <Label>Placement</Label>
                      <Select value={mediaPlacement} onValueChange={(v: "gallery" | "timeline") => setMediaPlacement(v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gallery">Main Gallery</SelectItem>
                          <SelectItem value="timeline">Specific Timeline Update</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={mediaCategory} onValueChange={setMediaCategory}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{GALLERY_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  {mediaPlacement === "timeline" && (
                    <>
                      <div>
                        <Label>Timeline Update</Label>
                        <Select value={mediaTimelineId} onValueChange={setMediaTimelineId}>
                          <SelectTrigger><SelectValue placeholder="Choose update" /></SelectTrigger>
                          <SelectContent>{timelineRows.map((entry) => <SelectItem key={entry.id} value={entry.id}>{entry.entry_date} — {entry.title || "Update"}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      {galleryMedia.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="mb-0">Or pick from existing gallery photos</Label>
                            {reuseIds.length > 0 && (
                              <button type="button" className="text-xs text-muted-foreground hover:text-primary" onClick={() => setReuseIds([])}>Clear ({reuseIds.length})</button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">Selected photos will be added to this timeline update while staying in the main gallery.</p>
                          <div className="grid grid-cols-4 md:grid-cols-6 gap-2 max-h-64 overflow-y-auto p-1 border border-border rounded-md bg-muted/30">
                            {galleryMedia.map((row) => (
                              <PickerThumb
                                key={row.id}
                                row={row}
                                selected={reuseIds.includes(row.id)}
                                onToggle={() => setReuseIds((prev) => prev.includes(row.id) ? prev.filter((i) => i !== row.id) : [...prev, row.id])}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <div><Label>Photos / Videos (multiple)</Label><Input name="files" type="file" accept="image/*,video/*" multiple /></div>
                  <div><Label>YouTube URL</Label><Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="Optional YouTube link" /></div>
                  <Button type="submit" disabled={busy}><Upload size={16} /> {busy ? "Uploading…" : "Upload Media"}</Button>
                </form>
              </div>
            </motion.div>
          ) : (
            /* ===== PROJECT LIST ===== */
            <div className="space-y-8">
              <section className="bg-card border border-border rounded-md p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <h2 className="font-heading text-2xl uppercase">Projects ({projects.length})</h2>
                  <Button onClick={() => setShowAddProject((s) => !s)}>
                    {showAddProject ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add Project</>}
                  </Button>
                </div>
                <div className="grid gap-2">
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedId(p.id || null)}
                      className="flex flex-wrap items-center gap-3 border border-border rounded-md p-4 text-left hover:border-primary hover:bg-muted transition group"
                    >
                      {p.image && <img src={p.image} alt={p.title} className="w-16 h-16 object-cover rounded-md" />}
                      <div className="flex-1 min-w-[200px]">
                        <p className="font-heading uppercase text-sm text-foreground">{p.title}</p>
                        <p className="text-xs text-muted-foreground">/{p.slug} · {STATUS_META[p.status].label}{!p.isPublished && " · Unpublished"}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{(p.media?.length || 0)} media · {(p.timeline?.length || 0)} updates</span>
                      <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary" />
                    </button>
                  ))}
                  {projects.length === 0 && <p className="text-sm text-muted-foreground">No projects yet.</p>}
                </div>
              </section>

              <AnimatePresence>
                {showAddProject && (
                  <motion.section
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-card border border-border rounded-md p-6 overflow-hidden"
                  >
                    <h2 className="font-heading text-2xl uppercase mb-5 flex items-center gap-2"><Plus size={20} /> Add Project</h2>
                    <form onSubmit={saveNewProject} className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2"><Label>Project Name</Label><Input value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} required /></div>
                      <div><Label>Project Type</Label><Input value={newProject.project_type} onChange={(e) => setNewProject({ ...newProject, project_type: e.target.value, category: e.target.value })} /></div>
                      <div><Label>Client</Label><Input value={newProject.client} onChange={(e) => setNewProject({ ...newProject, client: e.target.value })} /></div>
                      <div><Label>Location</Label><Input value={newProject.location} onChange={(e) => setNewProject({ ...newProject, location: e.target.value })} /></div>
                      <div><Label>Square Feet</Label><Input value={newProject.size} onChange={(e) => setNewProject({ ...newProject, size: e.target.value })} /></div>
                      <div>
                        <Label>Status</Label>
                        <Select value={newProject.status} onValueChange={(v) => setNewProject({ ...newProject, status: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div><Label>Project Start</Label><Input value={newProject.project_start} onChange={(e) => setNewProject({ ...newProject, project_start: e.target.value })} /></div>
                      <div><Label>Estimated / Completed Date</Label><Input value={newProject.projected_completion} onChange={(e) => setNewProject({ ...newProject, projected_completion: e.target.value })} /></div>
                      <div className="md:col-span-2"><Label>Services Performed (comma separated)</Label><Input value={newProject.services} onChange={(e) => setNewProject({ ...newProject, services: e.target.value })} /></div>
                      <div className="md:col-span-2"><Label>Short Description</Label><Textarea value={newProject.short_description} onChange={(e) => setNewProject({ ...newProject, short_description: e.target.value })} required rows={2} /></div>
                      <div className="md:col-span-2"><Label>Full Description</Label><Textarea value={newProject.full_description} onChange={(e) => setNewProject({ ...newProject, full_description: e.target.value })} rows={5} /></div>
                      <div><Label>Hero Banner Image</Label><Input type="file" accept="image/*" onChange={(e) => setHeroFile(e.target.files?.[0] || null)} /></div>
                      <div><Label>Gallery Cover Image</Label><Input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} /></div>
                      <label className="md:col-span-2 flex items-center gap-3 text-sm"><Checkbox checked={newProject.is_published} onCheckedChange={(c) => setNewProject({ ...newProject, is_published: Boolean(c) })} /> Publish on website</label>
                      <Button className="md:col-span-2" type="submit" disabled={busy}>{busy ? "Saving…" : "Add Project"}</Button>
                    </form>
                  </motion.section>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EmployeePortal;
