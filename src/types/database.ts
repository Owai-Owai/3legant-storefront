export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          display_name: string | null
          email: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          profile_id: string
          full_name: string
          phone: string | null
          street_line1: string
          street_line2: string | null
          city: string
          region: string | null
          postal_code: string | null
          country_code: string
          is_default_billing: boolean
          is_default_shipping: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          full_name: string
          phone?: string | null
          street_line1: string
          street_line2?: string | null
          city: string
          region?: string | null
          postal_code?: string | null
          country_code?: string
          is_default_billing?: boolean
          is_default_shipping?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          full_name?: string
          phone?: string | null
          street_line1?: string
          street_line2?: string | null
          city?: string
          region?: string | null
          postal_code?: string | null
          country_code?: string
          is_default_billing?: boolean
          is_default_shipping?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          slug: string
          name: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          sort_order?: number
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          room: string | null
          dimensions: string | null
          is_published: boolean
          is_featured: boolean
          rating: number
          review_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          room?: string | null
          dimensions?: string | null
          is_published?: boolean
          is_featured?: boolean
          rating?: number
          review_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string | null
          room?: string | null
          dimensions?: string | null
          is_published?: boolean
          is_featured?: boolean
          rating?: number
          review_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          sku: string
          color_name: string | null
          color_hex: string | null
          unit_amount: number
          compare_at_amount: number | null
          currency: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          sku: string
          color_name?: string | null
          color_hex?: string | null
          unit_amount: number
          compare_at_amount?: number | null
          currency?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          sku?: string
          color_name?: string | null
          color_hex?: string | null
          unit_amount?: number
          compare_at_amount?: number | null
          currency?: string
          is_active?: boolean
          created_at?: string
        }
      }
      product_media: {
        Row: {
          id: string
          product_id: string
          variant_id: string | null
          url: string
          alt_text: string | null
          sort_order: number
          slot_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          variant_id?: string | null
          url: string
          alt_text?: string | null
          sort_order?: number
          slot_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          variant_id?: string | null
          url?: string
          alt_text?: string | null
          sort_order?: number
          slot_name?: string | null
          created_at?: string
        }
      }
      inventory: {
        Row: {
          variant_id: string
          on_hand: number
          reserved: number
          updated_at: string
        }
        Insert: {
          variant_id: string
          on_hand?: number
          reserved?: number
          updated_at?: string
        }
        Update: {
          variant_id?: string
          on_hand?: number
          reserved?: number
          updated_at?: string
        }
      }
      carts: {
        Row: {
          id: string
          profile_id: string | null
          guest_token_hash: string | null
          status: 'active' | 'converted' | 'abandoned'
          revision: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          guest_token_hash?: string | null
          status?: 'active' | 'converted' | 'abandoned'
          revision?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string | null
          guest_token_hash?: string | null
          status?: 'active' | 'converted' | 'abandoned'
          revision?: number
          created_at?: string
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          cart_id: string
          variant_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cart_id: string
          variant_id: string
          quantity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cart_id?: string
          variant_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      wishlist_items: {
        Row: {
          profile_id: string
          variant_id: string
          created_at: string
        }
        Insert: {
          profile_id: string
          variant_id: string
          created_at?: string
        }
        Update: {
          profile_id?: string
          variant_id?: string
          created_at?: string
        }
      }
      shipping_methods: {
        Row: {
          id: string
          code: string
          name: string
          amount: number
          currency: string
          is_active: boolean
        }
        Insert: {
          id?: string
          code: string
          name: string
          amount?: number
          currency?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          code?: string
          name?: string
          amount?: number
          currency?: string
          is_active?: boolean
        }
      }
      coupons: {
        Row: {
          id: string
          code: string
          discount_type: 'percentage' | 'fixed_amount'
          discount_value: number
          currency: string
          min_order_amount: number
          usage_limit: number | null
          used_count: number
          is_active: boolean
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          discount_type: 'percentage' | 'fixed_amount'
          discount_value: number
          currency?: string
          min_order_amount?: number
          usage_limit?: number | null
          used_count?: number
          is_active?: boolean
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          discount_type?: 'percentage' | 'fixed_amount'
          discount_value?: number
          currency?: string
          min_order_amount?: number
          usage_limit?: number | null
          used_count?: number
          is_active?: boolean
          expires_at?: string | null
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          profile_id: string
          status: 'pending' | 'processing' | 'completed' | 'cancelled'
          payment_status: 'unpaid' | 'paid' | 'failed' | 'refunded'
          fulfillment_status: 'unfulfilled' | 'fulfilled' | 'shipped' | 'delivered'
          currency: string
          subtotal_amount: number
          discount_amount: number
          shipping_amount: number
          tax_amount: number
          total_amount: number
          shipping_address: Json
          billing_address: Json
          contact_email: string
          contact_phone: string | null
          payment_method: string
          idempotency_key: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          profile_id: string
          status?: 'pending' | 'processing' | 'completed' | 'cancelled'
          payment_status?: 'unpaid' | 'paid' | 'failed' | 'refunded'
          fulfillment_status?: 'unfulfilled' | 'fulfilled' | 'shipped' | 'delivered'
          currency?: string
          subtotal_amount: number
          discount_amount?: number
          shipping_amount?: number
          tax_amount?: number
          total_amount: number
          shipping_address: Json
          billing_address: Json
          contact_email: string
          contact_phone?: string | null
          payment_method?: string
          idempotency_key?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          profile_id?: string
          status?: 'pending' | 'processing' | 'completed' | 'cancelled'
          payment_status?: 'unpaid' | 'paid' | 'failed' | 'refunded'
          fulfillment_status?: 'unfulfilled' | 'fulfilled' | 'shipped' | 'delivered'
          currency?: string
          subtotal_amount?: number
          discount_amount?: number
          shipping_amount?: number
          tax_amount?: number
          total_amount?: number
          shipping_address?: Json
          billing_address?: Json
          contact_email?: string
          contact_phone?: string | null
          payment_method?: string
          idempotency_key?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          variant_id: string | null
          sku: string
          name: string
          color_name: string | null
          unit_amount: number
          quantity: number
          total_amount: number
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          variant_id?: string | null
          sku: string
          name: string
          color_name?: string | null
          unit_amount: number
          quantity: number
          total_amount: number
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          variant_id?: string | null
          sku?: string
          name?: string
          color_name?: string | null
          unit_amount?: number
          quantity?: number
          total_amount?: number
          image_url?: string | null
          created_at?: string
        }
      }
      payment_attempts: {
        Row: {
          id: string
          order_id: string
          provider: string
          provider_reference: string
          amount: number
          currency: string
          status: 'pending' | 'success' | 'failed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          provider?: string
          provider_reference: string
          amount: number
          currency?: string
          status?: 'pending' | 'success' | 'failed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          provider?: string
          provider_reference?: string
          amount?: number
          currency?: string
          status?: 'pending' | 'success' | 'failed'
          created_at?: string
          updated_at?: string
        }
      }
      articles: {
        Row: {
          id: string
          slug: string
          title: string
          excerpt: string | null
          body: string | null
          hero_image_url: string | null
          author_name: string
          is_published: boolean
          published_at: string
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          excerpt?: string | null
          body?: string | null
          hero_image_url?: string | null
          author_name?: string
          is_published?: boolean
          published_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          excerpt?: string | null
          body?: string | null
          hero_image_url?: string | null
          author_name?: string
          is_published?: boolean
          published_at?: string
          created_at?: string
        }
      }
      contact_messages: {
        Row: {
          id: string
          name: string
          email: string
          message: string
          status: 'received' | 'reviewed' | 'archived'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          message: string
          status?: 'received' | 'reviewed' | 'archived'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          message?: string
          status?: 'received' | 'reviewed' | 'archived'
          created_at?: string
        }
      }
      newsletter_subscriptions: {
        Row: {
          id: string
          email: string
          status: 'active' | 'unsubscribed'
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          status?: 'active' | 'unsubscribed'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          status?: 'active' | 'unsubscribed'
          created_at?: string
        }
      }
    }
  }
}
