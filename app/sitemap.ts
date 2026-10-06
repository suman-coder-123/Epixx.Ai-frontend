import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { apiGet } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;
  const staticRoutes: MetadataRoute.Sitemap = [
    "", "/courses", "/about", "/placements", "/trainers", "/testimonials",
    "/blog", "/contact", "/faq", "/corporate-training", "/verify-certificate",
  ].map((p) => ({ url: `${base}${p || "/"}`, lastModified: new Date(), changeFrequency: "weekly", priority: p === "" ? 1 : 0.7 }));

  try {
    const [courses, posts] = await Promise.all([
      apiGet<{ items: { slug: string; updatedAt: string }[] }>("/courses?status=published&limit=100"),
      apiGet<{ items: { slug: string; updatedAt: string }[] }>("/posts?status=published&limit=100"),
    ]);
    return [
      ...staticRoutes,
      ...courses.items.map((c) => ({ url: `${base}/courses/${c.slug}`, lastModified: new Date(c.updatedAt), changeFrequency: "weekly" as const, priority: 0.8 })),
      ...posts.items.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: new Date(p.updatedAt), changeFrequency: "weekly" as const, priority: 0.6 })),
    ];
  } catch {
    return staticRoutes;
  }
}
