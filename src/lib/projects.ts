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
    title: "E-Commerce Platform",
    description:
      "Full-stack e-commerce solution with real-time inventory, admin dashboard etc.",
    image:
      "https://res.cloudinary.com/dxhjlkdx0/image/upload/v1764943362/xggiscz6k1j660x0llab.png",
    tags: ["TypeScript", "Tailwind CSS", "Firebase", "Node.js"],
    link: "https://garutech.ng/",
    github: "#",
    category: "Web Development",
    featured: true,
  },
  {
    title: "Daily Quote Generator",
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
    title: "Lost and Found Web App",
    description:
      "Modern lost and found app with cool design, media sharing and real-time inventory",
    image:
      "https://res.cloudinary.com/dxhjlkdx0/image/upload/v1764943658/silrjvnefnmvyil4htsy.png",
    tags: ["HTML & CSS", "Firebase", "JavaScript", "UI Design"],
    link: "https://lawalkamal.github.io/Lost-and-Found/",
    github: "#",
    category: "Web Development",
    featured: true,
  },
  {
    title: "Product Figma Design",
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
    title: "Upholstery Website Design",
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
];

export const featuredProjects = projects.filter((project) => project.featured);

export const projectCategories = [
  "All",
  ...Array.from(new Set(projects.map((project) => project.category))),
];
