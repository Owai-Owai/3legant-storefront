# Required integrations: database, Mailgun and Google OAuth

These requirements were supplied by the user after the initial source audit. They supersede generic provider suggestions elsewhere in the handbook. **No service has been connected or implemented by this documentation update.**

## Required services and remaining decisions

| Area | Required | Still to decide/configure |
| --- | --- | --- |
| Database | Supabase **or** Neon for durable application business data | Choose one primary provider, project/region, environments, hosting and migration tooling |
| Confirmation emails | Mailgun | Verified domain, sender, US/EU region, credentials, templates and delivery/retention policy |
| Google authentication | Google OAuth configured through Google Cloud Console | Cloud project, consent audience, web client, exact callbacks and chosen session/auth layer |

Google Cloud Console configures the OAuth client; it is not the application database or the session store. Mailgun delivers messages; it must not generate identity-verification tokens or decide that a payment succeeded.

## What “persist everything” means

Persist all durable business records instead of depending on singleton React state:

| Data | Persistence requirement |
| --- | --- |
| Identity/profile | Identity-provider subject plus real profile; same source for navbar and account screens |
| Addresses/avatar | User-owned address rows; avatar in approved object storage with database metadata/key |
| Catalog/categories/media | Canonical products, variants, prices, publication and media metadata; binary media may live in object storage |
| Inventory | Variant stock, reservations and reconciliation history appropriate to operations |
| Cart/wishlist | Owned durable records, guest cart expiration/merge policy and reload/new-device recovery |
| Coupons/shipping | Approved server rules, eligibility and redemptions; never browser-calculated authority |
| Orders/payments | Immutable item/address/contact/totals snapshots, authorized receipts, payment references/status and verified events |
| Articles | Unique published articles/slugs and related content |
| Contact/newsletter/consent | Accepted messages, subscription/suppression states and approved consent/version records |
| Email delivery | Durable outbox/notification attempts and redacted Mailgun delivery outcomes |

Do **not** store plaintext passwords, password confirmations, PAN/CVC, provider secrets or raw OAuth/session tokens in ordinary application tables. Credential/session material belongs to the approved secure identity layer. A checkbox, open drawer, hover state, current slide, unsent form draft and password visibility are transient UI state, not business records to persist. Preferences may be persisted only if explicitly chosen.

Database persistence does not mean storing binary files inside PostgreSQL. Choose object storage separately, particularly for a Neon-based deployment. Retention/deletion policies still apply; “everything” does not authorize retaining personal information indefinitely.

## Database integration paths

### Supabase option

- Use the PostgreSQL schema/constraints in DATABASE.md, not an unstructured key-value replacement for core commerce records.
- Supabase Auth can provide identity/session management and integrate the Google OAuth client. Configure allowed application redirects separately from Google's provider callback URI.
- Enable and test RLS/permissions for any browser-accessible tables/storage. Browser-visible publishable/anon credentials are not a substitute for ownership rules.
- Service-role credentials remain server-side. Privileged pricing/order/payment operations use trusted API/functions, not unrestricted frontend writes.
- Configure Mailgun SMTP for identity emails if supported by the chosen auth configuration; use Mailgun's server API for transactional order notifications.

### Neon option

- Use Neon PostgreSQL behind a trusted backend with server-held connection credentials; never put a database connection string in Vite/browser code.
- Select an appropriate auth/session layer, including a supported Neon auth option or a separate provider, and connect Google Cloud OAuth through it. Choosing Neon database alone does not establish login/session behavior.
- Use the provider-recommended pooled/runtime connection and appropriate migration connection strategy; separate environment branches/projects and protect production.
- Enforce row ownership in the backend/database roles; direct SQL access must not bypass the user authorization model.
- Choose avatar/product-media object storage and configure Mailgun identity-email integration with the selected auth service where supported.

Both paths must satisfy the same contracts, transaction/idempotency rules and QA checks. Do not connect both databases merely because the requirement says “supabase/neon.” Record the selected path before implementation.

