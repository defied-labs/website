import {
  IconBrain,
  IconBrandSpeedtest,
  IconPlant2,
  IconRocket,
  IconShieldCheck,
  IconStack,
} from "@tabler/icons-react";

export const itemsConfig = {
  navLinks: [
    {
      id: 1,
      title: "Services",
      links: [
        {
          id: "service-1",
          title: "Web Development",
          href: "/web-dev",
        },
        {
          id: "service-2",
          title: "Interface Design",
          href: "/interface-design",
        },
        {
          id: "service-3",
          title: "Minecraft Development",
          href: "/minecraft-dev",
        },
        {
          id: "service-4",
          title: "Full Stack Development",
          href: "/full-stack-dev",
        },
      ],
    },
    {
      id: 2,
      title: "Products",
      links: [
        {
          id: "product-1",
          title: "Defied Prism",
          href: "https://prism.defied.dev",
          src: "",
          description:
            "Choose everything, don't settle for less. Defied Prism is a comprehensive UI component library for building consistent and visually appealing user interfaces across all Defied projects.",
        },
        {
          id: "product-2",
          title: "Defied Web Configs",
          href: "https://webconfigs.defied.dev",
          src: "",
          description:
            "Access your configurations from anywhere, anytime. Defied Web Configs is a cloud-based configuration management tool that allows you to store, manage, and access your minecraft server configurations from any device with an internet connection.",
        },
      ],
    },
    {
      id: 3,
      title: "Pricing",
      links: [
        {
          id: 1,
          title: "Hobby",
          href: "/hobby",
        },
        {
          id: 2,
          title: "Individual",
          href: "/individual",
        },
        {
          id: 3,
          title: "Team",
          href: "/team",
        },
        {
          id: 4,
          title: "Enterprise",
          href: "/enterprise",
        },
      ],
    },
  ],
  projectsSection: [
    {
      id: 1,
      title: "Defied Core",
      description:
        "The core repository of the Defied ecosystem, containing the foundational components and libraries that power our projects. It serves as the backbone for all other Defied applications and services.",
      link: "https://github.com/defied-labs/core",
      stars: 0,
      forks: 0,
      status: "active",
    },
    {
      id: 2,
      title: "Defied Prism",
      description:
        "A comprehensive UI component library for building consistent and visually appealing user interfaces across all Defied projects.",
      link: "https://github.com/defied-labs/prism",
      stars: 0,
      forks: 0,
      status: "active",
    },
    {
      id: 3,
      title: "Defied Docs",
      description:
        "The official documentation repository for the Defied ecosystem, providing guides, tutorials, and API references for developers.",
      link: "https://github.com/defied-labs/docs",
      stars: 0,
      forks: 0,
      status: "active",
    },
    {
      id: 4,
      title: "Defied CLI",
      description:
        "A command-line interface tool for managing and deploying Defied projects, streamlining development workflows.",
      link: "https://github.com/defied-labs/cli",
      stars: 0,
      forks: 0,
      status: "active",
    },
    {
      id: 5,
      title: "Defied Analytics",
      description:
        "A powerful analytics platform for tracking user behavior and performance metrics across all Defied applications. ",
      link: "https://github.com/defied-labs/analytics",
      stars: 0,
      forks: 0,
      status: "active",
    },
    {
      id: 6,
      title: "Defied Auth",
      description:
        "A secure authentication and authorization service for managing user access and permissions within the Defied ecosystem. It supports various authentication methods, including OAuth, JWT, and multi-factor authentication.",
      link: "https://github.com/defied-labs/auth",
      stars: 0,
      forks: 0,
      status: "active",
    },
    {
      id: 7,
      title: "Defied Payments",
      description:
        "A payment processing system for handling transactions and subscriptions within the Defied ecosystem.",
      link: "https://github.com/defied-labs/payments",
      stars: 0,
      forks: 0,
      status: "active",
    },
    {
      id: 8,
      title: "Defied Notifications",
      description:
        "A notification service for sending real-time alerts and updates to users across all Defied applications.",
      link: "https://github.com/defied-labs/notifications",
      stars: 0,
      forks: 0,
      status: "active",
    },
    {
      id: 9,
      title: "Defied Marketplace",
      description:
        "An online marketplace for discovering and sharing Defied-compatible applications and services.",
      link: "https://github.com/defied-labs/marketplace",
      stars: 0,
      forks: 0,
      status: "active",
    },
  ],
  todaySection: [
    {
      id: 1,
      icon: <IconShieldCheck className="text-primary" />,
      title: "Quality-first, speed second",
      description:
        "Better ship later with an excellent product, rather than shipping now with a mediocre product",
    },
    {
      id: 2,
      icon: <IconRocket className="text-primary" />,
      title: "Solve real problems",
      description: `No project is born from "it would be cool". It's born from: a problem, a user or value`,
    },
    {
      icon: <IconBrain className="text-primary" />,
      id: 3,
      title: "AI as multiplier",
      description:
        "Do not use AI everywhere. Use where it really changes the product, not as an added feature, but as part of the architecture.",
    },
    {
      id: 4,
      icon: <IconStack className="text-primary" />,
      title: "Developer First",
      description: "Developers are the first priority.",
    },
    {
      id: 5,
      icon: <IconBrandSpeedtest className="text-primary" />,
      title: "Software built to endure",
      description: "No temporary hacks",
    },
    {
      id: 6,
      icon: <IconPlant2 className="text-primary" />,
      title: "Ecosystem before isolated products",
      description: "Every product should connect to the others",
    },
  ],
  qualityFirstSection: [
    {
      // Create some mock data for the quality first section without repeating the same values as the today section
      id: 1,
      value: "100%",
      label: "Open-source discipline",
    },
    {
      id: 2,
      value: "99.9%",
      label: "Satisfaction rate",
    },
    {
      id: 3,
      value: "24/7",
      label: "Support availability",
    },
  ],
};
