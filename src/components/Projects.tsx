import { motion } from "framer-motion";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";

const projects = [
  { image: project1, title: "Custom Residential Home", category: "Residential" },
  { image: project2, title: "Commercial Office Build", category: "Commercial" },
  { image: project3, title: "Modern Kitchen Remodel", category: "Renovation" },
];

const Projects = () => {
  return (
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="group relative overflow-hidden cursor-pointer"
            >
              <img
                src={p.image}
                alt={p.title}
                className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/70 transition-colors duration-500 flex items-end">
                <div className="p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <span className="text-primary font-heading text-xs uppercase tracking-widest">{p.category}</span>
                  <h3 className="font-heading text-xl uppercase text-secondary-foreground mt-1">{p.title}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
