import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Ruler, CalendarCheck, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProjectBySlug } from "@/data/projects";

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const project = slug ? getProjectBySlug(slug) : undefined;
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

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

  const nextMedia = () => setCurrentIndex((i) => (i + 1) % project.media.length);
  const prevMedia = () =>
    setCurrentIndex((i) => (i - 1 + project.media.length) % project.media.length);

  const handleTouchStart = (e: React.TouchEvent) => (touchStartX.current = e.touches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => (touchEndX.current = e.touches[0].clientX);
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextMedia();
      else prevMedia();
    }
  };

  const current = project.media[currentIndex];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-[140px]">
        {/* Back link */}
        <div className="max-w-6xl mx-auto w-full px-6 md:px-12 mb-6">
          <Link
            to="/#projects"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Projects
          </Link>
        </div>

        {/* Media */}
        <div
          className="relative bg-black"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {current?.type === "youtube" ? (
            <iframe
              src={current.src}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-[55vh] md:h-[70vh]"
            />
          ) : (
            <img
              src={current?.src}
              alt={project.title}
              className="w-full h-[55vh] md:h-[70vh] object-contain bg-black"
            />
          )}

          {project.media.length > 1 && (
            <>
              <button
                onClick={prevMedia}
                aria-label="Previous"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground p-3 rounded-full hover:bg-primary/80 transition-colors shadow-lg"
              >
                <ChevronLeft size={26} />
              </button>
              <button
                onClick={nextMedia}
                aria-label="Next"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground p-3 rounded-full hover:bg-primary/80 transition-colors shadow-lg"
              >
                <ChevronRight size={26} />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {project.media.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to media ${idx + 1}`}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? "bg-primary scale-125" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Info */}
        <div className="max-w-5xl mx-auto w-full px-6 md:px-12 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-heading text-xs uppercase tracking-widest text-primary">
              {project.category}
            </span>
            {project.status === "current" && (
              <span className="bg-cta-yellow text-cta-yellow-foreground text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                In Progress
              </span>
            )}
            {project.status === "completed" && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                Completed
              </span>
            )}
          </div>
          <h1 className="font-heading text-3xl md:text-5xl uppercase text-foreground mt-1 mb-6">
            {project.title}
          </h1>
          <p className="font-body text-muted-foreground leading-relaxed text-lg mb-8">
            {project.description}
          </p>

          <div className="flex flex-wrap items-center gap-8 text-sm font-body border-t border-border pt-6">
            <div>
              <span className="text-muted-foreground block mb-1">Location</span>
              <span className="text-primary font-semibold flex items-center gap-1">
                <MapPin size={14} /> {project.location}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-1">Size</span>
              <span className="text-foreground font-semibold flex items-center gap-1">
                <Ruler size={14} /> {project.size}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-1">Status</span>
              <span className="text-foreground font-semibold flex items-center gap-1">
                <CalendarCheck size={14} /> {project.completed}
              </span>
            </div>
            {project.projectStart && (
              <div>
                <span className="text-muted-foreground block mb-1">Project Start</span>
                <span className="text-foreground font-semibold">{project.projectStart}</span>
              </div>
            )}
            {project.projectedCompletion && (
              <div>
                <span className="text-muted-foreground block mb-1">Projected Completion</span>
                <span className="text-foreground font-semibold">{project.projectedCompletion}</span>
              </div>
            )}
          </div>

          {project.timeline && project.timeline.length > 0 && (
            <div className="mt-16">
              <p className="font-heading uppercase tracking-[0.4em] text-primary text-xs mb-2 text-center">
                Progress Updates
              </p>
              <h2 className="font-heading text-2xl md:text-3xl uppercase text-foreground mb-10 text-center">
                Project Timeline
              </h2>

              <div className="relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />
                <div className="space-y-10">
                  {project.timeline.map((entry, idx) => {
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
                        <div className="absolute left-1/2 top-4 w-3 h-3 rounded-full bg-primary -translate-x-1/2 ring-4 ring-background z-10" />
                        {left ? (
                          <>
                            <div className="pr-4">
                              <div className="bg-background border border-border rounded-lg overflow-hidden shadow-md">
                                {entry.image && (
                                  <img
                                    src={entry.image}
                                    alt={entry.date}
                                    className="w-full aspect-video object-cover"
                                    loading="lazy"
                                  />
                                )}
                                <div className="p-4">
                                  <span className="inline-block bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded mb-2">
                                    {entry.date}
                                  </span>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {entry.text}
                                  </p>
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
                                  <img
                                    src={entry.image}
                                    alt={entry.date}
                                    className="w-full aspect-video object-cover"
                                    loading="lazy"
                                  />
                                )}
                                <div className="p-4">
                                  <span className="inline-block bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded mb-2">
                                    {entry.date}
                                  </span>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {entry.text}
                                  </p>
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
      </main>

      <Footer />
    </div>
  );
};

export default ProjectDetail;
