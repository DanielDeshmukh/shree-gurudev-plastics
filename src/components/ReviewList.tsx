"use client";

import { useEffect, useState, useCallback } from "react";
import StarRating from "./StarRating";
import ReviewForm from "./ReviewForm";

interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
}

interface ReviewListProps {
  productId: number;
}

export default function ReviewList({ productId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = useCallback(() => {
    fetch(`/api/reviews?productId=${productId}`)
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const handleSubmitted = () => {
    setShowForm(false);
    fetchReviews();
  };

  return (
    <section className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 transition-colors"
        >
          Write a Review
        </button>
      </div>

      {loading ? (
        <div className="flex h-20 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
              <StarRating rating={Math.round(avgRating)} size="sm" />
              <p className="text-sm text-gray-500 mt-1">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {showForm && (
            <div className="mb-6 pb-6 border-b border-gray-100">
              <ReviewForm productId={productId} onSubmitted={handleSubmitted} />
            </div>
          )}

          {reviews.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium text-gray-900">{review.name}</span>
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-sm text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
