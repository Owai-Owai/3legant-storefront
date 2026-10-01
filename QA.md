# QA: prototype tests and production acceptance plan

Audit date: **2026-10-01**. This file is a test specification and execution guide, **not an executable test runner**. The repository currently has no committed unit/component/E2E suite, test script or CI test configuration. Current browser smoke evidence is recorded at the end; unrun cases remain unverified.

Read [docs/FUNCTIONALITY.md](docs/FUNCTIONALITY.md) for actual behavior, [docs/SECURITY.md](docs/SECURITY.md) for controls and [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) for delivery gates.

## Test modes and priorities

- **D — current demo:** assertions describe the prototype as implemented. A demo pass does not establish production readiness.
- **P — future production:** acceptance requirements for backend integration; currently blocked/not implemented, not expected to pass now.
- **P0:** release-blocking security/financial/data-loss failure; **P1:** essential functionality/accessibility; **P2:** lower-risk content/polish.

Use dummy credentials, `example.com` emails and test-only addresses. Never type real card details into the prototype. Never run destructive migrations/payment tests against production.

## Environment and deterministic fixtures

Use the running preview's actual base URL/port. The Vite config uses `PORT` or defaults to 8443; do not hardcode a temporary audit port in committed tests. Do not start a second server in Figma Make. For future CI, own server startup/teardown explicitly.

Fresh page load resets fixtures:

- Cart: Loveseat Sofa $199 + Table Lamp $24.99, one each; count 2; subtotal $223.99.
- Delivery: Standard $0, Express $15, Store pickup $21, all demo fees.
- Wishlist: four demo rows ($19.19, $345, $8.80, $8.80).
- Orders: four sample rows; no created demo orders until submitting checkout.
- Signup/signin sample identity: Sofia Havertz / SH regardless of submitted identity.
- Checkout coupon: trimmed, case-insensitive `JenkateMW`; $25 capped at subtotal; parent applied flag resets on reload.
- Direct receipt load: No demo order yet.

Use a fresh browser context/page reload between independent tests. For navigation-persistence cases remain in the same client session. Avoid asserting exact random order codes or current dates; capture them and compare between receipt/history. Use a controlled clock when testing expiry boundaries.

## Current demo test matrix

These cases are required coverage, not a list of tests already passed.

