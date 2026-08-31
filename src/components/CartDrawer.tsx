"use client";

import { useRouter } from "next/navigation";
import BlurImage from "@/components/BlurImage";
import { useCart } from "@/context/CartContext";
import { PHONE } from "@/lib/seo";
import { logEnquiry } from "@/lib/log-enquiry";

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isCartOpen, closeCart } = useCart();
  const router = useRouter();

  const handleSendEnquiry = () => {
    if (items.length === 0) return;

    const productList = items
      .map(
        (item, index) =>
          `${index + 1}. ${item.name}${item.color ? ` (${item.color}` : ""}${item.color && item.size ? ", " : ""}${item.size ? `${item.size}` : ""}${item.color ? ")" : ""}${item.brand ? ` - ${item.brand}` : ""}\n   Qty: ${item.quantity} x ₹${item.price} = ₹${(item.price * item.quantity).toLocaleString("en-IN")}`
      )
      .join("\n\n");

    const message = `Namaste!\n\nI am interested in the following products:\n\n${productList}\n\n------------------------------\nTotal: Rs.${totalPrice.toLocaleString("en-IN")}\n\nKindly share the best prices and confirm availability.\n\nThank you!`;
    logEnquiry({ productName: `${items.length} items from cart`, message, source: "whatsapp" });
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={closeCart}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
              <span className="text-sm text-gray-500">({totalItems} {totalItems === 1 ? "item" : "items"})</span>
            </div>
            <button onClick={closeCart} className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                <p className="text-gray-500 font-medium mb-1">Your cart is empty</p>
                <p className="text-gray-400 text-sm">Add products to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.id}__${item.color || ""}`} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                      {item.imageUrl ? (
                        <BlurImage src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                      <div className="flex gap-1 text-xs text-gray-500 mt-0.5">
                        {item.color && <span>{item.color}</span>}
                        {item.color && item.size && <span>•</span>}
                        {item.size && <span>{item.size}</span>}
                      </div>
                      <p className="text-sm font-bold text-primary-500 mt-1">₹{item.price}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.color)}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-primary-500 transition-colors rounded-l-lg hover:bg-gray-50"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="text-sm font-medium text-gray-900 w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.color)}
                            disabled={item.stock !== undefined && item.quantity >= item.stock}
                            className={`w-7 h-7 flex items-center justify-center transition-colors rounded-r-lg ${
                              item.stock !== undefined && item.quantity >= item.stock
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-500 hover:text-primary-500 hover:bg-gray-50"
                            }`}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        {item.stock !== undefined && item.stock <= 5 && (
                          <span className="text-[10px] text-amber-600 font-medium">Only {item.stock} left</span>
                        )}
                        <button onClick={() => removeItem(item.id, item.color)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Subtotal</span>
                <span className="text-xl font-bold text-gray-900">₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 bg-primary-500 text-white font-semibold py-3 rounded-lg hover:bg-primary-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Proceed to Checkout
              </button>
              <button
                onClick={handleSendEnquiry}
                className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-medium py-2.5 rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Or Enquire on WhatsApp
              </button>
              <button
                onClick={clearCart}
                className="w-full text-center text-sm text-gray-500 hover:text-red-500 transition-colors py-1"
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
