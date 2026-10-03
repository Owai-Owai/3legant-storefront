import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { Minus, Plus, Trash2 } from 'lucide-react-native'
import { CartItem } from '../types'
import { resolveProductImage } from '../lib/supabase'

interface CartItemCardProps {
  item: CartItem
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

export const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: resolveProductImage(item.image) }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <TouchableOpacity
            onPress={() => onRemove(item.productId)}
            style={styles.deleteButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2 size={16} color="#6C7275" />
          </TouchableOpacity>
        </View>

        {item.color && (
          <Text style={styles.colorText}>Color: {item.color}</Text>
        )}

        <View style={styles.footer}>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => onUpdateQuantity(item.productId, item.quantity - 1)}
              activeOpacity={0.6}
            >
              <Minus size={14} color="#141718" />
            </TouchableOpacity>

            <Text style={styles.quantityText}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => onUpdateQuantity(item.productId, item.quantity + 1)}
              activeOpacity={0.6}
            >
              <Plus size={14} color="#141718" />
            </TouchableOpacity>
          </View>

          <Text style={styles.totalPrice}>
            ${(item.price * item.quantity).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8ECEF',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    gap: 14,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#141718',
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  colorText: {
    fontSize: 12,
    color: '#6C7275',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECEF',
    borderRadius: 6,
    height: 32,
    paddingHorizontal: 4,
  },
  stepperButton: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#141718',
    minWidth: 24,
    textAlign: 'center',
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#141718',
  },
})
