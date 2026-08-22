import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { SITE_URL, PHONE } from "@/lib/seo";

const WHATSAPP_NUMBER = PHONE;

const FESTIVAL_TEMPLATES: Record<string, (name: string) => string> = {
  diwali: (name) =>
    `Happy Diwali, ${name}! 🪔✨\n\nMay this festival of lights bring joy, prosperity, and success to you and your family.\n\nAs a token of appreciation, enjoy special festive offers on our entire range of plastic products!\n\n🛒 Shop now: ${SITE_URL}/products\n📞 Call us: ${WHATSAPP_NUMBER}\n\nWishing you a bright and beautiful Diwali!\n\n— Shree Gurudev Plastics`,

  raksha_bandhan: (name) =>
    `Happy Raksha Bandhan, ${name}! 🎀\n\nOn this special occasion of love and protection, we celebrate the beautiful bond between brothers and sisters.\n\nMay this day bring happiness and togetherness to your family.\n\nCheck out our family essentials collection with festive discounts!\n\n🛒 Shop now: ${SITE_URL}/products\n📞 Call us: ${WHATSAPP_NUMBER}\n\nWith warm wishes,\n— Shree Gurudev Plastics`,

  holi: (name) =>
    `Happy Holi, ${name}! 🎨\n\nMay this festival of colors fill your life with joy, love, and happiness!\n\nCelebrate with our range of durable, colorful plastic products for your home.\n\nSpecial Holi discounts available!\n\n🛒 Shop now: ${SITE_URL}/products\n📞 Call us: ${WHATSAPP_NUMBER}\n\nWishing you a colorful Holi!\n\n— Shree Gurudev Plastics`,

  new_year: (name) =>
    `Happy New Year, ${name}! 🎉\n\nWishing you a wonderful year ahead filled with prosperity and success!\n\nStart the new year with fresh additions to your home. Explore our latest collection with exclusive New Year offers.\n\n🛒 Shop now: ${SITE_URL}/products\n📞 Call us: ${WHATSAPP_NUMBER}\n\nHere's to a fantastic year ahead!\n\n— Shree Gurudev Plastics`,

  navratri: (name) =>
    `Happy Navratri, ${name}! 🙏\n\nMay the divine blessings of Goddess Durga bring peace, happiness, and prosperity to your life.\n\nCelebrate with our special Navratri collection and festive offers!\n\n🛒 Shop now: ${SITE_URL}/products\n📞 Call us: ${WHATSAPP_NUMBER}\n\nJai Mata Di!\n\n— Shree Gurudev Plastics`,

  christmas: (name) =>
    `Merry Christmas, ${name}! 🎄\n\nWishing you a season filled with joy, love, and warm celebrations!\n\nMake your Christmas special with our range of home essentials and festive decorations.\n\nSpecial Christmas offers await you!\n\n🛒 Shop now: ${SITE_URL}/products\n📞 Call us: ${WHATSAPP_NUMBER}\n\nSeason's greetings!\n\n— Shree Gurudev Plastics`,

  pongal: (name) =>
    `Happy Pongal, ${name}! 🌾\n\nWishing you and your family a harvest of happiness, prosperity, and good health!\n\nCelebrate this harvest festival with our special offers on kitchen and home essentials.\n\n🛒 Shop now: ${SITE_URL}/products\n📞 Call us: ${WHATSAPP_NUMBER}\n\nPongal Vazthukal!\n\n— Shree Gurudev Plastics`,

  eid: (name) =>
    `Eid Mubarak, ${name}! 🌙\n\nMay this blessed occasion bring peace, joy, and prosperity to you and your loved ones.\n\nCheck out our special Eid collection with festive discounts!\n\n🛒 Shop now: ${SITE_URL}/products\n📞 Call us: ${WHATSAPP_NUMBER}\n\nEid Mubarak!\n\n— Shree Gurudev Plastics`,
};

export async function GET() {
  try {
    const username = await getAuthUser();
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customers = await db.customer.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        totalOrders: true,
        totalSpent: true,
        tier: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      customers,
      templates: Object.keys(FESTIVAL_TEMPLATES),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const username = await getAuthUser();
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { customerIds, template, customMessage } = body;

    let customers;
    if (customerIds && customerIds.length > 0) {
      customers = await db.customer.findMany({
        where: { id: { in: customerIds } },
      });
    } else {
      customers = await db.customer.findMany();
    }

    if (customers.length === 0) {
      return NextResponse.json({ error: "No customers found" }, { status: 404 });
    }

    const results = customers.map((customer) => {
      let message: string;
      if (template && FESTIVAL_TEMPLATES[template]) {
        message = FESTIVAL_TEMPLATES[template](customer.name);
      } else if (customMessage) {
        message = customMessage.replace(/\{name\}/g, customer.name);
      } else {
        message = `Hi ${customer.name}! 👋\n\nFrom Shree Gurudev Plastics — Wishing you all the best!\n\nShop now: ${SITE_URL}/products\n📞 ${WHATSAPP_NUMBER}`;
      }

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${customer.phone}?text=${encodedMessage}`;

      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        message,
        whatsappUrl,
      };
    });

    return NextResponse.json({
      count: results.length,
      messages: results,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate broadcast messages" },
      { status: 500 }
    );
  }
}
