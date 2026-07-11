import project2 from "@/assets/project-2.jpg";

export interface MediaItem {
  type: "image" | "youtube";
  src: string;
}

export interface TimelineEntry {
  date: string;
  image?: string;
  text: string;
}

export interface Project {
  slug: string;
  image: string;
  media: MediaItem[];
  title: string;
  category: string;
  description: string;
  location: string;
  size: string;
  completed: string;
  projectStart?: string;
  projectedCompletion?: string;
  status: "current" | "completed";
  timeline?: TimelineEntry[];
}

export const projects: Project[] = [
  {
    slug: "coffee-shop-on-westheimer",
    image: "https://i.postimg.cc/CKpYJ1c1/1.avif",
    media: [
      { type: "image", src: "https://i.postimg.cc/CKpYJ1c1/1.avif" },
      { type: "image", src: "https://i.postimg.cc/BvCWgC8y/2.avif" },
      { type: "image", src: "https://i.postimg.cc/3wZMBZyB/3.avif" },
      { type: "image", src: "https://i.postimg.cc/mrSxwScn/4.avif" },
      { type: "youtube", src: "https://www.youtube.com/embed/NQK6f5SwU-0?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1" },
      { type: "youtube", src: "https://www.youtube.com/embed/vnZYs5i_wSE?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1" },
      { type: "image", src: "https://i.postimg.cc/xCC0NZsf/7.avif" },
      { type: "youtube", src: "https://www.youtube.com/embed/2zsBjgPphhc?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1" },
      { type: "image", src: "https://i.postimg.cc/brVS2bHD/9.avif" },
      { type: "youtube", src: "https://www.youtube.com/embed/QbPXbNcXxfA?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1" },
      { type: "youtube", src: "https://www.youtube.com/embed/8tE1lLqTMa0?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1" },
      { type: "image", src: "https://i.postimg.cc/25CHGNNn/12.avif" },
      { type: "youtube", src: "https://www.youtube.com/embed/y1uaHsv9zmM?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1" },
      { type: "image", src: "https://i.postimg.cc/6q13jXPT/IMG-3625.avif" },
      { type: "youtube", src: "https://www.youtube.com/embed/pobOE_D4ZVo?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1" },
      { type: "youtube", src: "https://www.youtube.com/embed/YD9ke5D5oIM?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1" },
      { type: "image", src: "https://i.postimg.cc/cCJ7tdYG/IMG-5483.jpg" },
      { type: "image", src: "https://i.postimg.cc/Sxc9sn5V/IMG-6503.jpg" },
      { type: "image", src: "https://i.postimg.cc/k59btn3s/IMG-6506.jpg" },
    ],
    title: "Coffee Shop on Westheimer",
    category: "Commercial Build-Out",
    description:
      "A modern coffee shop build-out on Westheimer featuring contemporary interior design with warm, culturally-inspired accents. This 2,000 sq ft space is being transformed into an inviting atmosphere with custom woodwork, specialty lighting, and a fully equipped coffee bar.",
    location: "Westheimer, Houston, TX",
    size: "2,000 sq ft",
    completed: "In Progress",
    projectStart: "March 2026",
    projectedCompletion: "July 2026",
    status: "current",
    timeline: [
      {
        date: "June 2026",
        image: "https://i.postimg.cc/k59btn3s/IMG-6506.jpg",
        text: "Interior finish work is progressing well — custom woodwork installed, specialty lighting mounted, and coffee bar framing underway.",
      },
      {
        date: "May 2026",
        image: "https://i.postimg.cc/Sxc9sn5V/IMG-6503.jpg",
        text: "Framing completed and MEP rough-ins passed inspection. Preparing for drywall and interior detailing.",
      },
      {
        date: "April 2026",
        image: "https://i.postimg.cc/cCJ7tdYG/IMG-5483.jpg",
        text: "Site demolition complete and structural build-out officially began on the 2,000 sq ft commercial space.",
      },
    ],
  },
  {
    slug: "vape-store-in-galveston",
    image: project2,
    media: [{ type: "image", src: project2 }],
    title: "Vape Store in Galveston",
    category: "Commercial Build-Out",
    description:
      "A ground-up commercial build-out for a new vape retail store in Galveston. The project includes full interior finish work, custom display millwork, modern lighting design, and a clean storefront presentation tailored to the retail experience.",
    location: "Galveston, TX",
    size: "1,500 sq ft",
    completed: "In Progress",
    projectStart: "April 2026",
    projectedCompletion: "September 2026",
    status: "current",
  },
];

export const getProjectBySlug = (slug: string) =>
  projects.find((p) => p.slug === slug);
