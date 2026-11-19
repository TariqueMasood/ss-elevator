import Link from "next/link";
import { SITE, wa } from "@/lib/config";
import { categories } from "@/lib/products";
import BackToTop from "./BackToTop";
import WhatsAppIcon from "./icons/WhatsAppIcon";

export default function Footer() {
  return (
    <>
      <footer>
        <div className="w">
          <div className="grid" data-reveal>
            <div>
              <h4>{SITE.name}</h4>
              <p className="footer-tagline">
                {SITE.tagline}
                <br />
                Professional &amp; Excellent in Elevator Spare Parts.
              </p>
              <a className="wa" href={wa()} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon size={20} /> WhatsApp Us
              </a>
            </div>
            <div>
              <h4>General</h4>
              <Link href="/">Home</Link>
              <Link href="/#about">About</Link>
              <Link href="/#products">Products</Link>
              <Link href="/#contact">Contact</Link>
            </div>
            <div>
              <h4>Categories</h4>
              {categories.map((category) => (
                <Link key={category} href="/#products">
                  {category}
                </Link>
              ))}
            </div>
            <div>
              <h4>Contact</h4>
              <a href={`tel:+${SITE.phone}`}>{SITE.phoneDisplay}</a>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              <span>{SITE.address}</span>
            </div>
          </div>
          <div className="copy" data-reveal>
            © {new Date().getFullYear()} SS Elevator Component Intl., Trader.
            All rights reserved.
          </div>
        </div>
      </footer>
      <a
        className="fab"
        href={wa()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppIcon size={30} />
      </a>
      <BackToTop />
    </>
  );
}
