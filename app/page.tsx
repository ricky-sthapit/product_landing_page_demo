import Image from "next/image";
import Link from "next/link";
import BrandLogo from "./brand-logo";

const features = [
  ["Cordless convenience", "Move around your home or car without managing a power cord."],
  ["Quick everyday cleanups", "Pick up dry crumbs, dust, and small messes as they happen."],
  ["Home and car ready", "A handy cleaning companion for seats, sofas, desks, and other suitable surfaces."],
  ["Compact to store", "Keep it in a cupboard or car boot, ready for the next quick cleanup."],
  ["Useful attachments", "The pictured nozzle and brush attachments help reach crevices and different surfaces."],
  ["Easy to handle", "A portable handheld design makes short, targeted cleaning jobs feel simpler."],
];

const faqs = [
  ["What can I clean with this cordless portable vacuum cleaner?", "Use it for everyday dry cleaning on suitable surfaces such as car interiors, sofas, desks, shelves, and accessible corners. It is intended for dust, crumbs, and loose dirt."],
  ["Can I use it to clean my car?", "Yes. Its portable, cordless design is convenient for car seats, floor mats, and accessible corners."],
  ["Does it need to be plugged in while I use it?", "No. It is designed for cordless operation with a rechargeable battery. Charge it according to the product instructions before use."],
  ["How long does the battery last?", "For compact handheld vacuums in this category, a full charge often provides about 15–25 minutes of spot cleaning. Treat this as a general estimate: this listing's exact runtime has not been verified, and actual battery life varies with suction setting and usage."],
  ["How do I charge the vacuum?", "The pictured set includes a USB charging cable. Follow the product's charging instructions and use a compatible power source."],
  ["Can I use it for liquids or wet surfaces?", "Unless the manufacturer confirms that your specific model supports wet cleaning, use it only for dry debris. Do not vacuum liquids or use it on wet surfaces."],
  ["What accessories are included?", "The product image shows crevice, brush, and wide nozzle attachments, plus a USB charging cable. Please confirm the included items with us before ordering, as box contents can vary by model."],
  ["Do you deliver across Nepal and what does delivery cost?", "We accept Cash on Delivery across Nepal. Delivery is NPR 150 inside Kathmandu Valley and NPR 250 outside the Valley."],
];

function Header() {
  return <><div className="announcement">CASH ON DELIVERY ACROSS NEPAL · EASY ORDERING</div><header className="site-header"><div className="container nav-row"><BrandLogo/><nav className="nav-links"><a href="#benefits">Benefits</a><a href="#gallery">In use</a><a href="#faq">FAQs</a><Link className="button" href="/checkout">Order now · NPR 799</Link></nav></div></header></>;
}

