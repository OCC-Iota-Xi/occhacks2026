import type { MetadataRoute } from "next";

const SITE_URL = "https://occhacks.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/register`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/volunteer`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/mentor`, changeFrequency: "monthly", priority: 0.5 },
  ];
}
