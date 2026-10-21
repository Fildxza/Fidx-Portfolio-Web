import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/constants";
import { publishedCaseStudies } from "@/lib/project-registry";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/resume`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/projects`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...publishedCaseStudies().map((c) => ({
      url: `${siteConfig.url}/projects/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
