# 3legant Mobile App (React Native + Expo)

A cross-platform iOS & Android mobile shopping experience for **3legant Storefront**, built with React Native, Expo, TypeScript, and Supabase.

## Features

- **Instant Realtime Cart Sync**: Powered by Supabase Realtime WebSockets (`postgres_changes` on `cart_items`).
  - Adding, changing quantity, or removing an item on the **Web** instantly updates the **Mobile app** cart and badge count in real time with zero delay.
  - Adding or modifying items on the **Mobile app** instantly reflects on the **Web store**.
- **Unified Supabase Authentication**: Users sign in with their existing 3legant account credentials across both web and mobile.
- **Product Discovery & Shopping**:
  - Hero showcase with featured collections.
  - Room category filtering (Living Room, Bedroom, Kitchen, Dining, Outdoor).
  - Live search & sorting (Price: Low to High / High to Low).
  - High-res product details with dimensions, materials, star ratings, and instant "Add to Cart" / "Buy Now".
- **Cart & Checkout**:
  - Live sync indicator showing connection to Supabase Realtime.
  - Item steppers with optimistic local state + remote DB updates.
  - Checkout flow with shipping address and Paystack Sandbox selection.
  - Automatic cross-device cart clearance upon successful order.

---

## Getting Started

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Start the Development Server
```bash
npm start
```

### 3. Running on Devices
- **Physical Phone (Expo Go)**:
  1. Install **Expo Go** from the App Store (iOS) or Google Play Store (Android).
  2. Scan the QR code displayed in your terminal with your camera (iOS) or the Expo Go app (Android).
- **Android Emulator**:
  ```bash
  npm run android
  ```
- **iOS Simulator** (macOS required):
  ```bash
  npm run ios
  ```
- **Web Preview**:
  ```bash
  npm run web
  ```

---

## Project Structure

```
mobile/
├── App.tsx                     # Main entrypoint with Context Providers & Navigation
├── app.json                    # Expo project configuration
├── src/
│   ├── lib/
│   │   └── supabase.ts         # Supabase client with AsyncStorage session persistence
│   ├── data/
│   │   └── products.ts         # 3legant furniture catalogue matching web store
│   ├── types/
│   │   └── index.ts            # Product, CartItem, and Profile definitions
│   ├── context/
│   │   ├── AuthContext.tsx     # Supabase authentication & user state
│   │   └── CartContext.tsx     # Realtime WebSocket subscription & cart sync logic
│   ├── components/
│   │   ├── Header.tsx          # Top navigation bar with live cart badge
│   │   ├── ProductCard.tsx     # Product grid card with quick-add
│   │   └── CartItemCard.tsx    # Cart item row with quantity stepper
│   └── screens/
│       ├── HomeScreen.tsx      # Hero, categories, value propositions
│       ├── ShopScreen.tsx      # Filterable catalogue & search
│       ├── ProductDetailScreen.tsx # High-res gallery & specifications
│       ├── CartScreen.tsx      # Realtime synchronized cart & summary
│       ├── SignInScreen.tsx    # Supabase authentication
│       ├── SignUpScreen.tsx    # User registration
│       ├── ProfileScreen.tsx   # Account details & sync status
│       └── CheckoutScreen.tsx  # Order placement & cart clearance
```
