-- Migration: 20261002000000_realtime_cart_sync.sql
-- Enables real-time synchronization between Web and Mobile applications for carts

-- 1. Make cart_items flexible to support both product catalog entries and arbitrary custom items
ALTER TABLE public.cart_items ALTER COLUMN variant_id DROP NOT NULL;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS product_id TEXT;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS price NUMERIC;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS image TEXT;

-- 2. Drop the old unique constraint on (cart_id, variant_id) if it exists, replace with (cart_id, product_id)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'cart_items_cart_id_variant_id_key'
    ) THEN
        ALTER TABLE public.cart_items DROP CONSTRAINT cart_items_cart_id_variant_id_key;
    END IF;
END $$;

-- 3. Ensure index for fast query by cart and product
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON public.cart_items(cart_id, product_id);

-- 4. Enable Supabase Realtime publication for carts and cart_items
-- This allows both Web and Mobile to listen to live websocket postgres_changes!
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.carts;
    EXCEPTION WHEN duplicate_object THEN
        -- table already in publication
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.cart_items;
    EXCEPTION WHEN duplicate_object THEN
        -- table already in publication
    END;
END $$;
