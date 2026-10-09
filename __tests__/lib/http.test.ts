import { describe, it, expect } from "vitest";
import { parseId, isNotFound, badRequest, notFoundJson } from "@/lib/http";

describe("parseId", () => {
  it("accepts plain positive integers", () => expect(parseId("17")).toBe(17));
  it("rejects non-numeric", () => expect(parseId("probe-no-such")).toBeNull());
  it("rejects NaN-producing garbage", () => expect(parseId("NaN")).toBeNull());
  it("rejects zero and negatives", () => {
    expect(parseId("0")).toBeNull();
    expect(parseId("-5")).toBeNull();
  });
  it("rejects null/undefined/empty", () => {
    expect(parseId(null)).toBeNull();
    expect(parseId(undefined)).toBeNull();
    expect(parseId("")).toBeNull();
  });
});

describe("isNotFound", () => {
  it("detects Prisma P2025", () => expect(isNotFound({ code: "P2025" })).toBe(true));
  it("ignores other errors", () => {
    expect(isNotFound(new Error("boom"))).toBe(false);
    expect(isNotFound(null)).toBe(false);
  });
});

describe("responses", () => {
  it("badRequest is 400", () => expect(badRequest("x").status).toBe(400));
  it("notFoundJson is 404", () => expect(notFoundJson().status).toBe(404));
});
