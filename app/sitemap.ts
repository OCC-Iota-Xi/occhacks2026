import type { MetadataRoute } from "next";

const SITE_URL = "https://occhacks.com";

/*
 * Only the homepage. /register, /volunteer and /mentor sit behind the auth
 * proxy, so an anonymous crawler is redirected to /signin (disallowed in
 * robots.ts) and could never index them.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL, changeFrequency: "weekly", priority: 1 }];
}
