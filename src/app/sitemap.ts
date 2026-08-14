import type { MetadataRoute } from "next";

const SITE_URL = "https://shreegurudevplastics.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${SITE_URL}/products`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
  ];

  let brandPages: MetadataRoute.Sitemap = [];
  let productPages: MetadataRoute.Sitemap = [];

  try {
    const brandsRes = await fetch(`${SITE_URL}/api/brands`, { cache: "no-store" });
    const brandsData = await brandsRes.json();
    const brands = brandsData.brands || [];
    brandPages = brands.map((b: any) => ({
      url: `${SITE_URL}/brand/${b.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const productsRes = await fetch(`${SITE_URL}/api/products`, { cache: "no-store" });
    const productsData = await productsRes.json();
    const products = productsData.products || [];
    productPages = products.map((p: any) => ({
      url: `${SITE_URL}/product/${p.id}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));
  } catch {}

  return [...staticPages, ...brandPages, ...productPages];
}
