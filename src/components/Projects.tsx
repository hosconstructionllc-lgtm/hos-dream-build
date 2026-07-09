import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { MapPin, Ruler, CalendarCheck, X, ChevronLeft, ChevronRight, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";

interface MediaItem {
  type: "image" | "youtube";
  src: string;
}

interface TimelineEntry {
  date: string;
  image?: string;
  text: string;
}

interface Project {
  image: string;
  media: MediaItem[];
  title: string;
  category: string;
  description: string;
  location: string;
  size: string;
  completed: string;
  projectStart?: string;
  projectedCompletion?: string;
  status: "current" | "completed";
  timeline?: TimelineEntry[];
}

const projects: Project[] = [
  {
    image: "https://i.postimg.cc/CKpYJ1c1/1.avif",
    media: [
      { type: "image", src: "https://i.postimg.cc/CKpYJ1c1/1.avif" },
      { type: "image", src: "https://i.postimg.cc/BvCWgC8y/2.avif" },
      { type: "image", src: "https://i.postimg.cc/3wZMBZyB/3.avif" },
      { type: "image", src: "https://i.postimg.cc/mrSxwScn/4.avif" },
      { type: "youtube", src: "https://www.youtube.com/embed/NQK6f5SwU-0?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1" },
      { type: "youtube", src: "https://www.youtube.com/embed/vnZYs5i_wSE?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1" },
      { type: "image", src: "https://i.postimg.cc/xCC0NZsf/7.avif" },
      { type: "youtube", src: "https://www.youtube.com/embed/2zsBjgPphhc?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1" },
      { type: "image", src: "https://i.postimg.cc/brVS2bHD/9.avif" },
      { type: "youtube", src: "https://www.youtube.com/embed/QbPXbNcXxfA?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1" },
      { type: "youtube", src: "https://www.youtube.com/embed/8tE1lLqTMa0?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1" },
      { type: "image", src: "https://i.postimg.cc/25CHGNNn/12.avif" },
      { type: "youtube", src: "https://www.youtube.com/embed/y1uaHsv9zmM?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1" },
      { type: "image", src: "https://i.postimg.cc/6q13jXPT/IMG-3625.avif" },
      { type: "youtube", src: "https://www.youtube.com/embed/pobOE_D4ZVo?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1" },
      { type: "youtube", src: "https://www.youtube.com/embed/YD9ke5D5oIM?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1" },
      { type: "image", src: "https://i.postimg.cc/cCJ7tdYG/IMG-5483.jpg" },
      { type: "image", src: "https://i.postimg.cc/Sxc9sn5V/IMG-6503.jpg" },
      { type: "image", src: "https://i.postimg.cc/k59btn3s/IMG-6506.jpg" },
    ],
    title: "Arwa Yemeni Coffee",
    category: "Commercial Build-Out",
    description:
      "A modern Yemeni coffee shop featuring contemporary interior design with traditional Middle Eastern influences. This 2,000 sq ft space was transformed into a warm, inviting atmosphere with custom woodwork, specialty lighting, and a fully equipped coffee bar — blending culture and craftsmanship seamlessly.",
    location: "Houston, TX",
    size: "2,000 sq ft",
    completed: "In Progress",
    projectStart: "March 2026",
    projectedCompletion: "August 2026",
    status: "current",
    timeline: [
      {
        date: "June 2026",
        image: "https://i.postimg.cc/k59btn3s/IMG-6506.jpg",
        text: "Interior finish work is progressing well — custom woodwork installed, specialty lighting mounted, and coffee bar framing underway.",
      },
      {
        date: "May 2026",
        image: "https://i.postimg.cc/Sxc9sn5V/IMG-6503.jpg",
        text: "Framing completed and MEP rough-ins passed inspection. Preparing for drywall and interior detailing.",
      },
      {
        date: "April 2026",
        image: "https://i.postimg.cc/cCJ7tdYG/IMG-5483.jpg",
        text: "Site demolition complete and structural build-out officially began on the 2,000 sq ft commercial space.",
      },
    ],
  },
  {
    image: project2,
    media: [{ type: "image", src: project2 }],
    title: "Custom Residential Home",
    category: "Upcoming",
    description: "",
    location: "",
    size: "",
    completed: "",
    status: "current",
  },
  {
    image: project3,
    media: [{ type: "image", src: project3 }],
    title: "Modern Kitchen Remodel",
    category: "Upcoming",
    description: "",
    location: "",
    size: "",
    completed: "",
    status: "current",
  },
];


const Projects = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"current" | "completed">("current");
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const sectionRef = useRef(null);

  const counts = useMemo(
    () => ({
      current: projects.filter((p) => p.status === "current" && p.description).length,
      completed: projects.filter((p) => p.status === "completed" && p.description).length,
    }),
    []
  );

  const visibleProjects = useMemo(
    () => projects.filter((p) => p.status === activeTab),
    [activeTab]
  );

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["3%", "-3%"]);

  const openProject = (project: Project) => {
    setSelectedProject(project);
    setCurrentIndex(0);
  };

  const closeProject = () => {
    setSelectedProject(null);
    setCurrentIndex(0);
  };

  const nextMedia = () => {
    if (selectedProject) {
      setCurrentIndex((prev) => (prev + 1) % selectedProject.media.length);
    }
  };

  const prevMedia = () => {
    if (selectedProject) {
      setCurrentIndex((prev) => (prev - 1 + selectedProject.media.length) % selectedProject.media.length);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextMedia();
      else prevMedia();
    }
  };

  return (
    <>
      <section id="projects" ref={sectionRef} className="section-padding bg-secondary overflow-hidden">
        <motion.div style={{ y: bgY }} className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center mb-20"
          >
            <p className="font-heading uppercase tracking-[0.4em] text-primary text-xs mb-4">Our Portfolio</p>
            <h2 className="font-heading text-5xl md:text-6xl uppercase text-secondary-foreground">Featured Projects</h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-24 h-1 bg-primary mx-auto mt-6 origin-left"
            />
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-12"
          >
            <div className="bg-background rounded-full p-2 inline-flex items-center gap-2 shadow-lg">
              {[
                { key: "current" as const, label: "Current Projects", count: counts.current, Icon: Clock },
                { key: "completed" as const, label: "Completed Projects", count: counts.completed, Icon: CheckCircle2 },
              ].map(({ key, label, count, Icon }) => {
                const active = activeTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`relative flex items-center gap-2 px-5 md:px-7 py-3 rounded-full font-semibold text-sm md:text-base transition-colors duration-300 ${
                      active ? "text-primary-foreground" : "text-foreground hover:text-primary"
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="tab-pill"
                        className="absolute inset-0 bg-primary rounded-full shadow-md"
                        transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                      />
                    )}
                    <Icon size={18} className="relative z-10" />
                    <span className="relative z-10">{label}</span>
                    <span
                      className={`relative z-10 inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full text-xs font-bold ${
                        active ? "bg-primary-foreground/25 text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {visibleProjects.filter(p => p.description).length === 0 ? (
            <motion.div
              key={activeTab + "-empty"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <p className="font-body text-secondary-foreground/70 text-lg">
                {activeTab === "current"
                  ? "Exciting new projects are currently in the works. Check back soon!"
                  : "Completed projects will appear here."}
              </p>
            </motion.div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {visibleProjects.filter(p => p.description).map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 80, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.2,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                whileHover={{ y: -10 }}
                onClick={() => openProject(p)}
                className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-500 cursor-pointer group aspect-[4/5]"
              >
                <motion.img
                  src={p.image}
                  alt={p.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.6 }}
                  loading="lazy"
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-hero-navy-deep via-hero-navy-deep/60 to-transparent" />

                {/* Status badge */}
                {p.status === "current" && (
                  <div className="absolute top-4 left-4 bg-cta-yellow text-cta-yellow-foreground text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md">
                    In Progress
                  </div>
                )}
                {p.status === "completed" && (
                  <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md">
                    Completed
                  </div>
                )}

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-secondary-foreground">
                  <h3 className="font-heading text-xl md:text-2xl uppercase tracking-wide mb-4 drop-shadow">
                    {p.title}
                  </h3>
                  {(p.projectStart || p.projectedCompletion) && (
                    <div className="space-y-1 mb-5 text-sm font-body text-secondary-foreground/90">
                      {p.projectStart && (
                        <p><span className="font-semibold">Project Start:</span> {p.projectStart}</p>
                      )}
                      {p.projectedCompletion && (
                        <p><span className="font-semibold">Projected Completion:</span> {p.projectedCompletion}</p>
                      )}
                    </div>
                  )}
                  <span className="inline-flex items-center gap-2 border border-secondary-foreground/70 text-secondary-foreground px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-widest group-hover:bg-cta-yellow group-hover:text-cta-yellow-foreground group-hover:border-cta-yellow transition-all duration-300">
                    Learn More <ArrowRight size={14} />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          )}
        </motion.div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-secondary/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closeProject}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 40 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="relative flex-shrink-0"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {selectedProject.media[currentIndex]?.type === "youtube" ? (
                      <iframe
                        src={selectedProject.media[currentIndex].src}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full aspect-video rounded-t-lg"
                      />
                    ) : (
                      <img
                        src={selectedProject.media[currentIndex]?.src}
                        alt={selectedProject.title}
                        className="w-full aspect-video object-contain rounded-t-lg bg-black"
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
                <button
                  onClick={closeProject}
                  className="absolute top-4 right-4 bg-secondary/80 text-secondary-foreground p-2 rounded-full hover:bg-secondary transition-colors z-10"
                >
                  <X size={20} />
                </button>

                {selectedProject.media.length > 1 && (
                  <>
                    <button
                      onClick={prevMedia}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground p-3 rounded-full hover:bg-primary/80 transition-colors shadow-lg z-10"
                    >
                      <ChevronLeft size={28} />
                    </button>
                    <button
                      onClick={nextMedia}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground p-3 rounded-full hover:bg-primary/80 transition-colors shadow-lg z-10"
                    >
                      <ChevronRight size={28} />
                    </button>
                  </>
                )}

                {selectedProject.media.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                    {selectedProject.media.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-primary scale-125" : "bg-secondary-foreground/40"}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="p-8 overflow-y-auto flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-heading text-xs uppercase tracking-widest text-primary">{selectedProject.category}</span>
                  {selectedProject.status === "current" && (
                    <span className="bg-cta-yellow text-cta-yellow-foreground text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                      In Progress
                    </span>
                  )}
                </div>
                <h2 className="font-heading text-3xl md:text-4xl text-foreground mt-1 mb-4">{selectedProject.title}</h2>
                <p className="font-body text-muted-foreground leading-relaxed mb-8">{selectedProject.description}</p>
                <div className="flex flex-wrap items-center gap-8 text-sm font-body border-t border-border pt-6">
                  <div>
                    <span className="text-muted-foreground block mb-1">Location</span>
                    <span className="text-primary font-semibold flex items-center gap-1"><MapPin size={14} /> {selectedProject.location}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Size</span>
                    <span className="text-foreground font-semibold flex items-center gap-1"><Ruler size={14} /> {selectedProject.size}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Status</span>
                    <span className="text-foreground font-semibold flex items-center gap-1"><CalendarCheck size={14} /> {selectedProject.completed}</span>
                  </div>
                </div>

                {selectedProject.timeline && selectedProject.timeline.length > 0 && (
                  <div className="mt-12">
                    <p className="font-heading uppercase tracking-[0.4em] text-primary text-xs mb-2 text-center">Progress Updates</p>
                    <h3 className="font-heading text-2xl md:text-3xl text-foreground mb-10 text-center">Project Timeline</h3>

                    <div className="relative">
                      {/* Vertical line */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />

                      <div className="space-y-10">
                        {selectedProject.timeline.map((entry, idx) => {
                          const left = idx % 2 === 0;
                          return (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 30 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true, margin: "-50px" }}
                              transition={{ duration: 0.6, delay: idx * 0.1 }}
                              className="relative grid grid-cols-2 gap-8 items-start"
                            >
                              {/* Dot */}
                              <div className="absolute left-1/2 top-4 w-3 h-3 rounded-full bg-primary -translate-x-1/2 ring-4 ring-background z-10" />

                              {left ? (
                                <>
                                  <div className="pr-4">
                                    <div className="bg-background border border-border rounded-lg overflow-hidden shadow-md">
                                      {entry.image && (
                                        <img src={entry.image} alt={entry.date} className="w-full aspect-video object-cover" loading="lazy" />
                                      )}
                                      <div className="p-4">
                                        <span className="inline-block bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded mb-2">
                                          {entry.date}
                                        </span>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{entry.text}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div />
                                </>
                              ) : (
                                <>
                                  <div />
                                  <div className="pl-4">
                                    <div className="bg-background border border-border rounded-lg overflow-hidden shadow-md">
                                      {entry.image && (
                                        <img src={entry.image} alt={entry.date} className="w-full aspect-video object-cover" loading="lazy" />
                                      )}
                                      <div className="p-4">
                                        <span className="inline-block bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded mb-2">
                                          {entry.date}
                                        </span>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{entry.text}</p>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Projects;
