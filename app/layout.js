import { Plus_Jakarta_Sans, DM_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import { SITE } from "@/lib/config";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  weight: ["500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm",
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "SS Elevator – Component Intl., Trading",
  description: "Professional & Excellent in Elevator Spare Parts. Safety components, car frame parts, buffers, rubber, brackets and more across the Middle East.",
  metadataBase: new URL(SITE.web),
  openGraph: {
    title: "SS Elevator – Component Intl., Trading",
    description: "Professional & Excellent in Elevator Spare Parts. Safety components, car frame parts, buffers, rubber, brackets and more across the Middle East.",
    url: SITE.web,
    siteName: SITE.name,
    images: [{ url: SITE.ogImage, width: 400, height: 400, alt: "SS Elevator logo" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "SS Elevator – Component Intl., Trading",
    description: "Professional & Excellent in Elevator Spare Parts across the Middle East.",
    images: [SITE.ogImage],
  },
  icons: {
    icon: "/ss-elevator-logo.jpg",
    apple: "/ss-elevator-logo.jpg",
  },
};

export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${dmSans.variable}`}>
      <body>
        <ScrollReveal />
        <Header />
        {children}
        <Contact />
        <Footer />
      </body>
    </html>
  );
}