| ID | Priority | Action | Expected current behavior |
| --- | --- | --- | --- |
| D-NAV-01 | P1 | Open/refresh each route in the route checklist below | Correct screen; no browser exception; auth pages omit storefront header/footer |
| D-NAV-02 | P1 | Use main Shop, footer Blog, both Contact Us links and Product anchor | Shop/Blog/Contact destinations correct; Product scrolls to home new arrivals |
| D-NAV-03 | P2 | Use promotion/room/mobile Shop actions and footer Shop on different pages | Current catalog-dialog/page distinction matches FUNCTIONALITY; document future normalization |
| D-NAV-04 | P1 | Open account icon signed out on home/Shop and mobile account menu | Home desktop to signup; other-page desktop to account; mobile dialog Sign in to signin |
| D-AUTH-01 | P1 | Submit blank/whitespace identity or missing password in Sign In | Required/trim validation blocks demo session |
| D-AUTH-02 | P1 | Submit valid dummy Sign In; navigate Account/Orders/Wishlist | Home shows SH avatar; demo disclaimer; session survives client navigation |
| D-AUTH-03 | P1 | Submit Sign Up with missing fields, invalid email, unchecked consent, then valid values | Invalid forms blocked; valid form opens sample session, not submitted user's real profile |
| D-AUTH-04 | P1 | Toggle password visibility and Remember me | Visibility/type/accessible label agree; checkbox toggles; no persistence-policy effect |
| D-AUTH-05 | P1 | Open avatar by keyboard/pointer; Escape/outside click; choose account link | Dropdown closes appropriately; Escape returns focus to summary; correct route |
| D-AUTH-06 | P1 | Sign out via avatar, mobile menu and account sidebar; refresh signed in | Demo session ends; refresh resets; other root business state is not cleared by sign-out |
| D-AUTH-07 | P1 | Use Google, Forgot password and auth legal controls | Honest unavailable/demo messages; no provider/account/reset request |
| D-CAT-01 | P1 | Shop default, room changes, every price filter, sorting and Show more | Correct local filtering/order; initial highlighted price is not active until clicked; no fabricated extra products |
| D-CAT-02 | P1 | Switch 1/2/3/4-column layouts and empty-result room | Controls stay usable; products reflow; empty state appears where no match |
| D-CAT-03 | P1 | Search by name/room; open result | Search uses home catalog only; result opens legacy product modal |
| D-PDP-01 | P1 | Click Shop card image/title; load unknown product ID | Correct product detail route; unknown ID shows explicit not-found state |
| D-PDP-02 | P1 | Tray-table color selection, quantity, gallery, wishlist and cart actions | Color/main image update; nonblack cart ID distinct; quantity >= 1; gallery closes; base-product wishlist toggle |
| D-PDP-03 | P2 | Accordions/review count/recommendations; navigate between product IDs without reload | Visible states and fixture review text correct; record whether local state is retained and get reset-policy approval |
| D-CART-01 | P1 | Add same item twice; add different tray-table colors; open drawer/page | Same ID merges; distinct color IDs remain separate; header count sums quantities |
| D-CART-02 | P1 | Increase/decrease/remove in drawer/cart/checkout | Root quantities stay consistent; minimum one; remove separate; totals update |
| D-CART-03 | P1 | Remove all items | Empty UI; cart Checkout/Place Order disabled; shipping counted zero |
| D-CART-04 | P1 | Select Standard/Express/pickup from seeded cart | Cart totals $223.99 / $238.99 / $244.99; selection follows canonical checkout navigation |
| D-CART-05 | P1 | Drawer Checkout then Cart Checkout; separately drawer View cart | Canonical path drawer -> cart -> checkout; View cart uses older dialog and informational checkout |
| D-CART-06 | P1 | Apply any cart coupon | Feedback only; total unchanged |
| D-CHK-01 | P1 | Blank form, invalid email, different billing on/off | Required validation blocks; billing required only when mounted; whitespace/phone/address normalization limitations recorded |
| D-CHK-02 | P1 | Apply valid/mixed-case/trimmed coupon, invalid code, summary Apply/Remove | Discount = min($25, subtotal); invalid attempt preserves existing applied state; no discount stacking |
| D-CHK-03 | P1 | Use valid test card then bad digit count, expiry, CVC | Native/custom validation as documented; no actual payment; Luhn validation is not implemented |
| D-CHK-04 | P1 | Choose PayPal/Paystack | Card fields unmount; provider disclaimer appears; no redirect/charge |
| D-CHK-05 | P1 | Submit valid demo checkout twice quickly | One completion per mounted instance; receipt matches snapshot; no contact/address/card data in receipt draft |
| D-ORD-01 | P1 | Purchase history after order; navigate away/back; change cart | New Demo order precedes sample rows; captured receipt remains immutable despite cart changes |
| D-ORD-02 | P1 | Reload receipt/history; return to checkout and submit again | Receipt snapshot lost on reload; history returns to four samples; cart remains after order; remount can create another demo order |
| D-ACC-01 | P1 | Visit all account tabs | Only current tab active: Account/Address/Orders/Wishlist respectively; public sample pages do not require demo login |
| D-ACC-02 | P1 | Save profile with empty/whitespace/email errors; then valid values | Invalid blocked; local display name updates in account layout; navbar stays fixed SH |
| D-ACC-03 | P1 | Partial/mismatched password group then matching group | Partial/mismatch blocked; successful save clears passwords without changing real credentials |
| D-ACC-04 | P1 | Upload valid avatar, invalid MIME, >5 MiB and undecodable file; switch tabs/leave | Accepted preview only; errors for invalid files; survives account tabs but not leaving layout; no upload |
| D-ACC-05 | P1 | Edit billing then shipping; cancel; navigate/reload | Independently saved root records; cancel unchanged; navigation retains; reload resets; checkout not prefilled |
| D-WISH-01 | P1 | Remove seeded/saved items, empty list, add to cart repeatedly | Correct root state; empty UI; proper cart increment; separate demo IDs preserved |
| D-BLOG-01 | P2 | Featured/All, title sorts and four views; Show more | Featured first three; All nine; correct sort/layout; Show more switches subset or reports all shown |
| D-BLOG-02 | P2 | Click each Blog card and related article; compare home article card | Blog cards share supplied article; related anchors same article; homepage uses local article modal |
| D-CON-01 | P1 | Submit contact empty/whitespace/invalid email then valid | Invalid blocked; valid feedback explicitly not sent; editing clears submitted status |
| D-CON-02 | P2 | Phone/email/map links | Correct tel/mailto/maps target; map opens separately with safe rel; no geolocation assumption |
| D-COM-01 | P1 | Newsletter invalid then valid; edit after success | Native email validation; local success only; no subscription request/storage; log misleading production wording as gap |
| D-OVR-01 | P1 | Drawer/dialog open/close/Tab/Shift+Tab/Escape/backdrop/reopen | Focus stays usable, scroll lock restored, close works; test focus restoration per overlay, not assumed globally |
| D-STATE-01 | P1 | Refresh after cart/wishlist/address/profile/session/order changes | Root fixtures and page-local state reset as documented; no app local/session storage persistence |

