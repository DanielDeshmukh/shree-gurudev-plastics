"use client";

import { useEffect, useState } from "react";
import { MdCampaign, MdMessage, MdCheckCircle } from "react-icons/md";

interface Customer {
  id: number;
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  tier: string;
}

interface GeneratedMessage {
  id: number;
  name: string;
  phone: string;
  message: string;
  whatsappUrl: string;
}

const FESTIVAL_OPTIONS = [
  { value: "diwali", label: "Diwali", emoji: "🪔" },
  { value: "raksha_bandhan", label: "Raksha Bandhan", emoji: "🎀" },
  { value: "holi", label: "Holi", emoji: "🎨" },
  { value: "new_year", label: "New Year", emoji: "🎉" },
  { value: "navratri", label: "Navratri", emoji: "🙏" },
  { value: "christmas", label: "Christmas", emoji: "🎄" },
  { value: "pongal", label: "Pongal", emoji: "🌾" },
  { value: "eid", label: "Eid", emoji: "🌙" },
];

export default function BroadcastPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [templates, setTemplates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [generated, setGenerated] = useState<GeneratedMessage[]>([]);
  const [sending, setSending] = useState<number | null>(null);
  const [sentIds, setSentIds] = useState<number[]>([]);

  useEffect(() => {
    fetch("/api/admin/broadcast")
      .then((r) => r.json())
      .then((d) => {
        setCustomers(d.customers || []);
        setTemplates(d.templates || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleSelectAll = () => {
    if (selectedIds.length === customers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(customers.map((c) => c.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!selectedTemplate && !customMessage.trim()) return;
    setGenerated([]);
    setSentIds([]);

    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerIds: selectedIds.length > 0 ? selectedIds : undefined,
          template: selectedTemplate || undefined,
          customMessage: customMessage.trim() || undefined,
        }),
      });
      const data = await res.json();
      setGenerated(data.messages || []);
    } catch {}
  };

  const handleSend = (msg: GeneratedMessage) => {
    setSending(msg.id);
    window.open(msg.whatsappUrl, "_blank");
    setTimeout(() => {
      setSentIds((prev) => [...prev, msg.id]);
      setSending(null);
    }, 1000);
  };

  const handleSendAll = () => {
    generated.forEach((msg, i) => {
      setTimeout(() => {
        window.open(msg.whatsappUrl, "_blank");
        setSentIds((prev) => [...prev, msg.id]);
      }, i * 1500);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MdCampaign className="text-2xl text-primary-400" />
        <h2 className="text-2xl font-bold">Festival Broadcast</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
            <h3 className="mb-3 text-sm font-semibold text-gray-300">Select Festival</h3>
            <div className="grid grid-cols-2 gap-2">
              {FESTIVAL_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => {
                    setSelectedTemplate(f.value);
                    setCustomMessage("");
                  }}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    selectedTemplate === f.value
                      ? "border-primary-500 bg-primary-500/10 text-primary-400"
                      : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600"
                  }`}
                >
                  <span className="mr-1">{f.emoji}</span> {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
            <h3 className="mb-3 text-sm font-semibold text-gray-300">Or Custom Message</h3>
            <p className="mb-2 text-xs text-gray-500">Use {"{name}"} for customer name</p>
            <textarea
              value={customMessage}
              onChange={(e) => {
                setCustomMessage(e.target.value);
                setSelectedTemplate("");
              }}
              placeholder="Hi {name}! Check out our latest offers..."
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-primary-500 h-28 resize-none"
            />
          </div>

          <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
            <h3 className="mb-3 text-sm font-semibold text-gray-300">
              Customers {selectedIds.length > 0 && `(${selectedIds.length} selected)`}
            </h3>
            <button
              onClick={toggleSelectAll}
              className="mb-3 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 transition-colors"
            >
              {selectedIds.length === customers.length ? "Deselect All" : "Select All"}
            </button>
            {loading ? (
              <div className="flex h-20 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
              </div>
            ) : (
              <div className="max-h-64 space-y-1 overflow-y-auto">
                {customers.map((c) => (
                  <label
                    key={c.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-300 hover:bg-gray-800"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(c.id)}
                      onChange={() => toggleSelect(c.id)}
                      className="rounded border-gray-600 bg-gray-700 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="text-xs text-gray-500">{c.totalOrders} orders</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={!selectedTemplate && !customMessage.trim()}
            className="w-full rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Messages
          </button>
        </div>

        <div className="lg:col-span-2">
          {generated.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Generated Messages ({generated.length})
                </h3>
                <button
                  onClick={handleSendAll}
                  className="flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400 hover:bg-green-500/20 transition-colors"
                >
                  <MdMessage /> Send All
                </button>
              </div>
              <div className="space-y-3">
                {generated.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-xl border p-4 ${
                      sentIds.includes(msg.id)
                        ? "border-green-500/30 bg-green-500/5"
                        : "border-gray-800 bg-gray-900"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <span className="font-medium">{msg.name}</span>
                        <span className="ml-2 text-sm text-gray-500">{msg.phone}</span>
                      </div>
                      {sentIds.includes(msg.id) ? (
                        <span className="flex items-center gap-1 text-xs text-green-400">
                          <MdCheckCircle /> Sent
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSend(msg)}
                          disabled={sending === msg.id}
                          className="flex items-center gap-1 rounded-lg bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                        >
                          <MdMessage />
                          {sending === msg.id ? "Opening..." : "Send"}
                        </button>
                      )}
                    </div>
                    <pre className="whitespace-pre-wrap rounded-lg bg-gray-800 px-3 py-2 text-xs text-gray-300 font-sans">
                      {msg.message}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-gray-800 bg-gray-900">
              <div className="text-center text-gray-500">
                <MdCampaign className="mx-auto mb-3 text-4xl" />
                <p>Select a festival and customers, then generate messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
