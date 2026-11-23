// Change company details here – used across the whole site.
export const SITE = {
  name: "SS ELEVATOR",
  tagline: "Component Intl., Trading",
  phone: "919118535966", // WhatsApp number with country code, no + or spaces
  phoneDisplay: "+91-9118535966",
  email: "sselevator@hotmail.com",
  web: "https://ss-elevator.vercel.app/",
  address: "H#19, 2nd Floor Purabaaz, Aurangabad, Mau (U.P.) 275101, India",
  /** Shown in the Why Us section stats. Update when these change. */
  stats: [
    { value: "6", label: "Product groups" },
    { value: "33+", label: "Catalog pages" },
    { value: "5", label: "Countries served" },
    { value: "2022", label: "Established" },
  ],
  /** Open Graph image shown when the site is shared on social / WhatsApp. */
  ogImage: "/ss-elevator-logo.jpg",
};
export const WA_MSG =
  "Hi SS Elevator, I'm interested in your elevator spare parts. Please share details and pricing.";
export const wa = (text = WA_MSG) =>
  `https://wa.me/${SITE.phone}?text=${encodeURIComponent(text)}`;
