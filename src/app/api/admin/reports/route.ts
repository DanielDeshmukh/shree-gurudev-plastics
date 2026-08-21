import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

const BRAND_COLOR = "F97316";
const HEADER_BG = "1F2937";
const HEADER_FG = "FFFFFF";
const ALT_ROW = "F3F4F6";
const BORDER_COLOR = "D1D5DB";

function styleHeaderRow(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_BG } };
    cell.font = { bold: true, color: { argb: HEADER_FG }, size: 11, name: "Calibri" };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin", color: { argb: BORDER_COLOR } },
      bottom: { style: "thin", color: { argb: BORDER_COLOR } },
      left: { style: "thin", color: { argb: BORDER_COLOR } },
      right: { style: "thin", color: { argb: BORDER_COLOR } },
    };
  });
  row.height = 28;
}

function styleDataRows(sheet: ExcelJS.Worksheet, startRow: number, endRow: number) {
  for (let i = startRow; i <= endRow; i++) {
    const row = sheet.getRow(i);
    const isAlt = (i - startRow) % 2 === 1;
    row.eachCell((cell) => {
      cell.font = { size: 10, name: "Calibri" };
      cell.alignment = { vertical: "middle" };
      cell.border = {
        top: { style: "thin", color: { argb: BORDER_COLOR } },
        bottom: { style: "thin", color: { argb: BORDER_COLOR } },
        left: { style: "thin", color: { argb: BORDER_COLOR } },
        right: { style: "thin", color: { argb: BORDER_COLOR } },
      };
      if (isAlt) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ALT_ROW } };
      }
    });
    row.height = 22;
  }
}

function addTitle(sheet: ExcelJS.Worksheet, title: string, subtitle: string, cols: number) {
  sheet.mergeCells(1, 1, 1, cols);
  const titleCell = sheet.getCell("A1");
  titleCell.value = title;
  titleCell.font = { bold: true, size: 16, color: { argb: BRAND_COLOR }, name: "Calibri" };
  titleCell.alignment = { vertical: "middle", horizontal: "left" };
  sheet.getRow(1).height = 32;

  sheet.mergeCells(2, 1, 2, cols);
  const subtitleCell = sheet.getCell("A2");
  subtitleCell.value = subtitle;
  subtitleCell.font = { size: 10, color: { argb: "6B7280" }, name: "Calibri" };
  subtitleCell.alignment = { vertical: "middle" };
  sheet.getRow(2).height = 20;

  sheet.getRow(3).height = 8;
}

function addSummaryBlock(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  summary: { label: string; value: string }[]
) {
  for (let i = 0; i < summary.length; i++) {
    const row = startRow + Math.floor(i / 3);
    const col = (i % 3) * 2 + 1;

    const labelCell = sheet.getCell(row, col);
    labelCell.value = summary[i].label;
    labelCell.font = { size: 9, color: { argb: "6B7280" }, name: "Calibri" };

    const valueCell = sheet.getCell(row, col + 1);
    valueCell.value = summary[i].value;
    valueCell.font = { bold: true, size: 12, color: { argb: BRAND_COLOR }, name: "Calibri" };
  }
}

