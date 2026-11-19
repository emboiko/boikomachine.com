# auth.md

You are an agent looking for how to register or authenticate against Boiko Machine & Tool (`https://boikomachine.com`).

This document is self-contained. There is no OAuth Protected Resource Metadata and no Authorization Server on this host — do not fetch `/.well-known/oauth-protected-resource` or `/.well-known/oauth-authorization-server` expecting registration metadata.

## Agent audience

Any agent (browser agent, crawler, or assistant acting for a human) that needs to understand how authentication works on this public marketing and contact site.

There are no customer accounts, no API keys, and no agent credentials to obtain. Public pages are readable without registration.

## Registration methods supported

Only `anonymous` access to public content:

- No account is created.
- No credential is issued.
- Call or fetch public URLs directly.

`identity_assertion`, `service_auth`, ID-JAG, verified-email claim ceremonies, and `POST /agent/auth` are **not** supported. Do not invent registration requests against this host.

## Registration and provisioning endpoints

There are no registration or provisioning endpoints.

- `register_uri`: none
- `claim_uri`: none (nothing to claim; public access needs no binding)
- `revocation_uri`: none (no credentials are issued)

Staff-only surfaces are out of scope for agents and are not customer auth.

## Credential use

Credentials are not used on the public site.

- Do not send `Authorization` headers to public pages.
- Do not ask users to paste passwords, tokens, or API keys for this site.

## Contacting the shop

Human visitors use the contact form on the homepage. That form is protected by Cloudflare Turnstile and is not for agents. Do not POST `/api/contact`.

Agents send a JSON inquiry with no API key and no Turnstile token:

`POST https://boikomachine.com/api/contact/agent`

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "978-555-0100",
  "message": "Looking for a repair quote on a fixture.",
  "agentName": "ChatGPT"
}
```

Required: `name`, `email`, `message`. Optional: `phone`, `agentName`. Do not attach files.

Responses:

- `200` — inquiry accepted
- `400` — invalid JSON or fields
- `403` with `code: agent_contact_disabled` — the shop has turned this route off. Stop retrying and use the phone or email published on the homepage.
- `429` — a rate limit was reached. Honor `Retry-After` and do not retry in a loop.

## Machine-readable summary

```json
{
  "agent_auth": {
    "skill": "https://boikomachine.com/auth.md",
    "register_uri": null,
    "identity_types_supported": ["anonymous"],
    "anonymous": {
      "credential_types_supported": ["none"],
      "claim_uri": null
    }
  }
}
```

## Related discovery

- Site: `https://boikomachine.com`
- Sitemap: `https://boikomachine.com/sitemap.xml`
- Crawl preferences: `https://boikomachine.com/robots.txt`

## Errors you should expect

| Situation                                 | Meaning                                                 | What to do                                            |
| ----------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------- |
| Missing OAuth well-known documents        | No OAuth resource or authorization server is advertised | Stay with this file; do not invent endpoints          |
| `401` / `403` on non-public paths         | Private or staff-only surface                           | Stop; no customer auth exists to recover with         |
| `403` with `code: agent_contact_disabled` | Agent contact is turned off                             | Stop retrying. Use the phone or email on the homepage |
| `429` on `POST /api/contact/agent`        | Rate limit                                              | Honor `Retry-After`. Do not loop                      |
| Turnstile on `POST /api/contact`          | Human contact form                                      | Use `POST /api/contact/agent` instead                 |

## Revocation

Not applicable. This site does not issue agent credentials.
