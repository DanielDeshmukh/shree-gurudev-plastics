import type { Metadata } from "next";
import Link from "next/link";
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

const lastUpdated = "31 August 2026";

export default function PrivacyPolicyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-6 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: {lastUpdated}</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">1. Introduction</h2>
            <p>
              Welcome to <strong>{BUSINESS_NAME}</strong> (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). We operate the website <Link href="/" className="text-primary-500 hover:underline">shree-gurudev-plastics.vercel.app</Link> and provide wholesale and retail distribution of plastic products from our warehouse at {ADDRESS}.
            </p>
            <p>
              This Privacy Policy explains how we collect, use, store, share, and protect your personal information when you visit our website, place orders, or use our services. By using our website, you consent to the practices described in this policy.
            </p>
            <p>
              This policy is in compliance with the <strong>Information Technology Act, 2000</strong>, the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>, and the <strong>Digital Personal Data Protection Act, 2023</strong> (DPDP Act) of India.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">2. Information We Collect</h2>

            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4 mb-2">2.1 Personal Information</h3>
            <p>We may collect the following personal information when you interact with our website or services:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Full name</li>
              <li>Phone number (including WhatsApp number)</li>
              <li>Email address</li>
              <li>Delivery and billing address (including pincode)</li>
              <li>Business name and GST number (for wholesale/B2B customers)</li>
              <li>Payment information (processed securely through Razorpay; we do not store card/bank details on our servers)</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4 mb-2">2.2 Non-Personal Information</h3>
            <p>When you visit our website, we automatically collect:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>IP address</li>
              <li>Pages visited and time spent on each page</li>
              <li>Referring website or source</li>
              <li>Device type (desktop, mobile, tablet)</li>
              <li>Location data (city/state level, derived from IP address)</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4 mb-2">2.3 Cookies and Similar Technologies</h3>
            <p>
              We use cookies and local storage to enhance your browsing experience. Cookies help us remember your cart items, recently viewed products, wishlist, language preferences, and authentication state. You can control cookie settings through your browser. Disabling cookies may affect certain features of the website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">3. How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Order Processing:</strong> To process, fulfill, and deliver your orders for plastic products.</li>
              <li><strong>Communication:</strong> To send order confirmations, delivery updates, and respond to your enquiries via WhatsApp, phone, or email.</li>
              <li><strong>Customer Support:</strong> To provide assistance, handle complaints, and resolve issues related to products or orders.</li>
              <li><strong>Payment Processing:</strong> To facilitate secure payment collection through our payment gateway partner (Razorpay).</li>
              <li><strong>Website Improvement:</strong> To analyze usage patterns, improve website functionality, and enhance user experience.</li>
              <li><strong>Marketing:</strong> To send promotional offers, new product announcements, and seasonal deals (only with your consent; you may opt out at any time).</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable Indian laws, tax regulations, and government orders.</li>
              <li><strong>Fraud Prevention:</strong> To detect and prevent fraudulent activities, unauthorized access, and abuse of our services.</li>
              <li><strong>Business Operations:</strong> To maintain internal records, manage inventory, and generate business analytics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">4. How We Share Your Information</h2>
            <p>We do <strong>not</strong> sell, rent, or trade your personal information to third parties. We may share your information only in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Payment Gateway:</strong> Payment information is shared with Razorpay (https://razorpay.com) solely for processing transactions. Razorpay&apos;s privacy policy governs their handling of your payment data.</li>
              <li><strong>Delivery Partners:</strong> Order delivery information (name, address, phone number) is shared with courier and logistics partners solely for order fulfillment and delivery.</li>
              <li><strong>Legal Requirements:</strong> We may disclose your information if required by law, court order, or government authority under the Information Technology Act, 2000, or other applicable Indian laws.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of business assets, customer information may be transferred as part of the transaction, subject to the same privacy protections.</li>
              <li><strong>Service Providers:</strong> We may share data with trusted third-party service providers (e.g., hosting, analytics) who are contractually obligated to protect your data and use it only for the services they provide to us.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">5. Data Security</h2>
            <p>
              We implement industry-standard security practices and procedures as mandated by the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011. Our security measures include:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>SSL/TLS encryption for all data transmitted between your browser and our servers (HTTPS)</li>
              <li>Secure payment processing through PCI-DSS compliant Razorpay (we never store card numbers, CVV, or bank credentials)</li>
              <li>Encrypted password storage using industry-standard hashing algorithms (bcrypt)</li>
              <li>Admin panel protected with JWT-based authentication and HTTP-only cookies</li>
              <li>Regular security audits and access reviews</li>
              <li>Content Security Policy (CSP) headers to prevent cross-site scripting (XSS) attacks</li>
              <li>Strict rate limiting on sensitive endpoints to prevent brute-force attacks</li>
            </ul>
            <p>
              While we take every reasonable precaution, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security of your data, but we promptly address and remediate any security vulnerabilities as they are identified.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">6. Data Retention</h2>
            <p>
              We retain your personal information only for as long as necessary to fulfill the purposes described in this policy, unless a longer retention period is required or permitted by law.
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Order Information:</strong> Retained for 8 years as required under Indian tax and GST regulations.</li>
              <li><strong>Account Information:</strong> Retained for the duration of your account existence. You may request account deletion by contacting us.</li>
              <li><strong>Enquiry Data:</strong> Retained for 2 years from the date of the enquiry for follow-up purposes.</li>
              <li><strong>Website Analytics:</strong> Aggregated and anonymized analytics data may be retained indefinitely for business analysis.</li>
              <li><strong>Cookies:</strong> Session cookies are deleted when you close your browser. Persistent cookies expire based on their defined lifespan (typically 30 days to 1 year).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">7. Your Rights</h2>
            <p>Under the DPDP Act 2023 and applicable Indian data protection laws, you have the following rights:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Right to Access:</strong> You may request a copy of the personal data we hold about you.</li>
              <li><strong>Right to Correction:</strong> You may request correction of inaccurate or incomplete personal data.</li>
              <li><strong>Right to Erasure:</strong> You may request deletion of your personal data, subject to legal retention requirements.</li>
              <li><strong>Right to Grievance Redressal:</strong> You may lodge a complaint regarding the processing of your personal data by contacting our Grievance Officer (details below).</li>
              <li><strong>Right to Nominate:</strong> You may nominate another individual to exercise your rights in the event of your death or incapacity.</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at <Link href={`https://wa.me/${PHONE_DISPLAY?.replace(/[^0-9]/g, "")}`} className="text-primary-500 hover:underline">{PHONE_DISPLAY}</Link> or email our Grievance Officer.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">8. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites, including social media platforms and partner websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to read the privacy policies of any third-party websites you visit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">9. Children&apos;s Privacy</h2>
            <p>
              Our website and services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided personal information to us, please contact us immediately, and we will take steps to remove such information from our systems.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">10. International Data Transfers</h2>
            <p>
              Your data is primarily stored and processed within India. Our website is hosted on Vercel (USA) with data centers in India and globally distributed edge servers. Our database is hosted on Turso with servers located in India (AWS Mumbai region). We ensure that any international data transfers comply with applicable Indian data protection laws and that adequate safeguards are in place.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. Any material changes will be notified on this page with an updated &quot;Last updated&quot; date. We encourage you to review this page periodically. Your continued use of the website after any changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">12. Grievance Officer</h2>
            <p>
              In accordance with the Information Technology Act, 2000, and the DPDP Act, 2023, the name and contact details of our Grievance Officer are provided below:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5 mt-4 space-y-2 border border-gray-200 dark:border-gray-700">
              <p><strong>Grievance Officer:</strong> Shree Gurudev Plastics</p>
              <p><strong>Address:</strong> {ADDRESS}</p>
              <p><strong>Phone:</strong> {PHONE_DISPLAY}</p>
              <p><strong>Email:</strong> contact@shreegurudevplastics.com</p>
              <p><strong>Response Time:</strong> We will acknowledge your grievance within 24 hours and resolve it within 30 days from the date of receipt, as required by law.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">13. Governing Law and Jurisdiction</h2>
            <p>
              This Privacy Policy shall be governed by and construed in accordance with the laws of India. Any disputes arising under this policy shall be subject to the exclusive jurisdiction of the courts in Maharashtra, India.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">14. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please reach out to us:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5 mt-4 space-y-2 border border-gray-200 dark:border-gray-700">
              <p><strong>Shree Gurudev Plastics</strong></p>
              <p>{ADDRESS}</p>
              <p>Phone: {PHONE_DISPLAY}</p>
              <p>
                WhatsApp:{" "}
                <Link href={`https://wa.me/918552084251?text=${encodeURIComponent("Hi, I have a question about your Privacy Policy.")}`} target="_blank" className="text-primary-500 hover:underline">
                  Chat with us
                </Link>
              </p>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
