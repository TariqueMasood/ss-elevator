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
              <address className="footer-address">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                <span>{SITE.address}</span>
              </address>
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
