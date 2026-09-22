import type { MetadataRoute } from "next";
import { programs } from "@/data/programs";
import { articles } from "@/data/articles";
import { createClient } from "@/lib/supabase/server";
import { getActiveTeachers } from "@/lib/supabase/teachers";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.motqen.site";

// Teacher slugs are DB-backed and can change (new approvals), so this route
// renders per-request instead of being baked into the static build.
export const dynamic = "force-dynamic";

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

async function loadTeacherSlugs(): Promise<string[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = await createClient();
    const teachers = await getActiveTeachers(supabase);
    return teachers.map((t) => t.slug);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes = ["", "/about", "/programs", "/teachers", "/articles", "/contact"].map(
    (path) => entry(path, now)
  );

  const programRoutes = programs.map((p) => entry(`/programs/${p.slug}`, now));

  const teacherSlugs = await loadTeacherSlugs();
  const teacherRoutes = teacherSlugs.map((slug) => entry(`/teachers/${slug}`, now));

  const articleRoutes = articles.map((a) => entry(`/articles/${a.slug}`, new Date(a.date)));

  return [...staticRoutes, ...programRoutes, ...teacherRoutes, ...articleRoutes];
}
