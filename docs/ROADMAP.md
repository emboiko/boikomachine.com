# Boiko Machine & Tool - Roadmap

Informal backlog beyond v1. Not committed to timeline.

## Advanced file pipeline

- Virus scanning on uploads
- Presigned direct-to-Blob uploads for large CAD files
- Internal review queue UI for submitted drawings

## Product catalog

- Categories, materials, specs, MOQ notes (can be abstract and not directly linked to exact SKUs)
- Search across catalog items

## Search with zero-result logging

- Save `SearchQuery` documents when `resultCount === 0`
- Admin view of demand signals (what people looked for but did not find)

## Google Business Profile

- Optional reviews badge / live rating widget when ready (third-party; Google has no official GBP badge)

## Portfolio expansion

- **Dedicated portfolio routes (future)** - When 10+ documented jobs exist, add `/portfolio/[category]` and `/portfolio/[category]/[slug]` pages for SEO and shareable URLThe landing-page modal flow remains the entry point; routes become canonical detail pages.
- Real photography over time (white-background part shots)

## Social & external links

- YouTube, Facebook links in footer

## Parts-are-ready email

Not part of the billing pass. Marking a job completed does not send mail.

Later this is an admin action available once `workStatus` is `completed`, separate from the payment emails. It tells the customer the parts are finished and ready for pickup or shipment, repeats the quote or invoice code, and includes the pay link only when a balance is still due. It does not change `workStatus` or `paymentStatus`. A `readyNoticeSentAt` timestamp on the work order blocks a second send. The shop is BCC'd, matching the other billing emails. The wording covers both completed-and-unpaid and completed-and-paid jobs.
