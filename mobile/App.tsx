import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Home, Store, ShoppingBag, User } from 'lucide-react-native'

import { AuthProvider } from './src/context/AuthContext'
import { CartProvider, useCart } from './src/context/CartContext'
import { Header } from './src/components/Header'

import { HomeScreen } from './src/screens/HomeScreen'
import { ShopScreen } from './src/screens/ShopScreen'
import { ProductDetailScreen } from './src/screens/ProductDetailScreen'
import { CartScreen } from './src/screens/CartScreen'
import { ProfileScreen } from './src/screens/ProfileScreen'
import { SignInScreen } from './src/screens/SignInScreen'
import { SignUpScreen } from './src/screens/SignUpScreen'
import { CheckoutScreen } from './src/screens/CheckoutScreen'
import { Product } from './src/types'

type TabType = 'home' | 'shop' | 'cart' | 'profile'

function MainContent() {
  const { cartCount } = useCart()
  const [activeTab, setActiveTab] = useState<TabType>('home')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [shopCategory, setShopCategory] = useState<string>('All Rooms')
  const [isCheckout, setIsCheckout] = useState(false)
  const [authModal, setAuthModal] = useState<'signin' | 'signup' | null>(null)

  // Navigate to shop with pre-selected room
  const handleNavigateToShop = (category?: string) => {
    if (category) setShopCategory(category)
    setSelectedProduct(null)
    setIsCheckout(false)
    setAuthModal(null)
    setActiveTab('shop')
  }

  // Switch to product details
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product)
  }

  // Render current active screen
  const renderScreen = () => {
    // 1. Auth Modals
    if (authModal === 'signin') {
      return (
        <SignInScreen
          onSuccess={() => setAuthModal(null)}
          onNavigateToSignUp={() => setAuthModal('signup')}
          onBack={() => setAuthModal(null)}
        />
      )
    }

    if (authModal === 'signup') {
      return (
        <SignUpScreen
          onSuccess={() => setAuthModal(null)}
          onNavigateToSignIn={() => setAuthModal('signin')}
          onBack={() => setAuthModal(null)}
        />
      )
    }

    // 2. Checkout Screen
    if (isCheckout) {
      return (
        <CheckoutScreen
          onBack={() => setIsCheckout(false)}
          onOrderComplete={() => {
            setIsCheckout(false)
            setActiveTab('home')
          }}
        />
      )
    }

    // 3. Product Detail Screen
    if (selectedProduct) {
      return (
        <ProductDetailScreen
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
          onNavigateToCart={() => {
            setSelectedProduct(null)
            setActiveTab('cart')
          }}
        />
      )
    }

    // 4. Tab Screens
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onSelectProduct={handleSelectProduct}
            onNavigateToShop={handleNavigateToShop}
          />
        )
      case 'shop':
        return (
          <ShopScreen
            initialCategory={shopCategory}
            onSelectProduct={handleSelectProduct}
          />
        )
      case 'cart':
        return (
          <CartScreen
            onNavigateToShop={() => setActiveTab('shop')}
            onNavigateToSignIn={() => setAuthModal('signin')}
            onNavigateToCheckout={() => setIsCheckout(true)}
          />
        )
      case 'profile':
        return (
          <ProfileScreen
            onNavigateToSignIn={() => setAuthModal('signin')}
            onNavigateToSignUp={() => setAuthModal('signup')}
            onNavigateToShop={() => setActiveTab('shop')}
          />
        )
    }
  }

  const isFullscreenView = !!selectedProduct || isCheckout || !!authModal

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* HEADER (hidden on detail/checkout/auth views) */}
      {!isFullscreenView && (
        <Header
          title="3legant."
          showCart={activeTab !== 'cart'}
          onCartPress={() => setActiveTab('cart')}
          onProfilePress={() => setActiveTab('profile')}
        />
      )}

      {/* MAIN SCREEN BODY */}
      <View style={styles.main}>{renderScreen()}</View>

      {/* BOTTOM TAB BAR (hidden on detail/checkout/auth views) */}
      {!isFullscreenView && (
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('home')}
            activeOpacity={0.7}
          >
            <Home
              size={22}
              color={activeTab === 'home' ? '#141718' : '#6C7275'}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'home' && styles.tabLabelActive,
              ]}
            >
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('shop')}
            activeOpacity={0.7}
          >
            <Store
              size={22}
              color={activeTab === 'shop' ? '#141718' : '#6C7275'}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'shop' && styles.tabLabelActive,
              ]}
            >
              Shop
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('cart')}
            activeOpacity={0.7}
          >
            <View style={styles.cartIconWrapper}>
              <ShoppingBag
                size={22}
                color={activeTab === 'cart' ? '#141718' : '#6C7275'}
              />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'cart' && styles.tabLabelActive,
              ]}
            >
              Cart
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('profile')}
            activeOpacity={0.7}
          >
            <User
              size={22}
              color={activeTab === 'profile' ? '#141718' : '#6C7275'}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'profile' && styles.tabLabelActive,
              ]}
            >
              Account
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <MainContent />
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  main: {
    flex: 1,
  },
  tabBar: {
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E8ECEF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabLabel: {
    fontSize: 11,
    color: '#6C7275',
    marginTop: 4,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#141718',
    fontWeight: '700',
  },
  cartIconWrapper: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#141718',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
})
