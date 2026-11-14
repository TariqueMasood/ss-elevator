# SS Elevator – Next.js website

    npm install
    npm run dev      # http://localhost:3000
    npm run build && npm start

- Products & photos: `lib/products.js`, images in `public/images/`
- Phone / email / address / WhatsApp number: `lib/config.js`
- Styles: `app/globals.css`
- Deploy: push to GitHub and import in Vercel (zero config), or `npx vercel`.

## Catalog PDF email notifications

The catalog is previewed at `/catalog`. A visitor's explicit download request
sends a confirmation email to the visitor and a lead notification to the owner
before the browser downloads the PDF. SMTP is used only by the server. Configure
these environment variables for local development and deployment:

- `SMTP_HOST`: SMTP server hostname.
- `SMTP_PORT`: SMTP port; defaults to `587` when omitted. Port `465` uses TLS.
- `SMTP_USERNAME`: SMTP login and sender email address.
- `SMTP_PASSWORD`: SMTP password or provider-issued app password.
- `OWNER_EMAIL`: recipient for download request notifications.

Email failures are logged and do not prevent the download request from
succeeding. The PDF remains in `public/` for the preview and download; as a
result, its URL is public and the preview can be saved without submitting the
form.

The Contact form uses the same SMTP settings to send an owner notification and
a customer acknowledgement. It includes an optional international phone
number; no additional environment variables are required.
