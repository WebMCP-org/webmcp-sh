import { CheckIcon } from "@/icons/card-icons";
import { CloseIcon } from "@/icons/general";

export enum TierName {
  TIER_1 = "Growth",
  TIER_2 = "Scale",
  TIER_3 = "Enterprise",
}

export const tiers = [
  {
    title: TierName.TIER_1,
    subtitle: "Early stage teams",
    monthly: 8,
    yearly: 80,
    ctaText: "Start building",
    ctaLink: "/sign-up",
    features: [
      "Up to 5 active agents",
      "50 simulation runs",
      "Visual builder access",
      "GitHub + Zapier integration",
      "Basic support",
      "1 team workspace",
      "Workflow APIs",
      "Community Slack access",
    ],
  },
  {
    title: TierName.TIER_2,
    subtitle: "Fast moving startups",
    monthly: 12,
    yearly: 120,
    ctaText: "Start for free",
    ctaLink: "/sign-up",
    features: [
      "Up to 25 active agents",
      "150 simulation runs",
      "Visual builder access",
      "GitHub + Zapier integration",
      "Priority support",
      "3 team workspace",
      "Workflow APIs",
      "Priority Slack access",
    ],
    featured: true,
  },
  {
    title: TierName.TIER_3,
    subtitle: "Large enterprises",
    monthly: 25,
    yearly: 250,
    ctaText: "Contact sales",
    ctaLink: "/contact",
    features: [
      "Unlimited active agents",
      "Unlimited simulation runs",
      "Visual builder access",
      "GitHub + Zapier integration",
      "Priority support",
      "Unlimited team workspace",
      "Workflow APIs",
      "Priority Slack access",
      "Access to Fight Club",
    ],
  },
];

