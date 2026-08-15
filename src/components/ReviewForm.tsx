"use client";

import { useState } from "react";
import StarRating from "./StarRating";

interface ReviewFormProps {
  productId: number;
  onSubmitted: () => void;
}

export default function ReviewForm({ productId, onSubmitted }: ReviewFormProps) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (rating < 1 || rating > 5) {
      setError("Please select a rating");
      return;
    }
    if (comment.trim().length < 10) {
      setError("Comment must be at least 10 characters");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), rating, comment: comment.trim(), productId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to submit review");
        return;
      }

      setSuccess(true);
      setName("");
      setRating(0);
      setComment("");
      onSubmitted();
    } catch {
      setError("Failed to submit review");
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-center">
        <p className="text-green-700 font-medium">Thank you! Your review has been submitted and will appear after approval.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
          placeholder="Your name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
        <StarRating rating={rating} onChange={setRating} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none resize-none"
          placeholder="Share your experience (min 10 characters)"
        />
      </div>
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50 transition-colors"
      >
        {saving ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
