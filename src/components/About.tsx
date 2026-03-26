import { motion, useScroll, useTransform } from "framer-motion";
import { Shield, Clock, ThumbsUp } from "lucide-react";
import { useRef } from "react";

const stats = [
  { icon: Shield, label: "Licensed & Insured", value: "LLC" },
  { icon: Clock, label: "On-Time Delivery", value: "100%" },
  { icon: ThumbsUp, label: "Client Satisfaction", value: "5★" },
];

const About = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);

  return (
    <section id="about" ref={sectionRef} className="section-padding bg-background overflow-hidden">
      <motion.div style={{ y }} className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <motion.p
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="font-heading uppercase tracking-[0.4em] text-primary text-xs mb-4"
            >
              About Us
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="font-heading text-5xl md:text-6xl uppercase text-foreground mb-8"
            >
              Built on Trust & Quality
            </motion.h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-24 h-1 bg-primary mb-8 origin-left"
            />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-muted-foreground leading-relaxed mb-4 text-lg"
            >
              HOS Construction, LLC is a full-service construction company committed to delivering
              exceptional results. From new builds to renovations, we bring professionalism, skill,
              and dedication to every project we take on.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-muted-foreground leading-relaxed mb-10 text-lg"
            >
              Our team of experienced professionals works closely with every client to ensure your
              vision becomes reality — on time and within budget.
            </motion.p>
            <motion.a
              href="#contact"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex bg-primary text-primary-foreground font-heading uppercase tracking-wider text-sm px-10 py-4 hover:bg-accent transition-colors"
            >
              Work With Us
            </motion.a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.6,
                  delay: 0.2 + i * 0.15,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                whileHover={{ y: -5, scale: 1.03 }}
                className="bg-secondary p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.4 + i * 0.15 }}
                >
                  <s.icon className="w-10 h-10 text-primary mx-auto mb-4" />
                </motion.div>
                <p className="font-heading text-3xl text-secondary-foreground">{s.value}</p>
                <p className="text-secondary-foreground/60 text-xs uppercase tracking-wider mt-2">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default About;
