import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { SITE } from "@/config/site";
import { Header, Footer, WhatsAppFloat } from "@/components/Chrome";
import { Cursor } from "@/components/Cursor";

const heading = Manrope({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-heading" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-body" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | Job-Oriented Courses in ${SITE.city}`,
    template: `%s | ${SITE.shortName}`,
  },
  description: SITE.tagline,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} | Courses in ${SITE.city}`,
    description: SITE.tagline,
  },
  twitter: { card: "summary_large_image", title: SITE.name, description: SITE.tagline },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${heading.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white text-ink">
        <Cursor />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
