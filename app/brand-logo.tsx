import Image from "next/image";
import Link from "next/link";

export default function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <Link className={`brand-logo ${className}`} href="/" aria-label="SajiloLiving home">
      <Image src="/logos/sajiloliving-homeleaf.svg" alt="SajiloLiving — Everyday Living, Made Easier" width={560} height={148} unoptimized />
    </Link>
  );
}
