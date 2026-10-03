import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native'
import { ArrowLeft, Star, Heart, Minus, Plus, ShoppingBag, Check } from 'lucide-react-native'
import { Product } from '../types'
import { resolveProductImage } from '../lib/supabase'
import { useCart } from '../context/CartContext'

const { width } = Dimensions.get('window')

interface ProductDetailScreenProps {
  product: Product
  onBack: () => void
  onNavigateToCart: () => void
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  product,
  onBack,
  onNavigateToCart,
}) => {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const handleAddToCart = async () => {
    await addToCart(product, quantity)
    setIsAdded(true)
    setTimeout(() => {
      setIsAdded(false)
    }, 2000)
  }

  const handleBuyNow = async () => {
    await addToCart(product, quantity)
    onNavigateToCart()
  }

  return (
    <View style={styles.container}>
      {/* TOP NAVIGATION BAR */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.iconButton} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft size={22} color="#141718" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setIsWishlisted(!isWishlisted)}
          activeOpacity={0.7}
        >
          <Heart
            size={22}
            color={isWishlisted ? '#E04F16' : '#141718'}
            fill={isWishlisted ? '#E04F16' : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* PRODUCT IMAGE GALLERY */}
        <View style={styles.imageBox}>
          <Image
            source={{ uri: resolveProductImage(product.image) }}
            style={styles.image}
            resizeMode="contain"
          />
          {product.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{product.badge}</Text>
            </View>
          )}
        </View>

        {/* DETAILS SECTION */}
        <View style={styles.details}>
          <View style={styles.ratingRow}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                color={i < Math.floor(product.rating || 5) ? '#141718' : '#E8ECEF'}
                fill={i < Math.floor(product.rating || 5) ? '#141718' : '#E8ECEF'}
              />
            ))}
            <Text style={styles.ratingText}>
              {product.rating || 5.0} ({product.reviewsCount || 11} Reviews)
            </Text>
          </View>

          <Text style={styles.title}>{product.name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>
                ${product.originalPrice.toFixed(2)}
              </Text>
            )}
            {product.discount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{product.discount}</Text>
              </View>
            )}
          </View>

          {/* ATTRIBUTES */}
          <View style={styles.attributesRow}>
            {product.room && (
              <View style={styles.attributeItem}>
                <Text style={styles.attributeLabel}>Room</Text>
                <Text style={styles.attributeValue}>{product.room}</Text>
              </View>
            )}
            {product.color && (
              <View style={styles.attributeItem}>
                <Text style={styles.attributeLabel}>Color</Text>
                <Text style={styles.attributeValue}>{product.color}</Text>
              </View>
            )}
            {product.measurements && (
              <View style={styles.attributeItem}>
                <Text style={styles.attributeLabel}>Measurements</Text>
                <Text style={styles.attributeValue}>{product.measurements}</Text>
              </View>
            )}
          </View>

          {/* DESCRIPTION */}
          <Text style={styles.sectionHeader}>Description</Text>
          <Text style={styles.description}>
            {product.description ||
              'A beautifully designed contemporary home furnishing piece handcrafted with precision, bringing Scandinavian elegance into your living space.'}
          </Text>

          <View style={styles.divider} />

          {/* QUANTITY PICKER */}
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus size={16} color="#141718" />
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Plus size={16} color="#141718" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* STICKY BOTTOM ACTION BAR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.addToCartButton, isAdded && styles.addedButton]}
          onPress={handleAddToCart}
          activeOpacity={0.8}
        >
          {isAdded ? (
            <>
              <Check size={18} color="#FFFFFF" />
              <Text style={styles.addToCartText}>Added to Cart</Text>
            </>
          ) : (
            <>
              <ShoppingBag size={18} color="#FFFFFF" />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyNowButton}
          onPress={handleBuyNow}
          activeOpacity={0.8}
        >
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topNav: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8ECEF',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBox: {
    width: width,
    height: width * 0.9,
    backgroundColor: '#F3F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: 24,
  },
  image: {
    width: '90%',
    height: '90%',
  },
  badge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#141718',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  details: {
    padding: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#6C7275',
    marginLeft: 4,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#141718',
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: '#141718',
  },
  originalPrice: {
    fontSize: 16,
    color: '#6C7275',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#38CB89',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  attributesRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F5F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    gap: 16,
  },
  attributeItem: {
    flex: 1,
  },
  attributeLabel: {
    fontSize: 11,
    color: '#6C7275',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  attributeValue: {
    fontSize: 13,
    color: '#141718',
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#141718',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: '#6C7275',
    lineHeight: 20,
    marginBottom: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E8ECEF',
    marginVertical: 16,
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#141718',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECEF',
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 8,
  },
  stepperButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#141718',
    minWidth: 32,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E8ECEF',
    flexDirection: 'row',
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#141718',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addedButton: {
    backgroundColor: '#38CB89',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  buyNowButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F3F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyNowText: {
    color: '#141718',
    fontSize: 14,
    fontWeight: '600',
  },
})
