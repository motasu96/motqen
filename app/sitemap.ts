import type { MetadataRoute } from "next";
import { programs } from "@/data/programs";
import { teachers } from "@/data/teachers";
import { articles } from "@/data/articles";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.motqen.site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/about", "/programs", "/teachers", "/articles", "/contact"].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
    })
  );

  const programRoutes = programs.map((p) => ({
    url: `${SITE_URL}/programs/${p.slug}`,
    lastModified: new Date(),
  }));

  const teacherRoutes = teachers.map((t) => ({
    url: `${SITE_URL}/teachers/${t.slug}`,
    lastModified: new Date(),
  }));

  const articleRoutes = articles.map((a) => ({
    url: `${SITE_URL}/articles/${a.slug}`,
    lastModified: new Date(a.date),
  }));

  return [...staticRoutes, ...programRoutes, ...teacherRoutes, ...articleRoutes];
}
