import { motion } from "framer-motion";
import { Shield, Clock, ThumbsUp } from "lucide-react";

const stats = [
  { icon: Shield, label: "Licensed & Insured", value: "LLC" },
  { icon: Clock, label: "On-Time Delivery", value: "100%" },
  { icon: ThumbsUp, label: "Client Satisfaction", value: "5★" },
];

const About = () => {
  return (
    <section id="about" className="section-padding bg-background">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-heading uppercase tracking-[0.25em] text-primary text-sm mb-3">About Us</p>
            <h2 className="font-heading text-4xl md:text-5xl uppercase text-foreground mb-6">
              Built on Trust & Quality
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              HOS Construction, LLC is a full-service construction company committed to delivering
              exceptional results. From new builds to renovations, we bring professionalism, skill,
              and dedication to every project we take on.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Our team of experienced professionals works closely with every client to ensure your
              vision becomes reality — on time and within budget. We take pride in our craftsmanship
              and stand behind every project we complete.
            </p>
            <a
              href="#contact"
              className="inline-flex bg-primary text-primary-foreground font-heading uppercase tracking-wider text-sm px-8 py-4 hover:bg-accent transition-colors"
            >
              Work With Us
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-secondary p-6 text-center"
              >
                <s.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="font-heading text-2xl text-secondary-foreground">{s.value}</p>
                <p className="text-secondary-foreground/60 text-xs uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
