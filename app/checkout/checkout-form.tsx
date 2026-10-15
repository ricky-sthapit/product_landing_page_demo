"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

const PRICE = 799;

export default function CheckoutForm() {
  const router = useRouter();
  const [zone, setZone] = useState("inside");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const delivery = zone === "inside" ? 150 : 250;
  const subtotal = useMemo(() => PRICE * quantity, [quantity]);

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    payload.zone = zone;
    payload.quantity = String(quantity);
    try {
      const response = await fetch("/api/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We couldn't submit your order. Please try again.");
      router.push(`/thank-you?order=${encodeURIComponent(result.orderId)}&total=${result.total}&delivery=${result.delivery}&zone=${result.zone}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "We couldn't submit your order. Please try again.");
      setSubmitting(false);
    }
  }

  return <form onSubmit={submitOrder}><div className="checkout-grid"><div className="panel"><h2>1. Your contact details</h2><div className="field-grid">
    <div className="field"><label htmlFor="name">Full name *</label><input id="name" name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="Your name" /></div>
    <div className="field"><label htmlFor="phone">Phone number *</label><input id="phone" name="phone" inputMode="tel" autoComplete="tel" required minLength={7} maxLength={20} placeholder="98XXXXXXXX" /></div>
    <div className="field full"><label htmlFor="email">Email address *</label><input id="email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" /><span className="field-hint">We’ll send your order confirmation here.</span></div>
  </div><div className="section-divider"/><h2>2. Delivery address</h2><div className="field-grid">
    <div className="field"><label htmlFor="district">District *</label><input id="district" name="district" required maxLength={80} placeholder="e.g. Kathmandu" /></div>
    <div className="field"><label htmlFor="city">City / Municipality *</label><input id="city" name="city" required maxLength={100} placeholder="e.g. Kathmandu Metropolitan City" /></div>
    <div className="field full"><label htmlFor="address">Street, area, and house details *</label><textarea id="address" name="address" required minLength={5} maxLength={300} placeholder="Ward, tole, street, landmark" /></div>
    <div className="field full"><label>Delivery area *</label><div className="radio-row"><label className="radio-card"><input type="radio" name="deliveryZone" checked={zone === "inside"} onChange={() => setZone("inside")} />Kathmandu Valley · NPR 150</label><label className="radio-card"><input type="radio" name="deliveryZone" checked={zone === "outside"} onChange={() => setZone("outside")} />Outside Valley · NPR 250</label></div><span className="field-hint">Delivery is available across Nepal. Choose the matching fee for your address.</span></div>
    <div className="field"><label htmlFor="quantity">Quantity *</label><select id="quantity" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>{[1,2,3,4,5].map(n=><option value={n} key={n}>{n}</option>)}</select></div>
    <div className="field"><label htmlFor="note">Delivery note (optional)</label><input id="note" name="note" maxLength={240} placeholder="Helpful landmark or timing" /></div>
  </div><div className="section-divider"/><h2>3. Payment method</h2><div className="radio-card"><input type="radio" checked readOnly /> Cash on Delivery <span style={{fontWeight:400,color:"#777d74"}}>— pay the courier when your order arrives</span></div>
    {error && <div className="error-box" role="alert">{error}</div>}<button className="button dark" style={{width:"100%",marginTop:23}} type="submit" disabled={submitting}>{submitting ? "Submitting your order…" : "Place COD order · NPR " + (subtotal + delivery).toLocaleString("en-IN")}</button><p className="secure-note">By placing your order, you agree to be contacted to confirm delivery details.</p>
  </div><aside className="panel"><h2>Order summary</h2><div className="summary-product"><Image src="/images/01_main_product_image.png" alt="Cordless handheld vacuum cleaner" width={100} height={90}/><div><strong>Cordless Handheld Vacuum Cleaner</strong><small>Offer price · Quantity {quantity}</small></div></div><div className="summary-lines"><div className="summary-line"><span>Subtotal</span><span>NPR {subtotal.toLocaleString("en-IN")}</span></div><div className="summary-line"><span>Delivery</span><span>NPR {delivery}</span></div><div className="summary-line total"><span>Total due on delivery</span><span>NPR {(subtotal + delivery).toLocaleString("en-IN")}</span></div></div><div className="cod-note"><strong>Cash on Delivery</strong><br/>Pay NPR {(subtotal + delivery).toLocaleString("en-IN")} in cash when your parcel arrives. We’ll email your order details after submission.</div><Link href="/" className="field-hint">← Continue shopping</Link></aside></div></form>;
}
