import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata = {
  title: "SS Elevator – Component Intl., Trading",
  description: "Professional & Excellent in Elevator Spare Parts. Safety components, car frame parts, buffers, rubber, brackets and more across the Middle East.",
};

export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
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
