"use client";

import { useEffect, useState, useCallback } from "react";
import { MdSearch, MdFilterList, MdOpenInNew, MdCheckCircle, MdPending, MdArchive, MdContentCopy, MdChat, MdLocalOffer } from "react-icons/md";
import { useToast } from "@/components/Toast";
import { PHONE } from "@/lib/seo";

interface Enquiry {
  id: number;
  productId: number | null;
  productName: string;
  productUrl: string | null;
  customerName: string | null;
  customerPhone: string | null;
  message: string;
  source: string;
  status: string;
  note: string | null;
  productPrice: number | null;
  productColor: string | null;
  brandName: string | null;
  createdAt: string;
}

const REPLY_TEMPLATES = [
  {
    label: "Price Quote",
    icon: MdLocalOffer,
    template: (e: Enquiry) =>
      `Namaste!\n\nThank you for your enquiry about ${e.productName}${e.productColor ? ` (${e.productColor})` : ""}.\n\n${e.brandName ? `Brand: ${e.brandName}\n` : ""}Price: Rs.${e.productPrice?.toLocaleString("en-IN") ?? "Contact for price"}\n\nFor bulk orders (50+ units), we offer special discounts.\n\nKindly share your pincode for delivery details.\n\nThank you!\nShree Gurudev Plastics`,
  },
  {
    label: "Stock & Delivery",
    icon: MdChat,
    template: (e: Enquiry) =>
      `Namaste!\n\n${e.productName} is currently available in stock.\n\nDelivery typically takes 3-5 business days depending on your location.\n\nPlease share your pincode and we will confirm delivery availability and charges.\n\nThank you!\nShree Gurudev Plastics`,
  },
  {
    label: "Bulk Discount",
    icon: MdLocalOffer,
    template: (e: Enquiry) =>
      `Namaste!\n\nThank you for your interest in ${e.productName}.\n\nWe offer attractive bulk pricing:\n- 50+ units: 10% off\n- 100+ units: 15% off\n- 500+ units: 20% off\n\nPlease let us know your required quantity.\n\nThank you!\nShree Gurudev Plastics`,
  },
  {
    label: "Share Catalogue",
    icon: MdChat,
    template: () =>
      `Namaste!\n\nThank you for your enquiry.\n\nPlease visit our catalogue to explore our full range:\nhttps://shree-gurudev-plastics.vercel.app/products\n\nFeel free to ask about any product.\n\nThank you!\nShree Gurudev Plastics`,
  },
  {
    label: "Custom Message",
    icon: MdChat,
    template: (e: Enquiry) =>
      `Namaste!\n\nRegarding your enquiry about ${e.productName}...\n\n[Write your message here]\n\nThank you!\nShree Gurudev Plastics`,
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ComponentType<{ size?: number }> }> = {
  new: { label: "New", color: "text-blue-400", bg: "bg-blue-500/15", icon: MdPending },
  replied: { label: "Replied", color: "text-green-400", bg: "bg-green-500/15", icon: MdCheckCircle },
  closed: { label: "Closed", color: "text-gray-400", bg: "bg-gray-500/15", icon: MdArchive },
};

export default function EnquiriesPage() {
  const { toast } = useToast();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50", offset: "0" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/enquiries?${params}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) console.error("[enquiries] GET failed:", data);
      setEnquiries(data.enquiries || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error("[enquiries] fetch error:", e);
      toast("Failed to load enquiries", "error");
    }
    setLoading(false);
  }, [statusFilter, search, toast]);

  useEffect(() => { fetchEnquiries(); }, [fetchEnquiries]);

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
      if (selectedEnquiry?.id === id) setSelectedEnquiry((prev) => (prev ? { ...prev, status } : null));
      toast(`Marked as ${STATUS_CONFIG[status]?.label || status}`);
    } catch {
      toast("Failed to update", "error");
    }
  };

  const copyTemplate = (template: string) => {
    navigator.clipboard.writeText(template);
    toast("Template copied to clipboard!");
  };

  const openWhatsApp = (phone: string, message: string) => {
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const statusCounts = enquiries.reduce(
    (acc, e) => { acc[e.status] = (acc[e.status] || 0) + 1; return acc; },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Enquiries</h1>
        <p className="text-sm text-gray-400 mt-1">{total} total enquiries from customers</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MdSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by product, name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchEnquiries()}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-700 bg-gray-800 rounded-lg text-sm text-white placeholder-gray-500 outline-none focus:border-primary-500"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "new", "replied", "closed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                statusFilter === s
                  ? "bg-primary-500 text-white"
                  : "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700"
              }`}
            >
              {s === "all" ? "All" : STATUS_CONFIG[s]?.label}
              {s !== "all" && statusCounts[s] ? ` (${statusCounts[s]})` : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : enquiries.length === 0 ? (
            <div className="rounded-xl bg-gray-900 border border-gray-800 py-12 text-center text-gray-500">No enquiries found</div>
          ) : (
            enquiries.map((enquiry) => {
              const cfg = STATUS_CONFIG[enquiry.status] || STATUS_CONFIG.new;
              const Icon = cfg.icon;
              return (
                <div
                  key={enquiry.id}
                  onClick={() => { setSelectedEnquiry(enquiry); setShowTemplates(false); }}
                  className={`bg-gray-900 border rounded-xl p-4 cursor-pointer transition-all hover:bg-gray-800/80 ${
                    selectedEnquiry?.id === enquiry.id ? "border-primary-500 ring-1 ring-primary-500/30" : "border-gray-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${cfg.color} ${cfg.bg}`}>
                          <Icon size={11} /> {cfg.label}
                        </span>
                        <span className="text-[11px] text-gray-500">{formatDate(enquiry.createdAt)}</span>
                      </div>
                      <h3 className="font-semibold text-gray-100 text-sm truncate">{enquiry.productName}</h3>
                      {enquiry.brandName && <p className="text-xs text-gray-400">{enquiry.brandName}</p>}
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{enquiry.message}</p>
                      {enquiry.customerName && (
                        <p className="text-[11px] text-gray-500 mt-1">From: {enquiry.customerName}{enquiry.customerPhone ? ` (${enquiry.customerPhone})` : ""}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      {enquiry.status === "new" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); updateStatus(enquiry.id, "replied"); }}
                          className="text-[10px] font-medium text-green-400 bg-green-500/15 px-2 py-1 rounded-md hover:bg-green-500/25"
                        >
                          Mark Replied
                        </button>
                      )}
                      {enquiry.status !== "closed" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); updateStatus(enquiry.id, "closed"); }}
                          className="text-[10px] font-medium text-gray-400 bg-gray-700/50 px-2 py-1 rounded-md hover:bg-gray-700"
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="space-y-4">
          {selectedEnquiry ? (
            <>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <h3 className="font-semibold text-gray-100 text-sm mb-3">Enquiry Details</h3>
                <div className="space-y-2 text-xs">
                  <div><span className="text-gray-500">Product:</span> <span className="font-medium text-gray-200">{selectedEnquiry.productName}</span></div>
                  {selectedEnquiry.brandName && <div><span className="text-gray-500">Brand:</span> <span className="font-medium text-gray-200">{selectedEnquiry.brandName}</span></div>}
                  {selectedEnquiry.productPrice && <div><span className="text-gray-500">Price:</span> <span className="font-medium text-primary-400">Rs.{selectedEnquiry.productPrice.toLocaleString("en-IN")}</span></div>}
                  {selectedEnquiry.customerName && <div><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-200">{selectedEnquiry.customerName}</span></div>}
                  {selectedEnquiry.customerPhone && <div><span className="text-gray-500">Phone:</span> <span className="font-medium text-gray-200">{selectedEnquiry.customerPhone}</span></div>}
                  <div><span className="text-gray-500">Source:</span> <span className="font-medium text-gray-200 capitalize">{selectedEnquiry.source}</span></div>
                  <div><span className="text-gray-500">Time:</span> <span className="font-medium text-gray-200">{new Date(selectedEnquiry.createdAt).toLocaleString("en-IN")}</span></div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-800">
                  <p className="text-[11px] text-gray-500 mb-1">Customer message:</p>
                  <p className="text-xs text-gray-300 bg-gray-800 rounded-lg p-2 whitespace-pre-wrap">{selectedEnquiry.message}</p>
                </div>
                <div className="flex gap-2 mt-3">
                  {selectedEnquiry.status === "new" && (
                    <button onClick={() => updateStatus(selectedEnquiry.id, "replied")} className="flex-1 text-xs font-medium text-white bg-green-500 hover:bg-green-600 py-2 rounded-lg transition-colors">
                      Mark Replied
                    </button>
                  )}
                  {selectedEnquiry.status !== "closed" && (
                    <button onClick={() => updateStatus(selectedEnquiry.id, "closed")} className="flex-1 text-xs font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg transition-colors">
                      Close
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="w-full flex items-center justify-between text-sm font-semibold text-gray-100"
                >
                  Quick Reply Templates
                  <MdFilterList size={16} className={`transition-transform text-gray-400 ${showTemplates ? "rotate-180" : ""}`} />
                </button>
                {showTemplates && (
                  <div className="mt-3 space-y-2">
                    {REPLY_TEMPLATES.map((tpl) => {
                      const TplIcon = tpl.icon;
                      const filled = tpl.template(selectedEnquiry);
                      return (
                        <div key={tpl.label} className="border border-gray-700/50 rounded-lg p-2.5 hover:bg-gray-800 transition-colors">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                              <TplIcon size={13} className="text-primary-400" /> {tpl.label}
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => copyTemplate(filled)}
                                className="p-1 text-gray-500 hover:text-primary-400 transition-colors"
                                title="Copy to clipboard"
                              >
                                <MdContentCopy size={13} />
                              </button>
                              {selectedEnquiry.customerPhone && (
                                <button
                                  onClick={() => openWhatsApp(selectedEnquiry.customerPhone!, filled)}
                                  className="p-1 text-gray-500 hover:text-green-400 transition-colors"
                                  title="Open in WhatsApp"
                                >
                                  <MdOpenInNew size={13} />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-500 whitespace-pre-wrap line-clamp-3">{filled}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-500 text-sm">
              Select an enquiry to view details and reply templates
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
