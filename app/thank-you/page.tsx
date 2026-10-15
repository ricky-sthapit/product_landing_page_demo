import Link from "next/link";
import BrandLogo from "../brand-logo";

export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ order?: string; total?: string; delivery?: string; zone?: string }> }) {
  const { order, total, delivery, zone } = await searchParams;
  const parsedTotal = Number(total);
  const parsedDelivery = Number(delivery);
  const totalText = Number.isFinite(parsedTotal) && parsedTotal > 0 ? `NPR ${parsedTotal.toLocaleString("en-IN")} total` : "the amount shown in your checkout";
  const deliveryText = zone === "inside" ? "inside Kathmandu Valley" : "outside Kathmandu Valley";
  return <main className="page-shell"><div className="announcement">SAJILOLIVING · ORDER CONFIRMATION</div><header className="site-header"><div className="container nav-row"><BrandLogo/><Link href="/" className="checkout-store-link">← Back to store</Link></div></header><div className="success-wrap"><section className="success-card"><div className="success-check">✓</div><p className="eyebrow">Thank you for choosing SajiloLiving</p><h1>Your order is received!</h1><p>We’ve received your Cash on Delivery order. A confirmation email is on its way, and our team may contact you to confirm delivery details.</p>{order && <div className="order-id">Order reference: <strong>{order}</strong></div>}<p>Please keep <strong>{totalText}</strong> ready for the courier{Number.isFinite(parsedDelivery) && parsedDelivery > 0 ? `, including NPR ${parsedDelivery} delivery ${deliveryText}` : ""}.</p><Link href="/" className="button dark" style={{marginTop:12}}>Back to SajiloLiving</Link></section></div></main>;
}
