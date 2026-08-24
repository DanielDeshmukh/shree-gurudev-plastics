import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAuthUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";

    const where: Record<string, unknown> = {};
    if (filter === "unread") where.read = false;
    if (filter === "read") where.read = true;

    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const unreadCount = await db.notification.count({ where: { read: false } });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("[Notifications GET]", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAuthUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { type, title, message, orderId } = body;

    const notification = await db.notification.create({
      data: {
        type: type || "info",
        title,
        message,
        orderId: orderId || null,
      },
    });

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const admin = await getAuthUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { ids, read } = body;

    if (ids && Array.isArray(ids)) {
      await db.notification.updateMany({
        where: { id: { in: ids } },
        data: { read },
      });
    } else if (ids === "all") {
      await db.notification.updateMany({
        data: { read },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await getAuthUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get("ids");

    if (ids === "all") {
      await db.notification.deleteMany({});
    } else if (ids) {
      const idList = ids.split(",").map(Number).filter(Boolean);
      await db.notification.deleteMany({
        where: { id: { in: idList } },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete notifications" }, { status: 500 });
  }
}
