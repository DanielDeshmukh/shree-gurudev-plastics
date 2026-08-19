import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { securityLogger } from "@/lib/security-logger";

const ALLOWED_DIRS = [
  path.join(process.cwd(), "mango-images"),
  path.join(process.cwd(), "public"),
];

function isPathSafe(resolvedPath: string): boolean {
  return ALLOWED_DIRS.some((dir) => resolvedPath.startsWith(dir));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileParam = searchParams.get("file");
  const imageUrl = searchParams.get("url");
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined;

  let localPath: string | null = null;

  if (fileParam) {
    const resolved = path.resolve(fileParam);
    if (!isPathSafe(resolved)) {
      securityLogger.pathTraversalAttempt(fileParam, ip);
      return new NextResponse("Access denied", { status: 403 });
    }
    localPath = resolved;
  } else if (imageUrl) {
    if (imageUrl.includes("cloudinary.com")) {
      const match = imageUrl.match(/\/shree-gurudev\/mango\/(.+)$/);
      if (match) {
        const resolved = path.resolve(process.cwd(), "mango-images", match[1]);
        if (isPathSafe(resolved)) localPath = resolved;
      }
    } else if (imageUrl.startsWith("/mango-images/")) {
      const resolved = path.resolve(process.cwd(), imageUrl.replace(/^\//, ""));
      if (isPathSafe(resolved)) localPath = resolved;
    } else if (imageUrl.startsWith("/")) {
      const resolved = path.resolve(process.cwd(), imageUrl.replace(/^\//, ""));
      if (isPathSafe(resolved)) localPath = resolved;
    }
  }

  if (!localPath) {
    return new NextResponse("Missing file or url param", { status: 400 });
  }

  if (!fs.existsSync(localPath)) {
    return new NextResponse("File not found", { status: 404 });
  }

  const ext = path.extname(localPath).toLowerCase();
  const mimeMap: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };
  const contentType = mimeMap[ext] || "application/octet-stream";

  const buffer = fs.readFileSync(localPath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
