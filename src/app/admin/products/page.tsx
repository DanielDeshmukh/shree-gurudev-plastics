"use client";

import { useEffect, useState } from "react";

interface Brand {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  name: string;
  color: string;
  size: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string | null;
  description: string | null;
  brand: Brand;
  moq: number;
}

const emptyForm = {
  name: "",
  color: "",
  size: "",
  brandId: "",
  imageUrl: "",
  price: "",
  stock: "",
  category: "general",
  description: "",
  moq: "1",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchProducts = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchBrands = () => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((d) => setBrands(d.brands || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchProducts();
    fetchBrands();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchProducts(), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setForm({
      name: product.name,
      color: product.color,
      size: product.size,
      brandId: String(product.brand.id),
      imageUrl: product.imageUrl || "",
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
      description: product.description || "",
      moq: String(product.moq || 1),
    });
    setEditingId(product.id);
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.brandId) {
      setError("Name and brand are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const url = editingId ? `/api/products/${editingId}` : "/api/products";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Failed to save");
        return;
      }
      setShowModal(false);
      fetchProducts();
    } catch {
      setError("Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch {}
  };

  const filtered = products;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Products</h2>
        <button
          onClick={openAdd}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
        >
          + Add Product
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        />
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg bg-gray-900 border border-gray-800 p-8 text-center text-gray-400">
          No products found
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900 text-gray-400">
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Color</th>
                <th className="px-4 py-3 font-medium">Size</th>
                <th className="px-4 py-3 font-medium">Brand</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((product) => (
                <tr key={product.id} className="text-gray-300 hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 text-gray-500 text-xs">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3">{product.color}</td>
                  <td className="px-4 py-3">{product.size}</td>
                  <td className="px-4 py-3">{product.brand?.name}</td>
                  <td className="px-4 py-3">₹{product.price.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        product.stock > 10
                          ? "bg-green-500/10 text-green-400"
                          : product.stock > 0
                            ? "bg-yellow-500/10 text-yellow-400"
                            : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-gray-900 border border-gray-800 p-6">
            <h3 className="mb-4 text-lg font-bold">
              {editingId ? "Edit Product" : "Add Product"}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Color</label>
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Size</label>
                  <input
                    type="text"
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Brand *</label>
                  <select
                    value={form.brandId}
                    onChange={(e) => setForm({ ...form, brandId: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500"
                  >
                    <option value="">Select brand</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Image URL</label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Price</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Stock</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Minimum Order Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={form.moq}
                  onChange={(e) => setForm({ ...form, moq: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-orange-500 resize-none"
                />
              </div>
              {error && (
                <div className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400 border border-red-500/20">
                  {error}
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Saving..." : editingId ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