### Route checklist

`/`, `/shop`, `/product/shop-tray-table`, `/cart`, `/checkout`, `/order-complete`, `/account`, `/account/orders`, `/account/address`, `/account/wishlist`, `/signup`, `/signin`, `/blog`, `/blog/how-to-make-a-busy-bathroom-a-place-to-relax`, `/contact`.

Also test `/product/not-a-product`, `/#new-arrivals`, Back/Forward and a truly unknown application URL. The latter currently lacks a designed 404/error route; do not confuse it with the implemented missing-product screen.

## Production acceptance matrix

These are **not implemented / not run** until backend phases are delivered.

Supabase-or-Neon persistence, Mailgun confirmations and Google Cloud OAuth are confirmed requirements. Run the applicable provider-specific cases below after integration; the initial smoke record is not evidence that these services work.

| ID | Priority | Scenario | Required result |
| --- | --- | --- | --- |
| P-AUTH-01 | P0 | Wrong credentials, duplicate signup, unverified user, expiry, logout | Real provider rules; no arbitrary demo bypass; revoked session cannot access private data |
| P-AUTH-02 | P0 | User A attempts User B's order/address/cart/wishlist/avatar ID | No read/write leakage; server and DB enforce owner policy independently of UI |
| P-AUTH-03 | P0 | Account switch/logout + Back/multiple tabs | Private caches and views cleared; no prior user's data displayed |
| P-AUTH-04 | P1 | Recovery/OAuth/Remember me/email/password changes | Approved provider flow, safe redirects, supported expiry, reauthentication, no secret logging |
| P-CAT-01 | P1 | Published/draft/deleted products, variants, slug/search/paging | Only authorized publication; distinct variants; unavailable UI; stable pagination |
| P-CART-01 | P1 | Refresh/new device; guest-to-user merge; duplicate mutation/stale revision | Durable scoped cart; deterministic merge; no duplicate increments; conflict visible |
| P-PRICE-01 | P0 | Tamper with price, currency, coupon/fee/tax and negative/huge quantity | Server rejects/recomputes; charged amount equals authorized quote |
| P-PRICE-02 | P0 | Coupon expiry/quota/concurrent redemption; low subtotal; tax/rounding | Eligibility enforced once; nonnegative exact totals; no float drift or quota bypass |
| P-STOCK-01 | P0 | Two buyers compete for last item; reservation expires | No oversell; atomic reservation; correct release and exception handling |
| P-ORD-01 | P0 | Double-click, timeout/retry, two tabs, same key/different payload | One intended order/attempt; mismatched idempotency payload conflicts |
| P-PAY-01 | P0 | Valid/invalid/replayed/out-of-order provider webhook | Raw signature verified; events deduplicated; legal transition, stock changes and notification intent recorded exactly once |
| P-PAY-02 | P0 | Fake success URL; provider amount/currency mismatch; browser closes | No unverified paid confirmation; server reconciles; no incorrect amount accepted |
| P-PAY-03 | P0 | Decline/cancel/processing/late success after reservation expiry/refund | Correct retryable states, stock reconciliation/refund escalation, no repeated charge |
| P-PAY-04 | P0 | Inspect logs/DB/storage/requests and build artifacts | No PAN/CVC/password/provider secrets; hosted fields used; sanitized references only |
| P-ORD-02 | P1 | Receipt refresh/history paging; catalog/address edits after purchase | Authorized durable receipt; immutable snapshots; stable history/status |
| P-ACC-01 | P1 | Real profile/avatar/address changes and reset/reload | Durable owner data; navbar/profile agree; file-content validation and object ownership |
| P-COM-01 | P1 | Contact/email provider outage, queue retry, spam burst | Durable accepted status; honest delivery state; business records deduplicated; uncertain email attempts reconciled; rate limits |
| P-COM-02 | P1 | Newsletter confirmation/unsubscribe/duplicate/consent | Approved consent recorded; tokens expire; suppression honored; truthful feedback |
| P-DB-01 | P0 | Empty DB migration, prior-version upgrade, failure rollback, restore | Repeatable schema; constraints/permissions intact; tested recovery without lost paid orders |
| P-SEC-01 | P0 | CSRF/session abuse, privilege escalation, XSS/upload abuse | Approved protections; no unauthorized action or active-content execution |
| P-FAIL-01 | P1 | Offline/5xx/timeouts/expired quote/unauthorized/stale data | Accessible error/retry; no false success; useful nonsensitive input retained |
| P-OPS-01 | P1 | Failed worker/webhook, audit/monitoring, fulfillment update | Alertable backlog; least privilege; safe audit trail; reconciliation possible |
| P-PERSIST-01 | P1 | Create/update business records, refresh, use another device and restart service | Durable Supabase/Neon profile/cart/wishlist/address/order/content/communication data restored under approved ownership and guest policy |
| P-PERSIST-02 | P0 | Query chosen DB as public/guest/User A/User B/server; inspect frontend bundle | Supabase RLS or Neon backend/DB role controls enforce isolation; no service-role key/connection string in browser |
| P-GOOGLE-01 | P1 | Google consent/login in configured development/staging/production environment | Correct Cloud OAuth client/callback; one real profile/session; navbar and account agree; valid refresh restoration |
| P-GOOGLE-02 | P0 | Cancel consent; tamper state/return URL; expire code; duplicate/email-link attempt | No false login/open redirect/account takeover; safe error; approved identity linking; no Google secret/token leakage |
| P-MAIL-01 | P1 | Account verification and verified order confirmation in Mailgun sandbox | Provider-owned verification link works; order template uses durable receipt; one notification intent per business event; no email triggered solely by success-page navigation |
| P-MAIL-02 | P1 | Mailgun timeout/5xx/permanent failure; worker restart/retry | Persisted attempts/backoff; uncertain result reconciled; no repeated order/charge; duplicate-delivery risk monitored rather than exactly-once assumed |
| P-MAIL-03 | P0 | Forged/replayed/stale/duplicate delivery/bounce/complaint events | Signature/freshness verified; events deduplicated; delivery state and suppression follow legal policy; no sensitive payload leakage |

