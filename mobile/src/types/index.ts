export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  discount?: string
  rating?: number
  reviewsCount?: number
  image: string
  room?: string
  color?: string
  description?: string
  measurements?: string
  badge?: string
}

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  color?: string
  image: string
  quantity: number
}

export interface UserProfile {
  id: string
  email: string
  firstName?: string
  lastName?: string
  displayName?: string
  avatarUrl?: string
}
