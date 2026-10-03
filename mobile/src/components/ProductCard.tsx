import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { Star, Plus } from 'lucide-react-native'
import { Product } from '../types'
import { resolveProductImage } from '../lib/supabase'
import { useCart } from '../context/CartContext'

interface ProductCardProps {
  product: Product
  onPress: () => void
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const { addToCart } = useCart()

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: resolveProductImage(product.image) }}
          style={styles.image}
          resizeMode="contain"
        />

        {product.badge && (
          <View
            style={[
              styles.badge,
              product.badge.includes('%') ? styles.badgeDiscount : styles.badgeNormal,
            ]}
          >
            <Text style={styles.badgeText}>{product.badge}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.quickAddButton}
          onPress={() => addToCart(product, 1)}
          activeOpacity={0.7}
        >
          <Plus size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.details}>
        {product.rating && (
          <View style={styles.ratingRow}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                color={i < Math.floor(product.rating || 5) ? '#141718' : '#E8ECEF'}
                fill={i < Math.floor(product.rating || 5) ? '#141718' : '#E8ECEF'}
              />
            ))}
            <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
          </View>
        )}

        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>
              ${product.originalPrice.toFixed(2)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 0.85,
    backgroundColor: '#F3F5F7',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  image: {
    width: '90%',
    height: '90%',
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeNormal: {
    backgroundColor: '#141718',
  },
  badgeDiscount: {
    backgroundColor: '#38CB89',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  quickAddButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#141718',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  details: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 11,
    color: '#6C7275',
    marginLeft: 3,
    fontWeight: '500',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#141718',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#141718',
  },
  originalPrice: {
    fontSize: 13,
    color: '#6C7275',
    textDecorationLine: 'line-through',
  },
})
