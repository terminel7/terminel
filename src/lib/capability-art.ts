type CapabilityShowcaseArt = {
  src: string;
  flow: "up" | "down";
  row: number;
  column: number;
  leading?: boolean;
  center?: "upper" | "lower";
};

export const capabilityShowcaseArt: readonly CapabilityShowcaseArt[] = [
  { src: "/images/capabilities-abstract/01-strategy-glass.webp", flow: "down", row: 0, column: -2 },
  { src: "/images/capabilities-abstract/02-creative-textile.webp", flow: "down", row: 0, column: 0, center: "upper" },
  { src: "/images/capabilities-abstract/03-brand-forms.webp", flow: "down", row: 0, column: 2 },
  { src: "/images/capabilities-abstract/04-development-systems.webp", flow: "down", row: 1, column: -2 },
  { src: "/images/capabilities-abstract/05-prismatic-motion.webp", flow: "down", row: 1, column: 0, center: "lower" },
  { src: "/images/capabilities-abstract/06-optical-overlap.webp", flow: "down", row: 1, column: 2 },
  { src: "/images/capabilities-abstract/07-material-weave.webp", flow: "down", row: 2, column: -2, leading: true },
  { src: "/images/capabilities-abstract/08-growth-lens.webp", flow: "down", row: 2, column: 0, leading: true },
  { src: "/images/capabilities-abstract/01-strategy-glass.webp", flow: "down", row: 2, column: 2, leading: true },
  { src: "/images/capabilities-abstract/02-creative-textile.webp", flow: "up", row: 0, column: -1, leading: true },
  { src: "/images/capabilities-abstract/03-brand-forms.webp", flow: "up", row: 0, column: 1, leading: true },
  { src: "/images/capabilities-abstract/04-development-systems.webp", flow: "up", row: 1, column: -1 },
  { src: "/images/capabilities-abstract/05-prismatic-motion.webp", flow: "up", row: 1, column: 1 },
  { src: "/images/capabilities-abstract/06-optical-overlap.webp", flow: "up", row: 2, column: -1 },
  { src: "/images/capabilities-abstract/07-material-weave.webp", flow: "up", row: 2, column: 1 },
];

export const capabilityFeatureArt = {
  strategy: "/images/capabilities-abstract/01-strategy-glass.webp",
  creative: "/images/capabilities-abstract/02-creative-textile.webp",
  branding: "/images/capabilities-abstract/03-brand-forms.webp",
  development: "/images/capabilities-abstract/04-development-systems.webp",
} as const;
