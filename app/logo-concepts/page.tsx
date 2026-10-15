import Image from "next/image";
import Link from "next/link";

const concepts = [
  {
    name: "01 · Homeleaf",
    file: "sajiloliving-homeleaf.svg",
    description: "A simple home outline with a growing leaf. Warm, familiar, and close to the everyday home category.",
    mood: "Friendly · natural · clear",
  },
  {
    name: "02 · Open Door",
    file: "sajiloliving-open-door.svg",
    description: "An open doorway with a small sprout. It suggests welcome, ease, and discovering useful things for home.",
    mood: "Welcoming · useful · calm",
  },
  {
    name: "03 · Easy Orbit",
    file: "sajiloliving-orbit.svg",
    description: "A flowing S shape and leaf make a compact symbol that can work well as a social profile icon.",
    mood: "Modern · light · memorable",
  },
  {
    name: "04 · SL Monogram",
    file: "sajiloliving-monogram.svg",
    description: "A bold geometric badge built around the SajiloLiving initials for a more established, stamp-like identity.",
    mood: "Bold · polished · compact",
  },
];

export default function LogoConceptsPage() {
  return (
    <main className="logo-lab">
      <div className="logo-lab-top">
        <Link href="/" className="logo-lab-back">← Back to SajiloLiving</Link>
        <span>BRAND CONCEPTS · 2026</span>
      </div>
      <header className="logo-lab-heading">
        <p className="eyebrow">A small identity exploration</p>
        <h1>Four ways to say<br />SajiloLiving.</h1>
        <p>Distinctive, easy-to-use marks for a brand about making everyday living easier. Each sample is a clean vector SVG and uses your sage, cream, charcoal, and warm accent colors.</p>
      </header>
      <section className="logo-concept-grid" aria-label="Logo concepts">
        {concepts.map((concept) => (
          <article className={`logo-concept-card ${concept.file === "sajiloliving-homeleaf.svg" ? "is-selected" : ""}`} key={concept.file}>
            <div className="logo-concept-art">
              <Image src={`/logos/${concept.file}`} alt={`${concept.name} logo for SajiloLiving`} width={560} height={148} unoptimized />
              {concept.file === "sajiloliving-homeleaf.svg" && <span className="logo-selected-label">IN USE</span>}
            </div>
            <div className="logo-concept-copy">
              <div>
                <h2>{concept.name}</h2>
                <p>{concept.description}</p>
              </div>
              <span className="logo-concept-mood">{concept.mood}</span>
              <a className="logo-download" href={`/logos/${concept.file}`} download>Download SVG <span aria-hidden>↗</span></a>
            </div>
          </article>
        ))}
      </section>
      <footer className="logo-lab-footer">Homeleaf is now the active SajiloLiving logo. The other concepts remain available to download.</footer>
    </main>
  );
}
