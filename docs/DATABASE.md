# Database design and persistence guide

**Proposed PostgreSQL relational model; no database or migrations currently exist.** The user requires **Supabase or Neon**; select one as the primary database. Hosting, ORM, migration tooling and auth/session layer remain open decisions. Mailgun sends confirmations and Google Cloud Console configures Google OAuth. The model below is a design contract, not executable DDL; follow [INTEGRATIONS.md](INTEGRATIONS.md) for persistence boundaries and provider setup.

## Modeling rules

- Use UUID primary keys for application entities, UTC timestamps and foreign keys. Map managed identity IDs explicitly; do not assume every provider ID is a UUID.
- Use integer minor units (`bigint` or suitably bounded integer) and a validated currency code. Define currency exponent/rounding policy before supporting more than USD.
- Nonnegative money/stock, positive bounded quantities, valid status transitions and uniqueness must be enforced server-side and in database constraints where possible.
- Do not store passwords, password confirmations, raw session secrets, PAN, CVC or provider secrets in application tables.
- Product slug, SKU, public order number and internal IDs are separate concepts.
- Snapshot purchased descriptions, variants, unit prices, discounts and addresses; subsequent catalog/profile edits must not change historical receipts.
- Index foreign keys and common owner/status/time queries. Do not use unbounded table scans as pagination.

## Identity and ownership

| Table | Essential fields | Constraints / lifecycle |
| --- | --- | --- |
| `profiles` | `id`, `auth_subject`, `first_name`, `last_name`, `display_name`, verified/contact email as approved, `avatar_key`, timestamps | Unique auth subject; email authority remains with identity provider; no password columns |
| `addresses` | `id`, `profile_id`, `full_name`, `phone`, `line1`, `line2`, `city`, `region`, `postal_code`, `country_code`, default billing/shipping flags | FK owner; at most one default of each kind per owner using partial unique indexes; approved country validation |
| `carts` | `id`, nullable `profile_id`, nullable `guest_token_hash`, `status`, `revision`, timestamps/expiry | Exactly one ownership mode; one active cart per owner; token hash never returned to browser |
| `wishlist_items` | `profile_id`, `variant_id`, `created_at` | Composite unique/primary key; private to owner; choose product-level alternative explicitly if desired |

Guest cart credentials belong in protected cookies/server handling; the DB stores a hash if needed. Auth-provider subjects require a trusted verification/mapping layer. Choose how identity deletion interacts with retained purchase records and legal retention before setting cascading deletes.

## Catalog and inventory

| Table | Essential fields | Constraints / lifecycle |
| --- | --- | --- |
| `products` | `id`, unique `slug`, name, description, dimensions, publication/archive state, timestamps | Public reads only for published records; archive rather than destroying purchased references |
| `product_variants` | `id`, `product_id`, unique `sku`, color/approved option attributes, `unit_amount`, optional `compare_at_amount`, currency, active flag | FK product; nonnegative amounts; authoritative purchasable identity |
| `product_media` | `id`, `product_id`, nullable `variant_id`, storage key/public URL, alt text, slot/order, presentation metadata | Variant belongs to the same product; safe file type; preserve Figma slot/crop metadata separately from commerce rules |
| `categories` | `id`, unique slug, name, sort order | Approved category labels, not arbitrary browser strings |
| `product_categories` | `product_id`, `category_id` | Composite unique key |
| `inventory` | `variant_id`, `on_hand`, `reserved`, version/timestamps | Unique variant; `0 <= reserved <= on_hand`; stock updates atomic |
| `inventory_reservations` | `id`, `order_id`, `variant_id`, quantity, status, expires/created timestamps | Positive quantity; unique order/variant; release/consume exactly once |
| `cart_items` | `cart_id`, `variant_id`, quantity, timestamps | Unique cart/variant; positive quantity; stored amount, if cached, is not authority |

Available stock is `on_hand - reserved`. Reserve under row lock or equivalent atomic compare-and-update; when selling, decrease both on-hand and reserved consistently. Expired reservations require a reliable worker and reconciliation. Decide backorder/multi-location requirements before adding complexity.

