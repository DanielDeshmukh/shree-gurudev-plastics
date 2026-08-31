import type { Metadata } from "next";
import Link from "next/link";
import { Cormorant_Garamond, Lora } from "next/font/google";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getBreadcrumbSchema, SITE_URL, BUSINESS_NAME, ADDRESS, PHONE_DISPLAY } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy — Shree Gurudev Plastics",
  description: "Privacy Policy of Shree Gurudev Plastics. Learn how we collect, use, protect, and share your personal information when you use our website and services.",
  keywords: ["privacy policy", "Shree Gurudev Plastics privacy", "data protection", "wholesale plastic products privacy"],
  alternates: { canonical: `${SITE_URL}/privacy-policy` },
  openGraph: {
    title: "Privacy Policy — Shree Gurudev Plastics",
    description: "Learn how we collect, use, and protect your personal information.",
    url: `${SITE_URL}/privacy-policy`,
    siteName: BUSINESS_NAME,
    locale: "en_IN",
    type: "website",
  },
};

const breadcrumbs = getBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Privacy Policy", url: "/privacy-policy" },
]);

const headingFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-heading",
});

const bodyFont = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-body",
});

const lastUpdated = "31 August 2026";

export default function PrivacyPolicyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      <div className={`${headingFont.variable} ${bodyFont.variable} font-body`}>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />

          <div className="mt-8 mb-12 text-center">
            <p className="text-sm tracking-[0.25em] uppercase text-primary-600 font-semibold mb-3 font-heading">Shree Gurudev Plastics</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4 font-heading">Privacy Policy</h1>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary-500 to-transparent mx-auto mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">Effective Date: {lastUpdated}</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 px-6 sm:px-10 py-10 sm:py-14">

            <div className="space-y-10">

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-heading border-b border-gray-100 dark:border-gray-800 pb-2">1. Introduction</h2>
                <div className="space-y-4 text-[15px] leading-[1.85]">
                  <p>
                    Welcome to <strong>{BUSINESS_NAME}</strong> (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). We operate the website{" "}
                    <Link href="/" className="text-primary-600 hover:text-primary-700 underline decoration-primary-300 underline-offset-2 transition-colors">
                      shree-gurudev-plastics.vercel.app
                    </Link>{" "}
                    and provide wholesale and retail distribution of plastic products from our warehouse at {ADDRESS}.
                  </p>
                  <p>
                    This Privacy Policy explains how we collect, use, store, share, and protect your personal information when you visit our website, place orders, or use our services. By using our website, you consent to the practices described in this policy.
                  </p>
                  <p>
                    This policy is in compliance with the <strong>Information Technology Act, 2000</strong>, the{" "}
                    <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>,
                    and the <strong>Digital Personal Data Protection Act, 2023</strong> (DPDP Act) of India.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-heading border-b border-gray-100 dark:border-gray-800 pb-2">2. Information We Collect</h2>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-2 font-heading">2.1 Personal Information</h3>
                <p className="text-[15px] leading-[1.85] mb-3">We may collect the following personal information when you interact with our website or services:</p>
                <ul className="list-none space-y-2 text-[15px] leading-[1.85]">
                  {["Full name", "Phone number (including WhatsApp number)", "Email address", "Delivery and billing address (including pincode)", "Business name and GST number (for wholesale/B2B customers)", "Payment information (processed securely through Razorpay; we do not store card/bank details on our servers)"].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-2 font-heading">2.2 Non-Personal Information</h3>
                <p className="text-[15px] leading-[1.85] mb-3">When you visit our website, we automatically collect:</p>
                <ul className="list-none space-y-2 text-[15px] leading-[1.85]">
                  {["Browser type and version", "Operating system", "IP address", "Pages visited and time spent on each page", "Referring website or source", "Device type (desktop, mobile, tablet)", "Location data (city/state level, derived from IP address)"].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-2 font-heading">2.3 Cookies and Similar Technologies</h3>
                <p className="text-[15px] leading-[1.85]">
                  We use cookies and local storage to enhance your browsing experience. Cookies help us remember your cart items, recently viewed products, wishlist, language preferences, and authentication state. You can control cookie settings through your browser. Disabling cookies may affect certain features of the website.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-heading border-b border-gray-100 dark:border-gray-800 pb-2">3. How We Use Your Information</h2>
                <p className="text-[15px] leading-[1.85] mb-3">We use the collected information for the following purposes:</p>
                <ul className="list-none space-y-3 text-[15px] leading-[1.85]">
                  {[
                    { label: "Order Processing", desc: "To process, fulfill, and deliver your orders for plastic products." },
                    { label: "Communication", desc: "To send order confirmations, delivery updates, and respond to your enquiries via WhatsApp, phone, or email." },
                    { label: "Customer Support", desc: "To provide assistance, handle complaints, and resolve issues related to products or orders." },
                    { label: "Payment Processing", desc: "To facilitate secure payment collection through our payment gateway partner (Razorpay)." },
                    { label: "Website Improvement", desc: "To analyze usage patterns, improve website functionality, and enhance user experience." },
                    { label: "Marketing", desc: "To send promotional offers, new product announcements, and seasonal deals (only with your consent; you may opt out at any time)." },
                    { label: "Legal Compliance", desc: "To comply with applicable Indian laws, tax regulations, and government orders." },
                    { label: "Fraud Prevention", desc: "To detect and prevent fraudulent activities, unauthorized access, and abuse of our services." },
                    { label: "Business Operations", desc: "To maintain internal records, manage inventory, and generate business analytics." },
                  ].map(({ label, desc }) => (
                    <li key={label} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary-500 shrink-0" />
                      <span><strong>{label}:</strong> {desc}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-heading border-b border-gray-100 dark:border-gray-800 pb-2">4. How We Share Your Information</h2>
                <p className="text-[15px] leading-[1.85] mb-3">
                  We do <strong>not</strong> sell, rent, or trade your personal information to third parties. We may share your information only in the following circumstances:
                </p>
                <ul className="list-none space-y-3 text-[15px] leading-[1.85]">
                  {[
                    { label: "Payment Gateway", desc: "Payment information is shared with Razorpay solely for processing transactions. Razorpay's privacy policy governs their handling of your payment data." },
                    { label: "Delivery Partners", desc: "Order delivery information (name, address, phone number) is shared with courier and logistics partners solely for order fulfillment and delivery." },
                    { label: "Legal Requirements", desc: "We may disclose your information if required by law, court order, or government authority under the Information Technology Act, 2000, or other applicable Indian laws." },
                    { label: "Business Transfers", desc: "In the event of a merger, acquisition, or sale of business assets, customer information may be transferred as part of the transaction, subject to the same privacy protections." },
                    { label: "Service Providers", desc: "We may share data with trusted third-party service providers (e.g., hosting, analytics) who are contractually obligated to protect your data and use it only for the services they provide to us." },
                  ].map(({ label, desc }) => (
                    <li key={label} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary-500 shrink-0" />
                      <span><strong>{label}:</strong> {desc}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-heading border-b border-gray-100 dark:border-gray-800 pb-2">5. Data Security</h2>
                <p className="text-[15px] leading-[1.85] mb-3">
                  We implement industry-standard security practices and procedures as mandated by the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011. Our security measures include:
                </p>
                <ul className="list-none space-y-2 text-[15px] leading-[1.85]">
                  {[
                    "SSL/TLS encryption for all data transmitted between your browser and our servers (HTTPS)",
                    "Secure payment processing through PCI-DSS compliant Razorpay (we never store card numbers, CVV, or bank credentials)",
                    "Encrypted password storage using industry-standard hashing algorithms (bcrypt)",
                    "Admin panel protected with JWT-based authentication and HTTP-only cookies",
                    "Regular security audits and access reviews",
                    "Content Security Policy (CSP) headers to prevent cross-site scripting (XSS) attacks",
                    "Strict rate limiting on sensitive endpoints to prevent brute-force attacks",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[15px] leading-[1.85] mt-4 italic text-gray-600 dark:text-gray-400">
                  While we take every reasonable precaution, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security of your data, but we promptly address and remediate any security vulnerabilities as they are identified.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-heading border-b border-gray-100 dark:border-gray-800 pb-2">6. Data Retention</h2>
                <p className="text-[15px] leading-[1.85] mb-3">
                  We retain your personal information only for as long as necessary to fulfill the purposes described in this policy, unless a longer retention period is required or permitted by law.
                </p>
                <ul className="list-none space-y-2 text-[15px] leading-[1.85]">
                  {[
                    { label: "Order Information", desc: "Retained for 8 years as required under Indian tax and GST regulations." },
                    { label: "Account Information", desc: "Retained for the duration of your account existence. You may request account deletion by contacting us." },
                    { label: "Enquiry Data", desc: "Retained for 2 years from the date of the enquiry for follow-up purposes." },
                    { label: "Website Analytics", desc: "Aggregated and anonymized analytics data may be retained indefinitely for business analysis." },
                    { label: "Cookies", desc: "Session cookies are deleted when you close your browser. Persistent cookies expire based on their defined lifespan (typically 30 days to 1 year)." },
                  ].map(({ label, desc }) => (
                    <li key={label} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary-500 shrink-0" />
                      <span><strong>{label}:</strong> {desc}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-heading border-b border-gray-100 dark:border-gray-800 pb-2">7. Your Rights</h2>
                <p className="text-[15px] leading-[1.85] mb-3">
                  Under the DPDP Act 2023 and applicable Indian data protection laws, you have the following rights:
                </p>
                <ul className="list-none space-y-2 text-[15px] leading-[1.85]">
                  {[
                    { label: "Right to Access", desc: "You may request a copy of the personal data we hold about you." },
                    { label: "Right to Correction", desc: "You may request correction of inaccurate or incomplete personal data." },
                    { label: "Right to Erasure", desc: "You may request deletion of your personal data, subject to legal retention requirements." },
                    { label: "Right to Grievance Redressal", desc: "You may lodge a complaint regarding the processing of your personal data by contacting our Grievance Officer (details below)." },
                    { label: "Right to Nominate", desc: "You may nominate another individual to exercise your rights in the event of your death or incapacity." },
                  ].map(({ label, desc }) => (
                    <li key={label} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary-500 shrink-0" />
                      <span><strong>{label}:</strong> {desc}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[15px] leading-[1.85] mt-4">
                  To exercise any of these rights, please contact us at{" "}
                  <Link href={`https://wa.me/${PHONE_DISPLAY?.replace(/[^0-9]/g, "")}`} className="text-primary-600 hover:text-primary-700 underline decoration-primary-300 underline-offset-2 transition-colors">
                    {PHONE_DISPLAY}
                  </Link>{" "}
                  or email our Grievance Officer.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-heading border-b border-gray-100 dark:border-gray-800 pb-2">8. Third-Party Links</h2>
                <p className="text-[15px] leading-[1.85]">
                  Our website may contain links to third-party websites, including social media platforms and partner websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to read the privacy policies of any third-party websites you visit.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-heading border-b border-gray-100 dark:border-gray-800 pb-2">9. Children&apos;s Privacy</h2>
                <p className="text-[15px] leading-[1.85]">
                  Our website and services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided personal information to us, please contact us immediately, and we will take steps to remove such information from our systems.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-heading border-b border-gray-100 dark:border-gray-800 pb-2">10. International Data Transfers</h2>
                <p className="text-[15px] leading-[1.85]">
                  Your data is primarily stored and processed within India. Our website is hosted on Vercel (USA) with data centers in India and globally distributed edge servers. Our database is hosted on Turso with servers located in India (AWS Mumbai region). We ensure that any international data transfers comply with applicable Indian data protection laws and that adequate safeguards are in place.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-heading border-b border-gray-100 dark:border-gray-800 pb-2">11. Changes to This Policy</h2>
                <p className="text-[15px] leading-[1.85]">
                  We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. Any material changes will be notified on this page with an updated &quot;Last updated&quot; date. We encourage you to review this page periodically. Your continued use of the website after any changes constitutes acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-heading border-b border-gray-100 dark:border-gray-800 pb-2">12. Grievance Officer</h2>
                <p className="text-[15px] leading-[1.85] mb-4">
                  In accordance with the Information Technology Act, 2000, and the DPDP Act, 2023, the name and contact details of our Grievance Officer are provided below:
                </p>
                <div className="bg-gradient-to-br from-primary-50 to-orange-50 dark:from-gray-800 dark:to-gray-800/50 rounded-xl p-6 space-y-2 border border-primary-100 dark:border-gray-700">
                  <p className="text-[15px]"><strong>Grievance Officer:</strong> {BUSINESS_NAME}</p>
                  <p className="text-[15px]"><strong>Address:</strong> {ADDRESS}</p>
                  <p className="text-[15px]"><strong>Phone:</strong> {PHONE_DISPLAY}</p>
                  <p className="text-[15px]"><strong>Email:</strong> contact@shreegurudevplastics.com</p>
                  <p className="text-[15px] italic text-gray-600 dark:text-gray-400 mt-3">
                    <strong>Response Time:</strong> We will acknowledge your grievance within 24 hours and resolve it within 30 days from the date of receipt, as required by law.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-heading border-b border-gray-100 dark:border-gray-800 pb-2">13. Governing Law and Jurisdiction</h2>
                <p className="text-[15px] leading-[1.85]">
                  This Privacy Policy shall be governed by and construed in accordance with the laws of India. Any disputes arising under this policy shall be subject to the exclusive jurisdiction of the courts in Maharashtra, India.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-heading border-b border-gray-100 dark:border-gray-800 pb-2">14. Contact Us</h2>
                <p className="text-[15px] leading-[1.85] mb-4">
                  If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please reach out to us:
                </p>
                <div className="bg-gradient-to-br from-primary-50 to-orange-50 dark:from-gray-800 dark:to-gray-800/50 rounded-xl p-6 space-y-2 border border-primary-100 dark:border-gray-700">
                  <p className="text-[15px] font-semibold font-heading">{BUSINESS_NAME}</p>
                  <p className="text-[15px]">{ADDRESS}</p>
                  <p className="text-[15px]">Phone: {PHONE_DISPLAY}</p>
                  <p className="text-[15px]">
                    WhatsApp:{" "}
                    <Link
                      href={`https://wa.me/918552084251?text=${encodeURIComponent("Hi, I have a question about your Privacy Policy.")}`}
                      target="_blank"
                      className="text-primary-600 hover:text-primary-700 underline decoration-primary-300 underline-offset-2 transition-colors"
                    >
                      Chat with us
                    </Link>
                  </p>
                </div>
              </section>

            </div>

            <div className="mt-14 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
              <p className="text-sm text-gray-400 dark:text-gray-500 italic font-body">
                This Privacy Policy was last reviewed and updated on {lastUpdated}.
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">
                &copy; {new Date().getFullYear()} {BUSINESS_NAME}. All rights reserved.
              </p>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
