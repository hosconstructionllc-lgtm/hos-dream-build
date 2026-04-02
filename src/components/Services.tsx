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

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const Services = () => {
  return (
    <section id="services" className="section-padding bg-background overflow-hidden">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="uppercase tracking-[0.3em] text-primary text-xs font-semibold mb-3">What We Do</p>
          <h2 className="text-4xl md:text-5xl font-bold uppercase text-foreground">Our Services</h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-20 h-1 bg-primary mx-auto mt-5 origin-left"
          />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((s) => (
            <motion.div
              key={s.title}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="bg-card p-8 border border-border hover:border-primary/40 transition-all group relative overflow-hidden rounded-sm"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400"
              />
              <div className="relative z-10">
                <s.icon className="w-10 h-10 text-primary mb-5" />
                <h3 className="text-lg font-bold uppercase text-card-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
