import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SajiloLiving | Everyday Living, Made Easier",
  description: "A cordless handheld vacuum for quick home and car cleanups. Order online with Cash on Delivery across Nepal.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
