import { google } from "googleapis";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type OrderInput = {
  name?: string; phone?: string; email?: string; district?: string; city?: string;
  address?: string; note?: string; zone?: string; quantity?: string | number;
};

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
const clean = (value: unknown, limit = 300) => String(value ?? "").trim().slice(0, limit);

function getConfig() {
  const required = ["GOOGLE_SPREADSHEET_ID", "GOOGLE_SERVICE_ACCOUNT_EMAIL", "GOOGLE_PRIVATE_KEY", "SMTP_USER", "SMTP_PASS", "ORDER_NOTIFICATION_EMAIL", "ORDER_FROM_EMAIL"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Order system is not configured. Missing: ${missing.join(", ")}`);
}

async function saveToSheet(row: (string | number)[]) {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const tab = process.env.GOOGLE_SHEET_TAB || "Orders";
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;
  const range = `'${tab.replace(/'/g, "''")}'!A:Q`;
  const headings = ["Created At", "Order ID", "Customer Name", "Phone", "Email", "District", "City / Municipality", "Street Address", "Delivery Note", "Delivery Zone", "Quantity", "Unit Price (NPR)", "Subtotal (NPR)", "Delivery Fee (NPR)", "Total (NPR)", "Payment Method", "Order Status"];
  let spreadsheet = await sheets.spreadsheets.get({ spreadsheetId, fields: "sheets(properties(sheetId,title),bandedRanges)" });
  if (!spreadsheet.data.sheets?.some((sheet) => sheet.properties?.title === tab)) {
    await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests: [{ addSheet: { properties: { title: tab } } }] } });
    spreadsheet = await sheets.spreadsheets.get({ spreadsheetId, fields: "sheets(properties(sheetId,title),bandedRanges)" });
  }
  const sheet = spreadsheet.data.sheets?.find((entry) => entry.properties?.title === tab);
  if (sheet?.properties?.sheetId === undefined) throw new Error(`Could not access the ${tab} sheet tab.`);
  const existing = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  if (!existing.data.values?.length) {
    await sheets.spreadsheets.values.update({ spreadsheetId, range: `'${tab.replace(/'/g, "''")}'!A1:Q1`, valueInputOption: "RAW", requestBody: { values: [headings] } });
  }
  const sheetId = sheet.properties.sheetId;
  const requests: object[] = [
    { updateSheetProperties: { properties: { sheetId, gridProperties: { frozenRowCount: 1, hideGridlines: true }, tabColor: { red: 0.322, green: 0.4, blue: 0.325 } }, fields: "gridProperties.frozenRowCount,gridProperties.hideGridlines,tabColor" } },
    { repeatCell: { range: { sheetId, startRowIndex: 0, endRowIndex: 1 }, cell: { userEnteredFormat: { backgroundColor: { red: 0.322, green: 0.4, blue: 0.325 }, textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontSize: 10, fontFamily: "Arial" }, horizontalAlignment: "CENTER", verticalAlignment: "MIDDLE", wrapStrategy: "WRAP" } }, fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)" } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, startColumnIndex: 0, endColumnIndex: 17 }, cell: { userEnteredFormat: { textFormat: { fontFamily: "Arial", fontSize: 10 }, verticalAlignment: "MIDDLE" } }, fields: "userEnteredFormat(textFormat,verticalAlignment)" } },
    { updateDimensionProperties: { range: { sheetId, dimension: "ROWS", startIndex: 0, endIndex: 1 }, properties: { pixelSize: 44 }, fields: "pixelSize" } },
    { updateDimensionProperties: { range: { sheetId, dimension: "ROWS", startIndex: 1, endIndex: 1000 }, properties: { pixelSize: 34 }, fields: "pixelSize" } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, startColumnIndex: 11, endColumnIndex: 15 }, cell: { userEnteredFormat: { numberFormat: { type: "CURRENCY", pattern: '"NPR" #,##0' }, horizontalAlignment: "RIGHT" } }, fields: "userEnteredFormat(numberFormat,horizontalAlignment)" } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 7, endColumnIndex: 9 }, cell: { userEnteredFormat: { wrapStrategy: "WRAP", verticalAlignment: "TOP" } }, fields: "userEnteredFormat(wrapStrategy,verticalAlignment)" } },
  ];
  const widths = [165, 180, 175, 130, 230, 135, 210, 280, 240, 175, 90, 130, 130, 130, 145, 130, 120];
  widths.forEach((pixelSize, index) => requests.push({ updateDimensionProperties: { range: { sheetId, dimension: "COLUMNS", startIndex: index, endIndex: index + 1 }, properties: { pixelSize }, fields: "pixelSize" } }));
  const hasOrderBanding = sheet.bandedRanges?.some((band) => band.range?.sheetId === sheetId && band.range.startColumnIndex === 0 && band.range.endColumnIndex === 17);
  if (!hasOrderBanding) requests.push({ addBanding: { bandedRange: { range: { sheetId, startRowIndex: 0, startColumnIndex: 0, endColumnIndex: 17 }, rowProperties: { headerColor: { red: 0.322, green: 0.4, blue: 0.325 }, firstBandColor: { red: 1, green: 1, blue: 1 }, secondBandColor: { red: 0.96, green: 0.97, blue: 0.95 } } } } });
  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}

