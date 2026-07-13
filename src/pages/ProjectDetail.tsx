import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Ruler,
  CalendarCheck,
  Building2,
  User,
  Wrench,
  X,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  fetchManagedProjectBySlug,
  GALLERY_CATEGORIES,
  STATUS_META,
  type GalleryCategory,
  type SiteMediaItem,
  type SiteProject,
} from "@/lib/projectsRepository";

const InfoCard = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
        <Icon size={18} />
      </div>
      <span className="font-heading uppercase text-[10px] tracking-[0.25em] text-muted-foreground">{label}</span>
    </div>
    <p className="font-body text-foreground text-lg font-semibold leading-snug">{value}</p>
  </motion.div>
);

const Lightbox = ({
  items,
  index,
  onClose,
  onIndex,
}: {
  items: SiteMediaItem[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}) => {
  const current = items[index];
  if (!current) return null;
  const prev = () => onIndex((index - 1 + items.length) % items.length);
  const next = () => onIndex((index + 1) % items.length);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-6 right-6 text-white/80 hover:text-white z-10"
          aria-label="Close"
        >
          <X size={28} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          className="absolute left-4 md:left-8 text-white/80 hover:text-white z-10 bg-white/10 hover:bg-white/20 rounded-full p-3"
          aria-label="Previous"
        >
          <ChevronLeft size={28} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          className="absolute right-4 md:right-8 text-white/80 hover:text-white z-10 bg-white/10 hover:bg-white/20 rounded-full p-3"
          aria-label="Next"
        >
          <ChevronRight size={28} />
        </button>
        <div className="max-w-6xl w-full max-h-full" onClick={(e) => e.stopPropagation()}>
          {current.type === "youtube" ? (
            <iframe src={current.src} className="w-full aspect-video rounded-xl" allowFullScreen allow="autoplay; encrypted-media" />
          ) : current.type === "video" ? (
            <video src={current.src} controls autoPlay className="w-full max-h-[85vh] rounded-xl" />
          ) : (
            <img src={current.src} alt={current.alt || ""} className="w-full max-h-[85vh] object-contain rounded-xl" />
          )}
          {current.caption && (
            <p className="text-white/70 text-sm text-center mt-4 font-body">{current.caption}</p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<SiteProject | undefined>();
  const [loading, setLoading] = useState(true);
  const [galleryFilter, setGalleryFilter] = useState<GalleryCategory | "all">("all");
  const [lightboxItems, setLightboxItems] = useState<SiteMediaItem[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    let mounted = true;
    setLoading(true);
    if (!slug) {
      setLoading(false);
      return;
    }
    fetchManagedProjectBySlug(slug)
      .then((data) => mounted && setProject(data))
      .catch(() => mounted && setProject(undefined))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [slug]);

  const filteredGallery = useMemo(() => {
    if (!project) return [];
    if (galleryFilter === "all") return project.media;
    if (galleryFilter === "video")
      return project.media.filter((m) => m.type === "youtube" || m.type === "video");
    return project.media.filter((m) => m.category === galleryFilter);
  }, [project, galleryFilter]);

  const availableCategories = useMemo(() => {
    if (!project) return [];
    const present = new Set<string>();
    project.media.forEach((m) => {
      if (m.type === "youtube" || m.type === "video") present.add("video");
      present.add(m.category || "general");
    });
    return GALLERY_CATEGORIES.filter((c) => present.has(c.value) && c.value !== "general");
  }, [project]);

  const openLightbox = (items: SiteMediaItem[], idx: number) => {
    setLightboxItems(items);
    setLightboxIndex(idx);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-[200px] pb-24 px-6 text-center">
          <p className="font-heading uppercase tracking-[0.35em] text-primary text-xs animate-pulse">Loading Project</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-[200px] pb-24 text-center px-6">
          <h1 className="font-heading text-4xl uppercase text-foreground mb-4">Project Not Found</h1>
          <Link to="/#projects" className="text-primary hover:underline inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Projects
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const statusMeta = STATUS_META[project.status];
  const isCompleted = project.status === "completed";
  const completionLabel = isCompleted ? "Completed On" : "Estimated Completion";
  const completionValue = isCompleted
    ? project.projectedCompletion || project.completed || "—"
    : project.projectedCompletion || "TBD";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* HERO */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative w-full h-[80vh] min-h-[560px] flex items-center justify-center overflow-hidden"
        >
          <motion.img
            src={project.heroImage || project.image}
            alt={project.title}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80" />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-[140px]"
          >
            <span
              className={`inline-block ${statusMeta.badgeClass} text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] px-4 py-2 rounded-full shadow-lg mb-6`}
            >
              {statusMeta.label}
            </span>
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl uppercase text-white leading-[1.05] tracking-tight mb-6 drop-shadow-lg">
              {project.title}
            </h1>
            {(project.shortDescription || project.description) && (
              <p className="font-body text-white/85 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
                {project.shortDescription || project.description}
              </p>
            )}
          </motion.div>

          <Link
            to="/#projects"
            className="absolute top-[130px] left-6 md:left-12 z-10 inline-flex items-center gap-2 text-white/80 hover:text-white font-semibold text-sm bg-black/30 backdrop-blur px-4 py-2 rounded-full"
          >
            <ArrowLeft size={16} /> All Projects
          </Link>
        </motion.section>

        {/* INFO CARDS */}
        <section className="bg-muted/30 border-y border-border">
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-14 md:py-20">
            <div className="text-center mb-10">
              <p className="font-heading uppercase tracking-[0.4em] text-primary text-xs mb-3">Project Overview</p>
              <h2 className="font-heading text-3xl md:text-4xl uppercase text-foreground">At a Glance</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <InfoCard icon={CalendarCheck} label="Status" value={statusMeta.label} />
              {project.location && <InfoCard icon={MapPin} label="Location" value={project.location} />}
              {project.size && <InfoCard icon={Ruler} label="Square Feet" value={project.size} />}
              {project.projectType && <InfoCard icon={Building2} label="Project Type" value={project.projectType} />}
              {project.client && <InfoCard icon={User} label="Client" value={project.client} />}
              {project.projectStart && <InfoCard icon={CalendarCheck} label="Start Date" value={project.projectStart} />}
              <InfoCard icon={CalendarCheck} label={completionLabel} value={completionValue} />
              {project.services && project.services.length > 0 && (
                <InfoCard icon={Wrench} label="Services" value={project.services.join(", ")} />
              )}
            </div>
          </div>
        </section>

        {/* DESCRIPTION */}
        {(project.fullDescription || project.description) && (
          <section className="bg-background">
            <div className="max-w-4xl mx-auto px-6 md:px-12 py-16 md:py-24">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <p className="font-heading uppercase tracking-[0.4em] text-primary text-xs mb-3">About This Project</p>
                <h2 className="font-heading text-3xl md:text-5xl uppercase text-foreground mb-8 leading-tight">
                  Scope & Vision
                </h2>
                <div className="prose prose-lg max-w-none font-body text-foreground/80 leading-relaxed whitespace-pre-line">
                  {project.fullDescription || project.description}
                </div>
                {project.services && project.services.length > 0 && (
                  <div className="mt-10 pt-8 border-t border-border">
                    <p className="font-heading uppercase tracking-[0.3em] text-primary text-xs mb-4">Services Performed</p>
                    <div className="flex flex-wrap gap-2">
                      {project.services.map((s) => (
                        <span key={s} className="bg-primary/10 text-primary font-semibold text-sm px-4 py-2 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </section>
        )}

        {/* TIMELINE */}
        {project.timeline && project.timeline.length > 0 && (
          <section className="bg-muted/30 border-y border-border">
            <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24">
              <div className="text-center mb-16">
                <p className="font-heading uppercase tracking-[0.4em] text-primary text-xs mb-3">Progress Updates</p>
                <h2 className="font-heading text-3xl md:text-5xl uppercase text-foreground">Project Timeline</h2>
              </div>

              <div className="relative">
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-1/2" />
                <div className="space-y-12 md:space-y-16">
                  {project.timeline.map((entry, idx) => {
                    const left = idx % 2 === 0;
                    return (
                      <motion.div
                        key={entry.id || idx}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.7, delay: 0.05 }}
                        className="relative md:grid md:grid-cols-2 md:gap-12 items-start pl-12 md:pl-0"
                      >
                        <div className="absolute left-4 md:left-1/2 top-6 w-4 h-4 rounded-full bg-primary md:-translate-x-1/2 ring-4 ring-background z-10" />

                        <div className={`${left ? "md:pr-8 md:text-right" : "md:col-start-2 md:pl-8"}`}>
                          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                            {entry.media && entry.media.length > 0 && (
                              <div className={`grid ${entry.media.length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-1`}>
                                {entry.media.slice(0, 4).map((m, mIdx) => (
                                  <button
                                    key={m.id || mIdx}
                                    onClick={() => openLightbox(entry.media!, mIdx)}
                                    className="relative aspect-video overflow-hidden group"
                                  >
                                    {m.type === "image" ? (
                                      <img src={m.src} alt={m.alt || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                    ) : m.type === "video" ? (
                                      <>
                                        <video src={m.src} className="w-full h-full object-cover" muted />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                          <PlayCircle className="text-white" size={40} />
                                        </div>
                                      </>
                                    ) : (
                                      <div className="w-full h-full bg-hero-navy-deep flex items-center justify-center">
                                        <PlayCircle className="text-white" size={40} />
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                            <div className="p-6 text-left">
                              <span className="inline-block bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full mb-3">
                                {entry.date}
                              </span>
                              {entry.title && (
                                <h3 className="font-heading text-xl uppercase text-foreground mb-3">{entry.title}</h3>
                              )}
                              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                                {entry.text}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* GALLERY */}
        {project.media.length > 0 && (
          <section className="bg-background">
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
              <div className="text-center mb-10">
                <p className="font-heading uppercase tracking-[0.4em] text-primary text-xs mb-3">Media Library</p>
                <h2 className="font-heading text-3xl md:text-5xl uppercase text-foreground">Project Gallery</h2>
              </div>

              {availableCategories.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                  <button
                    onClick={() => setGalleryFilter("all")}
                    className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                      galleryFilter === "all"
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                    }`}
                  >
                    All ({project.media.length})
                  </button>
                  {availableCategories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setGalleryFilter(cat.value)}
                      className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                        galleryFilter === cat.value
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-muted text-muted-foreground hover:bg-muted/70"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {filteredGallery.map((item, idx) => (
                  <motion.button
                    key={item.id || idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: (idx % 8) * 0.05 }}
                    whileHover={{ y: -4 }}
                    onClick={() => openLightbox(filteredGallery, idx)}
                    className="relative aspect-square overflow-hidden rounded-xl bg-muted group"
                  >
                    {item.type === "image" ? (
                      <img
                        src={item.src}
                        alt={item.alt || ""}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : item.type === "video" ? (
                      <>
                        <video src={item.src} className="w-full h-full object-cover" muted />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                          <PlayCircle className="text-white" size={48} />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-hero-navy-deep flex items-center justify-center">
                        <PlayCircle className="text-white" size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {lightboxItems && (
        <Lightbox
          items={lightboxItems}
          index={lightboxIndex}
          onClose={() => setLightboxItems(null)}
          onIndex={setLightboxIndex}
        />
      )}

      <Footer />
    </div>
  );
};

export default ProjectDetail;
