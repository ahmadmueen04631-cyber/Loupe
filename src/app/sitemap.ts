import type { MetadataRoute } from "next";
import { TOOLS } from "@/data/tools";
import { SITE } from "@/lib/seo/site";
export default function sitemap(): MetadataRoute.Sitemap {
  const live = TOOLS.filter((t) => t.status === "live").map((t) => ({ url: `${SITE.url}/tools/${t.slug}` }));
  return [{ url: SITE.url }, { url: `${SITE.url}/tools` }, ...live];
}
