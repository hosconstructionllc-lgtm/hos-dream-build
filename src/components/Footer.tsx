import { motion } from "framer-motion";
import { Facebook, Instagram, Youtube } from "lucide-react";
const hosLogo = "https://i.postimg.cc/6QQH4XWt/D7E48163-D792-43E6-94B5-5340190564A5-removebg-preview.png";

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="bg-foreground py-12 px-4"
    >
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <img src={hosLogo} alt="HOS Construction Logo" className="h-20 w-auto" />
            <span className="text-background/90 uppercase tracking-wider text-lg font-bold">
              HOS Construction
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-5"
          >
            {[
              { href: "https://www.facebook.com/profile.php?id=61587938800884", icon: Facebook, label: "Facebook" },
              { href: "https://www.instagram.com/hosconstruction", icon: Instagram, label: "Instagram" },
              { href: "https://www.youtube.com/@HOSConstruction", icon: Youtube, label: "YouTube" },
            ].map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                whileHover={{ scale: 1.2, y: -2 }}
                className="text-background/50 hover:text-primary transition-colors"
              >
                <social.icon size={22} />
              </motion.a>
            ))}
            <motion.a
              href="https://www.tiktok.com/@hosconstruction"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              whileHover={{ scale: 1.2, y: -2 }}
              className="text-background/50 hover:text-primary transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </motion.a>
          </motion.div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-8 text-center">
          <p className="text-background/40 text-xs">
            © {new Date().getFullYear()} HOS Construction, LLC. All Rights Reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
