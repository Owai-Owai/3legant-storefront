# Application architecture

## Current stack and entry points

- React 19, React DOM 19, TypeScript 5.7, React Router 7 Data mode, Vite 8 and Tailwind CSS v4.
- `src/main.tsx` mounts React StrictMode, imports `src/index.css` and imports `src/App.tsx`.
- `src/App.tsx` re-exports the real implementation from `src/app/App.tsx`.
- `src/app/App.tsx` creates `createBrowserRouter` and renders `RouterProvider`.
- Runtime dependencies currently contain only React, React DOM and React Router. There is no API client, authentication SDK, backend service or committed test runner.

## Routing model

The parent `/` route renders Storefront. Child routes use `element: null`; Storefront switches pages by `pathname` flags and `useMatch('/product/:productId')`. It does **not** render an Outlet. That keeps its cart/session state alive while navigating between registered child routes.

Sign Up and Sign In are early returns **after all Storefront hooks**. Their standalone AuthLayout omits the shared header/footer but does not unmount the Storefront parent. Keep all hooks unconditional when adding or refactoring those branches.

There are no route loaders/actions, server-backed guards, custom error elements or catch-all route. The scroll effect handles hash targets or scrolls to the top on path changes. Future routing refactors must preserve `/#new-arrivals`, Back/Forward and deep-link behavior.

## Component and ownership map

| Module | Responsibility / integration seam |
| --- | --- |
| `src/app/App.tsx` | Root state, routes, navbar/footer, home content, ProductCard, generic Modal, catalog/search and legacy dialogs |
| `ShopPage.tsx` | Shop fixture catalog, room/price/sort/layout controls; parent supplies card renderer |
| `ProductDetailPage.tsx` | Product-specific presentation, tray-table variants, quantity, gallery and accordions; callbacks for save/add/view |
| `CartDrawer.tsx` | Native dialog flyout, focus/body-scroll behavior, quantity/remove/navigation callbacks |
| `CartPage.tsx` | Cart rows, delivery selection, monetary display, coupon feedback |
| `CheckoutPage.tsx` | Contact/address/payment form, local quote/discount, order-draft callback |
| `OrderCompletePage.tsx` | Receipt presentation and empty-receipt state; exports demo order types |
| `OrdersHistoryPage.tsx` | Shared account sidebar/avatar/profile state and orders; selects account subsection |
| `AccountDetailsPage.tsx` | Profile form and preview password validation |
| `AddressPage.tsx` | Address cards, types/sample record and reusable local editor |
| `WishlistPage.tsx` | Separate demo wishlist fixtures; parent-owned remove/add actions |
| `BlogPage.tsx` / `ArticleDetailPage.tsx` | Fixture article grid and one static article destination |
| `ContactPage.tsx` | Contact content, map/link actions and local message validation |
| `AuthLayout.tsx` | Shared split-image auth composition and Google button asset layers |
| `SignUpPage.tsx` / `SignInPage.tsx` | Validation and password clearing; parent demo-session callback |
| `PreviewAccountMenu.tsx` | Fixed sample avatar/name, account links, outside/Escape close and logout callback |

Paths in the table are relative to `src/app` unless fully qualified.

## Current data contracts

- `Product` combines ID, display name, price/oldPrice, image filename/prefix, room, color and visual geometry. This mixes domain data with Figma presentation metadata.
- Root cart entries are `{ product: Product, quantity }`. Pages receive flattened display items. Addition merges by `product.id`, not an independently modeled variant.
- `AccountProfile` has firstName, lastName, displayName and email; it is account-layout state, not the sample session's identity.
- `AddressBook` has one billing and one shipping `AddressRecord`; each record contains name, phone, street, city and country.
- `DemoOrderDraft` snapshots displayed line items and totals/payment label; `DemoOrder` adds client-generated code and timestamp.
- Wishlist IDs come from a combination of separate demo fixtures and catalog arrays. Do not treat them as a trustworthy database foreign-key design.

## Styling and assets

`src/index.css` imports `src/styles/fonts.css`, Tailwind and `src/styles/theme.css`. Fonts use exact Figma composite family names and font-face URLs. Theme defines the required tokens, dark counterparts and `@theme inline` mappings. Preserve names including `--background`, `--foreground`, `--border`, `--primary` and the Tailwind mappings.

Images/SVGs live in `public/assets` with page-specific folders. Some duplicate-looking assets are deliberately exact Figma exports. Preserve SVG intrinsic dimensions, image crops, masks and layering. Auth pages share the chair and eye assets; Sign In has its own Google content SVG. Do not add a CSS reset or silently replace supplied fonts/icons.

Layout uses Tailwind breakpoints and custom thresholds, notably 1199px / 1200px and mobile `sm`/`md`/`lg`. Test boundary widths, not just a single desktop and phone. Asset and font loading must finish before screenshots.

## Proposed integration architecture

```text
React views / route loaders
        |
Feature service adapters + typed contracts
        |
Trusted API / server functions ---- Auth/session layer + Google Cloud OAuth
        |                         ---- Payment provider + signed webhooks
        |                         ---- Mailgun + object storage / content services
        |
Supabase or Neon PostgreSQL: durable user-owned business records
```

Supabase or Neon persistence, Mailgun confirmations and Google Cloud OAuth are required services, not infrastructure already installed. Choose the database/auth path and object-storage hosting as described in [INTEGRATIONS.md](INTEGRATIONS.md); payment-provider choice remains open.

1. Add typed feature boundaries for identity, catalog, cart, wishlist, account, checkout and content. Keep view props stable where possible.
2. Move fixture/domain definitions out of the large App module gradually; keep geometry/media slot metadata in a presentation adapter rather than trusting it as product truth.
3. Establish one authenticated-user source. Header/profile/avatar read the same identity; all private caches clear on logout/account switch.
4. Use route loaders/actions or a deliberately selected query layer for loading/revalidation. Do not install a state library without a demonstrated need.
5. Fetch server-authoritative quotes for checkout. Never let a ProductCard's decimal price or synthetic ID determine a charge.
6. Add loading, empty, stale, unauthorized, validation, unavailable-stock and retry UI without changing the supplied visual composition.
7. Add custom 404/error routes and approved authentication guards. Server checks remain mandatory even when a route is guarded.

## Configuration and deployment

Vite config uses the `@` alias and platform configuration under `.figma/make`. Server port is determined by `PORT`, defaulting to 8443; the Figma preview server is already managed by the environment. Do not start a second server in this workspace.

Available package scripts: `dev`, `build`, `preview`, `format`. Type checking is `pnpm exec tsc --noEmit`; there is no `test` or `lint` script. The production deploy lifecycle runs `pnpm run build` and deploys `dist`. In this Figma Make environment validate it with `figma make verify-deploy`, not by manually invoking the publishing script.

Deep links need SPA fallback support on any new host. Verify `/signin`, `/product/shop-tray-table`, `/account/orders` and receipt routes on refresh, not only after client navigation. No backend secrets may be exposed through Vite public configuration.

## Maintainability risks

- Root Storefront currently owns many concerns and legacy modal flows; route and state changes need deliberate regression coverage.
- Parent state surviving navigation is not persistence or user isolation. Refresh clears it; logout currently leaves business data intact.
- Profile identity/avatar differs from the fixed navbar identity.
- Param-only product navigation may retain local quantity/color/panel state; explicitly choose reset or retention before refactoring.
- Formatting and bundle-size issues should be addressed in a separate scoped change, not mixed with backend behavior or design adjustments.
