# Backend functionality and API guide

**Proposal, not implemented.** The current app has no application endpoints. User-required services are **Supabase or Neon** persistence, **Mailgun** confirmation emails and **Google Cloud Console** OAuth. URL examples below remain framework-neutral. Finalize the database choice/auth layer, payment, guest checkout, currency and hosting decisions first. Follow [INTEGRATIONS.md](INTEGRATIONS.md) for provider-specific setup and durable data scope.

## Contract conventions

- Treat browser input as untrusted, including hidden fields, product IDs, quantities, coupon results, shipping fees and totals.
- Use durable opaque IDs and separate URL slugs. Prices/totals use integer minor units plus currency, never floating-point currency amounts in API contracts.
- Return UTC ISO timestamps and opaque pagination cursors with explicit limits.
- Error shape: `{ error: { code, message, fieldErrors?, requestId } }`; do not include stack traces, secrets or provider payloads.
- Use consistent HTTP status semantics: 400 malformed input, 401 missing/expired identity, 403 forbidden, 404 unavailable resource, 409 conflict, 422 field/business validation, 429 rate limit, 5xx service failure.
- Choose an anti-enumeration policy for private resources; a generic 404 is appropriate for inaccessible order IDs.
- Use idempotency keys for checkout/payment creation and retry-safe state transitions. Scope keys to actor + operation; bind each key to a request hash.
- Server must apply explicit bounds to search, paging, input sizes, quantity and upload size. Final numeric business limits are decisions, not currently enforced production policy.

## Service responsibilities and proposed endpoints

| Capability | Proposed endpoint / operation | Required behavior |
| --- | --- | --- |
| Identity | Provider signup/login/logout/recovery/OAuth; `GET /api/session` | Verified identity, secure session, real errors, expiry/revocation; no demo bypass in production |
| Profile | `GET/PATCH /api/me` | Current user's data, validated fields, provider-mediated email changes |
| Avatar | `POST /api/me/avatar-upload`, finalize/delete operations | Scoped upload, MIME/content validation, sanitized safe image, owned storage key |
| Address book | `GET/POST /api/me/addresses`, `PATCH/DELETE /api/me/addresses/:id` | Ownership, address validation, billing/shipping defaults |
| Catalog | `GET /api/products`, `GET /api/products/:slug`, `GET /api/categories` | Published items only; filter/sort/search/paging; real media and variant availability |
| Cart | `GET /api/cart`, `PUT/DELETE /api/cart/items/:variantId` | Guest or current-user owner; absolute quantity mutation; server price/stock revalidation |
| Wishlist | `GET /api/me/wishlist`, `PUT/DELETE /api/me/wishlist/:variantId` | User-owned unique entries and idempotent mutations |
| Quote | `POST /api/checkout/quote` | Items, coupon, delivery and destination validated; complete server totals and expiration |
| Order creation | `POST /api/orders` with idempotency key | Revalidate quote, reserve stock, snapshot order, create/reuse payment attempt |
| Payment reconciliation | `POST /api/payments/webhooks/:provider` | Verify signed raw request, deduplicate event, reconcile authoritative provider state |
| Order history | `GET /api/me/orders`, `GET /api/orders/:id` | Owner-scoped paging/detail, immutable receipt, safe status |
| Articles | `GET /api/articles`, `GET /api/articles/:slug` | Published unique article content and correct related destinations |
| Contact | `POST /api/contact-messages` | Validation, anti-spam, durable acceptance and delivery retry |
| Newsletter | `POST /api/newsletter/subscriptions`, confirmation/unsubscribe operations | Explicit consent, deduplication, verified confirmation and suppression |

Provider SDK paths may differ from these API examples. Keep browser sessions and server identity checks consistent; do not add a second competing identity system.

## Authentication and account flow

1. Sign Up submits approved identity fields and consent to the chosen provider/service. The provider handles credentials; application profiles do not store passwords.
2. Handle duplicate identities, weak passwords, verification requirements, throttling and outages. Do not claim an account exists before provider success.
3. Sign In verifies credentials; return a real session. Confirm whether username login is actually supported before retaining the username-or-email label.
4. Replace the boolean `demoSignedIn` and fixed SH navbar with session/profile data. Apply account-route guards for UX and independent backend authorization for security.
5. Logout revokes the relevant session and clears private frontend caches. Define guest-cart transition separately; do not leak another user's data.
6. Remember me must have an explicit supported expiry policy. It is currently only a checkbox and must not imply durable authentication until integrated.
7. Google sign-in uses the Google Cloud Console OAuth client through the approved auth layer, with exact callbacks, safe return allowlists and provider-managed state/PKCE. Recovery uses that layer and Mailgun delivery where supported, with neutral feedback. Leave these controls clearly unavailable until connected.
8. Profile/password/email edits require appropriate provider APIs and reauthentication. The current password confirmation UI does not verify old credentials.