async function generateDailyReport(from: Date, to: Date) {
  const orders = await db.order.findMany({
    where: { createdAt: { gte: from, lte: to } },
    include: {
      items: { include: { product: { include: { brand: true } } } },
      customerRef: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Shree Gurudev Plastics";
  workbook.created = new Date();

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalItems = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);

  const fromStr = from.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const toStr = to.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  // ── Sheet 1: Summary ──
  const summarySheet = workbook.addWorksheet("Summary", {
    properties: { tabColor: { argb: BRAND_COLOR } },
  });
  summarySheet.columns = [
    { header: "", key: "a", width: 22 },
    { header: "", key: "b", width: 18 },
    { header: "", key: "c", width: 5 },
    { header: "", key: "d", width: 22 },
    { header: "", key: "e", width: 18 },
    { header: "", key: "f", width: 5 },
    { header: "", key: "g", width: 22 },
    { header: "", key: "h", width: 18 },
  ];

  addTitle(summarySheet, "Daily Sales Report", `${fromStr} — ${toStr}`, 8);

  addSummaryBlock(summarySheet, 5, [
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}` },
    { label: "Total Orders", value: String(orders.length) },
    { label: "Avg Order Value", value: `₹${orders.length > 0 ? Math.round(totalRevenue / orders.length).toLocaleString("en-IN") : "0"}` },
    { label: "Total Items Sold", value: String(totalItems) },
    { label: "Unique Customers", value: String(new Set(orders.map((o) => o.phone)).size) },
    { label: "Report Period", value: `${fromStr} — ${toStr}` },
  ]);

  summarySheet.getRow(8).height = 12;

  // Daily breakdown
  summarySheet.getRow(9).values = ["Date", "Orders", "Revenue", "Items Sold", "Avg Order Value", "", "", ""];
  styleHeaderRow(summarySheet.getRow(9));

  const dailyGroups: Record<string, { orders: number; revenue: number; items: number }> = {};
  for (const order of orders) {
    const date = order.createdAt.toISOString().split("T")[0];
    if (!dailyGroups[date]) dailyGroups[date] = { orders: 0, revenue: 0, items: 0 };
    dailyGroups[date].orders += 1;
    dailyGroups[date].revenue += order.total;
    dailyGroups[date].items += order.items.reduce((s, i) => s + i.quantity, 0);
  }

  let rowNum = 10;
  for (const [date, d] of Object.entries(dailyGroups)) {
    const formatted = new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    summarySheet.getRow(rowNum).values = [
      formatted,
      d.orders,
      d.revenue,
      d.items,
      d.orders > 0 ? Math.round(d.revenue / d.orders) : 0,
      "", "", "",
    ];
    rowNum++;
  }
  styleDataRows(summarySheet, 10, rowNum - 1);

  // ── Sheet 2: Order Details ──
  const detailSheet = workbook.addWorksheet("Order Details", {
    properties: { tabColor: { argb: "3B82F6" } },
  });
  detailSheet.columns = [
    { header: "", key: "id", width: 10 },
    { header: "", key: "date", width: 14 },
    { header: "", key: "time", width: 10 },
    { header: "", key: "customer", width: 20 },
    { header: "", key: "phone", width: 14 },
    { header: "", key: "status", width: 12 },
    { header: "", key: "items", width: 10 },
    { header: "", key: "total", width: 14 },
    { header: "", key: "notes", width: 25 },
  ];

  addTitle(detailSheet, "Order Details", `${fromStr} — ${toStr}`, 9);

  detailSheet.getRow(4).values = ["Order ID", "Date", "Time", "Customer", "Phone", "Status", "Items", "Total (₹)", "Notes"];
  styleHeaderRow(detailSheet.getRow(4));

  rowNum = 5;
  for (const order of orders) {
    const dateObj = order.createdAt;
    detailSheet.getRow(rowNum).values = [
      `#${order.publicId}`,
      dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      order.customer,
      order.phone,
      order.status,
      order.items.reduce((s, i) => s + i.quantity, 0),
      order.total,
      order.notes || "",
    ];
    rowNum++;
  }
  styleDataRows(detailSheet, 5, rowNum - 1);

  // ── Sheet 3: Product Breakdown ──
  const productSheet = workbook.addWorksheet("Product Sales", {
    properties: { tabColor: { argb: "10B981" } },
  });
  productSheet.columns = [
    { header: "", key: "product", width: 30 },
    { header: "", key: "brand", width: 18 },
    { header: "", key: "category", width: 15 },
    { header: "", key: "qty", width: 10 },
    { header: "", key: "revenue", width: 14 },
    { header: "", key: "avgPrice", width: 14 },
  ];

  addTitle(productSheet, "Product Sales Breakdown", `${fromStr} — ${toStr}`, 6);

  productSheet.getRow(4).values = ["Product", "Brand", "Category", "Quantity Sold", "Revenue (₹)", "Avg Price (₹)"];
  styleHeaderRow(productSheet.getRow(4));

  const productSales: Record<string, { name: string; brand: string; category: string; qty: number; revenue: number }> = {};
  for (const order of orders) {
    for (const item of order.items) {
      const key = item.product.name;
      if (!productSales[key]) {
        productSales[key] = {
          name: item.product.name,
          brand: item.product.brand?.name || "—",
          category: item.product.category,
          qty: 0,
          revenue: 0,
        };
      }
      productSales[key].qty += item.quantity;
      productSales[key].revenue += item.quantity * item.price;
    }
  }

  const sortedProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue);
  rowNum = 5;
  for (const p of sortedProducts) {
    productSheet.getRow(rowNum).values = [
      p.name,
      p.brand,
      p.category,
      p.qty,
      p.revenue,
      p.qty > 0 ? Math.round(p.revenue / p.qty) : 0,
    ];
    rowNum++;
  }
  styleDataRows(productSheet, 5, rowNum - 1);

  // Totals row
  const totalRow = productSheet.getRow(rowNum);
  totalRow.values = [
    "TOTAL",
    "",
    "",
    sortedProducts.reduce((s, p) => s + p.qty, 0),
    sortedProducts.reduce((s, p) => s + p.revenue, 0),
    "",
  ];
  totalRow.eachCell((cell) => {
    cell.font = { bold: true, size: 11, name: "Calibri" };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "E5E7EB" } };
    cell.border = {
      top: { style: "medium", color: { argb: BORDER_COLOR } },
      bottom: { style: "medium", color: { argb: BORDER_COLOR } },
      left: { style: "thin", color: { argb: BORDER_COLOR } },
      right: { style: "thin", color: { argb: BORDER_COLOR } },
    };
  });

  return workbook.xlsx.writeBuffer();
}

