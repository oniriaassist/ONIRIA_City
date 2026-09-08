const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://oniriacity.com";

const routes = [
  "",
  "/properties",
  "/villas",
  "/villas/signature-villa",
  "/residences",
  "/v-avenue",
  "/commercial",
  "/vision",
  "/masterplan",
  "/lifestyle",
  "/architecture",
  "/amenities",
  "/investment",
  "/gallery",
  "/journal",
  "/faqs",
  "/contact",
  "/inquiries",
  "/privacy",
  "/cookie-policy",
  "/accessibility",
  "/sitemap",
];

export default function sitemap() {
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));
}
