import { motion, useScroll, useTransform } from "framer-motion";
import { Building2, Home, Paintbrush, HardHat, Wrench, Ruler } from "lucide-react";
import { useRef } from "react";

const services = [
  { icon: Home, title: "Residential Construction", desc: "Custom homes built to your vision with top-quality materials." },
  { icon: Building2, title: "Commercial Projects", desc: "Office buildings, retail spaces, and commercial facilities." },
  { icon: Paintbrush, title: "Renovations", desc: "Transform your space with expert remodeling and upgrades." },
  { icon: HardHat, title: "General Contracting", desc: "Full project management from start to finish." },
  { icon: Wrench, title: "Maintenance & Repairs", desc: "Dependable repair services to keep your property in shape." },
  { icon: Ruler, title: "Project Planning", desc: "Detailed blueprints and planning to bring ideas to life." },
];

const Services = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "-5%"]);

  return (
    <section id="services" ref={sectionRef} className="relative section-padding bg-background overflow-hidden">
      <motion.div style={{ y: backgroundY }} className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-20"
        >
          <p className="font-heading uppercase tracking-[0.4em] text-primary text-xs mb-4">What We Do</p>
          <h2 className="font-heading text-5xl md:text-6xl uppercase text-foreground">Our Services</h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-24 h-1 bg-primary mx-auto mt-6 origin-left"
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 60, rotateX: 10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.7,
                delay: i * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              whileHover={{
                y: -8,
                transition: { duration: 0.3 },
              }}
              className="bg-card p-10 border border-border hover:border-primary/50 transition-colors group relative overflow-hidden"
            >
              {/* Hover glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
              <div className="relative z-10">
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <s.icon className="w-12 h-12 text-primary mb-6" />
                </motion.div>
                <h3 className="font-heading text-xl uppercase text-card-foreground mb-3">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Services;