Reviews/questions are not currently implemented content. If included later, define moderated review/question tables, purchase verification, ratings aggregation and abuse policies separately; do not seed card stars as genuine customer reviews.

## Pricing, orders and payments

| Table | Essential fields | Constraints / lifecycle |
| --- | --- | --- |
| `shipping_methods` | `id`, code, display label, active flag and approved rule/config reference | Fixed demo fees are not live shipping policy; rule evaluation occurs on server |
| `coupons` | `id`, normalized unique code, discount type/value, currency if fixed, validity window, eligible scope/minimum, usage limits, active flag | Approved case normalization; valid values; global/per-user eligibility enforced transactionally |
| `coupon_redemptions` | `id`, coupon/order IDs, nullable profile or approved guest scope, reserved/consumed/released status, expiry | Unique order/coupon; prevent concurrent quota bypass; exclude released reservations from consumed totals |
| `orders` | `id`, unique public number, nullable owner or approved guest-access association, actor-scoped idempotency key/request hash, currency, subtotal/discount/shipping/tax/total, address/contact snapshots, order/payment/fulfillment states, timestamps | Nonnegative totals; totals consistent with snapshots; owner/guest access mandatory; transition rules server-controlled |
| `order_items` | `id`, `order_id`, nullable retained variant reference, SKU/name/options/media snapshot, quantity, unit/subtotal/discount/tax/total amounts | FK order; immutable after confirmation; exact line-total reconciliation |
| `payment_attempts` | `id`, `order_id`, provider, unique scoped provider reference, provider idempotency key, expected amount/currency, state, safe failure code, timestamps | No raw card data; one active attempt per approved flow; reconcile retries before creating another |
| `payment_events` | `id`, provider, provider event ID, type, verified received timestamp, processing state, safe metadata | Unique provider/event ID; durable deduplication; bounded/redacted payload retention |
| `outbox_events` | `id`, aggregate/order reference, event type, safe payload, status, attempt count, next retry time, timestamps | Transactionally enqueue with business change; idempotent consumption and failure escalation |
| `notification_deliveries` | `id`, unique business-event/recipient/template key, outbox/profile/order reference, template version, queued/accepted/delivered/failed state, timestamps | Mailgun confirmations; approved recipient retention; no secrets or verification-token plaintext in ordinary metadata |
| `notification_attempts` | `id`, `notification_id`, attempt number, safe Mailgun message reference/failure code, accepted timestamp | Unique notification/attempt; reconcile uncertain send result; bounded retry history |
| `email_provider_events` | `id`, provider/event ID, message reference, event type, verified timestamp and safe metadata | Deduplicate Mailgun webhooks; verify signatures/freshness; redacted payload and approved retention |

Checkout quotes can be signed short-lived server tokens or stored quote rows. If storing them, add `checkout_quotes` with actor/cart revision, totals/item snapshot, expiration and version; never trust a client quote without revalidation. This is an implementation choice, not a mandatory extra table.

Store immutable address/contact snapshots on orders even if the customer later edits or deletes an address-book entry. Use validated structured JSON or dedicated snapshot tables; document validation/index policy. Historical amounts are immutable; refunds are new provider/payment records or events, not overwritten order prices.

Order-total invariant: `total = subtotal - discount + shipping + tax`, with discount bounds and consistent line allocation. Server enforces cross-row sums within the order transaction; a simple CHECK cannot validate all related line rows. Currency must agree across variants, quote, order and provider request.

For idempotency, uniquely scope the key to actor and operation, retain a request hash and resulting order/payment reference. Reusing the key with different payload must conflict. Guest actor identity must be included; nullable user IDs alone are not a reliable uniqueness boundary.

## Content and communication

