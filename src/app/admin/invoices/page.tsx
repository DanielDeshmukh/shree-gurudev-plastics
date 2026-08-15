"use client";

import { useEffect, useState } from "react";

interface InvoiceItem {
  id: number;
  productName: string;
  hsnCode: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  orderId: number | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string | null;
  customerGstin: string | null;
  placeOfSupply: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  status: string;
  notes: string | null;
  createdAt: string;
  items: InvoiceItem[];
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState("all");

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    customerGstin: "",
    placeOfSupply: "Maharashtra",
    items: [{ productName: "", hsnCode: "3924", quantity: 1, unitPrice: 0, gstRate: 18 }],
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = () => {
    fetch("/api/admin/invoices")
      .then((r) => r.json())
      .then((d) => setInvoices(d.invoices || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleCreate = async () => {
    if (!form.customerName || !form.customerPhone) return;
    try {
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowCreateModal(false);
        fetchInvoices();
        setForm({
          customerName: "",
          customerPhone: "",
          customerAddress: "",
          customerGstin: "",
          placeOfSupply: "Maharashtra",
          items: [{ productName: "", hsnCode: "3924", quantity: 1, unitPrice: 0, gstRate: 18 }],
        });
      }
    } catch {}
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    await fetch(`/api/admin/invoices/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchInvoices();
    if (selectedInvoice?.id === id) {
      setSelectedInvoice({ ...selectedInvoice!, status });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this invoice?")) return;
    await fetch(`/api/admin/invoices/${id}`, { method: "DELETE" });
    fetchInvoices();
    if (selectedInvoice?.id === id) setSelectedInvoice(null);
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { productName: "", hsnCode: "3924", quantity: 1, unitPrice: 0, gstRate: 18 }],
    });
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const items = [...form.items];
    (items[index] as Record<string, unknown>)[field] = value;
    setForm({ ...form, items });
  };

  const removeItem = (index: number) => {
    if (form.items.length <= 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  };

  const filtered = filter === "all" ? invoices : invoices.filter((i) => i.status === filter);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Invoices</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
        >
          + Create Invoice
        </button>
      </div>

      <div className="flex gap-2">
        {["all", "draft", "issued", "paid", "cancelled"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f ? "bg-orange-500 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No invoices found</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-gray-900">
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="px-4 py-3 font-medium">Invoice #</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filtered.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => setSelectedInvoice(inv)}
                      className={`cursor-pointer transition-colors ${
                        selectedInvoice?.id === inv.id ? "bg-orange-500/10" : "hover:bg-gray-800"
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-xs">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3">{inv.customerName}</td>
                      <td className="px-4 py-3 font-medium">₹{inv.total.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            inv.status === "paid"
                              ? "bg-green-500/10 text-green-400"
                              : inv.status === "issued"
                                ? "bg-blue-500/10 text-blue-400"
                                : inv.status === "cancelled"
                                  ? "bg-red-500/10 text-red-400"
                                  : "bg-gray-500/10 text-gray-400"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {selectedInvoice && (
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold">{selectedInvoice.invoiceNumber}</h3>
                <p className="text-sm text-gray-400">
                  {new Date(selectedInvoice.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
              <div className="flex gap-2">
                {selectedInvoice.status !== "paid" && (
                  <button
                    onClick={() => handleStatusUpdate(selectedInvoice.id, "paid")}
                    className="rounded-lg bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/20"
                  >
                    Mark Paid
                  </button>
                )}
                {selectedInvoice.status !== "cancelled" && (
                  <button
                    onClick={() => handleStatusUpdate(selectedInvoice.id, "cancelled")}
                    className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedInvoice.id)}
                  className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-400">Customer:</span>
                <p className="font-medium">{selectedInvoice.customerName}</p>
              </div>
              <div>
                <span className="text-gray-400">Phone:</span>
                <p className="font-medium">{selectedInvoice.customerPhone}</p>
              </div>
              {selectedInvoice.customerAddress && (
                <div className="col-span-2">
                  <span className="text-gray-400">Address:</span>
                  <p className="font-medium">{selectedInvoice.customerAddress}</p>
                </div>
              )}
              {selectedInvoice.customerGstin && (
                <div>
                  <span className="text-gray-400">GSTIN:</span>
                  <p className="font-mono text-xs">{selectedInvoice.customerGstin}</p>
                </div>
              )}
              <div>
                <span className="text-gray-400">Place of Supply:</span>
                <p className="font-medium">{selectedInvoice.placeOfSupply}</p>
              </div>
            </div>

            <div className="mb-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400">
                    <th className="pb-2 font-medium">Item</th>
                    <th className="pb-2 font-medium">HSN</th>
                    <th className="pb-2 font-medium">Qty</th>
                    <th className="pb-2 font-medium">Rate</th>
                    <th className="pb-2 font-medium">GST%</th>
                    <th className="pb-2 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {selectedInvoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2">{item.productName}</td>
                      <td className="py-2 font-mono">{item.hsnCode}</td>
                      <td className="py-2">{item.quantity}</td>
                      <td className="py-2">₹{item.unitPrice.toLocaleString("en-IN")}</td>
                      <td className="py-2">{item.gstRate}%</td>
                      <td className="py-2 font-medium">₹{item.total.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-700 pt-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span>₹{selectedInvoice.subtotal.toLocaleString("en-IN")}</span></div>
              {selectedInvoice.igst > 0 ? (
                <div className="flex justify-between"><span className="text-gray-400">IGST</span><span>₹{selectedInvoice.igst.toLocaleString("en-IN")}</span></div>
              ) : (
                <>
                  <div className="flex justify-between"><span className="text-gray-400">CGST</span><span>₹{selectedInvoice.cgst.toLocaleString("en-IN")}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">SGST</span><span>₹{selectedInvoice.sgst.toLocaleString("en-IN")}</span></div>
                </>
              )}
              <div className="flex justify-between border-t border-gray-700 pt-2 mt-2 font-bold text-orange-400">
                <span>Total</span><span>₹{selectedInvoice.total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gray-900 border border-gray-800 p-6">
            <h3 className="mb-4 text-lg font-bold">Create GST Invoice</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Customer Name *</label>
                  <input type="text" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Phone *</label>
                  <input type="text" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Address</label>
                  <input type="text" value={form.customerAddress} onChange={(e) => setForm({ ...form, customerAddress: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">GSTIN</label>
                  <input type="text" value={form.customerGstin} onChange={(e) => setForm({ ...form, customerGstin: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Place of Supply</label>
                <select value={form.placeOfSupply} onChange={(e) => setForm({ ...form, placeOfSupply: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500">
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Other">Other (IGST)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-300">Line Items</label>
                  <button onClick={addItem} className="text-xs text-orange-400 hover:text-orange-300">+ Add Item</button>
                </div>
                <div className="space-y-2">
                  {form.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-6 gap-2 items-end">
                      <div className="col-span-2">
                        <input placeholder="Product" value={item.productName} onChange={(e) => updateItem(i, "productName", e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-2 py-1.5 text-white text-xs outline-none focus:border-orange-500" />
                      </div>
                      <input placeholder="HSN" value={item.hsnCode} onChange={(e) => updateItem(i, "hsnCode", e.target.value)} className="rounded-lg border border-gray-700 bg-gray-800 px-2 py-1.5 text-white text-xs outline-none focus:border-orange-500" />
                      <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 0)} className="rounded-lg border border-gray-700 bg-gray-800 px-2 py-1.5 text-white text-xs outline-none focus:border-orange-500" />
                      <input type="number" placeholder="Rate" value={item.unitPrice || ""} onChange={(e) => updateItem(i, "unitPrice", parseFloat(e.target.value) || 0)} className="rounded-lg border border-gray-700 bg-gray-800 px-2 py-1.5 text-white text-xs outline-none focus:border-orange-500" />
                      <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-300 text-xs">✕</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 rounded-lg bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors">Cancel</button>
                <button onClick={handleCreate} className="flex-1 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors">Create Invoice</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
