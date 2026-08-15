"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  color: string;
  size: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  category: string;
  imageUrl: string | null;
  brand: { id: number; name: string };
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/inventory")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const outOfStock = products.filter((p) => p.stock === 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Inventory Alerts</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <p className="text-sm text-gray-400">Total Alerts</p>
          <p className="mt-1 text-2xl font-bold text-orange-400">{products.length}</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <p className="text-sm text-gray-400">Out of Stock</p>
          <p className="mt-1 text-2xl font-bold text-red-400">{outOfStock.length}</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <p className="text-sm text-gray-400">Low Stock</p>
          <p className="mt-1 text-2xl font-bold text-yellow-400">{lowStock.length}</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-12 text-center">
          <p className="text-lg text-green-400 font-medium">All stocked up!</p>
          <p className="mt-1 text-sm text-gray-500">No products are running low.</p>
        </div>
      ) : (
        <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Brand</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Threshold</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {products.map((product) => (
                <tr key={product.id} className="text-gray-300">
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3">{product.brand?.name}</td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3 font-mono">{product.stock}</td>
                  <td className="px-4 py-3 font-mono">{product.lowStockThreshold}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        product.stock === 0
                          ? "bg-red-500/10 text-red-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {product.stock === 0 ? "Out of Stock" : "Low Stock"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-sm text-gray-500">
        <Link href="/admin/products" className="text-orange-400 hover:underline">
          Go to Products
        </Link>{" "}
        to update stock levels.
      </div>
    </div>
  );
}
