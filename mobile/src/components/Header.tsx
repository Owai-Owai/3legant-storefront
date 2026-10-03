import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { ShoppingBag, Bell, User } from 'lucide-react-native'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

interface HeaderProps {
  title?: string
  showCart?: boolean
  showBack?: boolean
  onBackPress?: () => void
  onCartPress?: () => void
  onProfilePress?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showCart = true,
  onCartPress,
  onProfilePress,
}) => {
  const { cartCount, isSyncing } = useCart()
  const { user } = useAuth()

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.brandTitle}>{title || '3legant.'}</Text>
        {isSyncing && (
          <View style={styles.syncIndicator}>
            <View style={styles.syncDot} />
            <Text style={styles.syncText}>Syncing</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onProfilePress}
          activeOpacity={0.7}
        >
          <User size={22} color={user ? '#141718' : '#6C7275'} />
        </TouchableOpacity>

        {showCart && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onCartPress}
            activeOpacity={0.7}
          >
            <ShoppingBag size={22} color="#141718" />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {cartCount > 99 ? '99+' : cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8ECEF',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#141718',
    letterSpacing: -0.5,
  },
  syncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F5F7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38CB89',
  },
  syncText: {
    fontSize: 10,
    color: '#6C7275',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#141718',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
})
