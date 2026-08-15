import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export function apiSuccess(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function apiUnauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function apiForbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export function apiNotFound(resource: string) {
  return NextResponse.json({ error: `${resource} not found` }, { status: 404 });
}

export function apiBadRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function handleApiError(error: unknown) {
  console.error("API error:", error);
  if (error instanceof ApiError) {
    return apiError(error.message, error.statusCode);
  }
  return apiError("Internal server error", 500);
}
