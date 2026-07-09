import { useState, useEffect } from "react";
import { Menu, X, Phone, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
const hosLogo = "https://i.postimg.cc/6QQH4XWt/D7E48163-D792-43E6-94B5-5340190564A5-removebg-preview.png";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#projects" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-hero-navy-deep/95 backdrop-blur-md shadow-lg" : "bg-hero-navy-deep/70 backdrop-blur-sm"
      }`}
    >
      {/* Top info bar - always visible */}
      <div className="w-full bg-hero-navy-deep text-secondary-foreground/90 border-b border-secondary-foreground/10">
        <div className="mx-auto flex items-center justify-between px-6 md:px-12 py-2 text-xs md:text-sm" style={{ maxWidth: "1600px" }}>
          <div className="flex items-center gap-4 md:gap-8">
            <a href="tel:+12819289967" className="flex items-center gap-2 hover:text-cta-yellow transition-colors">
              <Phone size={14} />
              <span className="tracking-wide">(281) 928-9967</span>
            </a>
            <a href="mailto:contact@hosconstructiontx.com" className="flex items-center gap-2 hover:text-cta-yellow transition-colors">
              <Mail size={14} />
              <span className="tracking-wide hidden sm:inline">contact@hosconstructiontx.com</span>
              <span className="tracking-wide sm:hidden">Email</span>
            </a>
          </div>
          <div className="hidden md:block text-secondary-foreground/60 tracking-widest uppercase text-[10px]">
            Houston, TX
          </div>
        </div>
      </div>

      <div
        className="mx-auto flex items-center justify-between px-6 md:px-12 gap-6 transition-all duration-300"
        style={{
          maxWidth: "1600px",
          height: scrolled ? "110px" : "150px",
        }}
      >
        <a href="#home" className="flex items-center flex-shrink-0">
          <img
            src={hosLogo}
            alt="HOS Construction Logo"
            className="w-auto transition-all duration-300 object-contain"
            style={{
              height: scrolled ? "95px" : "135px",
            }}
          />
        </a>

        {/* Desktop */}
        <ul className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm tracking-widest uppercase text-secondary-foreground/85 hover:text-cta-yellow transition-colors duration-300 font-medium"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#contact"
          className="hidden lg:inline-flex bg-cta-yellow text-cta-yellow-foreground font-bold uppercase tracking-wider text-sm px-6 py-3 hover:brightness-110 transition-all duration-300 rounded-sm"
        >
          Project Inquiry
        </a>

        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden text-secondary-foreground"
          aria-label="Toggle menu"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-hero-navy-deep/95 backdrop-blur-md overflow-hidden"
          >
            <ul className="flex flex-col items-center gap-6 py-8">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-lg tracking-widest uppercase text-secondary-foreground/80 hover:text-cta-yellow transition-colors font-medium"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#contact"
                  onClick={() => setOpen(false)}
                  className="bg-cta-yellow text-cta-yellow-foreground font-semibold uppercase tracking-wider text-sm px-6 py-3 rounded-sm"
                >
                  Get a Quote
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
