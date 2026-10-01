import type { Database } from './database'

export type DbProfile = Database['public']['Tables']['profiles']['Row']
export type DbAddress = Database['public']['Tables']['addresses']['Row']
export type DbProduct = Database['public']['Tables']['products']['Row']
export type DbProductVariant = Database['public']['Tables']['product_variants']['Row']
export type DbProductMedia = Database['public']['Tables']['product_media']['Row']
export type DbCart = Database['public']['Tables']['carts']['Row']
export type DbCartItem = Database['public']['Tables']['cart_items']['Row']
export type DbOrder = Database['public']['Tables']['orders']['Row']
export type DbOrderItem = Database['public']['Tables']['order_items']['Row']
export type DbShippingMethod = Database['public']['Tables']['shipping_methods']['Row']
export type DbCoupon = Database['public']['Tables']['coupons']['Row']

export interface ProductDetailItem {
  id: string
  slug: string
  name: string
  description: string
  room: string
  dimensions: string
  price: number // in dollars for UI display
  oldPrice?: number
  currency: string
  rating: number
  reviewCount: number
  isFeatured: boolean
  variants: {
    id: string
    sku: string
    colorName: string
    colorHex: string
    unitAmount: number
    compareAtAmount?: number
    currency: string
    inStock: boolean
  }[]
  images: {
    url: string
    altText: string
    slotName?: string
  }[]
}

export interface ClientCartItem {
  variantId: string
  productId: string
  name: string
  colorName?: string
  price: number // in dollars
  quantity: number
  image: string
  sku?: string
}

export interface CheckoutQuote {
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  couponCode?: string
  shippingMethodCode: string
}
