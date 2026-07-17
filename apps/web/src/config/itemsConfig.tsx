import {
  IconBolt,
  IconBrain,
  IconBrandSpeedtest,
  IconGitBranch,
  IconPuzzle,
  IconRocket,
  IconShieldCheck,
  IconSparkle2,
  IconStack,
} from "@tabler/icons-react";

export const itemsConfig = {
  arcSection: [
    {
      id: 1,
      icon: <IconGitBranch className="text-white" />,
      title: "Open Source",
      description:
        "Where it began: contributing to and maintaining public repositories, building trust one commit at a time.",
    },
    {
      id: 2,
      icon: <IconBolt className="text-white" />,
      title: "On demand",
      description:
        "Responsive solutions tailored to your specific needs, delivered with precision and efficiency.",
    },
    {
      id: 3,
      icon: <IconSparkle2 className="text-white" />,
      title: "AI Enterprise",
      description:
        "Advanced AI solutions designed to drive innovation and growth in your business.",
    },
  ],

  todaySection: [
    {
      id: 1,
      icon: <IconBrain className="text-primary" />,
      title: "AI-Native Engineering",
      description:
        "Custom models, agents, and pipelines woven directly into your product — not bolted on as an afterthought.",
    },
    {
      id: 2,
      icon: <IconRocket className="text-primary" />,
      title: "On-Demand Teams",
      description:
        "Scale senior engineering up or down as your roadmap shifts, without the overhead of a full-time hire.",
    },
    {
      id: 3,
      icon: <IconShieldCheck className="text-primary" />,
      title: "Quality & Compliance",
      description:
        "Automated testing, code review, and audit trails built into every delivery, not added at the end.",
    },
    {
      id: 4,
      icon: <IconStack className="text-primary" />,
      title: "Platform Modernization",
      description:
        "Migrate legacy systems onto resilient, cloud-native architecture without disrupting the business.",
    },
    {
      id: 5,
      icon: <IconPuzzle className="text-primary" />,
      title: "Open Integration",
      description:
        "We build with open standards and open source at the core, so you're never locked into a black box.",
    },
    {
      id: 6,
      icon: <IconBrandSpeedtest className="text-primary" />,
      title: "Performance Engineering",
      description:
        "Systems tuned for scale from day one — because enterprise workloads don't tolerate slow.",
    },
  ],
  qualityFirstSection: [
    {
      id: 1,
      label: "Contractual uptime SLA",
      value: "99.98%",
    },
    {
      id: 2,
      label: "Peer-reviewed pull requests",
      value: "100%",
    },
    {
      id: 3,
      label: "Type II audited",
      value: "SOC 2",
    },
  ],
};
