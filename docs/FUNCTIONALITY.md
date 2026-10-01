# Functionality: implemented UI versus production requirements

Status is based on source inspection on 2026-10-01. **Current** means browser behavior exists. **Production requirement** means work still required; no server-backed functionality is implied.

User-confirmed target services: Supabase or Neon for persistent business records, Mailgun for confirmation emails, and Google OAuth configured in Google Cloud Console. See [INTEGRATIONS.md](INTEGRATIONS.md). The current demo behavior below is unchanged; documenting those services does not connect them.

## Routes and screens

All routes are registered in `src/app/App.tsx`. Account URLs are currently public demo screens, not protected routes.

| Route | Current behavior | Production requirement |
| --- | --- | --- |
| `/` and `/#new-arrivals` | Three-slide hero, room/catalog dialogs, product cards, wishlist toggles, article dialogs, newsletter feedback | Published catalog/content, durable cart/wishlist, actual newsletter service |
| `/shop` | Room filtering, price filtering, sorting, 1/2/3/4-column layouts, expansion, product-card navigation | Server pagination, validated filters, product availability and canonical IDs |
| `/product/:productId` | Catalog lookup; unknown IDs show Product not found; quantity, wishlist, cart, image dialog and accordions | Real descriptions/media/variants/stock/reviews and stable product URLs |
| `/cart` | Product rows, quantity controls, removal, three shipping choices, totals, coupon feedback and Checkout | Durable ownership, valid stock limits, server quote and coupon rules |
| `/checkout` | Contact/shipping forms, optional billing form, card/PayPal/Paystack choices, local discount, demo order submission | Payment integration, authoritative pricing, stored order/address snapshots and retry-safe submission |
| `/order-complete` | Last in-memory demo receipt; direct load without an order shows No demo order yet | Authorized durable order lookup and verified payment/order status |
| `/account` | Local profile edits and password-form validation | Real profile retrieval/update and provider-backed password changes |
| `/account/address` | Two sample addresses; independent edit dialogs | User-owned address CRUD, country/postal validation and defaults |
| `/account/orders` | New session demo orders plus four fictional sample orders | Current user's real order history, pagination and fulfillment status |
| `/account/wishlist` | Four seeded examples plus saved catalog products; remove/add to cart | Durable user-owned variant/product references and availability handling |
| `/signup` | Required name/username/email/password/consent; valid submission starts Sofia Havertz demo session | Account creation, unique identity rules, verification, consent records and real profile |
| `/signin` | Required identity/password; valid submission starts same demo session | Verified credentials, session restoration, errors, recovery and OAuth |
| `/blog` | Nine cards, Featured subset, title sort and layout controls | Unique published articles, real pagination and editorial metadata |
| `/blog/how-to-make-a-busy-bathroom-a-place-to-relax` | One supplied article; related cards point to the same article's title anchor | Slug-based article lookup, distinct destinations and content ownership |
| `/contact` | Validated local message form, phone/email links, static map and external map link | Message delivery, spam protection, retention and honest delivery status |

Unknown application URLs have no custom catch-all screen or route error boundary configured. This is separate from the explicit missing-product UI.

## Navigation and overlays

- Desktop main-navigation Shop goes to `/shop`; Product goes to the homepage new-arrivals anchor. Header/footer Contact Us links go to `/contact`; footer Blog goes to `/blog`.
- Several promotional, room and mobile Shop controls call `shop()`, opening the local catalog dialog instead of navigating to `/shop`. Footer Shop behavior varies by current page. Normalize these only after agreeing the desired flow.
- Signed-out desktop account icon goes to `/signup` on `/`, but to `/account` on other storefront pages. On narrow mobile screens it is hidden; the mobile menu offers an account dialog containing a Sign in link.
- Valid Sign In or Sign Up submission starts a demo session and returns home. Submitted signup identity is not used to create a profile; navbar identity is hardcoded Sofia Havertz / SH.
- The signed-in avatar is visible on mobile too. Its native details dropdown links to Account, Orders and Wishlist. Escape closes it and returns focus; outside pointer clicks close it.
- Navbar/mobile Sign out and account-sidebar Log Out end the demo session when active. They do not clear the cart, wishlist, addresses or demo orders. There is no user switching or account-data isolation.
- Cart drawer Checkout goes to `/cart`, then Cart page Checkout goes to `/checkout`. Drawer View cart opens the older cart-details dialog; that dialog's Checkout opens an informational modal, not the checkout page.
- Native dialog overlays cover search, catalog, cart details, informational/legal content, image gallery and older homepage articles. Cart drawer includes body-scroll locking, keyboard handling and reduced-motion-aware animation.

## Catalog, variants and wishlist

Home defines six products; Shop defines nine, sharing `loveseat`. Shop combines them into 14 unique product IDs. Initial Shop category is Living Room. A price range appears selected initially, but `priceFilterActive` is false until a price option is clicked; initial results therefore are not restricted to that displayed range.

Search/catalog dialogs use the six home products, not the full Shop catalog. Search matches product name, plus room filter. Homepage article cards use local modal content rather than the Blog route.

Only `shop-tray-table` has the supplied detailed description, six-image gallery, SKU `1117`, measurements and Black/Natural/Red/White options. Other detail pages show available catalog metadata and explicit missing-details/reviews messages. Review totals and card stars are display fixtures, not real reviews.

Non-Black tray-table selections generate synthetic cart IDs such as `shop-tray-table--natural`. Cart merging uses these IDs, while wishlist selection uses the base product ID. Synthetic variant IDs are not resolved as product-detail route IDs. Production must separate product identity, variant identity and route slug.

