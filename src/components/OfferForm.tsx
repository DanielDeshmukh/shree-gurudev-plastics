"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MdSearch, MdClose, MdCheckCircle } from "react-icons/md";

type Product = {
  id: number;
  name: string;
  slug: string;
  color: string;
  size: string;
  price: number;
  category: string;
  imageUrl: string;
  brand: { name: string } | null;
};

type OfferFormProps = {
  offerId?: number;
  initial?: {
    title: string;
    description: string;
    discountPct: number;
    deadline: string;
    isActive: boolean;
    festivalSlug: string;
    scopeType: string;
    productIds: number[];
  };
};

const FESTIVAL_OPTIONS = [
  { value: "", label: "No Festival" },
  { value: "ganesh_chaturthi", label: "Ganesh Chaturthi" },
  { value: "diwali", label: "Diwali" },
  { value: "holi", label: "Holi" },
  { value: "navratri", label: "Navratri" },
  { value: "christmas", label: "Christmas" },
  { value: "new_year", label: "New Year" },
  { value: "raksha_bandhan", label: "Raksha Bandhan" },
  { value: "eid", label: "Eid" },
];

export default function OfferForm({ offerId, initial }: OfferFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [discountPct, setDiscountPct] = useState(initial?.discountPct || 10);
  const [deadline, setDeadline] = useState(initial?.deadline ? initial.deadline.slice(0, 16) : "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [festivalSlug, setFestivalSlug] = useState(initial?.festivalSlug || "");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set(initial?.productIds || []));
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  const fetchProducts = useCallback(async () => {
    setSearching(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryFilter) params.set("category", categoryFilter);
      if (brandFilter) params.set("brand", brandFilter);
      params.set("limit", "200");
      const res = await fetch(`/api/admin/offers/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);

      if (!categoryFilter && !brandFilter) {
        const cats = [...new Set((data.products || []).map((p: Product) => p.category))].sort() as string[];
        const brs = [...new Set((data.products || []).map((p: Product) => p.brand?.name).filter(Boolean))].sort() as string[];
        setCategories(cats);
        setBrands(brs);
      }
    } catch { /* empty */ }
    setSearching(false);
  }, [search, categoryFilter, brandFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const allVisibleIds = useMemo(() => products.map((p) => p.id), [products]);
  const allSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.has(id));
  const someSelected = allVisibleIds.some((id) => selectedIds.has(id));

  const selectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      allVisibleIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const clearAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      allVisibleIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  const toggleProduct = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title,
      description: description || null,
      discountPct,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      isActive,
      festivalSlug: festivalSlug || null,
      scopeType: "products",
      productIds: Array.from(selectedIds),
    };

    try {
      const url = offerId ? `/api/admin/offers/${offerId}` : "/api/admin/offers";
      const method = offerId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) router.push("/admin/offers");
    } catch { /* empty */ }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Offer Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Discount % *</label>
          <input type="number" min="1" max="90" value={discountPct} onChange={(e) => setDiscountPct(parseFloat(e.target.value) || 0)} required
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Deadline</label>
          <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Festival</label>
          <select value={festivalSlug} onChange={(e) => setFestivalSlug(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500">
            {FESTIVAL_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500" />
            <span className="text-sm text-gray-300">Active</span>
          </label>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-white font-semibold mb-3">Select Products</h3>
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white focus:outline-none focus:border-green-500" />
            {search && <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"><MdClose /></button>}
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500">
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500">
            <option value="">All Brands</option>
            {brands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-400">{selectedIds.size} selected / {products.length} shown</p>
          <div className="flex gap-2">
            <button type="button" onClick={selectAll} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg">
              Select All ({products.length})
            </button>
            <button type="button" onClick={clearAll} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg">
              Clear All
            </button>
          </div>
        </div>

        {allVisibleIds.length > 0 && (
          <label className="flex items-center gap-2 mb-2 cursor-pointer text-sm text-gray-300">
            <input type="checkbox" checked={allSelected} ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
              onChange={() => allSelected ? clearAll() : selectAll()}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500" />
            Select / Deselect all visible
          </label>
        )}

        <div className="max-h-[400px] overflow-y-auto border border-gray-700 rounded-lg">
          {searching ? (
            <div className="text-center py-8 text-gray-400">Searching...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No products found</div>
          ) : (
            <div className="divide-y divide-gray-700">
              {products.map((product) => (
                <label key={product.id} className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-700/50 ${selectedIds.has(product.id) ? "bg-green-900/20" : ""}`}>
                  <input type="checkbox" checked={selectedIds.has(product.id)} onChange={() => toggleProduct(product.id)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{product.name}</p>
                    <p className="text-gray-400 text-xs">{product.color} {product.size && `\u00B7 ${product.size}`} {product.brand?.name && `\u00B7 ${product.brand.name}`}</p>
                  </div>
                  <span className="text-gray-400 text-xs shrink-0">{product.category}</span>
                  <span className="text-green-400 text-sm font-medium shrink-0">Rs.{product.price.toLocaleString("en-IN")}</span>
                  {selectedIds.has(product.id) && <MdCheckCircle className="text-green-400 shrink-0" />}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-700">
        <button type="submit" disabled={saving || !title}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
          {saving ? "Saving..." : offerId ? "Update Offer" : "Create Offer"}
        </button>
        <button type="button" onClick={() => router.push("/admin/offers")}
          className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
