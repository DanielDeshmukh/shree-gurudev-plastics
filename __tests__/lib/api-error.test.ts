import { describe, it, expect } from "vitest";
import {
  ApiError,
  apiSuccess,
  apiError,
  apiUnauthorized,
  apiForbidden,
  apiNotFound,
  apiBadRequest,
  handleApiError,
} from "@/lib/api-error";

describe("api-error", () => {
  describe("ApiError", () => {
    it("creates error with statusCode and message", () => {
      const err = new ApiError(404, "Not found");
      expect(err.statusCode).toBe(404);
      expect(err.message).toBe("Not found");
      expect(err.name).toBe("ApiError");
    });
  });

  describe("apiSuccess", () => {
    it("returns 200 with data", async () => {
      const res = apiSuccess({ ok: true });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
    });

    it("supports custom status", async () => {
      const res = apiSuccess({ created: true }, 201);
      expect(res.status).toBe(201);
    });
  });

  describe("apiError", () => {
    it("returns 500 by default", async () => {
      const res = apiError("fail");
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBe("fail");
    });

    it("supports custom status", async () => {
      const res = apiError("not found", 404);
      expect(res.status).toBe(404);
    });
  });

  describe("apiUnauthorized", () => {
    it("returns 401", async () => {
      const res = apiUnauthorized();
      expect(res.status).toBe(401);
    });
  });

  describe("apiForbidden", () => {
    it("returns 403", async () => {
      const res = apiForbidden();
      expect(res.status).toBe(403);
    });
  });

  describe("apiNotFound", () => {
    it("returns 404 with resource name", async () => {
      const res = apiNotFound("Product");
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toBe("Product not found");
    });
  });

  describe("apiBadRequest", () => {
    it("returns 400", async () => {
      const res = apiBadRequest("Invalid input");
      expect(res.status).toBe(400);
    });
  });

  describe("handleApiError", () => {
    it("handles ApiError", async () => {
      const res = handleApiError(new ApiError(400, "Bad"));
      expect(res.status).toBe(400);
    });

    it("handles generic error", async () => {
      const res = handleApiError(new Error("oops"));
      expect(res.status).toBe(500);
    });

    it("handles unknown throw", async () => {
      const res = handleApiError("string error");
      expect(res.status).toBe(500);
    });
  });
});
