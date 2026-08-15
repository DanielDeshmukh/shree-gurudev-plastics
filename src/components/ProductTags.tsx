"use client";

import { parseTags, getTagInfo } from "@/lib/tags";

export default function ProductTags({ tags }: { tags: string }) {
  const tagIds = parseTags(tags);

  if (tagIds.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mb-1">
      {tagIds.map((tagId) => {
        const info = getTagInfo(tagId);
        if (!info) return null;
        return (
          <span
            key={tagId}
            className={`inline-block text-[9px] font-semibold text-white px-1.5 py-0.5 rounded-full ${info.color}`}
          >
            {info.label}
          </span>
        );
      })}
    </div>
  );
}
