# auth.md

You are an agent looking for how to register or authenticate against Boiko Machine & Tool (`https://boikomachine.com`).

## Current state

This site does **not** support agentic registration, OAuth, API keys, or customer accounts.

- There is no public sign-up or sign-in.
- There is no Protected Resource Metadata at `/.well-known/oauth-protected-resource`.
- There is no Authorization Server metadata, `agent_auth` block, identity endpoint, or claim ceremony.
- Do **not** attempt `identity_assertion`, `service_auth`, or `anonymous` registration against this host.

Public site content is available without credentials. Stop here for auth purposes.

## What this site is

Boiko Machine & Tool is a public marketing and contact site for a machine shop. Visitors browse capabilities and portfolio work, then reach out by phone, email, or the contact form. There are no end-user accounts to create or act on behalf of.

## How to interact without auth

1. Read public pages and `robots.txt` (including Content Signals) for crawl and usage preferences.
2. Use the sitemap at `/sitemap.xml` for discoverable URLs.
3. For human contact on behalf of a user, direct them to the site contact options — do not invent credentials or probe private paths.

Contact details are published on the homepage (`https://boikomachine.com`).

## Errors you should expect

| Situation | Meaning | What to do |
| --- | --- | --- |
| Missing `/.well-known/oauth-protected-resource` | No OAuth resource is advertised | Do not invent registration endpoints |
| `401` / `403` on non-public paths | Private or staff-only surface | Stop; no customer auth exists to recover with |
| Contact form challenges | Bot protection for human submissions | Do not automate form abuse; have the user contact the shop directly |

## Revocation

Not applicable. This site does not issue agent credentials.
