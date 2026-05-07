import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ChevronDown } from "lucide-react";
import heroImage from "@/assets/hero-construction.jpg";

const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section
      id="home"
      ref={ref}
      className="relative min-h-screen flex items-center overflow-hidden bg-hero-navy-deep"
    >
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroImage})`,
          y: bgY,
          scale,
        }}
      />
      {/* Navy overlay - heavy on left, fading right */}
      <div className="absolute inset-0 bg-gradient-to-r from-hero-navy-deep via-hero-navy-deep/85 to-hero-navy/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-hero-navy-deep/40 via-transparent to-hero-navy-deep/60" />

      <motion.div
        className="relative z-10 container mx-auto px-6 md:px-12 lg:px-20"
        style={{ y: textY, opacity }}
      >
        <div className="max-w-3xl">
          {[
            { text: "HANDS ON.", delay: 0.3 },
            { text: "HARDWORKING.", delay: 0.5 },
            { text: "RESULTS DRIVEN.", delay: 0.7 },
          ].map((line) => (
            <motion.h1
              key={line.text}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: line.delay, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-secondary-foreground leading-[1.05] mb-2"
            >
              {line.text}
            </motion.h1>
          ))}

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="w-24 h-1 bg-cta-yellow mt-8 mb-6 origin-left"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="text-base md:text-lg text-secondary-foreground/85 max-w-xl mb-10 font-light"
          >
            Built on decades of hands-on experience. Quality craftsmanship for residential, commercial, and renovation projects across Houston, TX.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a
              href="#contact"
              className="bg-cta-yellow text-cta-yellow-foreground font-bold uppercase tracking-wider px-10 py-4 text-sm hover:brightness-110 transition-all duration-300 hover:scale-105 rounded-sm shadow-xl"
            >
              Get your Project Started
            </a>
            <a
              href="#projects"
              className="border-2 border-secondary-foreground/40 text-secondary-foreground font-semibold uppercase tracking-wider px-10 py-4 text-sm hover:border-cta-yellow hover:text-cta-yellow transition-all duration-300 hover:scale-105 rounded-sm"
            >
              View Our Work
            </a>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-8 h-8 text-secondary-foreground/50" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
