import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Ruler, CalendarCheck, X, ChevronLeft, ChevronRight } from "lucide-react";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";

interface Project {
  image: string;
  images: string[];
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
    images: [project1],
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
    images: [project2],
    title: "Custom Residential Home",
    category: "Residential",
    description:
      "A fully custom-built residential home designed with modern aesthetics and quality materials. Features open-concept living, energy-efficient systems, and premium finishes throughout.",
    location: "Houston, TX",
    size: "3,500 sq ft",
    completed: "2024",
  },
  {
    image: project3,
    images: [project3],
    title: "Modern Kitchen Remodel",
    category: "Renovation",
    description:
      "Complete kitchen renovation featuring custom cabinetry, quartz countertops, modern appliances, and a redesigned layout for maximum functionality and style.",
    location: "Houston, TX",
    size: "800 sq ft",
    completed: "2024",
  },
];

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImage, setCurrentImage] = useState(0);

  const openProject = (project: Project) => {
    setSelectedProject(project);
    setCurrentImage(0);
  };

  const closeProject = () => {
    setSelectedProject(null);
    setCurrentImage(0);
  };

  const nextImage = () => {
    if (selectedProject) {
      setCurrentImage((prev) => (prev + 1) % selectedProject.images.length);
    }
  };

  const prevImage = () => {
    if (selectedProject) {
      setCurrentImage((prev) => (prev - 1 + selectedProject.images.length) % selectedProject.images.length);
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
            {projects.map((p, i) => (
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
                  <p className="font-body text-muted-foreground text-sm leading-relaxed mb-5 line-clamp-3">
                    {p.description}
                  </p>

                  {/* Meta details */}
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
              {/* Image gallery */}
              <div className="relative">
                <img
                  src={selectedProject.images[currentImage]}
                  alt={selectedProject.title}
                  className="w-full aspect-video object-cover rounded-t-lg"
                />
                <button
                  onClick={closeProject}
                  className="absolute top-4 right-4 bg-secondary/80 text-secondary-foreground p-2 rounded-full hover:bg-secondary transition-colors"
                >
                  <X size={20} />
                </button>

                {selectedProject.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-secondary/80 text-secondary-foreground p-2 rounded-full hover:bg-secondary transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-secondary/80 text-secondary-foreground p-2 rounded-full hover:bg-secondary transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                {/* Image counter */}
                {selectedProject.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-secondary/80 text-secondary-foreground text-xs font-heading px-3 py-1 rounded-full">
                    {currentImage + 1} / {selectedProject.images.length}
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
