"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BUSINESS_NAME, CITY, PHONE } from "@/lib/seo";
import { useLanguage } from "@/context/LanguageContext";

const CATEGORIES = [
  "Chairs",
  "Tables",
  "Buckets",
  "Containers",
  "Storage",
  "Kitchenware",
  "Accessories",
  "Other",
];

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  company: string;
  category: string;
  quantity: string;
  description: string;
  brand: string;
  location: string;
  deliveryDate: string;
}

export default function QuotePage() {
  const searchParams = useSearchParams();
  const defaultCategory = searchParams.get("category") || "";
  const { t } = useLanguage();

  const [form, setForm] = useState<FormData>({
    fullName: "",
    phone: "",
    email: "",
    company: "",
    category: defaultCategory,
    quantity: "",
    description: "",
    brand: "",
    location: "",
    deliveryDate: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (defaultCategory) {
      setForm((prev) => ({ ...prev, category: defaultCategory }));
    }
  }, [defaultCategory]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    if (!form.quantity.trim()) newErrors.quantity = "Quantity is required";
    else if (Number(form.quantity) < 10) newErrors.quantity = "Minimum quantity is 10";
    if (!form.description.trim()) newErrors.description = "Product description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const lines = [
      "QUOTE REQUEST",
      "",
      `Name: ${form.fullName}`,
      `Phone: ${form.phone}`,
      `Email: ${form.email || "N/A"}`,
      `Company: ${form.company || "N/A"}`,
      "",
      "Product Details:",
      `Category: ${form.category || "Not specified"}`,
      `Quantity: ${form.quantity}`,
      `Brand Preference: ${form.brand || "N/A"}`,
      `Description: ${form.description}`,
      "",
      `Delivery Location: ${form.location || "N/A"}`,
      `Expected Delivery: ${form.deliveryDate || "N/A"}`,
      "",
      "Please provide pricing and availability.",
    ];

    const message = lines.join("\n");
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`, "_blank");
    setSubmitted(true);
  };

  const resetForm = () => {
    setForm({
      fullName: "",
      phone: "",
      email: "",
      company: "",
      category: "",
      quantity: "",
      description: "",
      brand: "",
      location: "",
      deliveryDate: "",
    });
    setSubmitted(false);
    setErrors({});
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("Quote Request Sent!", "à¤•à¥‹à¤Ÿà¥‡à¤¶à¤¨ à¤…à¤¨à¥à¤°à¥‹à¤§ à¤­à¥‡à¤œà¤¾ à¤—à¤¯à¤¾!")}</h1>
            <p className="text-gray-600 mb-6">
              {t("Thank you! Your quote request has been sent via WhatsApp. We'll get back to you with pricing and availability shortly.", "à¤§à¤¨à¥à¤¯à¤µà¤¾à¤¦! à¤†à¤ªà¤•à¤¾ à¤•à¥‹à¤Ÿà¥‡à¤¶à¤¨ à¤…à¤¨à¥à¤°à¥‹à¤§ WhatsApp à¤ªà¤° à¤­à¥‡à¤œ à¤¦à¤¿à¤¯à¤¾ à¤—à¤¯à¤¾ à¤¹à¥ˆà¥¤ à¤¹à¤® à¤œà¤²à¥à¤¦ à¤¹à¥€ à¤®à¥‚à¤²à¥à¤¯ à¤”à¤° à¤‰à¤ªà¤²à¤¬à¥à¤§à¤¤à¤¾ à¤•à¥‡ à¤¸à¤¾à¤¥ à¤†à¤ªà¤¸à¥‡ à¤¸à¤‚à¤ªà¤°à¥à¤• à¤•à¤°à¥‡à¤‚à¤—à¥‡à¥¤")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={resetForm}
                className="bg-primary-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
              >
                {t("Send Another Request", "à¤à¤• à¤”à¤° à¤…à¤¨à¥à¤°à¥‹à¤§ à¤­à¥‡à¤œà¥‡à¤‚")}
              </button>
              <Link
                href="/products"
                className="bg-gray-100 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t("Browse Products", "à¤‰à¤¤à¥à¤ªà¤¾à¤¦à¤¨ à¤¦à¥‡à¤–à¥‡à¤‚")}
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{t("Request a Quote", "à¤•à¥‹à¤Ÿà¥‡à¤¶à¤¨ à¤…à¤¨à¥à¤°à¥‹à¤§")}</h1>
          <p className="text-gray-600 max-w-2xl">
            {t("Need bulk pricing or custom orders? Fill out the form below and we'll send your quote request directly via WhatsApp.", "à¤¥à¥‹à¤• à¤®à¥‚à¤²à¥à¤¯ à¤¯à¤¾ à¤•à¤¸à¥à¤Ÿà¤® à¤‘à¤°à¥à¤¡à¤° à¤šà¤¾à¤¹à¤¿à¤? à¤¨à¥€à¤šà¥‡ à¤«à¤¼à¥‰à¤°à¥à¤® à¤­à¤°à¥‡à¤‚ à¤”à¤° à¤¹à¤® à¤†à¤ªà¤•à¤¾ à¤•à¥‹à¤Ÿà¥‡à¤¶à¤¨ à¤…à¤¨à¥à¤°à¥‹à¤§ à¤¸à¥€à¤§à¥‡ WhatsApp à¤ªà¤° à¤­à¥‡à¤œ à¤¦à¥‡à¤‚à¤—à¥‡à¥¤")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">{t("Full Name *", "à¤ªà¥‚à¤°à¤¾ à¤¨à¤¾à¤® *")}</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                required
                value={form.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.fullName ? "border-red-400" : "border-gray-300"}`}
                placeholder="Your full name"
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">{t("Phone Number *", "à¤«à¤¼à¥‹à¤¨ à¤¨à¤‚à¤¬à¤° *")}</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={form.phone}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.phone ? "border-red-400" : "border-gray-300"}`}
                placeholder="Your phone number"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t("Email", "à¤ˆà¤®à¥‡à¤²")}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">{t("Company Name", "à¤•à¤‚à¤ªà¤¨à¥€ à¤•à¤¾ à¤¨à¤¾à¤®")}</label>
              <input
                type="text"
                id="company"
                name="company"
                value={form.company}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Your company name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">{t("Product Category", "à¤‰à¤¤à¥à¤ªà¤¾à¤¦à¤¨ à¤¶à¥à¤°à¥‡à¤£à¥€")}</label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="">{t("Select a category", "à¤¶à¥à¤°à¥‡à¤£à¥€ à¤šà¥à¤¨à¥‡à¤‚")}</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">{t("Quantity Required *", "à¤†à¤µà¤¶à¥à¤¯à¤• à¤®à¤¾à¤¤à¥à¤°à¤¾ *")}</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                required
                min={10}
                value={form.quantity}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.quantity ? "border-red-400" : "border-gray-300"}`}
                placeholder={t("Minimum 10 units", "à¤•à¤® à¤¸à¥‡ à¤•à¤® 10 à¤¯à¥‚à¤¨à¤¿à¤Ÿ")}
              />
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
            </div>
          </div>

          <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">{t("Product Description / Requirements *", "à¤‰à¤¤à¥à¤ªà¤¾à¤¦à¤¨ à¤µà¤¿à¤µà¤°à¤£ / à¤†à¤µà¤¶à¥à¤¯à¤•à¤¤à¤¾à¤à¤‚ *")}</label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={form.description}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.description ? "border-red-400" : "border-gray-300"}`}
              placeholder={t("Describe the products you need - colors, sizes, specifications, or any other requirements", "à¤†à¤ªà¤•à¥‹ à¤•à¥Œà¤¨ à¤¸à¥‡ à¤‰à¤¤à¥à¤ªà¤¾à¤¦à¤¨ à¤šà¤¾à¤¹à¤¿à¤ - à¤°à¤‚à¤—, à¤†à¤•à¤¾à¤°, à¤µà¤¿à¤¨à¤¿à¤°à¥à¤¦à¥‡à¤¶, à¤¯à¤¾ à¤…à¤¨à¥à¤¯ à¤†à¤µà¤¶à¥à¤¯à¤•à¤¤à¤¾à¤à¤‚ à¤²à¤¿à¤–à¥‡à¤‚")}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">{t("Preferred Brand", "à¤ªà¤¸à¤‚à¤¦à¥€à¤¦à¤¾ à¤¬à¥à¤°à¤¾à¤‚à¤¡")}</label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={form.brand}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t("e.g. Aristo, Milton, KG Plast", "à¤œà¥ˆà¤¸à¥‡ Aristo, Milton, KG Plast")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">{t("Delivery Location", "à¤¡à¤¿à¤²à¥€à¤µà¤°à¥€ à¤¸à¥à¤¥à¤¾à¤¨")}</label>
              <input
                type="text"
                id="location"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={t("City or area for delivery", "à¤¡à¤¿à¤²à¥€à¤µà¤°à¥€ à¤•à¥‡ à¤²à¤¿à¤ à¤¶à¤¹à¤° à¤¯à¤¾ à¤•à¥à¤·à¥‡à¤¤à¥à¤°")}
              />
            </div>
            <div>
              <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-1">{t("Expected Delivery Date", "à¤…à¤ªà¥‡à¤•à¥à¤·à¤¿à¤¤ à¤¡à¤¿à¤²à¥€à¤µà¤°à¥€ à¤¤à¤¿à¤¥à¤¿")}</label>
              <input
                type="date"
                id="deliveryDate"
                name="deliveryDate"
                value={form.deliveryDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary-500 text-white font-semibold py-3 rounded-lg hover:bg-primary-600 transition-colors"
          >
            {t("Submit Quote Request", "à¤•à¥‹à¤Ÿà¥‡à¤¶à¤¨ à¤…à¤¨à¥à¤°à¥‹à¤§ à¤­à¥‡à¤œà¥‡à¤‚")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            {t("Prefer to chat directly?", "à¤¸à¥€à¤§à¥‡ à¤šà¥ˆà¤Ÿ à¤•à¤°à¤¨à¤¾ à¤šà¤¾à¤¹à¤¤à¥‡ à¤¹à¥ˆà¤‚?")}{" "}
            <a
              href={`https://wa.me/${PHONE}?text=${encodeURIComponent(`Namaste!\n\nI need a quote for bulk plastic products from ${BUSINESS_NAME}.\n\nKindly share pricing and availability.\n\nThank you!`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-500 hover:underline font-medium"
            >
              {t("Message us on WhatsApp", "WhatsApp à¤ªà¤° à¤¸à¤‚à¤¦à¥‡à¤¶ à¤­à¥‡à¤œà¥‡à¤‚")}
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
