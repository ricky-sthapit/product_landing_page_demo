# SajiloLiving COD product funnel

Next.js + Tailwind CSS landing page and Cash on Delivery checkout for the Cordless Handheld Vacuum Cleaner.

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and fill in the private values below.
4. Run `npm run dev`, then open `http://localhost:3000`.

The product price and delivery fees are defined in `app/api/order/route.ts` and `app/checkout/checkout-form.tsx`: offer price NPR 4,299, delivery NPR 150 inside Kathmandu Valley and NPR 250 outside. Update both if pricing changes.

## Google Sheets setup

1. Create a Google Cloud service account and enable the Google Sheets API for its project.
2. Share the target spreadsheet with the service account email as an Editor.
3. Set `GOOGLE_SPREADSHEET_ID` to the spreadsheet ID from its URL. Set `GOOGLE_SHEET_TAB` to the tab name you want; the default is `Orders`.
4. Set `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY`. For the private key, preserve newlines or use literal `\n` sequences in the environment value.

The order endpoint creates the configured tab if it does not exist, adds column headings to a blank tab, and appends each order as raw values.

## Gmail order emails

For Gmail SMTP, use a Google App Password (with 2-Step Verification enabled) as `SMTP_PASS`; do not use your regular account password. Set `SMTP_USER`, `ORDER_FROM_EMAIL`, and `ORDER_NOTIFICATION_EMAIL`. The customer confirmation uses the submitted customer email as its recipient and `ORDER_FROM_EMAIL` as its reply-to. `SMTP_HOST`, `SMTP_PORT`, and `SMTP_SECURE` default to Gmail SMTP on port 465.

Set `BRAND_NAME` to change the name in the customer email. Set `NEXT_PUBLIC_SITE_URL` for production email links if links are added later.

## Order flow

The checkout posts customer details to `/api/order`. The server validates the fields and calculates price and delivery itself, writes the order to the spreadsheet, then sends the store notification and customer receipt. The browser goes to `/thank-you` only after all three operations finish. If configuration or an integration fails, the checkout displays an error and does not claim the order was placed.

Spreadsheet columns: Created At, Order ID, Customer Name, Phone, Email, District, City / Municipality, Street Address, Delivery Note, Delivery Zone, Quantity, Unit Price, Subtotal, Delivery Fee, Total, Payment Method, Order Status.

## Content notes

- The five supplied product images are included in `public/images/` as PNGs.
- The reels section is omitted because no reel links were provided.
- The three review cards are clearly labeled illustrative samples. Replace them with verified customer feedback before presenting them as genuine testimonials.
- Battery life, suction, container capacity, and warranty are not stated because model-specific values were not supplied. The accessory image is presented as pictured contents with a note to confirm the actual package.