export default function Home() {
  return <>
    <Header />
    <main>
      <section className="hero"><div className="container hero-grid">
        <div><p className="eyebrow">A cleaner space, with less effort</p><h1>Small messes?<br />Clean them in a snap.</h1><p className="hero-copy">Meet your new everyday helper. This cordless handheld vacuum makes quick cleanups around the home and car feel easy, without dragging out a bulky machine.</p>
          <div className="price-row"><span className="price-now">NPR 799</span><span className="price-old">NPR 999</span><span className="save-pill">SAVE NPR 200</span></div>
          <div className="hero-actions"><Link className="button dark" href="/checkout">Order with Cash on Delivery <span aria-hidden>→</span></Link><a className="button outline" href="#benefits">Explore benefits</a></div><p className="microcopy">Delivery: NPR 150 inside Kathmandu Valley · NPR 250 outside Valley</p>
        </div>
        <div className="hero-image-wrap"><Image className="hero-image" src="/images/01_main_product_image.png" alt="Cordless handheld vacuum cleaner" width={710} height={615} priority /><div className="image-note">Home tidy. Car tidy. Sorted.</div></div>
      </div></section>
      <section className="trust-strip"><div className="container trust-items"><div><span>✓</span>Cash on Delivery across Nepal</div><div><span>✓</span>One-time payment on delivery</div><div><span>✓</span>Order confirmation by email</div></div></section>
      <section className="section" id="benefits"><div className="container"><div className="section-head"><p className="eyebrow">Made for everyday life</p><h2>Quick cleanups, right when you need them</h2><p>From sofa crumbs to dust between car seats, keep a compact cleaner close for those little jobs.</p></div><div className="feature-grid">{features.map(([title, desc], i) => <article className="feature-card" key={title}><div className="feature-icon">{["↗", "✦", "⌂", "▣", "⌁", "✓"][i]}</div><h3>{title}</h3><p>{desc}</p></article>)}</div></div></section>
      <section className="section tinted" id="gallery"><div className="container"><div className="section-head"><p className="eyebrow">One handy helper</p><h2>From living room to car seat</h2><p>Take on everyday dry messes in the places that need a quick refresh.</p></div><div className="gallery-grid"><div className="gallery-main"><Image src="/images/02_home_cleaning.png" alt="Using the cordless vacuum to clean a sofa" width={587} height={615} unoptimized style={{width:"100%",height:"100%",maxWidth:"100%",objectFit:"cover"}} /></div><div className="gallery-side"><div className="gallery-photo car-photo"><div className="photo-copy photo-copy-car"><strong>Keep your car spotless</strong><span>Pick up dust and crumbs from seats, mats, and tight spaces.</span></div></div><div className="gallery-photo storage-photo" role="img" aria-label="Lightweight cordless vacuum that is easy to carry and store"/></div></div></div></section>
      <section className="section"><div className="container"><div className="section-head"><p className="eyebrow">Simple to get started</p><h2>Clean in three easy steps</h2></div><div className="how-grid"><article className="how-card"><span className="step">01 · CHARGE</span><h3>Get it ready</h3><p>Charge the vacuum following the instructions for your model.</p></article><article className="how-card"><span className="step">02 · PICK AN ATTACHMENT</span><h3>Reach the mess</h3><p>Choose a suitable nozzle for your surface and the spot you want to clean.</p></article><article className="how-card"><span className="step">03 · QUICK CLEAN</span><h3>Put it back</h3><p>Handle dry debris, empty the container as directed, and store it nearby.</p></article></div></div></section>
      <section className="section tinted"><div className="container"><div className="section-head"><p className="eyebrow">A little more detail</p><h2>Included in the pictured set</h2><p>The product image shows useful attachments for everyday home and car cleanups.</p></div><div className="gallery-grid accessories-grid"><div className="accessories-image"><Image src="/images/03_accessories.png" alt="Handheld vacuum with pictured nozzle and brush attachments" width={422} height={574} unoptimized /></div><div className="how-card accessories-copy"><p className="eyebrow">Pictured accessories</p><h3>Tools for the little corners</h3><p>The picture shows the handheld vacuum, crevice nozzle, brush attachment, wide nozzle, and USB charging cable. Please confirm package contents and exact model details before purchase, as supplied accessories can vary.</p><Link className="button" href="/checkout">Order yours · NPR 799</Link></div></div></div></section>
      <section className="section tinted" id="faq"><div className="container"><div className="section-head"><p className="eyebrow">Good to know</p><h2>Frequently asked questions</h2><p>Have another question? Email us at <a href="mailto:ricky.sthapit@gmail.com">ricky.sthapit@gmail.com</a>.</p></div><div className="faq-list">{faqs.map(([q,a])=><details className="faq-item" key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></div></section>
      <section className="final-cta"><div className="container"><h2>Make everyday cleaning easier</h2><p>Get yours for NPR 799, with Cash on Delivery across Nepal.</p><Link className="button" href="/checkout">Continue to checkout →</Link></div></section>
    </main>
    <footer className="footer"><div className="container footer-row"><BrandLogo className="footer-brand"/><div>© {new Date().getFullYear()} SajiloLiving · COD across Nepal</div></div></footer>
  </>;
}