| Table | Essential fields | Constraints / lifecycle |
| --- | --- | --- |
| `articles` | `id`, unique slug, title, sanitized body, excerpt, hero media, author reference/name, featured/publication state, publication/update times | Public reads only when published; explicit related-article IDs; draft moderation |
| `contact_messages` | `id`, name, email, message, acceptance/delivery state, timestamps and retention deadline | Sensitive content restricted to authorized support workers; spam/rate limits; explicit deletion policy |
| `newsletter_subscriptions` | `id`, normalized email, pending/confirmed/unsubscribed state, consent source/version/time, confirmation/token hash metadata, timestamps | Unique normalized email; suppression survives resubscribe attempts unless approved consent flow; single-use expiring tokens |

Consent/legal version records may require a separate append-only table once legal requirements are established. Business must approve exactly what is recorded and for how long; collecting more data is not inherently safer.

## Relationship summary

```text
identity subject -> profile -> addresses / user cart / wishlist / orders
guest credential -> guest cart -> authorized guest order
products -> variants -> inventory / reservations
products <-> categories; products / variants -> media
carts -> cart_items -> variants
orders -> order_items / payment_attempts / inventory_reservations
coupons -> coupon_redemptions -> orders
payment provider -> verified payment_events -> order transitions + outbox
published articles; support-only messages; consented subscriptions
```

## Access policy matrix

| Data | Customer read/write | Trusted service access |
| --- | --- | --- |
| Published catalog/articles | Read only | Authorized publishing/admin workflows |
| Profile/addresses | Own rows only; restricted validated updates | Identity synchronization and approved support operations |
| Cart/items | Verified owner or bound guest session only | Stock/price checks and checkout conversion |
| Wishlist | Own rows only | Availability reconciliation |
| Orders/items | Authorized owner/guest read; no direct status/amount writes | Validated checkout and authorized fulfillment |
| Inventory, coupons, redemptions | No direct stock/quota writes; disclose only approved eligibility | Pricing, reservations and reconciliation |
| Payment attempts/events/outbox | At most sanitized own payment status | Payment/worker roles only |
| Notifications/attempts/Mailgun events | At most sanitized own notification status; no direct recipient/template/status writes | Authorized email workers and verified webhook handlers only |
| Contact messages/subscriptions | Submit through validated service; authorized unsubscribe flow | Support/email workers with least privilege |

If using a browser-accessible database API, implement and test row-level security and restricted column/function permissions before exposing it. A server-only API still needs owner checks on every operation. Public schema names and foreign keys do not establish authorization.

## Indexes and migrations

Create indexes for product slug/SKU/publication, category joins, variant inventory, active owner carts, owner wishlist, owner order `(profile_id, created_at DESC, id DESC)`, order items, payment provider reference/event ID, reservation expiry, due outbox work, notification business keys/Mailgun message/event references and contact retention. Use matching compound/partial indexes for real queries; confirm plans on representative data.

Use versioned migrations in the chosen tool, transaction-safe data changes, reviewable privileges and a CI migration-from-empty test. Also test upgrade from the previous release. Seed fixtures in development/test only with deterministic IDs and payment sandbox references, never real customer data.

Before production migration: backup and restore-test, review locks, stage expand/backfill/contract changes where necessary, define rollback compatibility, and avoid destructive rollback of paid orders. Reconcile imported totals, currency and variant mapping before switching readers.

## Prototype-to-database mapping

- Home/Shop arrays become canonical products, variants and media. Deduplicate the shared loveseat and reconcile conflicting wishlist fixtures; do not migrate by display name.
- Synthetic color IDs become real variant records; cart/wishlist entries use approved canonical references.
- Root cart and addresses become owned records, not a singleton shared sample state.
- Sample orders and Sofia Havertz are demo fixtures only. `Math.random()` receipt codes are replaced by unique server-issued numbers.
- Auth form/profile state maps to provider identity plus profiles; signup fields must populate the actual user, not SH.
- Article cards need distinct article records/slugs rather than repeated links to the one supplied article.
- Existing receipt snapshots omit customer/address fields; production order creation must capture them securely.

## Data readiness gate

Do not connect production UI until migrations, constraints, ownership policies, concurrent stock/coupon tests, idempotency, backups/restoration, guest-access policy and deletion/retention behavior have been exercised. DATABASE.md describes the target; QA.md defines verification, not an already passing database suite.
