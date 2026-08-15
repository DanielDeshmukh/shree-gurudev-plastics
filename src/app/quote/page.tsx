"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BUSINESS_NAME, CITY } from "@/lib/seo";

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
    window.open(`https://wa.me/918552084251?text=${encodeURIComponent(message)}`, "_blank");
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Quote Request Sent!</h1>
            <p className="text-gray-600 mb-6">
              Thank you, {form.fullName}! Your quote request has been sent to {BUSINESS_NAME} via WhatsApp.
              We&apos;ll get back to you with pricing and availability shortly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={resetForm}
                className="bg-primary-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
              >
                Send Another Request
              </button>
              <Link
                href="/products"
                className="bg-gray-100 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Browse Products
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
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Request a Quote</h1>
          <p className="text-gray-600 max-w-2xl">
            Need bulk pricing or custom orders? Fill out the form below and we&apos;ll send your quote request directly to {BUSINESS_NAME} via WhatsApp.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
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
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
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
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Product Category</label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity Required *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                required
                min={10}
                value={form.quantity}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.quantity ? "border-red-400" : "border-gray-300"}`}
                placeholder="Minimum 10 units"
              />
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Product Description / Requirements *</label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={form.description}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.description ? "border-red-400" : "border-gray-300"}`}
              placeholder="Describe the products you need — colors, sizes, specifications, or any other requirements"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">Preferred Brand</label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={form.brand}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. Aristo, Milton, KG Plast"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Delivery Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="City or area for delivery"
              />
            </div>
            <div>
              <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date</label>
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
            Submit Quote Request
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Prefer to chat directly?{" "}
            <a
              href={`https://wa.me/918552084251?text=${encodeURIComponent(`Hi ${BUSINESS_NAME}, I need a quote for bulk plastic products.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-500 hover:underline font-medium"
            >
              Message us on WhatsApp
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
