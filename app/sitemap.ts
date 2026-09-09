import type { MetadataRoute } from "next";
import { programs } from "@/data/programs";
import { teachers } from "@/data/teachers";
import { articles } from "@/data/articles";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.motqen.site";

function entry(path: string, lastModified: Date): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${path}`,
    lastModified,
    alternates: {
      languages: {
        ar: `${SITE_URL}${path}`,
        en: `${SITE_URL}/en${path}`,
      },
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = ["", "/about", "/programs", "/teachers", "/articles", "/contact"].map(
    (path) => entry(path, now)
  );

  const programRoutes = programs.map((p) => entry(`/programs/${p.slug}`, now));

  const teacherRoutes = teachers.map((t) => entry(`/teachers/${t.slug}`, now));

  const articleRoutes = articles.map((a) => entry(`/articles/${a.slug}`, new Date(a.date)));

  return [...staticRoutes, ...programRoutes, ...teacherRoutes, ...articleRoutes];
}
