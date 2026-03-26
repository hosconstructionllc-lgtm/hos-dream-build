import { motion } from "framer-motion";
import heroImage from "@/assets/hero-construction.jpg";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-[120px]">
       {/* Background image */}
       <div
         className="absolute inset-0 bg-cover bg-center"
         style={{ backgroundImage: `url(${heroImage})`, backgroundSize: "140%" }}
       />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-secondary/75" />

      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p className="font-heading uppercase tracking-[0.3em] text-primary text-sm md:text-base mb-4">
            Building Excellence Since Day One
          </p>
           <h1 className="text-5xl md:text-7xl lg:text-8xl uppercase leading-none text-secondary-foreground mb-6" style={{ fontFamily: "'Bebas Neue', cursive" }}>
             HOS<span className="block text-primary">Construction</span>
           </h1>
          <p className="font-body text-lg md:text-xl text-secondary-foreground/70 max-w-2xl mx-auto mb-10">
            Quality craftsmanship and reliable service for residential, commercial, and renovation projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#projects"
              className="bg-primary text-primary-foreground font-heading uppercase tracking-wider px-8 py-4 text-sm hover:bg-accent transition-colors"
            >
              View Our Work
            </a>
            <a
              href="#contact"
              className="border-2 border-secondary-foreground/30 text-secondary-foreground font-heading uppercase tracking-wider px-8 py-4 text-sm hover:border-primary hover:text-primary transition-colors"
            >
              Request a Quote
            </a>
          </div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
