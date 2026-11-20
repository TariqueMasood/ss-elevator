# SS Elevator – Next.js website

    npm install
    npm run dev      # http://localhost:3000
    npm run build && npm start

- Products & photos: `lib/products.js`, images in `public/images/`
- Phone / email / address / WhatsApp number: `lib/config.js`
- Styles: `app/globals.css`
- Deploy: push to GitHub and import in Vercel (zero config), or `npx vercel`.

## Catalog PDF email notifications

The catalog is previewed as page images at `/catalog`, so mobile browsers do
not expose their native PDF open/download controls. The original PDF is stored
outside `public/`; a visitor must submit the request form to receive a signed,
seven-day download link by email. Configure these environment variables for
local development and deployment:

- `SMTP_HOST`: SMTP server hostname.
- `SMTP_PORT`: SMTP port; defaults to `587` when omitted. Port `465` uses TLS.
- `SMTP_USERNAME`: SMTP login and sender email address.
- `SMTP_PASSWORD`: SMTP password or provider-issued app password.
- `OWNER_EMAIL`: recipient for download request notifications.
- `CATALOG_DOWNLOAD_SECRET`: random secret of at least 32 bytes used to sign
  catalog links. Generate one with
  `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`.

The preview pages are public and can be saved individually, but the original
PDF is not publicly served. A valid email link opens the original PDF in the
browser's built-in viewer, where the user can choose to download it. Email
failures are reported by the request form; owner-notification failures are
logged.

The site uses DM Sans for body text and controls, and Plus Jakarta Sans for
headings and primary action labels. Email templates use the same font stacks
with Arial fallbacks; some email clients may use the fallback if they don't
load web fonts.

During local development, email links point to the current dev-server origin
and can only be opened on a device that can reach that server. Production links
use the configured site URL in `lib/config.js`.

The Contact form uses the same SMTP settings to send an owner notification and
a customer acknowledgement. No additional environment variables are required.
