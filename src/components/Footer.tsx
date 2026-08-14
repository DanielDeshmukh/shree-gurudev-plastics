import Link from "next/link";
import { BUSINESS_NAME, PHONE_DISPLAY, PHONE, ADDRESS, SITE_URL } from "@/lib/seo";

const productCategories = [
  { name: "Plastic Chairs", href: "/category/furniture" },
  { name: "Plastic Tables", href: "/category/furniture" },
  { name: "Plastic Buckets", href: "/category/accessories" },
  { name: "Plastic Containers", href: "/category/containers" },
  { name: "Plastic Storage", href: "/category/storage" },
  { name: "Plastic Kitchenware", href: "/category/kitchen" },
];

const brands = [
  { name: "Aristo", href: "/brand/aristo" },
  { name: "KG Plast", href: "/brand/kg-plast" },
  { name: "Mango Chairs", href: "/brand/mango-chairs" },
  { name: "Rajdhani", href: "/brand/rajdhani" },
  { name: "Milton", href: "/brand/milton" },
  { name: "Borosil", href: "/brand/borosil" },
];

const serviceAreas = [
  "Bhayander", "Naigaon", "Vasai", "Virar", "Mumbai", "Thane", "Palghar",
];

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "All Products", href: "/products" },
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Request a Quote", href: "/quote" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white text-lg font-bold mb-3">{BUSINESS_NAME}</h3>
          <p className="text-sm leading-relaxed mb-4">
            {BUSINESS_NAME} is a leading plastic products distributor and bulk seller in Bhayander, Mumbai.
            We offer premium quality plastic chairs, tables, buckets, containers, and more from top brands
            at wholesale prices. Serving Bhayander, Naigaon, Vasai, Virar, and all of Mumbai.
          </p>
          <p className="text-sm text-gray-400">{ADDRESS}</p>
          <a
            href={`https://wa.me/${PHONE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300 transition-colors text-sm"
          >
            WhatsApp: {PHONE_DISPLAY}
          </a>
        </div>

        <div>
          <h3 className="text-white text-lg font-bold mb-3">Product Categories</h3>
          <ul className="space-y-2 text-sm">
            {productCategories.map((cat) => (
              <li key={cat.name}>
                <Link href={cat.href} className="hover:text-orange-400 transition-colors">{cat.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-white text-lg font-bold mb-3">Our Brands</h3>
          <ul className="space-y-2 text-sm">
            {brands.map((brand) => (
              <li key={brand.name}>
                <Link href={brand.href} className="hover:text-orange-400 transition-colors">{brand.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-white text-lg font-bold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            {quickLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href} className="hover:text-orange-400 transition-colors">{link.name}</Link>
              </li>
            ))}
          </ul>
          <h3 className="text-white text-lg font-bold mt-6 mb-3">Service Areas</h3>
          <div className="flex flex-wrap gap-2">
            {serviceAreas.map((area) => (
              <span key={area} className="text-xs bg-gray-800 px-2 py-1 rounded">{area}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 text-center py-4 text-sm text-gray-500">
        © {new Date().getFullYear()} {BUSINESS_NAME}. All rights reserved. Plastic products distributor and bulk seller in Bhayander, Mumbai.
      </div>
    </footer>
  );
}
