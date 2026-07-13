import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Clock, CheckCircle2, ArrowRight, MapPin } from "lucide-react";
import { fetchManagedProjects, STATUS_META, type SiteProject } from "@/lib/projectsRepository";

type TabKey = "current" | "completed";

const Projects = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("current");
  const [projects, setProjects] = useState<SiteProject[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    fetchManagedProjects()
      .then((managed) => mounted && setProjects(managed))
      .catch(() => mounted && setProjects([]))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const buckets = useMemo(() => {
    const current = projects.filter((p) => p.status === "current" || p.status === "planning" || p.status === "on_hold");
    const completed = projects.filter((p) => p.status === "completed");
    return { current, completed };
  }, [projects]);

  const visibleProjects = buckets[activeTab];

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["3%", "-3%"]);

  return (
    <section id="projects" ref={sectionRef} className="section-padding bg-secondary overflow-hidden">
      <motion.div style={{ y: bgY }} className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-16 md:mb-20"
        >
          <p className="font-heading uppercase tracking-[0.4em] text-primary text-xs mb-4">Our Portfolio</p>
          <h2 className="font-heading text-5xl md:text-6xl uppercase text-secondary-foreground">Featured Projects</h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-24 h-1 bg-primary mx-auto mt-6 origin-left"
          />
        </motion.div>

        <div className="flex justify-center mb-12">
          <div className="bg-background rounded-full p-2 inline-flex items-center gap-2 shadow-lg">
            {[
              { key: "current" as const, label: "Current", count: buckets.current.length, Icon: Clock },
              { key: "completed" as const, label: "Completed", count: buckets.completed.length, Icon: CheckCircle2 },
            ].map(({ key, label, count, Icon }) => {
              const active = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`relative flex items-center gap-2 px-5 md:px-7 py-3 rounded-full font-semibold text-sm md:text-base transition-colors ${
                    active ? "text-primary-foreground" : "text-foreground hover:text-primary"
                  }`}
                >
                  {active && (
                    <motion.div layoutId="tab-pill" className="absolute inset-0 bg-primary rounded-full shadow-md" transition={{ type: "spring", duration: 0.5, bounce: 0.2 }} />
                  )}
                  <Icon size={18} className="relative z-10" />
                  <span className="relative z-10">{label}</span>
                  <span className={`relative z-10 inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full text-xs font-bold ${active ? "bg-primary-foreground/25 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 font-body text-secondary-foreground/60">Loading projects…</div>
        ) : visibleProjects.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-body text-secondary-foreground/70 text-lg">
              {activeTab === "current" ? "Exciting new projects are on the way. Check back soon!" : "Completed projects will appear here."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {visibleProjects.map((p, i) => {
              const status = STATUS_META[p.status];
              return (
                <motion.div
                  key={p.slug}
                  initial={{ opacity: 0, y: 60, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.7, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
                  whileHover={{ y: -8 }}
                  className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow bg-background"
                >
                  <Link to={`/projects/${p.slug}`} className="block">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <motion.img
                        src={p.image}
                        alt={p.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.7 }}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <span className={`absolute top-4 left-4 ${status.badgeClass} text-[10px] font-bold uppercase tracking-[0.25em] px-3 py-1.5 rounded-full shadow-md`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="p-6">
                      {p.projectType && (
                        <p className="font-heading text-[10px] uppercase tracking-[0.3em] text-primary mb-2">{p.projectType}</p>
                      )}
                      <h3 className="font-heading text-xl md:text-2xl uppercase text-foreground leading-tight mb-3">
                        {p.title}
                      </h3>
                      {p.location && (
                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                          <MapPin size={14} /> {p.location}
                        </p>
                      )}
                      {(p.shortDescription || p.description) && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-5">
                          {p.shortDescription || p.description}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-widest group-hover:gap-3 transition-all">
                        Learn More <ArrowRight size={14} />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default Projects;
