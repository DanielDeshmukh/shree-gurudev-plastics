"use client";

import { useState } from "react";
import Image from "next/image";
import { MdShare, MdClose, MdContentCopy, MdCheck } from "react-icons/md";
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

async function imageUrlToBlob(url: string): Promise<Blob | null> {
  try {
    // Cloudinary images — append a small transformation for faster fetch
    const fetchUrl = url.includes("res.cloudinary.com")
      ? url.replace("/upload/", "/upload/w_400,f_jpg,q_80/")
      : url;
    const res = await fetch(fetchUrl, { mode: "cors" });
    if (!res.ok) return null;
    return await res.blob();
  } catch {
    // CORS blocked — try via canvas proxy
    try {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
      });
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      return await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.85)
      );
    } catch {
      return null;
    }
  }
}

export default function ShareButton({ product }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const colorParam = product.color ? `?color=${encodeURIComponent(product.color.toLowerCase().replace(/\s+/g, "-"))}` : "";
  const productUrl = `${SITE_URL}/product/${product.slug}${colorParam}`;
  const shareText = `Check out ${product.name}${product.brand ? ` by ${product.brand}` : ""} — ₹${product.price}${product.color ? ` (${product.color})` : ""} on Shree Gurudev Plastics!`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        const shareData: ShareData = { title: product.name, text: shareText, url: productUrl };
        if (product.imageUrl) {
          const blob = await imageUrlToBlob(product.imageUrl);
          if (blob && blob.size > 0) {
            shareData.files = [new File([blob], "product.jpg", { type: "image/jpeg" })];
          }
        }
        await navigator.share(shareData);
      } catch {}
    } else {
      setOpen(true);
    }
  };

  const shareToWhatsApp = async () => {
    if (navigator.share && product.imageUrl) {
      try {
        const blob = await imageUrlToBlob(product.imageUrl);
        if (blob && blob.size > 0) {
          const file = new File([blob], "product.jpg", { type: "image/jpeg" });
          await navigator.share({ title: product.name, text: shareText, files: [file] });
          return;
        }
      } catch {}
    }
    // Fallback: text only
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + "\n" + productUrl)}`, "_blank");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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
      action: shareToWhatsApp,
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
        className="text-gray-400 hover:text-primary-500 transition-colors"
        title="Share product"
      >
        <MdShare className="w-5 h-5" />
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

            <div className="flex gap-3 bg-gray-50 rounded-lg p-3 mb-4">
              {product.imageUrl && (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                  <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="64px" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 line-clamp-2">{product.name}</p>
                <p className="text-sm text-primary-500 font-bold mt-1">₹{product.price}</p>
                {product.color && <p className="text-xs text-gray-500 mt-0.5">{product.color}</p>}
              </div>
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
              {shareLinks.map((link) =>
                link.action ? (
                  <button
                    key={link.name}
                    onClick={link.action}
                    className={`${link.color} text-white text-sm font-medium py-2.5 px-4 rounded-lg text-center transition-colors`}
                  >
                    {link.name}
                  </button>
                ) : (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${link.color} text-white text-sm font-medium py-2.5 px-4 rounded-lg text-center transition-colors`}
                  >
                    {link.name}
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
