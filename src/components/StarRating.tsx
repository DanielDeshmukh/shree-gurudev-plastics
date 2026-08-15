"use client";

import { useState } from "react";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md";
}

export default function StarRating({ rating, onChange, size = "md" }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  const sizeClass = size === "sm" ? "w-4 h-4" : "w-6 h-6";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hovered || rating);
        const isHalf = !isFilled && star - 0.5 <= (hovered || rating);

        return (
          <button
            key={star}
            type="button"
            disabled={!onChange}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => onChange && setHovered(star)}
            onMouseLeave={() => onChange && setHovered(0)}
            className={`${onChange ? "cursor-pointer" : "cursor-default"} transition-colors`}
          >
            <svg
              className={sizeClass}
              viewBox="0 0 24 24"
              fill={isFilled ? "currentColor" : isHalf ? "url(#half)" : "none"}
              stroke="currentColor"
              strokeWidth={1.5}
              style={{ color: isFilled || isHalf ? "#f59e0b" : "#d1d5db" }}
            >
              <defs>
                <linearGradient id="half">
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
