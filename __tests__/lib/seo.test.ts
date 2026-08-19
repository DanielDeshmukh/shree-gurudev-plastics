import { describe, it, expect } from "vitest";
import {
  getProductSchema,
  getLocalBusinessSchema,
  getBreadcrumbSchema,
  getFAQSchema,
  SITE_URL,
  BUSINESS_NAME,
  PHONE_DISPLAY,
  CITY,
  STATE,
} from "@/lib/seo";

describe("seo", () => {
  describe("constants", () => {
    it("has correct site URL", () => {
      expect(SITE_URL).toBe("https://shreegurudevplastics.com");
    });

    it("has correct business name", () => {
      expect(BUSINESS_NAME).toBe("Shree Gurudev Plastics");
    });

    it("has phone display", () => {
      expect(PHONE_DISPLAY).toContain("+91");
    });
  });

  describe("getProductSchema", () => {
    it("generates valid Product schema", () => {
      const schema = getProductSchema({
        name: "Plastic Chair",
        color: "Blue",
        size: "Standard",
        price: 500,
        stock: 10,
        category: "chairs",
        imageUrl: "/img.jpg",
        brand: { name: "Mango" },
        description: "A great chair",
      });
      expect(schema["@type"]).toBe("Product");
      expect(schema.name).toBe("Plastic Chair");
      expect(schema.offers.price).toBe(500);
      expect(schema.offers.availability).toContain("InStock");
    });

    it("marks out-of-stock products", () => {
      const schema = getProductSchema({
        name: "Chair",
        price: 100,
        stock: 0,
        category: "chairs",
        imageUrl: "/img.jpg",
        brand: null,
      });
      expect(schema.offers.availability).toContain("OutOfStock");
    });

    it("generates default description if none provided", () => {
      const schema = getProductSchema({
        name: "Chair",
        color: "Red",
        size: "L",
        price: 100,
        stock: 5,
        category: "chairs",
        imageUrl: "/img.jpg",
        brand: null,
      });
      expect(schema.description).toContain("Chair");
      expect(schema.description).toContain("Red");
    });
  });

  describe("getLocalBusinessSchema", () => {
    it("generates valid LocalBusiness schema", () => {
      const schema = getLocalBusinessSchema();
      expect(schema["@type"]).toBe("LocalBusiness");
      expect(schema.name).toBe(BUSINESS_NAME);
      expect(schema.url).toBe(SITE_URL);
      expect(schema.telephone).toBe(PHONE_DISPLAY);
      expect(schema.address.addressLocality).toBe(CITY);
      expect(schema.address.addressRegion).toBe(STATE);
    });

    it("has geo coordinates", () => {
      const schema = getLocalBusinessSchema();
      expect(typeof schema.geo.latitude).toBe("number");
      expect(typeof schema.geo.longitude).toBe("number");
    });

    it("has areaServed", () => {
      const schema = getLocalBusinessSchema();
      expect(schema.areaServed.length).toBeGreaterThan(0);
    });
  });

  describe("getBreadcrumbSchema", () => {
    it("generates BreadcrumbList", () => {
      const schema = getBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Products", url: "/products" },
      ]);
      expect(schema["@type"]).toBe("BreadcrumbList");
      expect(schema.itemListElement).toHaveLength(2);
      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[0].item).toBe(`${SITE_URL}/`);
    });
  });

  describe("getFAQSchema", () => {
    it("generates FAQPage schema", () => {
      const schema = getFAQSchema([
        { question: "Do you deliver?", answer: "Yes, same-day in Bhayander." },
      ]);
      expect(schema["@type"]).toBe("FAQPage");
      expect(schema.mainEntity).toHaveLength(1);
      expect(schema.mainEntity[0].name).toBe("Do you deliver?");
    });
  });
});