## Catalog and cart

Separate products from purchasable variants: product route slug identifies the product, variant ID identifies color/size/SKU/stock. Map synthetic current IDs to migration fixtures only; do not infer server variant identity by string suffix.

Define which source owns descriptions, gallery media, dimensions, room categories, badges, discounts and reviews. Keep unpublished/deleted items out of public results. Return explicit unavailable/retired states rather than silently changing a product's identity.

Guest cart ownership should use a server-issued, protected anonymous identifier; never accept an arbitrary user ID or ownership token from request JSON. On login, merge guest and account carts once, deterministically, with variant deduplication and stock/max-quantity checks. Return a revised quote and visible notice if quantities/prices changed. Wishlist policy for guests requires a separate decision.

Prefer absolute quantity updates over increment requests to make retry behavior unambiguous. If using cart revision numbers, reject stale writes with 409 and return the latest cart. A display price is not a price lock.

## Authoritative checkout quote

Request: `variantId`/quantity references or current cart revision, shipping method ID, destination fields and optional coupon code. Never require client totals as authority.

Response should contain:

- Quote ID/version, cart revision, expiration and currency.
- Validated line items with unit/line amounts and availability.
- Subtotal, discount, shipping, tax, total, applied coupon and eligibility messages, all in minor units.
- Supported payment methods and any address/fulfillment constraints.

Reprice on quantity, destination, shipping or coupon changes. Reject expired or mismatched quotes at order creation and require confirmation of changes. One rule engine must serve drawer, cart and checkout; the prototype's differing coupon paths must not remain separate production systems.

## Order and payment sequence

1. Validate actor/cart, addresses, quote revision, currency, stock, shipping and coupon eligibility on the server.
2. Inside a database transaction, lock relevant inventory/coupon usage, reserve stock, create a pending order and immutable line/address/totals snapshots. Record idempotency state. Bound reservation expiry.
3. Commit before external network calls. Create a payment intent/session using server totals and a provider idempotency key tied to order/attempt. An ambiguous timeout must be reconciled with the provider, not blindly duplicated.
4. Return a provider checkout/tokenization flow. Never post real PAN/CVC through the app's ordinary card inputs; use provider-hosted fields or redirect checkout.
5. Treat browser redirects as UX signals only. A signed webhook or authenticated server reconciliation verifies amount, currency, order reference and settled state.
6. Apply a legal, retry-safe order/payment transition. Convert reservations to sold stock once; consume coupon usage once; mark the purchased cart revision converted without erasing items added later.
7. Deliver confirmation through Mailgun using a durable retryable outbox/worker. Enqueue once per verified confirmation event; reconcile ambiguous send attempts and record provider delivery events. Do not claim exactly-once email delivery. Display processing/pending if the verified commerce result is not yet available.
8. On decline, cancellation or expiry release reservations. Handle late successful payment after expired stock reservation explicitly: reacquire stock if safe or trigger exception/refund workflow; never silently oversell.

Keep order, payment and fulfillment statuses separate. Proposed examples: order `pending_payment/confirmed/cancelled`; payment `created/pending/succeeded/failed/refunded/partially_refunded`; fulfillment `unfulfilled/processing/shipped/delivered`. Final transitions and refund capability require provider/operations agreement. Confirmation is not delivery.

Order receipts need a durable ID in the URL or another authorized retrieval mechanism. The current `/order-complete` reads only the last memory snapshot and cannot support reload, bookmarks or concurrent orders. For guests, approve a secure receipt-access mechanism; a public display order code alone must never grant access.

## Contact, newsletter and content

- Return “accepted for delivery” only after durable contact-message acceptance; use delivery status and retries. Do not claim an email was delivered merely because a database write succeeded.
- Rate-limit/honeypot contact/newsletter endpoints, validate maximum text lengths, encode output and avoid forwarding arbitrary HTML unsanitized.
- Store newsletter consent source/version/time, confirm addresses if required and honor unsubscribe/suppression idempotently. Current local welcome feedback is not a subscription.
- Use unique article slugs and redirect retired slugs deliberately; replace the current all-cards-to-one-article behavior.
- Align marketing claims with actual provider, shipping, refunds and support policies. “Secured by Stripe” is not evidence that Stripe is integrated.

## Frontend integration checklist

Replace local callbacks incrementally. Each feature needs loading, success, empty, validation, unauthorized, conflict, timeout and retry states. Disable only the relevant pending action; retain useful form data on failure except sensitive fields according to provider guidance. Prevent duplicated success navigation; announce errors/status to assistive technology.

Observability must use safe request/order/provider references, not passwords, PAN/CVC or full address/message bodies. Add alerts for failed reconciliation, stock exceptions, webhook failures, email backlog and checkout error rate. QA.md defines required failure-path coverage.
