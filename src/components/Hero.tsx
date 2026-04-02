import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ChevronDown } from "lucide-react";
import heroImage from "@/assets/hero-construction.jpg";

const hosLogo = "https://i.postimg.cc/6QQH4XWt/D7E48163-D792-43E6-94B5-5340190564A5-removebg-preview.png";

const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <section
      id="home"
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Parallax background */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          y: bgY,
          scale,
        }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/80 via-secondary/50 to-secondary/90" />

      <motion.div
        className="relative z-10 container mx-auto px-6 text-center flex flex-col items-center"
        style={{ y: textY, opacity }}
      >
        {/* Logo */}
        <motion.img
          src={hosLogo}
          alt="HOS Construction Logo"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-auto mb-8"
          style={{ height: "160px" }}
        />

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-secondary-foreground mb-4"
        >
          HOS{" "}
          <span className="text-primary">Construction</span>
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="w-32 h-1 bg-primary mb-6 origin-center"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-lg md:text-xl text-secondary-foreground/70 max-w-2xl mx-auto mb-10 font-light"
        >
          Quality craftsmanship and reliable service for residential, commercial, and renovation projects across Houston, TX.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <a
            href="#projects"
            className="bg-primary text-primary-foreground font-semibold uppercase tracking-wider px-10 py-4 text-sm hover:bg-accent transition-all duration-300 hover:scale-105 rounded-sm"
          >
            View Our Work
          </a>
          <a
            href="#contact"
            className="border-2 border-secondary-foreground/30 text-secondary-foreground font-semibold uppercase tracking-wider px-10 py-4 text-sm hover:border-primary hover:text-primary transition-all duration-300 hover:scale-105 rounded-sm"
          >
            Get a Free Quote
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
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
          <ChevronDown className="w-8 h-8 text-secondary-foreground/40" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
