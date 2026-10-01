# Security, privacy and production safeguards

This is a production requirements checklist, not a security certification. The present app is a UI demo with no application backend; its public sample account screens and arbitrary demo credentials must not become production authentication.

Required providers: Supabase or Neon, Mailgun and Google Cloud OAuth. Database service-role/connection credentials, Mailgun API/SMTP/webhook secrets and Google client secrets belong only in the trusted backend/auth-provider configuration. Verify Mailgun webhook signatures/freshness and exact Google callbacks/state/token validation. Never connect a privileged database directly from browser code. See [INTEGRATIONS.md](INTEGRATIONS.md).

## Priority risks and controls

| Priority | Current limitation / future risk | Required control |
| --- | --- | --- |
| P0 | `demoSignedIn` accepts any valid-looking form | Replace with verified provider sessions; exclude demo bypass from production builds |
| P0 | Account URLs are publicly accessible fixtures | Owner authorization in server/database; route guards only for UX |
| P0 | Client calculates prices, coupons and receipt success | Server quote/order totals; verified payment state before confirmation |
| P0 | Logout retains cart/address/order/wishlist state | Clear private caches on identity transition; explicitly convert only permitted guest data |
| P0 | Ordinary inputs can accept card data | Provider-hosted tokenization/checkout; never store/log PAN/CVC |
| P0 | Random receipt codes and in-memory orders | Unique durable references; authorized receipt lookup; no access by public number alone |
| P1 | Avatar validation currently checks browser MIME/size only | Server content validation, safe decoding/re-encoding, scoped storage and limits |
| P1 | Contact/newsletter forms are local and unthrottled | Rate limits, abuse controls, delivery queue, consent and retention |
| P1 | Static legal and payment/security marketing claims | Legal/content review matched to real capabilities |
| P1 | Third-party fonts/maps/social links | Document external services, privacy/referrer policy and appropriate consent requirements |

## Identity and authorization

- Use the approved identity provider for credentials, recovery, verification, OAuth and password changes; do not build plaintext password storage.
- For cookie sessions, use HTTPS, HttpOnly, Secure and appropriate SameSite settings, server expiry/revocation, and CSRF protection for mutating requests. If the provider uses a different session mechanism, document its threat model and protections explicitly.
- Never trust user ID from request JSON, cart ID in a URL, hidden total, browser session flag or user-editable role metadata.
- Check owner/guest access for every object, including nested order items, address IDs, wishlist IDs, upload keys and webhook processing targets.
- Test two users, a signed-out visitor, an expired session and a guest cart. Guessed identifiers must not reveal or modify another actor's data.
- Use neutral recovery feedback, throttled login/signup, safe redirect allowlists and OAuth state/PKCE. Reauthentication is required for sensitive changes according to provider policy.
- On logout clear private caches and sensitive local state. Test browser Back, multiple tabs and account switching; clearing a navbar boolean is insufficient.

## Payments and inventory

Server validates amount, currency, stock, discount, shipping and tax before creating any provider request. Webhooks require signature verification against raw request bytes, replay/deduplication controls and provider-state reconciliation. Browser success URLs cannot mark orders paid.

Use separate test/live provider credentials and webhook secrets. Never request or print secrets in documentation/test reports. Only the trusted service may transition payment state, consume stock or redeem coupon quota. Refunds/late events must not repeat stock changes or confirmation emails.

Treat ambiguous timeouts as unresolved, not failed payments; query/reconcile using durable provider references. Keep signed event receipts and reconciliation logs with approved retention, redacting unnecessary payloads.

## Secrets and environment boundaries

- Vite frontend/public variables are shipped to users. Never expose database passwords, service-role keys, payment secrets, signing secrets or email credentials there.
- Example categories such as `DATABASE_URL`, provider secret keys and webhook secrets belong in server secret management; final names depend on the chosen stack.
- Commit only safe example names/empty placeholders if an environment template is later added. Never commit a populated `.env` or copy platform secrets into repo files.
- Apply least-privilege service roles, rotation and separate development/staging/production resources.
- Disable debug payload dumps and inspect production source maps/build artifacts for accidental sensitive configuration.

## Privacy and sensitive data

Classify account email, phone, addresses, contact messages, avatar files and order history as personal data. Define purpose, legal basis/consent where needed, access roles, retention, deletion and export process before collecting it. Retention values are unresolved business/legal decisions, not guessed durations.

Minimize order snapshots to what fulfillment/receipts require. Restrict support-message access. Analytics must not capture passwords, card fields, full form bodies or personal message text. Redact logs at collection time, not only at display time.

The prototype clears auth/payment DOM fields on successful submission and uses no application storage for them. Browser autofill/password-manager behavior is external to that guarantee. Use dummy credentials/card data during preview QA.

## Uploads and rendered content

- Authenticate and scope avatar upload intent/finalization; generated object keys, size limits and expiry cannot be supplied unchecked by the browser.
- Validate actual file content and dimensions, not just extension/MIME; strip metadata and re-encode where appropriate. Avoid serving active SVG/HTML as avatars.
- Use private storage or explicitly approved public avatar policy; enforce object ownership and safe deletion.
- Sanitize rich article/admin content and encode user text. React text rendering helps, but future HTML injection/sanitization remains a distinct concern.
- Allowlist externally fetched media if the backend introduces image proxy/import features; avoid SSRF and internal-network access.

## Operational release gate

Before launch: authorization matrix tests, rate-limit/CSRF tests, webhook/idempotency tests, hosted payment integration review, secret scan, dependency review, safe logs, backup restoration, incident/rollback runbook and legal/content review.

Restrict fulfillment/admin tooling to approved roles with audit trails. No admin interface currently exists; ownership/permissions for operational stock, delivery and refund updates must be defined rather than assumed.

See [QA.md](../QA.md) for executable-suite requirements and acceptance cases. Mark tests not run explicitly; do not represent a source audit as penetration testing.
