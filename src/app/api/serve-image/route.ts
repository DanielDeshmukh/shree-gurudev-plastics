import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { securityLogger } from "@/lib/security-logger";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileParam = searchParams.get("file");
  const imageUrl = searchParams.get("url");
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined;

  let localPath: string | null = null;

  if (fileParam) {
    const resolved = path.resolve(fileParam);
    if (!resolved.startsWith(process.cwd())) {
      securityLogger.pathTraversalAttempt(fileParam, ip);
      return new NextResponse("Access denied", { status: 403 });
    }
    localPath = resolved;
  } else if (imageUrl) {
    if (imageUrl.includes("cloudinary.com")) {
      const match = imageUrl.match(/\/shree-gurudev\/mango\/(.+)$/);
      if (match) {
        localPath = path.join(process.cwd(), "mango-images", match[1]);
      }
    } else if (imageUrl.startsWith("/mango-images/")) {
      localPath = path.join(process.cwd(), imageUrl.replace(/^\//, ""));
    } else if (imageUrl.startsWith("/")) {
      localPath = path.join(process.cwd(), imageUrl.replace(/^\//, ""));
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
