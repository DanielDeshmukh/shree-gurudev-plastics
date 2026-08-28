import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { db } from "@/lib/db";

const MAINTENANCE_AMOUNT = 600000; // ₹6,000 in paise
const MAINTENANCE_PLAN_ID_KEY = "razorpay_maintenance_plan_id";

async function getOrCreatePlan(): Promise<string> {
  const existing = await db.setting.findUnique({ where: { key: MAINTENANCE_PLAN_ID_KEY } });
  if (existing?.value) return existing.value;

  const plan = await razorpay().plans.create({
    period: "monthly",
    interval: 1,
    item: {
      name: "Shree Gurudev Plastics — Monthly Maintenance",
      amount: MAINTENANCE_AMOUNT,
      currency: "INR",
      description: "Monthly website maintenance & support",
    },
  });

  await db.setting.upsert({
    where: { key: MAINTENANCE_PLAN_ID_KEY },
    update: { value: plan.id },
    create: { key: MAINTENANCE_PLAN_ID_KEY, value: plan.id },
  });

  return plan.id;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, customerEmail } = body;

    if (!customerName || !customerPhone) {
      return NextResponse.json({ error: "customerName and customerPhone required" }, { status: 400 });
    }

    const planId = await getOrCreatePlan();

    const existing = await db.subscription.findFirst({
      where: { customerPhone, status: { in: ["active", "authenticated", "created"] } },
    });
    if (existing) {
      return NextResponse.json({ error: "Active subscription already exists for this phone" }, { status: 409 });
    }

    const rpSubscription = await razorpay().subscriptions.create({
      plan_id: planId,
      total_count: 120,
      customer_notify: 1,
      notes: { customerName, customerPhone },
    });

    const subscription = await db.subscription.create({
      data: {
        razorpaySubscriptionId: rpSubscription.id,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        amount: MAINTENANCE_AMOUNT,
        currency: "INR",
        status: rpSubscription.status || "created",
      },
    });

    return NextResponse.json({
      subscriptionId: rpSubscription.id,
      planId,
      amount: MAINTENANCE_AMOUNT,
      currency: "INR",
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      dbId: subscription.id,
    });
  } catch (error: any) {
    console.error("Subscription creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create subscription" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const subscriptions = await db.subscription.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ subscriptions });
  } catch {
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }
}
