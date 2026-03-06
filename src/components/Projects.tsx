import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Ruler, CalendarCheck, X, ChevronLeft, ChevronRight } from "lucide-react";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";

interface MediaItem {
  type: "image" | "video";
  src: string;
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
}

const projects: Project[] = [
  {
    image: project1,
    media: [{ type: "image", src: project1 }],
    title: "Arwa Yemeni Coffee",
    category: "Commercial Build-Out",
    description:
      "A modern Yemeni coffee shop featuring contemporary interior design with traditional Middle Eastern influences. This 2,000 sq ft space was transformed into a warm, inviting atmosphere with custom woodwork, specialty lighting, and a fully equipped coffee bar — blending culture and craftsmanship seamlessly.",
    location: "Houston, TX",
    size: "2,000 sq ft",
    completed: "2025",
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
  },
];

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

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
      <section id="projects" className="section-padding bg-secondary">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="font-heading uppercase tracking-[0.25em] text-primary text-sm mb-3">Our Portfolio</p>
            <h2 className="font-heading text-4xl md:text-5xl uppercase text-secondary-foreground">Featured Projects</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {projects.filter(p => p.description).map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                onClick={() => openProject(p)}
                className="bg-background rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
              >
                {/* Image with category banner */}
                <div className="relative overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/60 to-primary/80 flex items-center justify-center">
                    <span className="font-heading text-lg md:text-xl uppercase tracking-wider text-primary-foreground text-center px-4">
                      {p.category}
                    </span>
                  </div>
                </div>

                {/* Card content */}
                <div className="p-6">
                  <h3 className="font-heading text-xl md:text-2xl text-foreground mb-3">{p.title}</h3>
                  {p.description && (
                    <p className="font-body text-muted-foreground text-sm leading-relaxed mb-5 line-clamp-3">
                      {p.description}
                    </p>
                  )}

                  {/* Meta details */}
                  {p.location && (
                    <div className="flex items-center gap-6 text-xs font-body border-t border-border pt-4">
                      <div>
                        <span className="text-muted-foreground block mb-1">Location</span>
                        <span className="text-primary font-semibold flex items-center gap-1">
                          <MapPin size={12} /> {p.location}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-1">Size</span>
                        <span className="text-foreground font-semibold flex items-center gap-1">
                          <Ruler size={12} /> {p.size}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-1">Completed</span>
                        <span className="text-foreground font-semibold flex items-center gap-1">
                          <CalendarCheck size={12} /> {p.completed}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-secondary/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeProject}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ duration: 0.3 }}
              className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Media gallery */}
              <div
                className="relative"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {selectedProject.media[currentIndex]?.type === "video" ? (
                  <video
                    src={selectedProject.media[currentIndex].src}
                    controls
                    className="w-full aspect-video object-cover rounded-t-lg"
                  />
                ) : (
                  <img
                    src={selectedProject.media[currentIndex]?.src}
                    alt={selectedProject.title}
                    className="w-full aspect-video object-cover rounded-t-lg"
                  />
                )}
                <button
                  onClick={closeProject}
                  className="absolute top-4 right-4 bg-secondary/80 text-secondary-foreground p-2 rounded-full hover:bg-secondary transition-colors"
                >
                  <X size={20} />
                </button>

                {selectedProject.media.length > 1 && (
                  <>
                    <button
                      onClick={prevMedia}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground p-3 rounded-full hover:bg-primary/80 transition-colors shadow-lg"
                    >
                      <ChevronLeft size={28} />
                    </button>
                    <button
                      onClick={nextMedia}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground p-3 rounded-full hover:bg-primary/80 transition-colors shadow-lg"
                    >
                      <ChevronRight size={28} />
                    </button>
                  </>
                )}

                {/* Media counter & dots */}
                {selectedProject.media.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    {selectedProject.media.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === currentIndex ? "bg-primary" : "bg-secondary-foreground/40"}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Detail content */}
              <div className="p-8">
                <span className="font-heading text-xs uppercase tracking-widest text-primary">{selectedProject.category}</span>
                <h2 className="font-heading text-3xl md:text-4xl text-foreground mt-2 mb-4">{selectedProject.title}</h2>
                <p className="font-body text-muted-foreground leading-relaxed mb-8">{selectedProject.description}</p>

                <div className="flex items-center gap-8 text-sm font-body border-t border-border pt-6">
                  <div>
                    <span className="text-muted-foreground block mb-1">Location</span>
                    <span className="text-primary font-semibold flex items-center gap-1">
                      <MapPin size={14} /> {selectedProject.location}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Size</span>
                    <span className="text-foreground font-semibold flex items-center gap-1">
                      <Ruler size={14} /> {selectedProject.size}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Completed</span>
                    <span className="text-foreground font-semibold flex items-center gap-1">
                      <CalendarCheck size={14} /> {selectedProject.completed}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Projects;
