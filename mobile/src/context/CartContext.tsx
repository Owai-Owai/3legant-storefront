import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { Product, CartItem } from '../types'

interface CartContextType {
  cart: CartItem[]
  cartCount: number
  subtotal: number
  loading: boolean
  isSyncing: boolean
  addToCart: (product: Product, quantity?: number) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType>({
  cart: [],
  cartCount: 0,
  subtotal: 0,
  loading: false,
  isSyncing: false,
  addToCart: async () => {},
  updateQuantity: async () => {},
  removeFromCart: async () => {},
  clearCart: async () => {},
  refreshCart: async () => {},
})

const LOCAL_CART_KEY = '@3legant_local_cart'

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartId, setCartId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const channelRef = useRef<any>(null)

  // Subtotal and count derived values
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Fetch or create user cart in Supabase
  const getOrCreateRemoteCart = useCallback(async (userId: string): Promise<string | null> => {
    try {
      const { data: existing, error } = await (supabase.from('carts') as any)
        .select('id')
        .eq('profile_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!error && existing?.id) {
        return existing.id
      }

      // Create new active cart
      const { data: created, error: createErr } = await (supabase.from('carts') as any)
        .insert({
          profile_id: userId,
          status: 'active',
        })
        .select('id')
        .single()

      if (!createErr && created?.id) {
        return created.id
      }
      return null
    } catch (err) {
      console.warn('[CartContext] Error getting remote cart:', err)
      return null
    }
  }, [])

  // Load items from Supabase cart_items table
  const loadRemoteCart = useCallback(async (activeCartId: string) => {
    try {
      setIsSyncing(true)
      const { data, error } = await (supabase.from('cart_items') as any)
        .select('*')
        .eq('cart_id', activeCartId)

      if (!error && data) {
        const formatted: CartItem[] = data.map((row: any) => ({
          id: row.id,
          productId: row.product_id || row.id,
          name: row.name || 'Product',
          price: Number(row.price) || 0,
          color: row.color || 'Standard',
          image: row.image || '',
          quantity: Number(row.quantity) || 1,
        }))
        setCart(formatted)
      }
    } catch (err) {
      console.warn('[CartContext] Error loading remote cart items:', err)
    } finally {
      setIsSyncing(false)
    }
  }, [])

  // Listen to remote cart and setup real-time subscription
  useEffect(() => {
    let isMounted = true

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    if (!user) {
      // Unauthenticated: load from local storage
      setCartId(null)
      AsyncStorage.getItem(LOCAL_CART_KEY).then((stored) => {
        if (isMounted && stored) {
          try {
            setCart(JSON.parse(stored))
          } catch {
            setCart([])
          }
        } else if (isMounted) {
          setCart([])
        }
      })
      return
    }

    // Authenticated user: setup remote cart and Realtime sync
    const setupRealtimeCart = async () => {
      setLoading(true)
      const remoteCartId = await getOrCreateRemoteCart(user.id)
      if (!isMounted || !remoteCartId) {
        setLoading(false)
        return
      }

      setCartId(remoteCartId)
      await loadRemoteCart(remoteCartId)
      setLoading(false)

      // Subscribe to INSTANT Realtime changes from web or other mobile sessions
      const channel = supabase
        .channel(`mobile-cart-${remoteCartId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cart_items',
            filter: `cart_id=eq.${remoteCartId}`,
          },
          async (payload) => {
            console.log('[Realtime WebSocket Sync] Received cart event on mobile:', payload.eventType)
            await loadRemoteCart(remoteCartId)
          }
        )
        .subscribe((status) => {
          console.log('[Realtime WebSocket Sync] Channel status:', status)
        })

      channelRef.current = channel
    }

    setupRealtimeCart()

    return () => {
      isMounted = false
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [user, getOrCreateRemoteCart, loadRemoteCart])

  // Save guest cart to AsyncStorage when unauthenticated
  useEffect(() => {
    if (!user) {
      AsyncStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart)).catch(() => {})
    }
  }, [cart, user])

  // Manual refresh trigger
  const refreshCart = async () => {
    if (cartId) {
      await loadRemoteCart(cartId)
    }
  }

  // ADD TO CART
  const addToCart = async (product: Product, quantity = 1) => {
    // 1. Optimistic local update
    const existing = cart.find((i) => i.productId === product.id)
    let updated: CartItem[]

    if (existing) {
      updated = cart.map((i) =>
        i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i
      )
    } else {
      const newItem: CartItem = {
        id: `local-${Date.now()}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        color: product.color || 'Standard',
        image: product.image,
        quantity,
      }
      updated = [...cart, newItem]
    }
    setCart(updated)

    // 2. Remote database sync if authenticated
    if (cartId) {
      try {
        const targetQty = existing ? existing.quantity + quantity : quantity
        const { data: existingRow } = await (supabase.from('cart_items') as any)
          .select('id')
          .eq('cart_id', cartId)
          .eq('product_id', product.id)
          .maybeSingle()

        if (existingRow?.id) {
          await (supabase.from('cart_items') as any)
            .update({
              quantity: targetQty,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingRow.id)
        } else {
          await (supabase.from('cart_items') as any).insert({
            cart_id: cartId,
            product_id: product.id,
            name: product.name,
            price: product.price,
            color: product.color || null,
            image: product.image,
            quantity: targetQty,
          })
        }
      } catch (err) {
        console.warn('[CartContext] Failed to sync addToCart to Supabase:', err)
      }
    }
  }

  // UPDATE QUANTITY
  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId)
      return
    }

    setCart((current) =>
      current.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    )

    if (cartId) {
      try {
        const { data: existingRow } = await (supabase.from('cart_items') as any)
          .select('id')
          .eq('cart_id', cartId)
          .eq('product_id', productId)
          .maybeSingle()

        if (existingRow?.id) {
          await (supabase.from('cart_items') as any)
            .update({
              quantity,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingRow.id)
        }
      } catch (err) {
        console.warn('[CartContext] Failed to sync quantity change:', err)
      }
    }
  }

  // REMOVE FROM CART
  const removeFromCart = async (productId: string) => {
    setCart((current) => current.filter((item) => item.productId !== productId))

    if (cartId) {
      try {
        await (supabase.from('cart_items') as any)
          .delete()
          .eq('cart_id', cartId)
          .eq('product_id', productId)
      } catch (err) {
        console.warn('[CartContext] Failed to remove item from remote cart:', err)
      }
    }
  }

  // CLEAR CART
  const clearCart = async () => {
    setCart([])
    if (cartId) {
      try {
        await (supabase.from('cart_items') as any).delete().eq('cart_id', cartId)
      } catch (err) {
        console.warn('[CartContext] Failed to clear remote cart:', err)
      }
    } else {
      await AsyncStorage.removeItem(LOCAL_CART_KEY)
    }
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        subtotal,
        loading,
        isSyncing,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