## Visual, responsive and accessibility QA

Use source Figma file `541K1wF4DEqbkqf4JrZAYh`; inspect actual frames, do not infer missing geometry from names.

| Screen | Reference node |
| --- | --- |
| Home | `4:1728` |
| Cart drawer | `4:2365` |
| Shop | `4:3181` |
| Product detail | `5:4855` |
| Cart | `5:7216` |
| Checkout | `7:8343` |
| Order complete | `11:9111` |
| Orders | `11:9324` |
| Account details | `16:9758` |
| Address | `17:10142` |
| Wishlist | `17:10345` |
| Blog | `17:12040` |
| Article | `18:12927` |
| Contact | `18:13183` |
| Sign Up | `19:13615` |
| Sign In | `20:13699` |

References identify the user-supplied design lineage; obtain current screenshots and confirm each frame/viewport before creating a baseline. The SH dropdown and demo notices were subsequent preview additions, not supplied signed-in Figma frames. Approve baselines for those states separately.

- Capture at each frame's actual desktop size; auth reference is 1440 × 1080. Wait for `document.fonts.ready`, image decoding and settled state. Use fixed fixtures/clocks and mask only genuinely dynamic timestamps/codes in comparisons.
- Compare geometry, font face/weight/size, line wrapping, borders/radii, spacing, image crop, intrinsic SVG dimensions and Google mask layers. Do not hide defects with broad screenshot-diff tolerance.
- Distinguish intentional blank/invisible design media from missing assets. Any visible static asset must exist, decode and render in its correct slot.
- Test widths 320, 390, 640, 768, 1024, 1199, 1200 and 1440; inspect immediately around active breakpoints. No viewport overflow; deliberate scrollable order-history region remains usable.
- Include mobile landscape/short-height viewport, touch-only use, slow font/image load, browser zoom 200% and text reflow. Hover-only cart actions need a discoverable touch equivalent.
- Keyboard: logical focus order, visible focus, native details activation, dialogs/drawer focus containment, Escape and appropriate focus restoration; no overlapping invisible hit targets.
- Check labels, field errors, live-region feedback, active sidebar/checkout step, meaningful alt text, contrast and reduced motion. Source colors matching Figma are not automatically an accessibility pass.
- Test Chromium, Firefox, desktop Safari and iOS Safari; platform-native form validation/date behavior and dialog support may differ. Current smoke evidence covers Chromium only.

