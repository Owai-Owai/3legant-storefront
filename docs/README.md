# 3legant implementation handbook

Audit date: **2026-10-01**. Source baseline: `bb0f2d2`, including the current user-edited application files. This handbook documents the implementation as inspected, not just the original design requests.

## Important distinction

The application is an interactive **frontend prototype**, not a production commerce service. React state powers the cart, wishlist, address book, sample session and demo orders. There is no application API, database integration, real authentication or payment processing in the inspected source. Fonts and external links can still make network requests; “no backend” does not mean “no network traffic.”

The documents below specify the path to production. Proposed endpoints, schemas, policies and tests are **not implemented** simply because they are documented.

## Confirmed integration requirements

- Persist application business data using **Supabase or Neon**. The choice between them remains open; this does not require running two databases.
- Send confirmation emails using **Mailgun**.
- Implement Google sign-in with OAuth credentials and consent configured in **Google Cloud Console**, integrated with the chosen authentication/session layer.

These are user requirements, not optional suggestions. See [INTEGRATIONS.md](INTEGRATIONS.md) for persistence scope, provider setup, email delivery and Google OAuth acceptance criteria. Passwords, raw card details and transient UI state are not part of “persist everything.”

## Document list and reading order

| File | Purpose | Primary reader |
| --- | --- | --- |
| [FUNCTIONALITY.md](FUNCTIONALITY.md) | Screen inventory, actual interactions, state lifetimes, demo behavior and functional gaps | Product, frontend, QA |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Entry points, routing, component ownership, assets, styling and integration boundaries | Frontend, backend |
| [INTEGRATIONS.md](INTEGRATIONS.md) | Required Supabase/Neon persistence, Mailgun confirmations and Google Cloud OAuth setup | Backend, platform, frontend |
| [BACKEND.md](BACKEND.md) | Proposed API contracts, authentication, pricing, checkout, payments and service behavior | Backend, frontend |
| [DATABASE.md](DATABASE.md) | Proposed relational entities, constraints, ownership, indexes, migrations and seed strategy | Backend, database engineer |
| [SECURITY.md](SECURITY.md) | Authorization, credentials, payments, privacy, uploads and production safeguards | Engineering, security |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | Dependency-ordered delivery phases, decision gates and acceptance criteria | Engineering lead, product |
| [../QA.md](../QA.md) | Current-prototype test cases, future integration tests, visual QA, automation setup and release gates | QA, frontend, backend |

Start with FUNCTIONALITY and ARCHITECTURE. Agree on the decisions below before implementing BACKEND and DATABASE. Use SECURITY and QA throughout delivery, not only at the end.

## Decisions requiring approval

| Decision | Why it matters | Recommended starting point, not an approved requirement |
| --- | --- | --- |
| Authentication/session layer | Signup, recovery and verified sessions; Google Cloud OAuth is required | Supabase Auth if Supabase is selected, or an approved Neon-compatible identity/session layer |
| Database choice and backend hosting | Deployment, connection pooling, migrations, backups | Choose Supabase or Neon; both satisfy the required PostgreSQL persistence direction |
| Payment provider(s) | UI names Card, PayPal and Paystack; marketing copy also mentions Stripe | Integrate one supported sandbox provider first; show only supported methods |
| Guest checkout and guest-cart behavior | Account ownership, receipts, login merge | Support guest cart; explicitly decide guest checkout before exposing it |
| Currency, markets, taxes and shipping | UI currently formats dollars, while content references multiple countries | Confirm USD or other supported currencies and destination rules |
| Coupon rules | Cart has no real discount; checkout has one local demo discount | Single server-priced quote and coupon policy |
| Inventory and fulfillment | Stock, reservations, refunds, delivery status | Variant-level stock and explicit fulfillment process |
| Content ownership and legal policies | Product descriptions, article slugs, benefits and consent claims | Assign content/legal owners before launch |
| PII retention and Mailgun configuration | Customer data and reliable notifications | Mailgun is required; approve domain/region/sender, delivery policies and retention periods |

No provider was connected, secret requested, migration run or runtime dependency installed during this documentation task.

## Evidence and limitations

The source audit covers all 18 modules under `src/app`, entry points, styles, dependencies and deployment configuration. A limited browser smoke audit covers the 15 route examples in QA.md, missing-product state, demo login/logout, express shipping, checkout coupon, a PayPal-labeled demo order, history reset, and five mobile overflow checks.

See [QA.md execution record](../QA.md#execution-record) for what was actually run. That record is not a claim that the full QA plan passed. Pixel accuracy across every screen, all browsers, assistive technologies and production security still requires the dedicated checks in QA.md.

## Working agreement

- Preserve the user's manual edits and supplied Figma visual language when connecting services.
- Keep demo fixtures distinct from production records; never migrate fictional customers or orders as live data.
- Replace one feature boundary at a time and verify its failure states before moving on.
- Do not consider the app ready for real customers until production acceptance criteria pass.
- Update these documents when behavior, API contracts or schema changes; record unresolved decisions rather than guessing.
