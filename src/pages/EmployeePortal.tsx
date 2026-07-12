import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ImagePlus, LogOut, Plus, ShieldCheck, Upload } from "lucide-react";
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
import { fetchManagedProjects, slugify, type SiteProject } from "@/lib/projectsRepository";

type SessionUser = { id: string; email?: string } | null;
type TimelineOption = { id: string; project_id: string; title: string; entry_date: string };

const emptyProject = {
  title: "",
  category: "Commercial Build-Out",
  description: "",
  location: "",
  size: "",
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
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [timelineProjectId, setTimelineProjectId] = useState("");
  const [mediaProjectId, setMediaProjectId] = useState("");
  const [mediaPlacement, setMediaPlacement] = useState<"gallery" | "timeline">("gallery");
  const [mediaTimelineId, setMediaTimelineId] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const selectedProject = useMemo(() => projects.find((project) => project.id === selectedProjectId), [projects, selectedProjectId]);
  const timelinesForMedia = timelineOptions.filter((entry) => entry.project_id === mediaProjectId);

  const loadProjects = async () => {
    const managed = await fetchManagedProjects(true);
    setProjects(managed);
    if (!selectedProjectId && managed[0]?.id) setSelectedProjectId(managed[0].id);
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
    if (allowed) {
      await Promise.all([loadProjects(), loadTimelineOptions()]);
    }
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
    const { error } = await supabase.auth.signUp({ email, password });
    setMessage(error ? error.message : "Account created. Check your email if confirmation is required, then sign in.");
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

  const saveProject = async (event: FormEvent) => {
    event.preventDefault();
    const slug = slugify(projectForm.title);
    if (!slug) return;

    const { error } = await supabase.from("projects").insert({
      ...projectForm,
      slug,
      display_order: projects.length + 1,
      created_by: user?.id,
    });

    setMessage(error ? error.message : "Project added.");
    if (!error) {
      setProjectForm(emptyProject);
      await loadProjects();
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

  const uploadFile = async (file: File, projectId: string) => {
    const path = `${projectId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-")}`;
    const { error } = await supabase.storage.from("project-media").upload(path, file);
    if (error) throw error;
    return path;
  };

  const addMedia = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("file") as File | null;
    let storage_path: string | null = null;

    try {
      if (file && file.size > 0) storage_path = await uploadFile(file, mediaProjectId);
      const mediaType = youtubeUrl ? "youtube" : "image";
      const { error } = await supabase.from("project_media").insert({
        project_id: mediaProjectId,
        timeline_entry_id: mediaPlacement === "timeline" ? mediaTimelineId || null : null,
        media_type: mediaType,
        url: youtubeUrl || null,
        storage_path,
        placement: mediaPlacement,
        alt_text: selectedProject?.title || "Project media",
        display_order: Date.now(),
      });

      setMessage(error ? error.message : "Media added.");
      if (!error) {
        setYoutubeUrl("");
        event.currentTarget.reset();
        await loadProjects();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    }
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
              <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
              <Label>Password</Label>
              <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
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
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
              <section className="bg-card border border-border rounded-md p-6">
                <h2 className="font-heading text-2xl uppercase mb-5 flex items-center gap-2"><Plus size={20} /> Add Project</h2>
                <form onSubmit={saveProject} className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2"><Label>Project Name</Label><Input value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} required /></div>
                  <div><Label>Category</Label><Input value={projectForm.category} onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })} /></div>
                  <div><Label>Location</Label><Input value={projectForm.location} onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })} /></div>
                  <div><Label>Size</Label><Input value={projectForm.size} onChange={(e) => setProjectForm({ ...projectForm, size: e.target.value })} /></div>
                  <div><Label>Status</Label><Select value={projectForm.status} onValueChange={(value) => setProjectForm({ ...projectForm, status: value, completed_label: value === "current" ? "In Progress" : "Completed" })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="current">In Progress</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent></Select></div>
                  <div><Label>Project Start</Label><Input value={projectForm.project_start} onChange={(e) => setProjectForm({ ...projectForm, project_start: e.target.value })} placeholder="March 2026" /></div>
                  <div><Label>Projected Completion</Label><Input value={projectForm.projected_completion} onChange={(e) => setProjectForm({ ...projectForm, projected_completion: e.target.value })} placeholder="July 2026" /></div>
                  <div className="md:col-span-2"><Label>Description</Label><Textarea value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} required /></div>
                  <label className="md:col-span-2 flex items-center gap-3 text-sm"><Checkbox checked={projectForm.is_published} onCheckedChange={(checked) => setProjectForm({ ...projectForm, is_published: Boolean(checked) })} /> Publish on website</label>
                  <Button className="md:col-span-2" type="submit">Add Project</Button>
                </form>
              </section>

              <section className="space-y-8">
                <form onSubmit={addTimeline} className="bg-card border border-border rounded-md p-6 space-y-4">
                  <h2 className="font-heading text-2xl uppercase flex items-center gap-2"><Plus size={20} /> Add Timeline</h2>
                  <Label>Project</Label><Select value={timelineProjectId} onValueChange={setTimelineProjectId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.id || ""}>{p.title}</SelectItem>)}</SelectContent></Select>
                  <Label>Date Label</Label><Input name="entry_date" placeholder="June 2026" required />
                  <Label>Timeline Title</Label><Input name="title" placeholder="Interior Finish Work" />
                  <Label>Description</Label><Textarea name="description" required />
                  <Button type="submit">Add Timeline Update</Button>
                </form>

                <form onSubmit={addMedia} className="bg-card border border-border rounded-md p-6 space-y-4">
                  <h2 className="font-heading text-2xl uppercase flex items-center gap-2"><ImagePlus size={20} /> Add Image / Video</h2>
                  <Label>Project</Label><Select value={mediaProjectId} onValueChange={setMediaProjectId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.id || ""}>{p.title}</SelectItem>)}</SelectContent></Select>
                  <Label>Placement</Label><Select value={mediaPlacement} onValueChange={(value: "gallery" | "timeline") => setMediaPlacement(value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="gallery">Main Gallery</SelectItem><SelectItem value="timeline">Specific Timeline Step</SelectItem></SelectContent></Select>
                  {mediaPlacement === "timeline" && <><Label>Timeline Step</Label><Select value={mediaTimelineId} onValueChange={setMediaTimelineId}><SelectTrigger><SelectValue placeholder="Choose timeline" /></SelectTrigger><SelectContent>{timelinesForMedia.map((entry) => <SelectItem key={entry.id} value={entry.id}>{entry.entry_date} — {entry.title || "Update"}</SelectItem>)}</SelectContent></Select></>}
                  <Label>Upload Image</Label><Input name="file" type="file" accept="image/*" />
                  <Label>YouTube URL</Label><Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="Optional video link" />
                  <Button type="submit"><Upload size={16} /> Add Media</Button>
                </form>
              </section>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EmployeePortal;