## Automation setup to add

Recommended tools: a TS-compatible unit runner, React component-testing library, Playwright for E2E/visual tests, and an accessibility checker. These are recommendations, **not currently installed**; add dependencies/scripts in an approved test implementation task.

Suggested organization once tooling exists:

```text
tests/unit/          pricing, coupon bounds, ID mapping, validation
tests/components/    forms, account menu, drawer focus, empty/error states
tests/e2e/demo/      current demo contracts; do not mistake for auth verification
tests/e2e/services/  sandbox identity/catalog/checkout/payment journeys
tests/integration/  ownership, DB constraints, transactions, webhook replay
tests/visual/       approved route/state/viewport screenshot baselines
```

Extract domain logic to testable boundaries as services are introduced; do not encode server financial rules only in JSX tests. Use semantic role/name selectors and stable explicit test hooks only when needed. Avoid generated asset hashes, nth-child and brittle Tailwind selectors.

Current runnable checks:

```bash
pnpm exec tsc --noEmit
git diff --check
figma make verify-deploy
```

The verifier is the correct build/deploy validation in Figma Make and does not publish. Package `format` exists, but it rewrites files; do not format the user's manually edited code as part of a documentation-only task. There is no current `pnpm test`, `pnpm lint` or `playwright test` script to claim as passing.

Future CI should typecheck, run unit/component/integration tests, launch a managed E2E server, execute browser/visual/accessibility tests, validate migrations and build artifacts, and retain failure screenshots/traces. Webhook tests require signed provider sandbox fixtures and controllable replay, not a real charge.

## Reporting and release gates

Record test ID, mode, environment/build, tester/date, input fixture, expected/actual behavior, pass/fail/blocked/not-run and evidence. A defect needs reproduction steps, affected route/viewport, severity, screenshot/trace and owner.

**Prototype handoff:** critical navigation/forms/arithmetic/overlays work; preview-only actions remain honest; manual edits preserved; scoped visual and keyboard checks pass. Known demo gaps are documented, not “fixed” by inventing backend results.

**Production release:** every applicable P0 passes; essential P1 passes or has explicit owner-approved mitigation; real payment/identity/data isolation, failure states, migration/restore, privacy/legal and monitoring are verified. No unapproved sample identities/orders, demo login bypass or unsupported success claims remain. Visual approval alone never satisfies this gate.

## Execution record

Documentation audit of source baseline `bb0f2d2` on 2026-10-01:

| Check | Result / scope |
| --- | --- |
| Source audit | Reviewed all 18 `src/app` modules plus entry points/styles/dependencies/routing/deploy configuration; identified demo/production boundaries |
| Chromium route smoke | Passed the 15 registered route examples above plus explicit missing-product state; not unknown-route/custom-404 acceptance |
| Demo identity smoke | Dummy Sign In -> SH navbar -> Orders -> sidebar logout passed |
| Commerce smoke | Seeded cart Express $238.99 -> checkout coupon $213.99 -> PayPal-labeled demo completion -> history -> refresh reset passed; no provider contacted |
| Mobile smoke | No viewport overflow at 390px on Home, Cart, Checkout, Sign In and Sign Up |
| Browser exceptions / application POST | None observed during this smoke flow; not a network/security audit |
| TypeScript | `npx tsc --noEmit` passed |
| Production artifact verification | `figma make verify-deploy` passed; existing >500 kB bundle warning remains |
| Documentation integrity | Relative links/source references/test IDs checked; only Markdown deliverables added |
| Full matrix / visual cross-browser / accessibility / backend security | Not run; production cases blocked until service integration |

The smoke automation was an ad hoc environment check, not a committed reusable suite. QA.md intentionally distinguishes that evidence from the broader test plan. Update this record with real CI/test-run evidence as tooling is added.

Subsequent requirement update: added Supabase/Neon persistence, Mailgun delivery and Google Cloud OAuth cases. Documentation links/IDs were checked; no database, Mailgun or Google service was configured or tested by this update.
