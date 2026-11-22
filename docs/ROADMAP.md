# Boiko Machine & Tool - Roadmap

Informal backlog beyond v1. Not committed to timeline.

## Advanced file pipeline

- Virus scanning on uploads
- Presigned direct-to-Blob uploads for large CAD files
- Internal review queue UI for submitted drawings

## Product catalog

- Categories, materials, specs, MOQ notes (can be abstract and not directly linked to exact SKUs)
- Search across catalog items

### Catalog-Search with zero-result logging

- Save `SearchQuery` documents when `resultCount === 0`
- Admin view of demand signals (what people looked for but did not find)

## Social & external links

- YouTube, Facebook links in footer

## Parts-are-ready email

Not part of the billing pass. Marking a job completed does not send mail.

Later this is an admin action available once `workStatus` is `completed`, separate from the payment emails. It tells the customer the parts are finished and ready for pickup or shipment, repeats the quote or invoice code, and includes the pay link only when a balance is still due. It does not change `workStatus` or `paymentStatus`. A `readyNoticeSentAt` timestamp on the work order blocks a second send. The shop is BCC'd, matching the other billing emails. The wording covers both completed-and-unpaid and completed-and-paid jobs.

We only want to send this parts-are-ready email once but want to retain the ability to send invoices again if needed. We should clearly have a "send invoice" or "re-send invoice" button on the work order page, with a date showing the last invoice sent. The parts-are-ready email should be disabled once it's been used on a given work order.

This email does repeat the quote, invoice code, etc, but serves as a deliberate confirmation to the customer that the parts are ready for pickup or shipment. It's more of a "we're done" email than an invoice email, and is sent alongside the invoice email.

## Shop inquiries

- Unsure but we might want to give the internal shop agent the ability to introspect work orders from the DB, or at the very least expose the work order data in the per-inquiry chat, which we could easily fetch from the DB when loading that inquiry, provided one was linked.
