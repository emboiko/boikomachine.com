# Boiko Machine & Tool

Web presence and API for [boikomachine.com](https://boikomachine.com). Next.js landing page with contact form, portfolio, analytics, and MongoDB-backed services. WIP.

## Requirements

- **Node.js 20+** (recommended: `nvm install 20` / `nvm use 20`)
- MongoDB Atlas cluster
- Vercel account (deploy target)
- Cloudflare Turnstile site keys
- Vercel Blob store (`BLOB_READ_WRITE_TOKEN`)
- Resend API key (contact notifications and work-order emails)
- Stripe keys, when taking a deposit on a quote or a payment on `/pay`

## Local development

1. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

2. Fill in `.env.local` with your Atlas URI, Turnstile keys, Blob token, Resend key, Stripe keys, and admin auth vars (`SESSION_SECRET`, `ADMIN_PASSWORD_HASH` from `npm run hash:admin-password`).

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Architecture

```
Page (thin) → Page component → Section components
     → MST stores → services/client → API route handlers → lib/services → MongoDB / Vercel Blob
```

- **`app/page.jsx`** - renders `LandingPage` only
- **`stores/`** - MobX State Tree (UI, Contact, Portfolio)
- **`services/client/`** - browser `fetch` layer (stores call these only)
- **`lib/services/`** - server business logic (route handlers call these only)
- **`lib/storage/`** - Vercel Blob uploads for contact attachments and portfolio media

## Scripts

| Command                       | Description                                    |
| ----------------------------- | ---------------------------------------------- |
| `npm run dev`                 | Development server                             |
| `npm run build`               | Production build                               |
| `npm run start`               | Run production build locally                   |
| `npm run lint`                | ESLint                                         |
| `npm run format`              | Prettier write                                 |
| `npm run hash:admin-password` | Generate bcrypt hash for `ADMIN_PASSWORD_HASH` |

## Portfolio admin

Sign in at `/admin/login`, then manage projects at `/admin/portfolio`. Categories are fixed on the public site (machining, 3D printing, fabrication, repair & misc). Upload photos via the admin form; they are served from `/api/portfolio/media`.

## Work orders

Sign in at `/admin/login`, then open **Work orders**. Create a quote, send it, and print a letter-size copy from the work order page. The quote email links to `/quote/{code}`. Resend the quote before work starts. Once the job is completed, that same `BMT-` code becomes the invoice, which can be sent again if the customer needs another copy. Customers pay the finished invoice at `/pay` with that code. No customer account is required. A required deposit can be paid on the quote page. The remaining balance is collected after the job is completed.

Card payments use Stripe's Payment Element on the site. Set `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET`. The webhook path is `/api/stripe/webhook`. Locally:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Check and cash are recorded from the work order page after the money is in hand. Each sends the same kind of receipt as a card payment.

## Money

Persisted amounts are integer cents. Do not add, subtract, multiply, or divide money outside [`lib/money.js`](lib/money.js). That includes `amount * 100`. Form fields keep dollar strings until submit, then `dollarsToCents` converts them by splitting the decimal string. Display uses `formatCents`. Stripe amounts are already cents and still pass through `assertCents` before they are stored. Future financing math belongs in this module too.

## Deployment (Vercel)

1. Import the GitHub repo into Vercel.
2. Set environment variables from `.env.example` (use production `NEXT_PUBLIC_SITE_URL`).
3. Enable Vercel Analytics in the project dashboard.
4. Point DNS for `boikomachine.com` to Vercel.

## Contact form attachments - ops note

Submitted files are stored in **Vercel Blob**. Metadata lives in MongoDB; download via URLs in the Resend notification email.

**Recommended review workflow:** open attachments on a sandboxed machine or VM. Do not open unknown CAD/PDF files with macros enabled on your primary workstation.

## Google Business Profile alignment

Keep these identical on GBP and the website:

- **Name:** Boiko Machine & Tool
- **Phone:** (978) 346-5977
- **Website:** https://boikomachine.com

Service-area business - no home address published on the site.
