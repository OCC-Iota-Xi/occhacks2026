import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/auth", "/signin", "/status", "/handbook"],
    },
    sitemap: "https://occhacks.com/sitemap.xml",
  };
}
