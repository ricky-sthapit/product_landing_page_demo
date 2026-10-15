import nextEnv from "@next/env";
import { google } from "googleapis";
import nodemailer from "nodemailer";

nextEnv.loadEnvConfig(process.cwd());

const required = ["GOOGLE_SPREADSHEET_ID", "GOOGLE_SERVICE_ACCOUNT_EMAIL", "GOOGLE_PRIVATE_KEY", "SMTP_USER", "SMTP_PASS"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) throw new Error(`Missing environment variables: ${missing.join(", ")}`);

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });
const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
const tab = process.env.GOOGLE_SHEET_TAB || "Orders";
let spreadsheet = await sheets.spreadsheets.get({ spreadsheetId, fields: "sheets(properties(sheetId,title),bandedRanges)" });
if (!spreadsheet.data.sheets?.some((sheet) => sheet.properties?.title === tab)) {
  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests: [{ addSheet: { properties: { title: tab } } }] } });
  spreadsheet = await sheets.spreadsheets.get({ spreadsheetId, fields: "sheets(properties(sheetId,title),bandedRanges)" });
}

const sheet = spreadsheet.data.sheets?.find((entry) => entry.properties?.title === tab);
if (sheet?.properties?.sheetId === undefined) throw new Error(`Could not access the ${tab} sheet tab.`);
const sheetId = sheet.properties.sheetId;
const escapedTab = tab.replace(/'/g, "''");
const headings = ["Created At", "Order ID", "Customer Name", "Phone", "Email", "District", "City / Municipality", "Street Address", "Delivery Note", "Delivery Zone", "Quantity", "Unit Price (NPR)", "Subtotal (NPR)", "Delivery Fee (NPR)", "Total (NPR)", "Payment Method", "Order Status"];
const existing = await sheets.spreadsheets.values.get({ spreadsheetId, range: `'${escapedTab}'!A:Q` });
if (!existing.data.values?.length) {
  await sheets.spreadsheets.values.update({ spreadsheetId, range: `'${escapedTab}'!A1:Q1`, valueInputOption: "RAW", requestBody: { values: [headings] } });
}

const requests = [
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
if (!hasOrderBanding) {
  requests.push({ addBanding: { bandedRange: { range: { sheetId, startRowIndex: 0, startColumnIndex: 0, endColumnIndex: 17 }, rowProperties: { headerColor: { red: 0.322, green: 0.4, blue: 0.325 }, firstBandColor: { red: 1, green: 1, blue: 1 }, secondBandColor: { red: 0.96, green: 0.97, blue: 0.95 } } } } });
}
await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
console.log(`Formatted spreadsheet tab "${tab}" with a frozen sage header, alternating rows, readable widths, wrapped addresses, and NPR currency columns.`);

const port = Number(process.env.SMTP_PORT || 465);
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port,
  secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});
await transporter.verify();
console.log("Gmail SMTP authentication verified. No message was sent.");
