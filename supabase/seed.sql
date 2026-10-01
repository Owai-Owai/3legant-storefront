-- 3legant Storefront Seed Data
-- Run this in Supabase SQL Editor to populate categories, products, variants, shipping, and coupons.

-- ============================================================================
-- 1. CATEGORIES
-- ============================================================================
INSERT INTO public.categories (slug, name, sort_order)
VALUES
    ('living-room', 'Living Room', 1),
    ('bedroom', 'Bedroom', 2),
    ('kitchen', 'Kitchen', 3),
    ('bathroom', 'Bathroom', 4),
    ('dining', 'Dining', 5)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 2. SHIPPING METHODS
-- ============================================================================
INSERT INTO public.shipping_methods (code, name, amount, currency, is_active)
VALUES
    ('free', 'Free shipping', 0, 'USD', true),
    ('express', 'Express shipping', 1500, 'USD', true),
    ('pickup', 'Pick Up', 0, 'USD', true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 3. COUPONS
-- ============================================================================
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_amount, is_active)
VALUES
    ('3LEGANT10', 'percentage', 10, 0, true),
    ('WELCOME25', 'fixed_amount', 2500, 10000, true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 4. CANONICAL PRODUCTS & VARIANTS
-- ============================================================================

-- Tray Table (Canonical Product Detail Item)
INSERT INTO public.products (id, slug, name, description, room, dimensions, is_published, is_featured, rating, review_count)
VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'shop-tray-table',
    'Tray Table',
    'Buy one or buy a few and make every space where you sit more convenient. Light and easy to move around with removable tray top, handy for serving snacks.',
    'Living Room',
    'H: 53cm x W: 45cm',
    true,
    true,
    5.0,
    11
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, color_name, color_hex, unit_amount, compare_at_amount, currency, is_active)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'TT-BLACK', 'Black', '#141718', 19900, 40000, 'USD', true),
    ('22222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'TT-BROWN', 'Brown', '#6C7275', 19900, 40000, 'USD', true),
    ('33333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'TT-RED', 'Red', '#E53E3E', 19900, 40000, 'USD', true),
    ('44444444-4444-4444-4444-444444444444', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'TT-OFFWHITE', 'Off-white', '#F3F5F7', 19900, 40000, 'USD', true)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.inventory (variant_id, on_hand, reserved)
VALUES
    ('11111111-1111-1111-1111-111111111111', 25, 0),
    ('22222222-2222-2222-2222-222222222222', 15, 0),
    ('33333333-3333-3333-3333-333333333333', 10, 0),
    ('44444444-4444-4444-4444-444444444444', 30, 0)
ON CONFLICT (variant_id) DO NOTHING;

-- Loveseat Sofa
INSERT INTO public.products (id, slug, name, description, room, is_published, is_featured, rating, review_count)
VALUES (
    'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    'loveseat-sofa',
    'Loveseat Sofa',
    'A comfortable and stylish sofa perfect for compact spaces and modern living rooms.',
    'Living Room',
    true,
    true,
    5.0,
    8
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, color_name, color_hex, unit_amount, compare_at_amount, currency, is_active)
VALUES
    ('55555555-5555-5555-5555-555555555555', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'LS-GREY', 'Grey', '#6C7275', 19900, 40000, 'USD', true)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.inventory (variant_id, on_hand, reserved)
VALUES ('55555555-5555-5555-5555-555555555555', 8, 0)
ON CONFLICT (variant_id) DO NOTHING;

-- Table Lamp
INSERT INTO public.products (id, slug, name, description, room, is_published, is_featured, rating, review_count)
VALUES (
    'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    'table-lamp',
    'Table Lamp',
    'Modern ambient table lamp with elegant metallic finish.',
    'Living Room',
    true,
    false,
    4.9,
    14
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, color_name, color_hex, unit_amount, currency, is_active)
VALUES
    ('66666666-6666-6666-6666-666666666666', 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'TL-GOLD', 'Gold', '#D4AF37', 2499, 'USD', true)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.inventory (variant_id, on_hand, reserved)
VALUES ('66666666-6666-6666-6666-666666666666', 50, 0)
ON CONFLICT (variant_id) DO NOTHING;

-- Beige Table Lamp
INSERT INTO public.products (id, slug, name, description, room, is_published, is_featured, rating, review_count)
VALUES (
    'd4e5f6a7-b89c-0d1e-2f3a-4b5c6d7e8f9a',
    'beige-table-lamp',
    'Beige Table Lamp',
    'Warm neutral table lamp suited for bedside tables and quiet corners.',
    'Bedroom',
    true,
    false,
    4.8,
    6
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, color_name, color_hex, unit_amount, currency, is_active)
VALUES
    ('77777777-7777-7777-7777-777777777777', 'd4e5f6a7-b89c-0d1e-2f3a-4b5c6d7e8f9a', 'BTL-BEIGE', 'Beige', '#E2D7C5', 2499, 'USD', true)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.inventory (variant_id, on_hand, reserved)
VALUES ('77777777-7777-7777-7777-777777777777', 40, 0)
ON CONFLICT (variant_id) DO NOTHING;

-- Bamboo Basket
INSERT INTO public.products (id, slug, name, description, room, is_published, is_featured, rating, review_count)
VALUES (
    'e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b',
    'bamboo-basket',
    'Bamboo basket',
    'Hand-woven natural bamboo basket for storage and home organization.',
    'Bedroom',
    true,
    false,
    5.0,
    19
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, color_name, color_hex, unit_amount, currency, is_active)
VALUES
    ('88888888-8888-8888-8888-888888888888', 'e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b', 'BB-NATURAL', 'Natural', '#D8B887', 2499, 'USD', true)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.inventory (variant_id, on_hand, reserved)
VALUES ('88888888-8888-8888-8888-888888888888', 35, 0)
ON CONFLICT (variant_id) DO NOTHING;

-- Articles
INSERT INTO public.articles (slug, title, excerpt, body, author_name, is_published)
VALUES
    (
        '7-ways-to-decor-your-home',
        '7 ways to decor your home',
        'Start with a comfortable focal point, then build your room around it.',
        'Start with a comfortable focal point, then build your room around it. Layer soft textiles, mix warm wood with natural textures, bring in greenery, add personal artwork, choose lighting at different heights, and leave room for the things you love.',
        'Interior Team',
        true
    ),
    (
        'kitchen-organization',
        'Kitchen organization',
        'Everything you need to keep your kitchen tidy, efficient, and inspiring.',
        'Keep daily items within arm reach, categorize drawers with dividers, and use glass containers to keep pantries tidy and visible.',
        'Kitchen Expert',
        true
    ),
    (
        'decor-your-bedroom',
        'Decor your bedroom',
        'Turn your bedroom into a peaceful sanctuary with thoughtful lighting and cozy textures.',
        'Create a peaceful sleeping space with soothing palettes, breathable bedding, blackout shades, and soft bedside illumination.',
        'Sleep Specialist',
        true
    )
ON CONFLICT (slug) DO NOTHING;
