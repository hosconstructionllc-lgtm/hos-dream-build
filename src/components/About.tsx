import { motion } from "framer-motion";
import { Shield, Clock, ThumbsUp } from "lucide-react";

const stats = [
  { icon: Shield, label: "Licensed & Insured", value: "LLC" },
  { icon: Clock, label: "On-Time Delivery", value: "100%" },
  { icon: ThumbsUp, label: "Client Satisfaction", value: "5★" },
];

const About = () => {
  return (
    <section id="about" className="section-padding bg-background overflow-hidden">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            <p className="uppercase tracking-[0.3em] text-primary text-xs font-semibold mb-3">About Us</p>
            <h2 className="text-4xl md:text-5xl font-bold uppercase text-foreground mb-6">
              Built on Trust & Quality
            </h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-20 h-1 bg-primary mb-6 origin-left"
            />
            <p className="text-muted-foreground leading-relaxed mb-4 text-base">
              HOS Construction, LLC is a full-service construction company committed to delivering
              exceptional results. From new builds to renovations, we bring professionalism, skill,
              and dedication to every project we take on.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8 text-base">
              Our team of experienced professionals works closely with every client to ensure your
              vision becomes reality — on time and within budget.
            </p>
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex bg-primary text-primary-foreground font-semibold uppercase tracking-wider text-sm px-10 py-4 hover:bg-accent transition-colors rounded-sm"
            >
              Work With Us
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-5"
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-secondary p-7 text-center rounded-sm"
              >
                <s.icon className="w-9 h-9 text-primary mx-auto mb-3" />
                <p className="text-2xl font-bold text-secondary-foreground">{s.value}</p>
                <p className="text-secondary-foreground/60 text-xs uppercase tracking-wider mt-1">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
