import { motion } from "framer-motion";
import { Building2, Home, Paintbrush, HardHat, Wrench, Ruler } from "lucide-react";

const services = [
  { icon: Home, title: "Residential Construction", desc: "Custom homes built to your vision with top-quality materials." },
  { icon: Building2, title: "Commercial Projects", desc: "Office buildings, retail spaces, and commercial facilities." },
  { icon: Paintbrush, title: "Renovations", desc: "Transform your space with expert remodeling and upgrades." },
  { icon: HardHat, title: "General Contracting", desc: "Full project management from start to finish." },
  { icon: Wrench, title: "Maintenance & Repairs", desc: "Dependable repair services to keep your property in shape." },
  { icon: Ruler, title: "Project Planning", desc: "Detailed blueprints and planning to bring ideas to life." },
];

const Services = () => {
  return (
    <section id="services" className="section-padding bg-background">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-heading uppercase tracking-[0.25em] text-primary text-sm mb-3">What We Do</p>
          <h2 className="font-heading text-4xl md:text-5xl uppercase text-foreground">Our Services</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card p-8 border border-border hover:border-primary/50 transition-colors group"
            >
              <s.icon className="w-10 h-10 text-primary mb-5 group-hover:scale-110 transition-transform" />
              <h3 className="font-heading text-xl uppercase text-card-foreground mb-3">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
