import { MetadataRoute } from "next";
import { getPublishedProjects } from "@/lib/cms";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

  const routes = [
    "",
    "/about",
    "/experience",
    "/skills",
    "/projects",
    "/resume",
    "/contact",
  ];

  const entries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));

  try {
    const projects = await getPublishedProjects();
    for (const project of projects) {
      entries.push({
        url: `${siteUrl}/projects/${project.id}`,
        lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  } catch {
    // Sitemap must never fail the build — static routes above still apply.
  }

  return entries;
}
