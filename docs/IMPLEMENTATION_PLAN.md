# Implementation sequence: UI prototype to production

No backend is built by this plan. Use the existing Figma-matched UI as the presentation layer, preserve manual edits and deliver small, verifiable service integrations. Required services are Supabase or Neon, Mailgun and Google Cloud OAuth. Resolve the remaining decisions in README.md and follow INTEGRATIONS.md before installing SDKs or connecting projects.

## Phase 0 — Freeze the baseline and agree policy

**Owners:** product + frontend lead + backend lead; legal/content for claims and retention.

- Capture route/interaction and screenshot baselines from FUNCTIONALITY.md and QA.md.
- Choose Supabase or Neon and its auth/session layer; agree API host, payment provider, guest checkout, currencies/tax/shipping/coupon policies and content ownership. Record Mailgun domain/region/sender and Google Cloud project/consent/callback requirements.
- Confirm normalization of legacy dialogs versus canonical Shop/Cart/Checkout routes.
- Create a decision log and issue tracker from the production blockers; identify test accounts and sandbox resources.

**Gate:** decisions recorded, fixtures labeled, production launch explicitly blocked until later gates pass. No screen redesign required.

## Phase 1 — Contracts, infrastructure and automated QA

**Owner:** engineering.

- Define typed DTOs and domain IDs separate from Figma geometry; select migration and API tooling.
- Establish database environments, secret management, health checks and safe logging. Configure Mailgun domain/DNS/sandbox delivery and Google Cloud OAuth clients/allowlists for approved environments.
- Set up unit/component/browser test tools deliberately; package.json currently has no test runner.
- Add reviewed schema migrations/constraints/permissions with deterministic test-only fixtures, plus migration-from-empty/upgrade tests.
- Set up CI for typecheck, tests, build validation and artifact reporting.

**Gate:** clean bootstrap, repeatable staging deployment, migrations/restore tested, source visual baseline retained. Refer to ARCHITECTURE and DATABASE.

## Phase 2 — Identity and private account data

**Owner:** identity/backend + frontend.

- Replace demo login callback/boolean with verified session data; wire signup/login/logout, Mailgun-backed identity emails where supported, recovery and Google Cloud OAuth through the selected auth layer.
- Guard account routes and enforce server/database ownership independently.
- Connect profile, avatar and address CRUD; use one identity for navbar and account pages.
- Remove hardcoded sample identity from production; clear private caches on logout/account switch.
- Define Remember me semantics and guest-to-user cart merge behavior before persistence integration.

**Gate:** two-user isolation, expiry, signup failures/recovery, avatar validation and logout/Back behavior pass. No demo credential bypass in production.

## Phase 3 — Canonical catalog, cart and wishlist

**Owner:** commerce/backend + frontend; content owner supplies product data.

- Publish canonical products/variants/media/categories; map current duplicate/synthetic IDs.
- Connect Shop filters/search/sort/pagination and product-detail lookup with loading/unavailable states.
- Persist owner/guest carts and user wishlists; bound quantities and handle stock/price changes.
- Reconcile cart mutations/merge under retries; replace separate wishlist fixtures with actual references.

**Gate:** cross-view cart consistency, reload persistence, deterministic merge, variant distinction and unavailable-product cases pass. Figma asset geometry remains intact.

## Phase 4 — Server pricing and real checkout

**Owner:** commerce/backend + frontend; finance/operations approve policy.

- Replace cart/checkout coupon divergence with server quote calculation.
- Integrate approved shipping/tax/currency rules, normalized addresses and quote expiration/reconfirmation.
- Create durable orders/line/address snapshots, reserve stock/coupon quota transactionally and enforce request idempotency.
- Add payment-pending/failed/cancelled/retry UI; keep provider integration in sandbox.

**Gate:** arithmetic invariants, quote tampering rejection, concurrent-stock/coupon limits, duplicate submission and guest receipt policy pass. Do not call an order paid yet.

## Phase 5 — Payments, confirmation and fulfillment

**Owner:** payments/backend + operations + frontend.

- Replace raw card controls with approved hosted payment UI; expose only supported methods.
- Verify/deduplicate webhooks and reconcile redirects/timeouts/out-of-order events.
- Transition stock/coupon/cart state exactly once; handle reservation expiry and late payment exceptions.
- Make receipt/history durable and authorized; show pending until verified success.
- Queue Mailgun order confirmations after verified commerce success, persist notification/attempt/event status, and define audited fulfillment/refund updates, monitoring and recovery.

**Gate:** provider sandbox end-to-end plus webhook failure/replay/refund tests pass. Confirmation survives refresh and never depends only on client navigation.

## Phase 6 — Content, communications and production readiness

**Owner:** content/support + frontend/backend + QA/security.

- Add distinct article slugs/content, contact delivery, consented newsletter and valid legal pages.
- Replace generic social links and unsupported shipping/payment/support claims.
- Implement custom route errors, approved accessibility/loading states and performance optimization as scoped changes.
- Complete QA matrix across browsers/devices, legal/security review, backup recovery, alerts, rollout and rollback procedure.

**Gate:** all release-blocking QA cases pass with evidence; no unsupported success claims or production demo records. Owners sign off separately on UI, commerce, identity, content and operations.

## Definition of done for each feature

1. Approved behavior/API/schema and one authoritative data owner.
2. Success, loading, empty, invalid, unauthorized, conflict, timeout and retry states implemented.
3. Unit/integration/browser tests and two-user checks where private data is involved.
4. Desktop/mobile visual and keyboard checks preserve the supplied design.
5. Safe logging, migration/rollback impact, operational ownership and docs updated.

## Reusable implementation prompt

> Implement [one phase/feature] using the required providers in docs/INTEGRATIONS.md and approved contracts in docs/BACKEND.md and docs/DATABASE.md. First inspect the current source and preserve manual edits. Replace only that feature's demo boundary, retain the supplied Figma typography/assets/layout, and implement loading, failure, authorization and retry behavior. Never trust browser prices or store credentials/card data. Add the applicable QA.md tests, run the configured checks, and report changed files, evidence, unresolved decisions and untested cases. Do not mark a feature production-ready solely because its UI works.

Avoid handing an agent “connect everything” in one step. Supabase/Neon, Mailgun and Google Cloud are required; database choice, session layer and remaining policies still need approval. This prompt does not authorize database migrations against production.
