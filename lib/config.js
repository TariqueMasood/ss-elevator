// Change company details here – used across the whole site.
export const SITE = {
  name: "SS ELEVATOR",
  tagline: "Component Intl., Trading",
  phone: "919118535966", // WhatsApp number with country code, no + or spaces
  phoneDisplay: "+91-9118535966",
  email: "sselevator@hotmail.com",
  web: "www.sselevator.in",
  address: "H#19, 2nd Floor Purabaaz, Aurangabad, Mau (U.P.) 275101, India",
};
export const WA_MSG = "Hi SS Elevator, I'm interested in your elevator spare parts. Please share details and pricing.";
export const wa = (text = WA_MSG) => `https://wa.me/${SITE.phone}?text=${encodeURIComponent(text)}`;
