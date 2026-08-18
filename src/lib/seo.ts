export const SITE_URL = "https://shreegurudevplastics.com";
export const BUSINESS_NAME = "Shree Gurudev Plastics";
export const PHONE = "918552084251";
export const PHONE_DISPLAY = "+91 85520 84251";
export const ADDRESS = "Naigaon, Bhayander, Maharashtra, India";
export const CITY = "Bhayander";
export const STATE = "Maharashtra";
export const COUNTRY = "India";

export const PRIMARY_KEYWORDS = [
  "plastic products", "plastic chairs", "plastic tables", "plastic buckets",
  "plastic containers", "plastic stools", "plastic boxes", "plastic baskets",
  "plastic trays", "plastic mugs", "plastic bottles", "plastic bags",
  "plastic furniture", "plastic storage", "plastic kitchenware",
  "plastic armless chairs", "plastic bistro chairs", "plastic cabinets",
  "plastic baby chairs", "plastic dining tables", "plastic bookshelves",
];

export const LOCATION_KEYWORDS = [
  "plastic products Bhayander", "plastic chairs Bhayander", "plastic buckets Bhayander",
  "plastic products Naigaon", "plastic products Vasai", "plastic products Virar",
  "plastic products Mumbai", "plastic products Thane", "plastic products Palghar",
  "plastic distributor Bhayander", "plastic wholesale Bhayander",
  "plastic dealer Naigaon", "plastic bulk seller Mumbai",
  "plastic supplier Maharashtra", "wholesale plastic products near me",
  "plastic furniture Bhayander", "plastic wholesale Vasai", "plastic wholesale Virar",
  "plastic supplier Nallasopara", "plastic dealer Andheri", "plastic supplier Borivali",
  "plastic wholesale Malad", "plastic dealer Thane", "plastic supplier Mulund",
  "plastic wholesale Navi Mumbai", "plastic supplier Kalyan",
];

export const BUSINESS_KEYWORDS = [
  "bulk plastic seller", "plastic distributor", "plastic wholesaler",
  "plastic manufacturer", "plastic products supplier", "plastic goods distributor",
  "wholesale plastic furniture", "bulk plastic containers", "bulk plastic chairs",
  "plastic products online", "buy plastic products online", "cheap plastic products",
  "best plastic chairs", "durable plastic furniture", "quality plastic products",
  "Aristo plastic", "KG Plast", "Mango Chairs", "Rajdhani plastic", "Cosmos plastic",
  "Borosil plastic", "Milton plastic", "Signoraware plastic",
  "plastic chair price list", "wholesale plastic bucket rate", "bulk order plastic items",
  "plastic products for shop", "shop fitting supplies Mumbai", "plastic goods for resale",
  "plastic chair wholesale rate", "bulk plastic containers Mumbai", "plastic bucket wholesale price",
  "best plastic furniture brand India", "plastic storage boxes wholesale", "plastic kitchen items bulk",
];

export const ALL_KEYWORDS = [...PRIMARY_KEYWORDS, ...LOCATION_KEYWORDS, ...BUSINESS_KEYWORDS];

export function getProductSchema(product: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} — ${product.color}, ${product.size}. Buy from ${BUSINESS_NAME}, ${CITY}.`,
    image: product.imageUrl,
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    category: product.category,
    color: product.color,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: BUSINESS_NAME },
      availableAtOrFrom: {
        "@type": "Organization",
        name: BUSINESS_NAME,
        address: { "@type": "PostalAddress", addressLocality: CITY, addressRegion: STATE, addressCountry: "IN" },
      },
    },
  };
}

export function getLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: BUSINESS_NAME,
    description: "Premium plastic products distributor and bulk seller in Bhayander. Shop chairs, tables, buckets, containers from top brands.",
    url: SITE_URL,
    telephone: PHONE_DISPLAY,
    address: {
      "@type": "PostalAddress",
      streetAddress: ADDRESS,
      addressLocality: CITY,
      addressRegion: STATE,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 19.2886,
      longitude: 72.8567,
    },
    areaServed: [
      { "@type": "City", name: "Bhayander" },
      { "@type": "City", name: "Naigaon" },
      { "@type": "City", name: "Vasai" },
      { "@type": "City", name: "Virar" },
      { "@type": "City", name: "Mumbai" },
      { "@type": "City", name: "Thane" },
      { "@type": "City", name: "Palghar" },
    ],
    priceRange: "₹₹",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "20:00",
    },
    sameAs: [],
  };
}

export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function getFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
