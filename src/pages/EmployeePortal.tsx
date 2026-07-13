import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ImagePlus, LogOut, Plus, ShieldCheck, Trash2, Upload } from "lucide-react";
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
import { fetchManagedProjects, GALLERY_CATEGORIES, slugify, type SiteProject } from "@/lib/projectsRepository";

type SessionUser = { id: string; email?: string } | null;
type TimelineOption = { id: string; project_id: string; title: string; entry_date: string };

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
  description: "",
  location: "",
  size: "",
  services: "",
  project_start: "",
  projected_completion: "",
  status: "current",
  completed_label: "In Progress",
  is_published: true,
};

const EmployeePortal = () => {
  const [user, setUser] = useState<SessionUser>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const [message, setMessage] = useState("");
  const [projects, setProjects] = useState<SiteProject[]>([]);
  const [timelineOptions, setTimelineOptions] = useState<TimelineOption[]>([]);
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [timelineProjectId, setTimelineProjectId] = useState("");
  const [mediaProjectId, setMediaProjectId] = useState("");
  const [mediaPlacement, setMediaPlacement] = useState<"gallery" | "timeline">("gallery");
  const [mediaCategory, setMediaCategory] = useState<string>("general");
  const [mediaTimelineId, setMediaTimelineId] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const timelinesForMedia = timelineOptions.filter((entry) => entry.project_id === mediaProjectId);

  const loadProjects = async () => {
    const managed = await fetchManagedProjects(true);
    setProjects(managed);
    if (!timelineProjectId && managed[0]?.id) setTimelineProjectId(managed[0].id);
    if (!mediaProjectId && managed[0]?.id) setMediaProjectId(managed[0].id);
  };

  const loadTimelineOptions = async () => {
    const { data } = await supabase
      .from("project_timeline_entries")
      .select("id, project_id, title, entry_date")
      .order("display_order", { ascending: true });
    setTimelineOptions((data || []) as TimelineOption[]);
  };

  const checkAccess = async (userId: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).in("role", ["admin", "employee"]);
    const allowed = Boolean(data?.length);
    setHasAccess(allowed);
    if (allowed) await Promise.all([loadProjects(), loadTimelineOptions()]);
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

  const saveProject = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const slug = slugify(projectForm.title);
      if (!slug) return;
      const services = projectForm.services
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      // Insert project first to obtain id for storage folder
      const { data: created, error } = await supabase
        .from("projects")
        .insert({
          slug,
          title: projectForm.title,
          category: projectForm.category || projectForm.project_type || "Commercial Build-Out",
          project_type: projectForm.project_type,
          client: projectForm.client,
          short_description: projectForm.short_description,
          full_description: projectForm.full_description,
          description: projectForm.short_description || projectForm.description || projectForm.full_description.slice(0, 240),
          location: projectForm.location,
          size: projectForm.size,
          services,
          project_start: projectForm.project_start || null,
          projected_completion: projectForm.projected_completion || null,
          status: projectForm.status,
          completed_label:
            projectForm.status === "completed" ? "Completed" : projectForm.status === "current" ? "In Progress" : STATUS_OPTIONS.find((o) => o.value === projectForm.status)?.label || "",
          is_published: projectForm.is_published,
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
      if (Object.keys(updates).length) {
        await supabase.from("projects").update(updates).eq("id", created.id);
      }

      setMessage("Project added.");
      setProjectForm(emptyProject);
      setHeroFile(null);
      setCoverFile(null);
      await loadProjects();
    } finally {
      setBusy(false);
    }
  };

  const addTimeline = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const { error } = await supabase.from("project_timeline_entries").insert({
      project_id: timelineProjectId,
      entry_date: String(form.get("entry_date") || ""),
      title: String(form.get("title") || ""),
      description: String(form.get("description") || ""),
      display_order: timelineOptions.filter((entry) => entry.project_id === timelineProjectId).length + 1,
    });
    setMessage(error ? error.message : "Timeline update added.");
    if (!error) {
      event.currentTarget.reset();
      await loadTimelineOptions();
    }
  };

  const addMedia = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const files = form.getAll("files") as File[];

    try {
      if (youtubeUrl) {
        const { error } = await supabase.from("project_media").insert({
          project_id: mediaProjectId,
          timeline_entry_id: mediaPlacement === "timeline" ? mediaTimelineId || null : null,
          media_type: "youtube",
          url: youtubeUrl,
          placement: mediaPlacement,
          category: mediaCategory,
          alt_text: projects.find((p) => p.id === mediaProjectId)?.title || "Project video",
          display_order: Date.now(),
        });
        if (error) throw error;
      }

      const validFiles = files.filter((f) => f && f.size > 0);
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const path = await uploadFile(file, mediaProjectId);
        const kind = file.type.startsWith("video/") ? "video" : "image";
        const { error } = await supabase.from("project_media").insert({
          project_id: mediaProjectId,
          timeline_entry_id: mediaPlacement === "timeline" ? mediaTimelineId || null : null,
          media_type: kind,
          storage_path: path,
          placement: mediaPlacement,
          category: mediaCategory,
          alt_text: projects.find((p) => p.id === mediaProjectId)?.title || "Project media",
          display_order: Date.now() + i,
        });
        if (error) throw error;
      }

      setMessage(`Uploaded ${validFiles.length + (youtubeUrl ? 1 : 0)} item(s).`);
      setYoutubeUrl("");
      event.currentTarget.reset();
      await loadProjects();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const deleteProject = async (id?: string) => {
    if (!id || !confirm("Delete this project? All timeline entries and media will be removed.")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    setMessage(error ? error.message : "Project deleted.");
    if (!error) await loadProjects();
  };

  const togglePublish = async (project: SiteProject) => {
    if (!project.id) return;
    const { error } = await supabase.from("projects").update({ is_published: !project.isPublished }).eq("id", project.id);
    setMessage(error ? error.message : "Visibility updated.");
    if (!error) await loadProjects();
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

          {message && <div className="mb-6 rounded-md border border-border bg-muted p-4 text-sm text-foreground">{message}</div>}

          {!user ? (
            <motion.form onSubmit={signIn} className="max-w-md bg-card border border-border rounded-md p-6 space-y-4">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
              <Label>Password</Label>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="submit">Sign In</Button>
                <Button type="button" variant="outline" onClick={signUp}>Create Account</Button>
              </div>
              <Button type="button" variant="secondary" onClick={signInWithGoogle}>Continue with Google</Button>
            </motion.form>
          ) : !hasAccess ? (
            <div className="max-w-xl bg-card border border-border rounded-md p-6">
              <ShieldCheck className="text-primary mb-4" />
              <h2 className="font-heading text-2xl uppercase mb-3">Activate Access</h2>
              <p className="text-muted-foreground mb-5">If this is the first portal account, activate admin access. Otherwise, ask the owner to add you as an employee.</p>
              <Button onClick={activateAdmin}>Activate First Admin</Button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* PROJECT LIST */}
              <section className="bg-card border border-border rounded-md p-6">
                <h2 className="font-heading text-2xl uppercase mb-5">Projects ({projects.length})</h2>
                <div className="space-y-2">
                  {projects.map((p) => (
                    <div key={p.id} className="flex flex-wrap items-center gap-3 border border-border rounded-md p-3">
                      <div className="flex-1 min-w-[200px]">
                        <p className="font-heading uppercase text-sm text-foreground">{p.title}</p>
                        <p className="text-xs text-muted-foreground">/{p.slug} · {p.status}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => togglePublish(p)}>
                        {p.isPublished ? "Unpublish" : "Publish"}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteProject(p.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                  {projects.length === 0 && <p className="text-sm text-muted-foreground">No projects yet.</p>}
                </div>
              </section>

              <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8">
                {/* ADD PROJECT */}
                <section className="bg-card border border-border rounded-md p-6">
                  <h2 className="font-heading text-2xl uppercase mb-5 flex items-center gap-2"><Plus size={20} /> Add Project</h2>
                  <form onSubmit={saveProject} className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2"><Label>Project Name</Label><Input value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} required /></div>
                    <div><Label>Project Type</Label><Input value={projectForm.project_type} onChange={(e) => setProjectForm({ ...projectForm, project_type: e.target.value, category: e.target.value })} placeholder="Commercial Build-Out" /></div>
                    <div><Label>Client</Label><Input value={projectForm.client} onChange={(e) => setProjectForm({ ...projectForm, client: e.target.value })} placeholder="Kroozin Truck Stop" /></div>
                    <div><Label>Location</Label><Input value={projectForm.location} onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })} placeholder="Houston, TX" /></div>
                    <div><Label>Square Feet</Label><Input value={projectForm.size} onChange={(e) => setProjectForm({ ...projectForm, size: e.target.value })} placeholder="18,000 sq ft" /></div>
                    <div>
                      <Label>Status</Label>
                      <Select value={projectForm.status} onValueChange={(v) => setProjectForm({ ...projectForm, status: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Project Start</Label><Input value={projectForm.project_start} onChange={(e) => setProjectForm({ ...projectForm, project_start: e.target.value })} placeholder="March 2026" /></div>
                    <div><Label>Estimated / Completed Date</Label><Input value={projectForm.projected_completion} onChange={(e) => setProjectForm({ ...projectForm, projected_completion: e.target.value })} placeholder="October 2026" /></div>
                    <div className="md:col-span-2"><Label>Services Performed (comma separated)</Label><Input value={projectForm.services} onChange={(e) => setProjectForm({ ...projectForm, services: e.target.value })} placeholder="Framing, MEP, Finish Carpentry" /></div>
                    <div className="md:col-span-2"><Label>Short Description (hero subtitle)</Label><Textarea value={projectForm.short_description} onChange={(e) => setProjectForm({ ...projectForm, short_description: e.target.value })} required rows={2} /></div>
                    <div className="md:col-span-2"><Label>Full Description (overview, scope, challenges, materials, goals)</Label><Textarea value={projectForm.full_description} onChange={(e) => setProjectForm({ ...projectForm, full_description: e.target.value })} rows={6} /></div>
                    <div><Label>Hero Banner Image</Label><Input type="file" accept="image/*" onChange={(e) => setHeroFile(e.target.files?.[0] || null)} /></div>
                    <div><Label>Gallery Cover Image</Label><Input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} /></div>
                    <label className="md:col-span-2 flex items-center gap-3 text-sm"><Checkbox checked={projectForm.is_published} onCheckedChange={(c) => setProjectForm({ ...projectForm, is_published: Boolean(c) })} /> Publish on website</label>
                    <Button className="md:col-span-2" type="submit" disabled={busy}>{busy ? "Saving…" : "Add Project"}</Button>
                  </form>
                </section>

                {/* TIMELINE + MEDIA */}
                <section className="space-y-8">
                  <form onSubmit={addTimeline} className="bg-card border border-border rounded-md p-6 space-y-4">
                    <h2 className="font-heading text-2xl uppercase flex items-center gap-2"><Plus size={20} /> Add Timeline Update</h2>
                    <div><Label>Project</Label><Select value={timelineProjectId} onValueChange={setTimelineProjectId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.id || ""}>{p.title}</SelectItem>)}</SelectContent></Select></div>
                    <div><Label>Date Label</Label><Input name="entry_date" placeholder="June 2026" required /></div>
                    <div><Label>Title</Label><Input name="title" placeholder="Electrical Rough-In Completed" /></div>
                    <div><Label>Description</Label><Textarea name="description" required rows={4} /></div>
                    <Button type="submit">Add Update</Button>
                  </form>

                  <form onSubmit={addMedia} className="bg-card border border-border rounded-md p-6 space-y-4">
                    <h2 className="font-heading text-2xl uppercase flex items-center gap-2"><ImagePlus size={20} /> Upload Photos / Videos</h2>
                    <div><Label>Project</Label><Select value={mediaProjectId} onValueChange={setMediaProjectId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.id || ""}>{p.title}</SelectItem>)}</SelectContent></Select></div>
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
                    {mediaPlacement === "timeline" && (
                      <div>
                        <Label>Timeline Update</Label>
                        <Select value={mediaTimelineId} onValueChange={setMediaTimelineId}>
                          <SelectTrigger><SelectValue placeholder="Choose update" /></SelectTrigger>
                          <SelectContent>{timelinesForMedia.map((entry) => <SelectItem key={entry.id} value={entry.id}>{entry.entry_date} — {entry.title || "Update"}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    )}
                    <div>
                      <Label>Category</Label>
                      <Select value={mediaCategory} onValueChange={setMediaCategory}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{GALLERY_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Photos / Videos (multiple)</Label><Input name="files" type="file" accept="image/*,video/*" multiple /></div>
                    <div><Label>YouTube URL</Label><Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="Optional YouTube link" /></div>
                    <Button type="submit" disabled={busy}><Upload size={16} /> {busy ? "Uploading…" : "Upload Media"}</Button>
                  </form>
                </section>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EmployeePortal;
