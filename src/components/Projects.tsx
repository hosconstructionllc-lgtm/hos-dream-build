import { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { MapPin, Ruler, CalendarCheck, X, ChevronLeft, ChevronRight } from "lucide-react";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";

interface MediaItem {
  type: "image" | "youtube";
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
    completed: "2026",
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
  const sectionRef = useRef(null);

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {projects.filter(p => p.description).map((p, i) => (
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
                className="bg-background rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-500 cursor-pointer group"
              >
                <div className="relative overflow-hidden">
                  <motion.img
                    src={p.image}
                    alt={p.title}
                    className="w-full aspect-[4/3] object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/60 to-primary/80 flex items-center justify-center">
                    <span className="font-heading text-lg md:text-xl uppercase tracking-wider text-primary-foreground text-center px-4">
                      {p.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-heading text-xl md:text-2xl text-foreground mb-3">{p.title}</h3>
                  {p.description && (
                    <p className="font-body text-muted-foreground text-sm leading-relaxed mb-5 line-clamp-3">
                      {p.description}
                    </p>
                  )}
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
                <span className="font-heading text-xs uppercase tracking-widest text-primary">{selectedProject.category}</span>
                <h2 className="font-heading text-3xl md:text-4xl text-foreground mt-2 mb-4">{selectedProject.title}</h2>
                <p className="font-body text-muted-foreground leading-relaxed mb-8">{selectedProject.description}</p>
                <div className="flex items-center gap-8 text-sm font-body border-t border-border pt-6">
                  <div>
                    <span className="text-muted-foreground block mb-1">Location</span>
                    <span className="text-primary font-semibold flex items-center gap-1"><MapPin size={14} /> {selectedProject.location}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Size</span>
                    <span className="text-foreground font-semibold flex items-center gap-1"><Ruler size={14} /> {selectedProject.size}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Completed</span>
                    <span className="text-foreground font-semibold flex items-center gap-1"><CalendarCheck size={14} /> {selectedProject.completed}</span>
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
