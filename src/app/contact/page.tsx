"use client";

import { useState } from "react";
import Link from "next/link";
import { MdCheck } from "react-icons/md";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BUSINESS_NAME, PHONE, PHONE_DISPLAY, ADDRESS, CITY } from "@/lib/seo";

const SERVICE_AREAS = ["Bhayander", "Naigaon", "Vasai", "Virar", "Mumbai", "Thane", "Palghar"];

const BUSINESS_HOURS = [
  { day: "Monday", hours: "9:00 AM – 8:00 PM" },
  { day: "Tuesday", hours: "9:00 AM – 8:00 PM" },
  { day: "Wednesday", hours: "9:00 AM – 8:00 PM" },
  { day: "Thursday", hours: "9:00 AM – 8:00 PM" },
  { day: "Friday", hours: "9:00 AM – 8:00 PM" },
  { day: "Saturday", hours: "9:00 AM – 8:00 PM" },
  { day: "Sunday", hours: "Closed" },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hi, I'm ${name}. ${message} Contact: ${phone}`;
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`, "_blank");
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: "Contact" }]} />

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Contact {BUSINESS_NAME}</h1>
        <p className="text-gray-600 mb-8 max-w-2xl">
          Get in touch with {BUSINESS_NAME} — your trusted plastic products distributor and bulk seller in {CITY}, Mumbai.
          Whether you need a single product or bulk quantities, we&apos;re here to help.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Send Us a Message</h2>
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <p className="text-green-700 font-medium mb-2">Message Sent!</p>
                <p className="text-green-600 text-sm">We&apos;ll get back to you on WhatsApp shortly.</p>
                <button
                  onClick={() => { setSubmitted(false); setName(""); setPhone(""); setMessage(""); }}
                  className="mt-4 text-orange-500 hover:underline text-sm"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Your phone number"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Tell us about your requirements (products, quantity, etc.)"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-orange-500 text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Send via WhatsApp
                </button>
              </form>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Address</h3>
                  <p className="text-gray-600 text-sm">{ADDRESS}</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Phone</h3>
                  <a href={`tel:${PHONE}`} className="text-orange-500 hover:underline text-sm">{PHONE_DISPLAY}</a>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">WhatsApp</h3>
                  <a href={`https://wa.me/${PHONE}`} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline text-sm">{PHONE_DISPLAY}</a>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Email</h3>
                  <a href="mailto:info@shreegurudevplastics.com" className="text-orange-500 hover:underline text-sm">info@shreegurudevplastics.com</a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Business Hours</h2>
              <div className="space-y-2">
                {BUSINESS_HOURS.map((item) => (
                  <div key={item.day} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.day}</span>
                    <span className={`font-medium ${item.hours === "Closed" ? "text-red-500" : "text-gray-900"}`}>{item.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Service Areas</h2>
          <p className="text-gray-600 mb-6">
            We deliver plastic products across the Mumbai metropolitan region. Order from {BUSINESS_NAME} from any of these locations:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SERVICE_AREAS.map((area) => (
              <div key={area} className="bg-gray-50 rounded-lg p-3 text-center">
                <span className="text-gray-900 font-medium text-sm">{area}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Sell</h2>
          <p className="text-gray-600 mb-4 text-sm">
            As a leading plastic products distributor in {CITY}, we offer a wide range of products including:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {["Plastic Chairs", "Plastic Tables", "Plastic Buckets", "Plastic Containers", "Plastic Stools", "Plastic Storage", "Plastic Kitchenware", "Plastic Baskets", "Plastic Trays"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="text-orange-500"><MdCheck /></span>
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
          <Link href="/products" className="inline-block mt-4 text-orange-500 hover:underline text-sm font-medium">Browse All Products →</Link>
        </section>

        <section className="bg-gray-900 text-white rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Quick Contact</h2>
          <p className="text-gray-300 mb-6">Prefer a quick chat? Reach us directly on WhatsApp.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`https://wa.me/${PHONE}?text=${encodeURIComponent("Hi, I'd like to inquire about your plastic products.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat on WhatsApp
            </a>
            <Link
              href="/quote"
              className="inline-flex items-center justify-center gap-2 bg-orange-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Request a Quote
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