async function generateMonthlyReport(year: number, month: number) {
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0, 23, 59, 59);

  const orders = await db.order.findMany({
    where: { createdAt: { gte: from, lte: to } },
    include: {
      items: { include: { product: { include: { brand: true } } } },
      customerRef: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Shree Gurudev Plastics";
  workbook.created = new Date();

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalItems = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
  const monthName = from.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  // ── Sheet 1: Monthly Summary ──
  const summarySheet = workbook.addWorksheet("Monthly Summary", {
    properties: { tabColor: { argb: BRAND_COLOR } },
  });
  summarySheet.columns = [
    { header: "", key: "a", width: 22 }, { header: "", key: "b", width: 18 },
    { header: "", key: "c", width: 5 },
    { header: "", key: "d", width: 22 }, { header: "", key: "e", width: 18 },
    { header: "", key: "f", width: 5 },
    { header: "", key: "g", width: 22 }, { header: "", key: "h", width: 18 },
  ];

  addTitle(summarySheet, `Monthly Sales Report — ${monthName}`, `Generated on ${new Date().toLocaleDateString("en-IN")}`, 8);

  addSummaryBlock(summarySheet, 5, [
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}` },
    { label: "Total Orders", value: String(orders.length) },
    { label: "Avg Order Value", value: `₹${orders.length > 0 ? Math.round(totalRevenue / orders.length).toLocaleString("en-IN") : "0"}` },
    { label: "Total Items Sold", value: String(totalItems) },
    { label: "Unique Customers", value: String(new Set(orders.map((o) => o.phone)).size) },
    { label: "Days in Period", value: String(Math.ceil((to.getTime() - from.getTime()) / 86400000)) },
  ]);

  summarySheet.getRow(8).height = 12;

  // Weekly breakdown
  summarySheet.getRow(9).values = ["Week", "Orders", "Revenue", "Items Sold", "Avg Order Value", "", "", ""];
  styleHeaderRow(summarySheet.getRow(9));

  const weeklyGroups: Record<string, { orders: number; revenue: number; items: number }> = {};
  for (const order of orders) {
    const d = order.createdAt;
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const weekNum = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
    const weekKey = `Week ${weekNum}`;
    if (!weeklyGroups[weekKey]) weeklyGroups[weekKey] = { orders: 0, revenue: 0, items: 0 };
    weeklyGroups[weekKey].orders += 1;
    weeklyGroups[weekKey].revenue += order.total;
    weeklyGroups[weekKey].items += order.items.reduce((s, i) => s + i.quantity, 0);
  }

  let rowNum = 10;
  for (const [week, w] of Object.entries(weeklyGroups)) {
    summarySheet.getRow(rowNum).values = [
      week, w.orders, w.revenue, w.items,
      w.orders > 0 ? Math.round(w.revenue / w.orders) : 0,
      "", "", "",
    ];
    rowNum++;
  }
  styleDataRows(summarySheet, 10, rowNum - 1);

  // ── Sheet 2: Order Details ──
  const detailSheet = workbook.addWorksheet("Order Details", {
    properties: { tabColor: { argb: "3B82F6" } },
  });
  detailSheet.columns = [
    { header: "", key: "id", width: 10 },
    { header: "", key: "date", width: 14 },
    { header: "", key: "time", width: 10 },
    { header: "", key: "customer", width: 20 },
    { header: "", key: "phone", width: 14 },
    { header: "", key: "status", width: 12 },
    { header: "", key: "items", width: 10 },
    { header: "", key: "total", width: 14 },
    { header: "", key: "notes", width: 25 },
  ];

  addTitle(detailSheet, `Order Details — ${monthName}`, `Total: ${orders.length} orders`, 9);

  detailSheet.getRow(4).values = ["Order ID", "Date", "Time", "Customer", "Phone", "Status", "Items", "Total (₹)", "Notes"];
  styleHeaderRow(detailSheet.getRow(4));

  rowNum = 5;
  for (const order of orders) {
    const dateObj = order.createdAt;
    detailSheet.getRow(rowNum).values = [
      `#${order.publicId}`,
      dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      order.customer,
      order.phone,
      order.status,
      order.items.reduce((s, i) => s + i.quantity, 0),
      order.total,
      order.notes || "",
    ];
    rowNum++;
  }
  styleDataRows(detailSheet, 5, rowNum - 1);

  // ── Sheet 3: Product Breakdown ──
  const productSheet = workbook.addWorksheet("Product Sales", {
    properties: { tabColor: { argb: "10B981" } },
  });
  productSheet.columns = [
    { header: "", key: "product", width: 30 },
    { header: "", key: "brand", width: 18 },
    { header: "", key: "category", width: 15 },
    { header: "", key: "qty", width: 10 },
    { header: "", key: "revenue", width: 14 },
    { header: "", key: "avgPrice", width: 14 },
  ];

  addTitle(productSheet, `Product Sales — ${monthName}`, "Sorted by revenue", 6);

  productSheet.getRow(4).values = ["Product", "Brand", "Category", "Quantity Sold", "Revenue (₹)", "Avg Price (₹)"];
  styleHeaderRow(productSheet.getRow(4));

  const productSales: Record<string, { name: string; brand: string; category: string; qty: number; revenue: number }> = {};
  for (const order of orders) {
    for (const item of order.items) {
      const key = item.product.name;
      if (!productSales[key]) {
        productSales[key] = {
          name: item.product.name,
          brand: item.product.brand?.name || "—",
          category: item.product.category,
          qty: 0,
          revenue: 0,
        };
      }
      productSales[key].qty += item.quantity;
      productSales[key].revenue += item.quantity * item.price;
    }
  }

  const sortedProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue);
  rowNum = 5;
  for (const p of sortedProducts) {
    productSheet.getRow(rowNum).values = [
      p.name, p.brand, p.category, p.qty, p.revenue,
      p.qty > 0 ? Math.round(p.revenue / p.qty) : 0,
    ];
    rowNum++;
  }
  styleDataRows(productSheet, 5, rowNum - 1);

  const totalRow = productSheet.getRow(rowNum);
  totalRow.values = [
    "TOTAL", "", "",
    sortedProducts.reduce((s, p) => s + p.qty, 0),
    sortedProducts.reduce((s, p) => s + p.revenue, 0),
    "",
  ];
  totalRow.eachCell((cell) => {
    cell.font = { bold: true, size: 11, name: "Calibri" };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "E5E7EB" } };
    cell.border = {
      top: { style: "medium", color: { argb: BORDER_COLOR } },
      bottom: { style: "medium", color: { argb: BORDER_COLOR } },
      left: { style: "thin", color: { argb: BORDER_COLOR } },
      right: { style: "thin", color: { argb: BORDER_COLOR } },
    };
  });

  // ── Sheet 4: Customer Breakdown ──
  const customerSheet = workbook.addWorksheet("Customer Sales", {
    properties: { tabColor: { argb: "8B5CF6" } },
  });
  customerSheet.columns = [
    { header: "", key: "name", width: 22 },
    { header: "", key: "phone", width: 14 },
    { header: "", key: "orders", width: 12 },
    { header: "", key: "totalSpent", width: 14 },
    { header: "", key: "avgOrder", width: 14 },
    { header: "", key: "lastOrder", width: 14 },
  ];

  addTitle(customerSheet, `Customer Sales — ${monthName}`, "Top customers by spending", 6);

  customerSheet.getRow(4).values = ["Customer", "Phone", "Orders", "Total Spent (₹)", "Avg Order (₹)", "Last Order"];
  styleHeaderRow(customerSheet.getRow(4));

  const customerSales: Record<string, { name: string; phone: string; orders: number; totalSpent: number; lastOrder: Date }> = {};
  for (const order of orders) {
    const key = order.phone;
    if (!customerSales[key]) {
      customerSales[key] = { name: order.customer, phone: order.phone, orders: 0, totalSpent: 0, lastOrder: order.createdAt };
    }
    customerSales[key].orders += 1;
    customerSales[key].totalSpent += order.total;
    if (order.createdAt > customerSales[key].lastOrder) {
      customerSales[key].lastOrder = order.createdAt;
    }
  }

  const sortedCustomers = Object.values(customerSales).sort((a, b) => b.totalSpent - a.totalSpent);
  rowNum = 5;
  for (const c of sortedCustomers) {
    customerSheet.getRow(rowNum).values = [
      c.name, c.phone, c.orders, c.totalSpent,
      c.orders > 0 ? Math.round(c.totalSpent / c.orders) : 0,
      c.lastOrder.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    ];
    rowNum++;
  }
  styleDataRows(customerSheet, 5, rowNum - 1);

  return workbook.xlsx.writeBuffer();
}

export async function GET(request: NextRequest) {
  try {
    const username = await getAuthUser();
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "daily";
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");

    if (type === "monthly") {
      const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
      const month = monthParam ? parseInt(monthParam) : new Date().getMonth() + 1;
      const xlsxBuffer = await generateMonthlyReport(year, month);
      const monthName = new Date(year, month - 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
      const filename = `SGP_Sales_Report_${monthName.replace(" ", "_")}.xlsx`;
      return new NextResponse(xlsxBuffer as BodyInit, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } else {
      const from = fromParam ? new Date(fromParam) : new Date(new Date().setDate(new Date().getDate() - 30));
      const to = toParam ? new Date(toParam) : new Date();
      to.setHours(23, 59, 59, 999);
      const xlsxBuffer = await generateDailyReport(from, to);
      const fromStr = from.toISOString().split("T")[0];
      const toStr = to.toISOString().split("T")[0];
      const filename = `SGP_Daily_Report_${fromStr}_to_${toStr}.xlsx`;
      return new NextResponse(xlsxBuffer as BodyInit, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