export const pricingTable = [
  {
    title: "Seat Limit",
    tiers: [
      {
        title: TierName.TIER_1,
        value: "Up to 3",
      },
      {
        title: TierName.TIER_2,
        value: "Up to 10",
      },
      {
        title: TierName.TIER_3,
        value: "Unlimited",
      },
    ],
  },
  {
    title: "Two-factor authentication",
    tiers: [
      {
        title: TierName.TIER_1,
        value: <CheckIcon className="mx-auto size-5 text-gray-600" />,
      },
      {
        title: TierName.TIER_2,
        value: <CheckIcon className="mx-auto size-5 text-gray-600" />,
      },
      {
        title: TierName.TIER_3,
        value: <CheckIcon className="mx-auto size-5 text-gray-600" />,
      },
    ],
  },
  {
    title: "Pay-per-task billing",
    tiers: [
      {
        title: TierName.TIER_1,
        value: <CloseIcon className="mx-auto size-5 text-gray-600" />,
      },
      {
        title: TierName.TIER_2,
        value: <CheckIcon className="mx-auto size-5 text-gray-600" />,
      },
      {
        title: TierName.TIER_3,
        value: <CheckIcon className="mx-auto size-5 text-gray-600" />,
      },
    ],
  },
  {
    title: "Static IP",
    tiers: [
      {
        title: TierName.TIER_1,
        value: <CloseIcon className="mx-auto size-5 text-gray-600" />,
      },
      {
        title: TierName.TIER_2,
        value: <CloseIcon className="mx-auto size-5 text-gray-600" />,
      },
      {
        title: TierName.TIER_3,
        value: <CheckIcon className="mx-auto size-5 text-gray-600" />,
      },
    ],
  },
  {
    title: "Record Limit",
    tiers: [
      {
        title: TierName.TIER_1,
        value: "1,000",
      },
      {
        title: TierName.TIER_2,
        value: "10,000",
      },
      {
        title: TierName.TIER_3,
        value: "Unlimited",
      },
    ],
  },
  {
    title: "Folder Permissions",
    tiers: [
      {
        title: TierName.TIER_1,
        value: <CloseIcon className="mx-auto size-5 text-gray-600" />,
      },
      {
        title: TierName.TIER_2,
        value: <CheckIcon className="mx-auto size-5 text-gray-600" />,
      },
      {
        title: TierName.TIER_3,
        value: <CheckIcon className="mx-auto size-5 text-gray-600" />,
      },
    ],
  },
  {
    title: "Teams",
    tiers: [
      {
        title: TierName.TIER_1,
        value: "1",
      },
      {
        title: TierName.TIER_2,
        value: "3",
      },
      {
        title: TierName.TIER_3,
        value: "Unlimited",
      },
    ],
  },
  {
    title: "Shared Nodes",
    tiers: [
      {
        title: TierName.TIER_1,
        value: <CloseIcon className="mx-auto size-5 text-gray-600" />,
      },
      {
        title: TierName.TIER_2,
        value: <CheckIcon className="mx-auto size-5 text-gray-600" />,
      },
      {
        title: TierName.TIER_3,
        value: <CheckIcon className="mx-auto size-5 text-gray-600" />,
      },
    ],
  },
  {
    title: "Shared app connections",
    tiers: [
      {
        title: TierName.TIER_1,
        value: <CloseIcon className="mx-auto size-5 text-gray-600" />,
      },
      {
        title: TierName.TIER_2,
        value: <CheckIcon className="mx-auto size-5 text-gray-600" />,
      },
      {
        title: TierName.TIER_3,
        value: <CheckIcon className="mx-auto size-5 text-gray-600" />,
      },
    ],
  },
  {
    title: "Agents",
    tiers: [
      {
        title: TierName.TIER_1,
        value: "5",
      },
      {
        title: TierName.TIER_2,
        value: "25",
      },
      {
        title: TierName.TIER_3,
        value: "Unlimited",
      },
    ],
  },
  {
    title: "Chatbots",
    tiers: [
      {
        title: TierName.TIER_1,
        value: "2",
      },
      {
        title: TierName.TIER_2,
        value: "10",
      },
      {
        title: TierName.TIER_3,
        value: "Unlimited",
      },
    ],
  },
  {
    title: "Nodus MCP",
    tiers: [
      {
        title: TierName.TIER_1,
        value: <CloseIcon className="mx-auto size-5 text-gray-600" />,
      },
      {
        title: TierName.TIER_2,
        value: <CheckIcon className="mx-auto size-5 text-gray-600" />,
      },
      {
        title: TierName.TIER_3,
        value: <CheckIcon className="mx-auto size-5 text-gray-600" />,
      },
    ],
  },
  {
    title: "Nodus Canvas",
    tiers: [
      {
        title: TierName.TIER_1,
        value: <CloseIcon className="mx-auto size-5 text-gray-600" />,
      },
      {
        title: TierName.TIER_2,
        value: <CheckIcon className="mx-auto size-5 text-gray-600" />,
      },
      {
        title: TierName.TIER_3,
        value: <CheckIcon className="mx-auto size-5 text-gray-600" />,
      },
    ],
  },
  {
    title: "Tables",
    tiers: [
      {
        title: TierName.TIER_1,
        value: "5",
      },
      {
        title: TierName.TIER_2,
        value: "50",
      },
      {
        title: TierName.TIER_3,
        value: "Unlimited",
      },
    ],
  },
  {
    title: "Access Permissions",
    tiers: [
      {
        title: TierName.TIER_1,
        value: "Basic",
      },
      {
        title: TierName.TIER_2,
        value: "Advanced",
      },
      {
        title: TierName.TIER_3,
        value: "Enterprise",
      },
    ],
  },
  {
    title: "Record Templates",
    tiers: [
      {
        title: TierName.TIER_1,
        value: "10",
      },
      {
        title: TierName.TIER_2,
        value: "100",
      },
      {
        title: TierName.TIER_3,
        value: "Unlimited",
      },
    ],
  },
];
