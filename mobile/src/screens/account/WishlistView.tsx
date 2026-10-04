import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native'
import {
  ArrowLeft,
  Heart,
  ShoppingBag,
  Trash2,
  Check,
} from 'lucide-react-native'
import { safeStorage } from '../../lib/storage'
import { resolveProductImage } from '../../lib/supabase'
import { useCart } from '../../context/CartContext'
import { Product } from '../../types'

interface WishlistViewProps {
  onBack: () => void
  onNavigateToShop: () => void
  onSelectProduct?: (product: Product) => void
}

const WISHLIST_STORAGE_KEY = '@3legant_user_wishlist'

const DEFAULT_WISHLIST: Product[] = [
  {
    id: 'demo-wishlist-tray-table',
    name: 'Tray Table',
    color: 'Black',
    price: 19.99,
    image: '/assets/shop/4925a.png',
    room: 'Living Room',
    badge: 'HOT',
    rating: 5.0,
    reviewsCount: 11,
    description: 'Light and versatile tray table with removable tray top.',
  },
  {
    id: 'demo-wishlist-sofa',
    name: 'Loveseat Sofa',
    color: 'Beige',
    price: 345.0,
    image: '/assets/shop/76e8d.png',
    room: 'Living Room',
    badge: '-20%',
    rating: 4.8,
    reviewsCount: 24,
    description: 'Comfortable and contemporary two-seat sofa with durable linen blend upholstery.',
  },
  {
    id: 'demo-wishlist-basket',
    name: 'Bamboo Basket',
    color: 'Beige',
    price: 8.8,
    image: '/assets/shop/c350a.png',
    room: 'Bedroom',
    rating: 4.9,
    reviewsCount: 38,
    description: 'Handcrafted natural woven bamboo basket perfect for home organization.',
  },
  {
    id: 'demo-wishlist-lamp',
    name: 'Toasted Ceramic Lamp',
    color: 'Brown',
    price: 39.0,
    image: '/assets/shop/fb624.png',
    room: 'Living Room',
    badge: 'NEW',
    rating: 4.7,
    reviewsCount: 19,
    description: 'Soft warm glow with hand-spun ceramic base and linen shade.',
  },
]

export const WishlistView: React.FC<WishlistViewProps> = ({
  onBack,
  onNavigateToShop,
  onSelectProduct,
}) => {
  const { addToCart } = useCart()
  const [items, setItems] = useState<Product[]>(DEFAULT_WISHLIST)
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null)

  // Load persisted wishlist
  useEffect(() => {
    safeStorage.getItem(WISHLIST_STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed)) {
            setItems(parsed)
          }
        } catch {
          // fallback to default
        }
      }
    })
  }, [])

  const handleRemove = async (productId: string) => {
    const updated = items.filter((item) => item.id !== productId)
    setItems(updated)
    await safeStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updated))
  }

  const handleAddToCart = async (product: Product) => {
    await addToCart(product, 1)
    setRecentlyAddedId(product.id)

    setTimeout(() => {
      setRecentlyAddedId((curr) => (curr === product.id ? null : curr))
    }, 2500)
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#141718" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wishlist</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Heart size={44} color="#6C7275" />
          </View>
          <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Save your favorite furniture and decor pieces so you can find them easily later or add them to your cart in one tap.
          </Text>
          <TouchableOpacity style={styles.shopNowButton} onPress={onNavigateToShop} activeOpacity={0.85}>
            <Text style={styles.shopNowButtonText}>Explore Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionSubtitle}>
            {items.length} saved item{items.length > 1 ? 's' : ''}
          </Text>

          {items.map((item) => {
            const isAdded = recentlyAddedId === item.id

            return (
              <View key={item.id} style={styles.itemCard}>
                <TouchableOpacity
                  style={styles.cardImageTouchable}
                  onPress={() => onSelectProduct?.(item)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: resolveProductImage(item.image) }}
                    style={styles.itemImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                <View style={styles.itemDetails}>
                  <TouchableOpacity onPress={() => onSelectProduct?.(item)} activeOpacity={0.8}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.metaRow}>
                    <Text style={styles.itemColor}>Color: {item.color || 'Standard'}</Text>
                    {item.room && (
                      <>
                        <Text style={styles.metaDot}>•</Text>
                        <Text style={styles.itemRoom}>{item.room}</Text>
                      </>
                    )}
                  </View>

                  <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={[styles.addToCartButton, isAdded && styles.addedButton]}
                      onPress={() => handleAddToCart(item)}
                      activeOpacity={0.85}
                    >
                      {isAdded ? (
                        <>
                          <Check size={14} color="#FFFFFF" />
                          <Text style={styles.addToCartText}>Added to Cart</Text>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={14} color="#FFFFFF" />
                          <Text style={styles.addToCartText}>Add to Cart</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemove(item.id)}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={16} color="#6C7275" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )
          })}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECEF',
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#141718',
  },
  headerPlaceholder: {
    width: 32,
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6C7275',
    marginBottom: 16,
    fontWeight: '500',
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E8ECEF',
    alignItems: 'center',
  },
  cardImageTouchable: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  itemImage: {
    width: 90,
    height: 90,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#141718',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  itemColor: {
    fontSize: 12,
    color: '#6C7275',
  },
  metaDot: {
    color: '#9CA3AF',
  },
  itemRoom: {
    fontSize: 12,
    color: '#6C7275',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#141718',
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#141718',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addedButton: {
    backgroundColor: '#15803D',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#141718',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6C7275',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  shopNowButton: {
    backgroundColor: '#141718',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
  },
  shopNowButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
})
