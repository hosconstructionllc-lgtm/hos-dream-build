import { Facebook, Instagram, Youtube } from "lucide-react";
import hosLogo from "@/assets/hos-logo-new.png";

const Footer = () => {
  return (
    <footer className="bg-foreground py-12 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <img src={hosLogo} alt="HOS Construction Logo" className="h-10 w-auto" />
            <span className="font-heading text-background/90 uppercase tracking-wider text-sm">
              HOS Construction
            </span>
          </div>

          {/* Socials */}
          <div className="flex items-center gap-5">
            <a
              href="https://www.facebook.com/profile.php?id=61587938800884"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-background/50 hover:text-primary transition-colors"
            >
              <Facebook size={20} />
            </a>
            <a
              href="https://www.instagram.com/hosconstruction"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-background/50 hover:text-primary transition-colors"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://www.youtube.com/@HOSConstruction"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="text-background/50 hover:text-primary transition-colors"
            >
              <Youtube size={20} />
            </a>
            <a
              href="https://www.tiktok.com/@hosconstruction"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="text-background/50 hover:text-primary transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </a>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-8 text-center">
          <p className="text-background/40 text-xs font-body">
            © {new Date().getFullYear()} HOS Construction. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
