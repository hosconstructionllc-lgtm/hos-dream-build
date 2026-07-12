import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { projects as fallbackProjects } from "@/data/projects";
import { fetchManagedProjects, type SiteProject } from "@/lib/projectsRepository";

const Projects = () => {
  const [activeTab, setActiveTab] = useState<"current" | "completed">("current");
  const [projects, setProjects] = useState<SiteProject[]>(fallbackProjects as SiteProject[]);
  const sectionRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    fetchManagedProjects()
      .then((managedProjects) => {
        if (mounted) setProjects(managedProjects);
      })
      .catch(() => {
        if (mounted) setProjects(fallbackProjects as SiteProject[]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const counts = useMemo(
    () => ({
      current: projects.filter((p) => p.status === "current" && p.description).length,
      completed: projects.filter((p) => p.status === "completed" && p.description).length,
    }),
    [projects]
  );

  const visibleProjects = useMemo(
    () => projects.filter((p) => p.status === activeTab && p.description),
    [activeTab]
  );

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["3%", "-3%"]);

  return (
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

        {visibleProjects.length === 0 ? (
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
            {visibleProjects.map((p, i) => (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 80, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.2,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                whileHover={{ y: -10 }}
                className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-500 group aspect-[4/5]"
              >
                <Link to={`/projects/${p.slug}`} className="absolute inset-0 block">
                  <motion.img
                    src={p.image}
                    alt={p.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.6 }}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-hero-navy-deep via-hero-navy-deep/60 to-transparent" />

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
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default Projects;
