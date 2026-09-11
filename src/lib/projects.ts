export type ProjectImage = {
  src: string;
  alt: string;
};

export type ProjectSection =
  | { type: "copy"; text: string }
  | { type: "image"; src: string; alt: string }
  | { type: "gallery"; images: ProjectImage[] };

export type Project = {
  slug: string;
  order: number;
  name: string;
  year: string;
  title: string;
  summary: string;
  services: string[];
  thumbnail: string;
  hero: string;
  intro: string | null;
  sections: ProjectSection[];
};

const modules = import.meta.glob<{ default: Project }>("../content/work/*.json", {
  eager: true,
});

export const projects = Object.values(modules)
  .map((module) => module.default)
  .sort((a, b) => a.order - b.order);

export function adjacentProjects(slug: string) {
  const index = projects.findIndex((project) => project.slug === slug);
  const previous = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];

  return { previous, next };
}
