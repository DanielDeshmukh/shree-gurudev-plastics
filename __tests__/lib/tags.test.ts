import { describe, it, expect } from "vitest";
import { parseTags, getTagInfo, AVAILABLE_TAGS } from "@/lib/tags";

describe("tags", () => {
  describe("parseTags", () => {
    it("parses comma-separated tags", () => {
      expect(parseTags("best-seller,new-arrival")).toEqual(["best-seller", "new-arrival"]);
    });

    it("trims whitespace", () => {
      expect(parseTags("best-seller , new-arrival")).toEqual(["best-seller", "new-arrival"]);
    });

    it("returns empty array for empty string", () => {
      expect(parseTags("")).toEqual([]);
    });

    it("filters empty segments", () => {
      expect(parseTags("best-seller,,new-arrival,")).toEqual(["best-seller", "new-arrival"]);
    });

    it("handles single tag", () => {
      expect(parseTags("sale")).toEqual(["sale"]);
    });
  });

  describe("getTagInfo", () => {
    it("returns tag info for valid tag", () => {
      const tag = getTagInfo("best-seller");
      expect(tag).not.toBeUndefined();
      expect(tag!.label).toBe("Best Seller");
    });

    it("returns undefined for unknown tag", () => {
      expect(getTagInfo("nonexistent")).toBeUndefined();
    });
  });

  describe("AVAILABLE_TAGS", () => {
    it("has 6 tags", () => {
      expect(AVAILABLE_TAGS).toHaveLength(6);
    });

    it("each tag has id, label, color", () => {
      for (const tag of AVAILABLE_TAGS) {
        expect(typeof tag.id).toBe("string");
        expect(typeof tag.label).toBe("string");
        expect(typeof tag.color).toBe("string");
      }
    });
  });
});
