# SS Elevator – Next.js website

    npm install
    npm run dev      # http://localhost:3000
    npm run build && npm start

- Products & photos: `lib/products.js`, images in `public/images/`
- Phone / email / address / WhatsApp number: `lib/config.js`
- Styles: `app/globals.css`
- Deploy: push to GitHub and import in Vercel (zero config), or `npx vercel`.

## Catalog PDF notifications

The catalog is previewed at `/catalog`. A visitor's explicit download request
sends a notification email before the PDF is returned. Configure these server
environment variables for local development and deployment:

- `RESEND_API_KEY`: API key from Resend.
- `RESEND_FROM_EMAIL`: sender address on a domain verified with Resend.
- `CATALOG_NOTIFICATION_EMAIL`: optional notification recipient; defaults to
  the site email in `lib/config.js`.

The PDF is stored in `private/` and included in the Next.js server output for
the catalog API route. The in-browser preview is still accessible without
submitting the form, so this flow collects details for explicit download
requests but does not prevent saving or capturing the preview.
