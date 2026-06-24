# Boiko Machine & Tool — Roadmap

Informal backlog beyond v1. Not committed to timeline.

## Near-term (before first production deploy)

- **Deploy pipeline** — Vercel staging project first; later: feature branch → staging → `main`
- **Portfolio admin CRUD** — last major item before initial go-live (see §4)

**Testing:** No automated test suite planned for v1. The site is small; manual smoke tests on form, auth, and deploy are enough unless complexity grows.

## Already in place

- Landing page, contact form, Turnstile, MongoDB submissions
- Resend notifications (`shop@`), private Blob attachments, session-gated downloads
- Admin login (`/admin/login`), 30-day session, header admin shortcut when signed in

---

## 1. Advanced file pipeline

- Virus scanning on uploads
- Presigned direct-to-Blob uploads for large CAD files
- Internal review queue UI for submitted drawings

## 2. Product catalog

- Categories, materials, specs, MOQ notes (can be abstract and not directly linked to exact SKUs)
- Search across catalog items

## 3. Search with zero-result logging

- Save `SearchQuery` documents when `resultCount === 0`
- Admin view of demand signals (what people looked for but did not find)

## 4. Admin UI

- Portfolio CRUD (categories, descriptions, media — see §6)
- Contact submission inbox (read-only list; email remains primary workflow)

## 5. Google Business Profile

- Link to GBP listing in footer
- Optional reviews badge when ready
- Eventually pipe Google reviews into the site

## 6. Portfolio expansion

- Category grids from the main portfolio section (fixtures, bushings, prototypes, etc.)
- Optional fields per item: description, in-progress shop photos, 3D model, prototype vs final, YouTube clip link
- Real photography over time (white-background part shots; replace SVG placeholders)
- Ties directly into admin portfolio CRUD

## 7. Service area & positioning

- Rework copy so southern NH / Merrimack Valley stays primary without implying we only serve locally
- Welcome inquiries from farther away when the job is workable (more consultation / prototyping / shipping as needed)
- Default tone: we want any work we can accept and profit from

## 8. Customer resources

- Curated links for customers who want to draw or model parts (web-based CAD, Autodesk tools, etc.)
- Messaging: 3D models and drawings are ideal; photos/PDFs/descriptions are fine — we can help customers who cannot or do not want to model

## 9. Social & external links

- YouTube, Facebook, Google Business links in footer or dedicated section

## 10. Payments & billing (TBD)

- Deposits, invoicing, payment processing for a solo manual shop — research options when volume warrants it
