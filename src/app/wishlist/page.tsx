"use client";

import Link from "next/link";
import BlurImage from "@/components/BlurImage";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { PHONE } from "@/lib/seo";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem, openCart } = useCart();

  const handleAddToCart = (item: (typeof wishlist)[0]) => {
    addItem({
      id: item.id,
      name: item.name,
      color: item.color,
      size: item.size,
      price: item.price,
      imageUrl: item.imageUrl,
      brand: item.brand,
      moq: 1,
    });
    openCart();
  };

  const handleEnquireAll = () => {
    const names = wishlist.map((item) => item.name).join(", ");
    const text = `Hi, I'm interested in the following products from your wishlist:\n\n${wishlist.map((item, i) => `${i + 1}. ${item.name} — ₹${item.price}`).join("\n")}\n\nPlease share the best prices and availability.`;
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Wishlist</h1>
          {wishlist.length > 0 && (
            <button onClick={clearWishlist} className="text-sm text-red-500 hover:text-red-600 font-medium">
              Clear All
            </button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Save products you love by tapping the heart icon.</p>
            <Link
              href="/products"
              className="inline-block bg-primary-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/product/${item.id}`}>
                    <div className="relative aspect-square bg-gray-100">
                      {item.imageUrl ? (
                        <BlurImage src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link href={`/product/${item.id}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-primary-500 transition-colors line-clamp-1">{item.name}</h3>
                    </Link>
                    <div className="flex gap-2 mt-1 text-sm text-gray-500">
                      {item.color && <span>{item.color}</span>}
                      {item.size && <span>• {item.size}</span>}
                    </div>
                    {item.brand && <p className="text-xs text-gray-400 mt-1">{item.brand}</p>}
                    <p className="text-lg font-bold text-primary-500 mt-2">₹{item.price}</p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="flex-1 bg-primary-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-block bg-white text-primary-500 border border-primary-300 font-semibold px-8 py-3 rounded-lg hover:bg-primary-50 transition-colors text-center"
              >
                Continue Shopping
              </Link>
              <button
                onClick={handleEnquireAll}
                className="inline-flex items-center justify-center gap-2 bg-green-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-green-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Enquire on WhatsApp
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
