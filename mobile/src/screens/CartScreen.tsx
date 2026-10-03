import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { ShoppingBag, ArrowRight, RefreshCw, LogIn, CheckCircle } from 'lucide-react-native'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { CartItemCard } from '../components/CartItemCard'

interface CartScreenProps {
  onNavigateToShop: () => void
  onNavigateToSignIn: () => void
  onNavigateToCheckout: () => void
}

export const CartScreen: React.FC<CartScreenProps> = ({
  onNavigateToShop,
  onNavigateToSignIn,
  onNavigateToCheckout,
}) => {
  const {
    cart,
    cartCount,
    subtotal,
    loading,
    isSyncing,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
  } = useCart()
  const { user } = useAuth()

  const shippingCost = subtotal > 200 || subtotal === 0 ? 0 : 15
  const total = subtotal + shippingCost

  return (
    <View style={styles.container}>
      {/* REALTIME STATUS BANNER */}
      <View style={styles.statusBar}>
        <View style={styles.statusLeft}>
          <View
            style={[
              styles.statusIndicator,
              user ? styles.statusOnline : styles.statusOffline,
            ]}
          />
          <Text style={styles.statusText}>
            {user
              ? isSyncing
                ? 'Syncing with Web Store...'
                : 'Connected to 3legant Realtime'
              : 'Local Cart (Sign in to sync across devices)'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={refreshCart}
          style={styles.refreshButton}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color="#141718" />
          ) : (
            <RefreshCw size={14} color="#6C7275" />
          )}
        </TouchableOpacity>
      </View>

      {/* SIGN IN REMINDER BANNER FOR GUEST USERS */}
      {!user && (
        <TouchableOpacity
          style={styles.authBanner}
          onPress={onNavigateToSignIn}
          activeOpacity={0.8}
        >
          <LogIn size={18} color="#141718" />
          <View style={styles.authBannerText}>
            <Text style={styles.authBannerTitle}>Sign in to sync your cart</Text>
            <Text style={styles.authBannerSubtitle}>
              Items added here will instantly appear on your web browser.
            </Text>
          </View>
          <ArrowRight size={16} color="#141718" />
        </TouchableOpacity>
      )}

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#141718" />
          <Text style={styles.loaderText}>Loading your cart...</Text>
        </View>
      ) : cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <ShoppingBag size={48} color="#6C7275" />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyDesc}>
            Looks like you haven't added anything yet. Explore our furniture collection or add items on the web store to see them appear here!
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={onNavigateToShop}
            activeOpacity={0.8}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
            <ArrowRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* HEADER CONTROLS */}
          <View style={styles.cartHeader}>
            <Text style={styles.itemCountText}>
              {cartCount} {cartCount === 1 ? 'item' : 'items'} in cart
            </Text>
            <TouchableOpacity onPress={clearCart}>
              <Text style={styles.clearCartText}>Clear all</Text>
            </TouchableOpacity>
          </View>

          {/* ITEM LIST */}
          <View style={styles.itemList}>
            {cart.map((item) => (
              <CartItemCard
                key={item.productId}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </View>

          {/* SUMMARY CARD */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>
                {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={onNavigateToCheckout}
              activeOpacity={0.85}
            >
              <Text style={styles.checkoutButtonText}>Checkout</Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F5F7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8ECEF',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusOnline: {
    backgroundColor: '#38CB89',
  },
  statusOffline: {
    backgroundColor: '#E04F16',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#141718',
  },
  refreshButton: {
    padding: 4,
  },
  authBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF08A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  authBannerText: {
    flex: 1,
  },
  authBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#141718',
  },
  authBannerSubtitle: {
    fontSize: 11,
    color: '#555',
    marginTop: 2,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: 14,
    color: '#6C7275',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F3F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#141718',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#6C7275',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#141718',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  cartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  itemCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#141718',
  },
  clearCartText: {
    fontSize: 13,
    color: '#6C7275',
  },
  itemList: {
    marginBottom: 24,
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: '#E8ECEF',
    borderRadius: 12,
    padding: 18,
    backgroundColor: '#FAFAFA',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#141718',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6C7275',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#141718',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E8ECEF',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#141718',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#141718',
  },
  checkoutButton: {
    height: 48,
    backgroundColor: '#141718',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
})
