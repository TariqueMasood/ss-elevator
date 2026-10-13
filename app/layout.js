import "./globals.css";
import Header from "@/components/Header";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export const metadata = {
  title: "SS Elevator – Component Intl., Trading",
  description: "Professional & Excellent in Elevator Spare Parts. Safety components, car frame parts, buffers, rubber, brackets and more across the Middle East.",
};

export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Contact />
        <Footer />
      </body>
    </html>
  );
}
