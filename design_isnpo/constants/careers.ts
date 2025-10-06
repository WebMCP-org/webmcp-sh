export enum Department {
  INTERNSHIPS = "Internships",
  ENGINEERING = "Engineering",
  DESIGN = "Design",
}

export const careers = [
  // Internships
  {
    id: "intern-software-engineer",
    title: "Software Engineering Intern",
    department: Department.INTERNSHIPS,
    location: "San Francisco, CA / Remote",
    type: "Internship",
    href: "#",
    createdAt: "2025-07-15",
    description:
      "Join our engineering team as an intern and work on cutting-edge AI workflow automation tools. You'll contribute to real product features while learning from industry experts.",
    shortDescription:
      "Build the future of AI workflows alongside our engineering team. Contribute to real features used by developers worldwide.",
    requirements: [
      "Currently pursuing a degree in Computer Science or related field",
      "Experience with JavaScript/TypeScript, React, or similar technologies",
      "Strong problem-solving skills and eagerness to learn",
      "Available for 10-12 week internship program",
    ],
  },
  {
    id: "intern-product-design",
    title: "Product Design Intern",
    department: Department.INTERNSHIPS,
    location: "San Francisco, CA / Remote",
    type: "Internship",
    href: "#",
    createdAt: "2025-07-15",
    description:
      "Help design the future of AI-driven workflow tools. You'll work closely with our design team to create intuitive user experiences for complex automation systems.",
    shortDescription:
      "Shape the visual experience of AI workflows. Design interfaces that make complex automation simple and intuitive.",
    requirements: [
      "Currently pursuing a degree in Design, HCI, or related field",
      "Proficiency in Figma, Sketch, or similar design tools",
      "Portfolio demonstrating UI/UX design skills",
      "Understanding of design systems and user-centered design principles",
    ],
  },

  // Engineering
  {
    id: "senior-frontend-engineer",
    title: "Senior Frontend Engineer",
    department: Department.ENGINEERING,
    location: "San Francisco, CA / Remote",
    type: "Full-time",
    href: "#",
    createdAt: "2025-07-10",
    description:
      "Lead the development of our visual workflow builder and agent management interfaces. You'll architect scalable frontend solutions that make complex AI systems accessible to all users.",
    shortDescription:
      "Architect the frontend that powers millions of AI workflows. Build scalable interfaces for complex automation systems.",
    requirements: [
      "5+ years of experience in frontend development",
      "Expert-level knowledge of React, TypeScript, and modern web technologies",
      "Experience with complex state management and real-time applications",
      "Track record of building and scaling user-facing products",
    ],
  },
  {
    id: "backend-engineer",
    title: "Backend Engineer",
    department: Department.ENGINEERING,
    location: "San Francisco, CA / Remote",
    type: "Full-time",
    href: "#",
    createdAt: "2025-07-12",
    description:
      "Build the infrastructure that powers millions of AI agent workflows. You'll work on distributed systems, API design, and the core orchestration engine that runs our platform.",
    shortDescription:
      "Build the engine that orchestrates AI agents at scale. Design APIs and infrastructure for the next generation of automation.",
    requirements: [
      "3+ years of backend development experience",
      "Proficiency in Python, Node.js, or Go",
      "Experience with microservices, databases, and cloud platforms",
      "Understanding of distributed systems and API design",
    ],
  },
  {
    id: "ml-engineer",
    title: "Machine Learning Engineer",
    department: Department.ENGINEERING,
    location: "San Francisco, CA / Remote",
    type: "Full-time",
    href: "#",
    createdAt: "2025-07-08",
    description:
      "Develop and optimize the AI models that power our autonomous agents. You'll work on natural language processing, decision-making algorithms, and model deployment at scale.",
    shortDescription:
      "Train the AI that powers autonomous workflows. Work on cutting-edge models that understand and execute complex tasks.",
    requirements: [
      "3+ years of ML engineering experience",
      "Strong background in Python, TensorFlow/PyTorch",
      "Experience with LLMs, NLP, and agent-based systems",
      "Knowledge of MLOps and model deployment practices",
    ],
  },

  // Design
  {
    id: "senior-product-designer",
    title: "Senior Product Designer",
    department: Department.DESIGN,
    location: "San Francisco, CA / Remote",
    type: "Full-time",
    href: "#",
    createdAt: "2025-07-14",
    description:
      "Shape the visual and interaction design of our AI workflow platform. You'll create intuitive experiences that make complex automation accessible to technical and non-technical users alike.",
    shortDescription:
      "Define how users interact with AI workflows. Create experiences that make automation accessible to everyone.",
    requirements: [
      "5+ years of product design experience",
      "Strong portfolio showcasing complex B2B or developer tools",
      "Expertise in design systems and component libraries",
      "Experience with user research and data-driven design decisions",
    ],
  },
  {
    id: "ux-researcher",
    title: "UX Researcher",
    department: Department.DESIGN,
    location: "San Francisco, CA / Remote",
    type: "Full-time",
    href: "#",
    createdAt: "2025-07-11",
    description:
      "Lead user research initiatives to understand how teams build and deploy AI workflows. You'll conduct studies, analyze user behavior, and provide insights that drive product decisions.",
    shortDescription:
      "Understand how teams work with AI. Conduct research that shapes the future of workflow automation tools.",
    requirements: [
      "3+ years of UX research experience",
      "Experience with both qualitative and quantitative research methods",
      "Background in B2B or developer tools research",
      "Strong analytical skills and ability to translate insights into actionable recommendations",
    ],
  },
  {
    id: "design-systems-designer",
    title: "Design Systems Designer",
    department: Department.DESIGN,
    location: "San Francisco, CA / Remote",
    type: "Full-time",
    href: "#",
    createdAt: "2025-07-09",
    description:
      "Build and maintain our design system that powers consistent experiences across our platform. You'll create reusable components and establish design standards for our growing product suite.",
    shortDescription:
      "Build the design foundation for our platform. Create components and standards that scale across our entire product.",
    requirements: [
      "4+ years of design systems experience",
      "Strong knowledge of component libraries and design tokens",
      "Experience collaborating closely with frontend engineers",
      "Proficiency in Figma and understanding of frontend technologies",
    ],
  },
];
