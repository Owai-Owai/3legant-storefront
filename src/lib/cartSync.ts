import { supabase, isSupabaseConfigured } from "./supabase"
import type { Product } from "@/app/App"

export interface SyncedCartItem {
  id: string
  productId: string
  name: string
  price: number
  color?: string
  image: string
  quantity: number
}

/**
 * Retrieves the active cart for an authenticated user, or creates one if it doesn't exist yet.
 */
export async function getOrCreateUserCart(userId: string): Promise<string | null> {
  if (!isSupabaseConfigured || !userId) return null

  try {
    const { data: existingCart, error: fetchError } = await (supabase.from("carts") as any)
      .select("id")
      .eq("profile_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!fetchError && existingCart?.id) {
      return existingCart.id
    }

    // Create a new active cart
    const { data: newCart, error: insertError } = await (supabase.from("carts") as any)
      .insert({
        profile_id: userId,
        status: "active",
      })
      .select("id")
      .single()

    if (!insertError && newCart?.id) {
      return newCart.id
    }

    return null
  } catch (err) {
    console.error("[CartSync] Failed to get or create cart:", err)
    return null
  }
}

/**
 * Loads all items currently stored in the user's remote cart.
 */
export async function loadRemoteCartItems(cartId: string): Promise<Array<{ product: Product; quantity: number }>> {
  if (!isSupabaseConfigured || !cartId) return []

  try {
    const { data, error } = await (supabase.from("cart_items") as any)
      .select("*")
      .eq("cart_id", cartId)

    if (error || !data) return []

    return data.map((item: any) => ({
      product: {
        id: item.product_id || item.id,
        name: item.name || "Product",
        price: Number(item.price) || 0,
        color: item.color || "Standard",
        image: item.image || "4925a.png",
        geometry: "inset-0 size-full object-contain",
      } as Product,
      quantity: item.quantity,
    }))
  } catch (err) {
    console.error("[CartSync] Failed to load remote cart items:", err)
    return []
  }
}

/**
 * Adds or increments an item in the remote database cart.
 */
export async function syncItemToRemoteCart(
  cartId: string,
  product: Product,
  quantityDelta: number,
  productImageSrc: string,
  currentCartItems: Array<{ product: Product; quantity: number }>
): Promise<void> {
  if (!isSupabaseConfigured || !cartId) return

  try {
    const existing = currentCartItems.find((i) => i.product.id === product.id)
    const newQty = existing ? existing.quantity + quantityDelta : quantityDelta

    if (newQty <= 0) {
      await removeRemoteCartItem(cartId, product.id)
      return
    }

    const { data: existingRow } = await (supabase.from("cart_items") as any)
      .select("id")
      .eq("cart_id", cartId)
      .eq("product_id", product.id)
      .maybeSingle()

    if (existingRow?.id) {
      const { error: updateError } = await (supabase.from("cart_items") as any)
        .update({
          quantity: newQty,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingRow.id)

      if (updateError) {
        console.error("[CartSync] Failed to update remote cart item:", updateError)
      } else {
        console.log("[CartSync] Updated remote cart item quantity:", product.name, newQty)
      }
    } else {
      const { error: insertError } = await (supabase.from("cart_items") as any).insert({
        cart_id: cartId,
        product_id: product.id,
        name: product.name,
        price: product.price,
        color: product.color || null,
        image: productImageSrc,
        quantity: newQty,
      })

      if (insertError) {
        console.error("[CartSync] Failed to insert remote cart item:", insertError)
      } else {
        console.log("[CartSync] Inserted new item into remote cart:", product.name)
      }
    }
  } catch (err) {
    console.error("[CartSync] Failed to sync item to remote cart:", err)
  }
}

/**
 * Removes an item from the remote cart.
 */
export async function removeRemoteCartItem(cartId: string, productId: string): Promise<void> {
  if (!isSupabaseConfigured || !cartId) return

  try {
    await (supabase.from("cart_items") as any)
      .delete()
      .eq("cart_id", cartId)
      .eq("product_id", productId)
  } catch (err) {
    console.error("[CartSync] Failed to remove item from remote cart:", err)
  }
}

/**
 * Clears all items in the remote cart.
 */
export async function clearRemoteCart(cartId: string): Promise<void> {
  if (!isSupabaseConfigured || !cartId) return

  try {
    await (supabase.from("cart_items") as any)
      .delete()
      .eq("cart_id", cartId)
  } catch (err) {
    console.error("[CartSync] Failed to clear remote cart:", err)
  }
}