## Mailgun confirmation emails

1. Set up the approved sending domain and DNS authentication: SPF/DKIM, plus an appropriate DMARC policy. Confirm sender/reply-to and Mailgun region. Use test recipients and sandbox/domain restrictions during development.
2. Keep API/SMTP credentials and webhook verification secrets in trusted secret management. Send API requests from a server/worker, never the browser.
3. Send account verification through the identity provider's supported Mailgun/SMTP integration. That provider creates and validates single-use expiring links; do not manufacture successful verification in frontend code.
4. Enqueue the order-confirmation intent transactionally with verified order confirmation, after the required payment/commerce condition is met. Browser navigation to success is not a trigger.
5. Use a durable outbox, unique notification/business-event key, versioned template and per-attempt status. Retry transient errors with bounded backoff; track permanent failures and alert operators.
6. Store safe Mailgun message references and verify webhook signatures/freshness before accepting delivery, bounce or complaint events. Deduplicate events and prevent later events from incorrectly reverting a terminal outcome.
7. Distinguish queued, provider-accepted, delivered, failed/bounced and complained states. “Mailgun accepted” is not “delivered to the customer.”
8. Order confirmations, account verification and enabled recovery/subscription confirmations are transactional flows. Newsletter campaigns require separate consent/suppression policy; a purchase is not marketing consent.

At-least-once workers and ambiguous send timeouts can cause duplicate delivery. Application deduplication and reconciliation reduce this risk; do not claim Mailgun offers exactly-once delivery. Investigate uncertain attempts before blindly resending. Email outages must not create a second order or charge, and must not undo a verified payment.

Templates use durable, authorized order/profile data, escaped customer text and appropriate currency/timezone display. Never include passwords, card data or unnecessary personal information. Keep links on approved application domains; identity verification tokens are handled under the provider's security policy.

## Google Cloud Console OAuth setup

1. Select/create the approved Cloud project, configure the OAuth consent screen/branding/audience and requested `openid`, `email`, `profile` scopes. Add test users when required and complete Google's publication/verification requirements applicable to the selected configuration.
2. Create a Web application OAuth client. Register exact JavaScript origins if the chosen flow requires them and exact redirect/callback URIs for the auth provider/server. Use separate environment clients where appropriate.
3. Distinguish the Google provider callback from the final app return URL. Supabase typically receives the Google callback at its auth endpoint before redirecting to an allowlisted app URL; Neon-based auth depends on its chosen layer. Obtain the actual callback from that layer rather than guessing.
4. Do not broadly allowlist every temporary Figma preview origin. Register the current approved development/staging/production URLs and reject untrusted return targets.
5. Store client secret server-side or in auth-provider settings; the client ID itself may be public. Use provider-managed Authorization Code flow, state/nonce/PKCE as appropriate, trusted token validation and secure session creation.
6. Map the verified Google issuer/subject to one durable user/profile. Decide account-linking policy; never merge accounts solely because an untrusted client sends a matching email.
7. Replace the current Google button's informational message with the real flow. Handle consent cancellation, invalid callback/state, expired code, provider outage and disabled/unverified user without displaying a false signed-in state.
8. Load navbar name/avatar and private data from the same real identity. Logout and session expiry clear private caches; refresh restores only a valid session under the approved Remember me policy.

Request no Google API scopes beyond the identity needs unless a later feature explicitly requires them. An OAuth app registration is not authorization to access a user's Gmail or Drive.

## Configuration handoff and acceptance

Provide chosen database/auth path, environment identifiers, migration process, callback/origin allowlists, Mailgun domain/region/sender and template/event mapping. Supply secrets only through approved secret management, never Markdown, chat, screenshots or committed files.

Before release: test durable reload/new-device data, two-user isolation, guest merge, real Google flow, session expiry/logout, verified account emails, payment-triggered order email, Mailgun failure/retry/bounce events and safe logs. See the integration cases in QA.md. This update records requirements only; those services remain unimplemented.
