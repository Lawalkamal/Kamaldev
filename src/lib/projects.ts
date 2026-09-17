export type Project = {
  title: string;
  description: string;
  image: string;
  tags: string[];
  link: string;
  github: string;
  category: string;
  /** Shown in the "Featured Projects" section on the landing page */
  featured?: boolean;
};

/**
 * Single source of truth for portfolio projects.
 * Add a new entry here and it shows up on /projects automatically
 * (set `featured: true` to also show it on the landing page).
 */
export const projects: Project[] = [
  {
    title: "Garutech",
    description:
      "Full-stack e-commerce solution with real-time inventory, admin dashboard etc.",
    image:
      "https://res.cloudinary.com/dxhjlkdx0/image/upload/v1789645057/xggiscz6k1j660x0llab.png",
    tags: ["TypeScript", "Tailwind CSS", "Firebase", "Node.js", "Ai Integration"],
    link: "https://garutech.ng/",
    github: "#",
    category: "Web Development",
    featured: true,
  },
  {
    title: "Quotes",
    description: "Daily motivation quote of great scholars.",
    image:
      "https://res.cloudinary.com/dxhjlkdx0/image/upload/v1767177549/s7kxpdfdgoiwllt0qzsf.png",
    tags: ["TypeScript", "CSS", "Tailwind", "Next.js", "Supabase"],
    link: "#",
    github: "#",
    category: "Web Development",
    featured: true,
  },
  {
    title: "FindIt",
    description:
      "Modern lost and found app with cool design, media sharing and real-time inventory",
    image:
      "https://res.cloudinary.com/dxhjlkdx0/image/upload/v1764943658/silrjvnefnmvyil4htsy.png",
    tags: ["HTML & CSS", "Firebase", "JavaScript", "UI Design"],
    link: "https://lawalkamal.github.io/Lost-and-Found/",
    github: "#",
    category: "Web Development",
    featured: false,
  },
  {
    title: "Bikez",
    description:
      "Figma design of an ecommerce website for bikes. Ultra-Modern design, prototyping.  ",
    image:
      "https://res.cloudinary.com/dxhjlkdx0/image/upload/v1764943894/g57amwgdgc8xih4q3ywy.png",
    tags: ["UI Design", "Figma", "Corel"],
    link: "https://www.figma.com/proto/LqWAN0siti31qokC1ySk4o/Bicycle-Product-Page?node-id=68-41&p=f&t=WbtUYXVufRtpmtr8-0&scaling=scale-down&content-scaling=fixed&page-id=62%3A5",
    github: "#",
    category: "UI Design",
    featured: true,
  },
  {
    title: "Lady-G Furniture and Interior",
    description:
      "Showcase of a modern upholstery website design with a focus on user experience and aesthetics.",
    image:
      "https://res.cloudinary.com/dxhjlkdx0/image/upload/v1785949769/y36na5hinwdnrvfis12b.png",
    tags: ["UI Design", "Custom Design", "Tailwind CSS", "Upholstery"],
    link: "https://ladygfurnitureandinterior.com/",
    github: "#",
    category: "UI Design",
    featured: true,
  },
  {
    title: "Rawzaam",
    description:
      "RAWZAAM FASHION CONCEPT creates Ready to Wear, Fashion Cloth, Caps, Hijab and Jalabia for those who value craftsmanship over fleeting trends — finished with our signature stoning and embellishment work.",
    image:
      "https://res.cloudinary.com/dxhjlkdx0/image/upload/v1789645242/vemrgg7w1lwiaqhkvqjf.png",
    tags: ["UI Design", "Custom Design", "Tailwind CSS", "Upholstery", "E-commerce"],
    link: "#",
    github: "#",
    category: "Web Development",
    featured: false,
  },
  {
    title: "NOVA - Telegram Bot",
    description:
      "A modern Telegram bot for the NOVA platform, built with Hermes and integrated with various APIs.",
    image:
      "https://res.cloudinary.com/dxhjlkdx0/image/upload/v1789645668/s1gdatrudehrrrv7j0sh.png",
    tags: ["Telegram Bot", "Hermes", "API Integration"],
    link: "#",
    github: "#",
    category: "AI Integration",
    featured: false,
  },
];

export const featuredProjects = projects.filter((project) => project.featured);

export const projectCategories = [
  "All",
  ...Array.from(new Set(projects.map((project) => project.category))),
];