async function sendEmails(order: { orderId: string; name: string; phone: string; email: string; district: string; city: string; address: string; note: string; quantity: number; zone: string; subtotal: number; delivery: number; total: number }) {
  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST || "smtp.gmail.com", port, secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
  const brand = clean(process.env.BRAND_NAME || "SajiloLiving", 80);
  const from = `"${brand}" <${process.env.ORDER_FROM_EMAIL}>`;
  const address = `${order.address}, ${order.city}, ${order.district}`;
  const safe = Object.fromEntries(Object.entries({ ...order, address, brand }).map(([key, value]) => [key, escapeHtml(String(value))]));
  const htmlDetails = `<p><strong>Order:</strong> ${safe.orderId}<br><strong>Product:</strong> Cordless Handheld Vacuum Cleaner × ${order.quantity}<br><strong>Subtotal:</strong> NPR ${order.subtotal.toLocaleString("en-IN")}<br><strong>Delivery:</strong> NPR ${order.delivery}<br><strong>Total due on delivery:</strong> NPR ${order.total.toLocaleString("en-IN")}<br><strong>Delivery area:</strong> ${order.zone === "inside" ? "Kathmandu Valley" : "Outside Kathmandu Valley"}<br><strong>Customer:</strong> ${safe.name}<br><strong>Phone:</strong> ${safe.phone}<br><strong>Email:</strong> ${safe.email}<br><strong>Address:</strong> ${safe.address}<br><strong>Note:</strong> ${safe.note || "—"}</p>`;
  const textDetails = `Order: ${order.orderId}\nProduct: Cordless Handheld Vacuum Cleaner × ${order.quantity}\nSubtotal: NPR ${order.subtotal}\nDelivery: NPR ${order.delivery}\nTotal due on delivery: NPR ${order.total}\nDelivery area: ${order.zone === "inside" ? "Kathmandu Valley" : "Outside Kathmandu Valley"}\nCustomer: ${order.name}\nPhone: ${order.phone}\nEmail: ${order.email}\nAddress: ${address}\nNote: ${order.note || "—"}`;
  await Promise.all([
    transporter.sendMail({ from, to: process.env.ORDER_NOTIFICATION_EMAIL, subject: `New COD order ${order.orderId} · NPR ${order.total}`, text: textDetails, html: `<h2>New Cash on Delivery order</h2>${htmlDetails}` }),
    transporter.sendMail({ from, to: order.email, replyTo: process.env.ORDER_FROM_EMAIL, subject: `Order received · ${brand}`, text: `Hi ${order.name},\n\nWe received your Cash on Delivery order.\n\n${textDetails}\n\nPlease keep the total ready for the courier. Thank you for shopping with ${brand}.`, html: `<h2>We received your order, ${safe.name}!</h2><p>Thank you for shopping with ${safe.brand}. Your Cash on Delivery order is confirmed.</p>${htmlDetails}<p>Please keep the total ready for the courier. Our team may contact you to confirm delivery details.</p>` }),
  ]);
}

export async function POST(request: Request) {
  let input: OrderInput;
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Please check your order details and try again." }, { status: 400 }); }
  const order = {
    orderId: `SL-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
    name: clean(input.name, 100), phone: clean(input.phone, 20), email: clean(input.email, 254).toLowerCase(),
    district: clean(input.district, 80), city: clean(input.city, 100), address: clean(input.address, 300), note: clean(input.note, 240),
    zone: input.zone === "outside" ? "outside" : input.zone === "inside" ? "inside" : "",
    quantity: Number(input.quantity),
  };
  if (order.name.length < 2 || !/^\+?[0-9 ()-]{7,20}$/.test(order.phone) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.email) || !order.district || !order.city || order.address.length < 5 || !order.zone || !Number.isInteger(order.quantity) || order.quantity < 1 || order.quantity > 5) {
    return NextResponse.json({ error: "Please provide a valid name, phone, email, delivery address, area, and quantity." }, { status: 400 });
  }
  const subtotal = order.quantity * 4299;
  const delivery = order.zone === "inside" ? 150 : 250;
  const total = subtotal + delivery;
  const createdAt = new Date().toISOString();
  const row = [createdAt, order.orderId, order.name, order.phone, order.email, order.district, order.city, order.address, order.note, order.zone === "inside" ? "Kathmandu Valley" : "Outside Valley", order.quantity, 4299, subtotal, delivery, total, "COD", "Received"];

  try {
    getConfig();
    await saveToSheet(row);
    await sendEmails({ ...order, subtotal, delivery, total });
    return NextResponse.json({ ok: true, orderId: order.orderId, total, delivery, zone: order.zone });
  } catch (error) {
    console.error("Order submission failed", { orderId: order.orderId, error });
    const message = error instanceof Error && error.message.startsWith("Order system is not configured.")
      ? "Orders are temporarily unavailable because the store integrations are not configured yet. Please try again later or contact us by email."
      : "We could not finish processing your order. Please contact SajiloLiving at ricky.sthapit@gmail.com before placing it again.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
