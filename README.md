# Boiko Machine & Tool

Web presence and API for [boikomachine.com](https://boikomachine.com). Next.js landing page with contact form, portfolio, analytics, and MongoDB-backed services.

## Requirements

- **Node.js 20+** (recommended: `nvm install 20` / `nvm use 20`)
- MongoDB Atlas cluster
- Vercel account (deploy target)
- Cloudflare Turnstile site keys
- Vercel Blob store (`BLOB_READ_WRITE_TOKEN`)
- Resend API key (contact notifications)

## Local development

1. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

2. Fill in `.env.local` with your Atlas URI, Turnstile keys, Blob token, Resend key, and admin auth vars (`SESSION_SECRET`, `ADMIN_PASSWORD_HASH` from `npm run hash:admin-password`).

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

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production build locally |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |
| `npm run hash:admin-password` | Generate bcrypt hash for `ADMIN_PASSWORD_HASH` |

## Portfolio admin

Sign in at `/admin/login`, then manage projects at `/admin/portfolio`. Categories are fixed on the public site (milling, turning, grinding, 3D printing, welding, misc). Upload photos via the admin form; they are served from `/api/portfolio/media`.

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
