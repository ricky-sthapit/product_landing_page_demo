import CheckoutForm from "./checkout-form";
import Link from "next/link";
import BrandLogo from "../brand-logo";

export default function CheckoutPage() {
  return <main className="page-shell"><div className="announcement">CASH ON DELIVERY ACROSS NEPAL · EASY ORDERING</div><header className="site-header"><div className="container nav-row"><BrandLogo/><Link href="/" className="checkout-store-link">← Continue shopping</Link></div></header><div className="container checkout-wrap"><p className="breadcrumbs"><Link href="/">Home</Link> / Checkout</p><h1 className="checkout-title">Complete your order</h1><p className="checkout-subtitle">Your cordless vacuum will be paid for in cash when it arrives.</p><CheckoutForm /></div></main>;
}
