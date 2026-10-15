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
  { src: "/images/capabilities-abstract/09-kinetic-acrylic.webp", flow: "down", row: 2, column: 2, leading: true },
  { src: "/images/capabilities-abstract/10-orbital-vellum.webp", flow: "up", row: 0, column: -1, leading: true },
  { src: "/images/capabilities-abstract/11-luminous-lattice.webp", flow: "up", row: 0, column: 1, leading: true },
  { src: "/images/capabilities-abstract/12-soft-geometry.webp", flow: "up", row: 1, column: -1 },
  { src: "/images/capabilities-abstract/13-dichroic-monolith.webp", flow: "up", row: 1, column: 1 },
  { src: "/images/capabilities-abstract/14-magnetic-field.webp", flow: "up", row: 2, column: -1 },
  { src: "/images/capabilities-abstract/15-liquid-chrome.webp", flow: "up", row: 2, column: 1 },
];

export const capabilityFeatureArt = {
  strategy: "/images/capabilities-abstract/16-strategy-pathways.webp",
  creative: "/images/capabilities-abstract/17-creative-folds.webp",
  branding: "/images/capabilities-abstract/18-brand-symbols.webp",
  development: "/images/capabilities-abstract/19-development-network.webp",
} as const;
