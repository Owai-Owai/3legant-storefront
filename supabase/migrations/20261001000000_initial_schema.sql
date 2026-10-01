-- 3legant Storefront Initial Schema Migration
-- Compatible with Supabase PostgreSQL (including RLS, Auth hooks, and Triggers)

-- Enable UUID extension if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. PROFILES & ADDRESSES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    display_name TEXT,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Trigger to create profile automatically when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, display_name, email, avatar_url)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'first_name', split_part(COALESCE(new.raw_user_meta_data->>'full_name', ''), ' ', 1)),
        COALESCE(new.raw_user_meta_data->>'last_name', split_part(COALESCE(new.raw_user_meta_data->>'full_name', ''), ' ', 2)),
        COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
        new.email,
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- User Addresses
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    street_line1 TEXT NOT NULL,
    street_line2 TEXT,
    city TEXT NOT NULL,
    region TEXT,
    postal_code TEXT,
    country_code TEXT NOT NULL DEFAULT 'US',
    is_default_billing BOOLEAN NOT NULL DEFAULT false,
    is_default_shipping BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_addresses_profile ON public.addresses(profile_id);
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own addresses"
    ON public.addresses FOR ALL
    USING (auth.uid() = profile_id);

-- ============================================================================
-- 2. CATEGORIES, PRODUCTS & VARIANTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    room TEXT,
    dimensions TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    review_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(is_published);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published products" ON public.products FOR SELECT USING (is_published = true);

CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT NOT NULL UNIQUE,
    color_name TEXT,
    color_hex TEXT,
    unit_amount BIGINT NOT NULL CHECK (unit_amount >= 0), -- minor currency units (cents)
    compare_at_amount BIGINT CHECK (compare_at_amount >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active variants" ON public.product_variants FOR SELECT USING (is_active = true);

CREATE TABLE IF NOT EXISTS public.product_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    slot_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_product_media_product ON public.product_media(product_id);
ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read product media" ON public.product_media FOR SELECT USING (true);

-- Inventory
CREATE TABLE IF NOT EXISTS public.inventory (
    variant_id UUID PRIMARY KEY REFERENCES public.product_variants(id) ON DELETE CASCADE,
    on_hand INT NOT NULL DEFAULT 0 CHECK (on_hand >= 0),
    reserved INT NOT NULL DEFAULT 0 CHECK (reserved >= 0 AND reserved <= on_hand),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read inventory availability" ON public.inventory FOR SELECT USING (true);

-- ============================================================================
-- 3. CARTS & WISHLISTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    guest_token_hash TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'converted', 'abandoned')),
    revision INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_carts_profile ON public.carts(profile_id);
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own carts"
    ON public.carts FOR ALL
    USING (auth.uid() = profile_id);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(cart_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON public.cart_items(cart_id);
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cart items"
    ON public.cart_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE carts.id = cart_items.cart_id
            AND carts.profile_id = auth.uid()
        )
    );

-- Wishlist
CREATE TABLE IF NOT EXISTS public.wishlist_items (
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (profile_id, variant_id)
);

ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlist"
    ON public.wishlist_items FOR ALL
    USING (auth.uid() = profile_id);

-- ============================================================================
-- 4. DISCOUNTS & SHIPPING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.shipping_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    amount BIGINT NOT NULL DEFAULT 0, -- cents
    currency TEXT NOT NULL DEFAULT 'USD',
    is_active BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read shipping methods" ON public.shipping_methods FOR SELECT USING (is_active = true);

CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value BIGINT NOT NULL CHECK (discount_value > 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    min_order_amount BIGINT NOT NULL DEFAULT 0,
    usage_limit INT,
    used_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active coupons" ON public.coupons FOR SELECT USING (is_active = true);

-- ============================================================================
-- 5. ORDERS & PAYMENTS (Paystack Supported)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'failed', 'refunded')),
    fulfillment_status TEXT NOT NULL DEFAULT 'unfulfilled' CHECK (fulfillment_status IN ('unfulfilled', 'fulfilled', 'shipped', 'delivered')),
    currency TEXT NOT NULL DEFAULT 'USD',
    subtotal_amount BIGINT NOT NULL CHECK (subtotal_amount >= 0),
    discount_amount BIGINT NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    shipping_amount BIGINT NOT NULL DEFAULT 0 CHECK (shipping_amount >= 0),
    tax_amount BIGINT NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount BIGINT NOT NULL CHECK (total_amount >= 0),
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    payment_method TEXT NOT NULL DEFAULT 'paystack',
    idempotency_key TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_orders_profile ON public.orders(profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = profile_id);

CREATE POLICY "Users can create own orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = profile_id);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    color_name TEXT,
    unit_amount BIGINT NOT NULL CHECK (unit_amount >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    total_amount BIGINT NOT NULL CHECK (total_amount >= 0),
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.profile_id = auth.uid()
        )
    );

-- Payment attempts & events (Paystack reference)
CREATE TABLE IF NOT EXISTS public.payment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'paystack',
    provider_reference TEXT NOT NULL UNIQUE,
    amount BIGINT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.payment_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payment attempts"
    ON public.payment_attempts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = payment_attempts.order_id
            AND orders.profile_id = auth.uid()
        )
    );

-- ============================================================================
-- 6. CONTENT & COMMUNICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT,
    body TEXT,
    hero_image_url TEXT,
    author_name TEXT NOT NULL DEFAULT 'Admin',
    is_published BOOLEAN NOT NULL DEFAULT true,
    published_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published articles" ON public.articles FOR SELECT USING (is_published = true);

CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'reviewed', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact message" ON public.contact_messages FOR INSERT WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions FOR INSERT WITH CHECK (true);
