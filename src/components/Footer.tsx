import { Facebook, Instagram, Twitter } from "lucide-react";
import hosLogo from "@/assets/hos-logo.png";

const Footer = () => {
  return (
    <footer className="bg-foreground py-12 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <img src={hosLogo} alt="HOS Construction Logo" className="h-10 w-auto" />
            <span className="font-heading text-background/90 uppercase tracking-wider text-sm">
              HOS Construction, LLC
            </span>
          </div>

          {/* Socials */}
          <div className="flex items-center gap-5">
            <a
              href="#"
              aria-label="Facebook"
              className="text-background/50 hover:text-primary transition-colors"
            >
              <Facebook size={20} />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="text-background/50 hover:text-primary transition-colors"
            >
              <Instagram size={20} />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="text-background/50 hover:text-primary transition-colors"
            >
              <Twitter size={20} />
            </a>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-8 text-center">
          <p className="text-background/40 text-xs font-body">
            © {new Date().getFullYear()} HOS Construction, LLC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
