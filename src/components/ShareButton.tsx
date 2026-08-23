"use client";

import { useState } from "react";
import { MdShare, MdLink, MdClose, MdContentCopy, MdCheck } from "react-icons/md";
import { SITE_URL } from "@/lib/seo";

type ShareButtonProps = {
  product: {
    name: string;
    slug: string;
    price: number;
    color?: string;
    brand?: string;
    imageUrl?: string;
  };
};

export default function ShareButton({ product }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const productUrl = `${SITE_URL}/product/${product.slug}`;
  const shareText = `Check out ${product.name}${product.brand ? ` by ${product.brand}` : ""} — ₹${product.price}${product.color ? ` (${product.color})` : ""} on Shree Gurudev Plastics!`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: shareText,
          url: productUrl,
        });
      } catch {
        // user cancelled or error
      }
    } else {
      setOpen(true);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement("input");
      input.value = productUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLinks = [
    {
      name: "WhatsApp",
      url: `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + productUrl)}`,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      name: "Telegram",
      url: `https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(shareText)}`,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
      color: "bg-blue-700 hover:bg-blue-800",
    },
    {
      name: "Twitter / X",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`,
      color: "bg-black hover:bg-gray-800",
    },
    {
      name: "LinkedIn",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productUrl)}`,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      name: "Email",
      url: `mailto:?subject=${encodeURIComponent(`Check out ${product.name}`)}&body=${encodeURIComponent(shareText + "\n\n" + productUrl)}`,
      color: "bg-gray-600 hover:bg-gray-700",
    },
    {
      name: "SMS",
      url: `sms:?body=${encodeURIComponent(shareText + " " + productUrl)}`,
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ];

  return (
    <>
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-2 text-gray-600 hover:text-primary-500 transition-colors"
        title="Share product"
      >
        <MdShare className="w-5 h-5" />
        <span className="text-sm font-medium">Share</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Share Product</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <MdClose className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-gray-900 line-clamp-2">{product.name}</p>
              <p className="text-sm text-primary-500 font-bold mt-1">₹{product.price}</p>
            </div>

            <button
              onClick={copyLink}
              className="w-full flex items-center justify-center gap-2 mb-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {copied ? (
                <>
                  <MdCheck className="w-4 h-4 text-green-500" />
                  Link Copied!
                </>
              ) : (
                <>
                  <MdContentCopy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${link.color} text-white text-sm font-medium py-2.5 px-4 rounded-lg text-center transition-colors`}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