Some product images and hero media are deliberately hidden with `blank`/`invisible` to match supplied frames. Do not automatically interpret every empty image area as a failed download. Confirm the Figma reference before changing it. Badges and old prices are static, not calculated promotion rules.

Wishlist starts with four separate demo IDs and prices: Tray Table $19.19, Sofa $345.00, Bamboo basket $8.80 and Pillow $8.80. These are not the canonical Shop items. Cart starts with Loveseat Sofa $199.00 and Table Lamp $24.99, quantity one each.

## Cart and checkout arithmetic

| Rule | Current implementation |
| --- | --- |
| Cart merge | Same product/cart ID increments quantity; no stock ceiling |
| Minimum quantity | One; removal is a separate action |
| Standard / Express / Store pickup | $0 / $15 / $21 respectively; explicitly demo prices |
| Empty cart | Delivery counted as zero; cart Checkout and Place Order disabled |
| Drawer totals | Item subtotal only; do not include selected shipping or discount |
| Cart page totals | Subtotal plus delivery, using cent arithmetic |
| Cart coupon | Feedback only; no discount is applied |
| Checkout coupon | Case-insensitive trimmed `JenkateMW`; $25 capped at subtotal, also directly toggled by summary Apply/Remove |
| Invalid checkout code | Displays feedback; does not remove a previously applied discount |
| Checkout total | Subtotal minus capped discount plus selected delivery; no tax calculation |
| Currency | Dollar formatting, with receipt explicitly using USD; no currency model |

For the seeded cart: subtotal $223.99; express total $238.99; express plus checkout coupon total $213.99. Cart selection carries shipping into checkout through Storefront state. The parent also retains coupon-applied state while switching pages.

Checkout validates required fields and email format. Country is chosen from a fixed list. Phone/address fields do not implement comprehensive normalization or country-specific validation. Optional state/postcode do not become required by destination. Checking different billing mounts a second required address group; unchecking removes it.

Card inputs validate 13–19 digits, expiry month/year and 3–4 digit CVC; there is no Luhn check or processor tokenization. Inputs are ordinary DOM elements and are cleared on successful demo submission. Only dummy test values should be used. PayPal and Paystack selections do not contact a provider.

Place Order snapshots items, subtotal, discount, delivery, total and selected payment label into a `DemoOrderDraft`. Contact/address/card values are not included. A per-mounted-checkout ref blocks repeated submission in that component instance; it is not server idempotency. Storefront assigns a random display code and client timestamp, saves the receipt in memory and navigates to `/order-complete`. The cart is not cleared. Returning to a new checkout mount can create another demo order.

## Account and communication forms

- Profile fields require trimmed nonempty values and email format. Password fields are optional as a group; if one is populated all three must be present and the new values must match. Old password is not verified, new password is not changed; values are cleared after a valid save.
- Profile/avatar state belongs to `OrdersHistoryPage`, which renders all four account sections. It survives switching account tabs, but is lost when leaving that component. Navbar name/avatar does not update from profile edits.
- Avatar accepts JPEG/PNG/WebP/GIF up to `5 * 1024 * 1024` bytes. It uses an object URL and revokes it on cleanup; nothing is uploaded.
- Billing/shipping address edits require trimmed name, phone, street, city and country. They update Storefront state independently; they do not prefill checkout.
- Contact validates trimmed full name/message and native email validity. Success explicitly says the message has **not** been sent.
- Newsletter sets a local `subscribed` flag and displays “Subscribed!” / welcome copy. No subscription is stored or delivered. That success wording must become truthful before production.
- Forgot password, Google sign-in and legal controls are informational preview actions. Social links point to generic platform homepages. The contact map is a static visual with a Google Maps link, not a geolocation integration.

## State lifetime

| Owner | State | Survives client-side navigation? | Refresh behavior |
| --- | --- | --- | --- |
| Storefront | Demo session, cart, wishlist IDs, addresses, delivery fee, coupon-applied flag, completed orders, promotion dismissal, newsletter flag | Yes while the parent stays mounted; even Sign In/Up keep parent state | Resets to fixtures/defaults |
| Account layout | Profile draft saved locally, avatar file/object URL | Across account sections; not after leaving account layout | Resets |
| Shop / Blog | Filters, layout, sort, expansion | Only while the page component remains mounted | Resets |
| Product detail | Quantity, selected color, accordion panels | Component-local; param-only navigation can reuse this component | Resets on reload; test param-switch behavior explicitly |
| Checkout | Form DOM values, different billing, payment choice, coupon input, submission guard | Only while mounted | Resets |
| Auth pages | Form DOM values, visibility, checkbox and feedback | Only while mounted | Resets |

No application `localStorage`, `sessionStorage`, API calls or database SDK was found. Remember me changes only the checkbox display; it does not change demo-session persistence.

## Production blockers to track

1. Real identity, authorization and user-owned data isolation are absent; account pages are publicly accessible fixtures.
2. Authoritative catalog IDs, variant stock, pricing, taxes, coupons and shipping rules are absent.
3. Order success does not prove payment; no stored order addresses or verified fulfillment exist.
4. Sample orders/wishlist and hardcoded SH navbar must be replaced or explicitly excluded from production.
5. Persistent state, loading/error/retry behavior, route errors and per-article destinations need integration.
6. Newsletter/marketing/legal/payment claims require service integration and content review.

See BACKEND, DATABASE and SECURITY for proposed solutions; see QA.md for current behavior tests and production acceptance criteria.
