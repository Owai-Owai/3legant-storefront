import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native'
import {
  User,
  ShoppingBag,
  MapPin,
  Heart,
  LogOut,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react-native'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { Product } from '../types'
import { OrdersHistoryView } from './account/OrdersHistoryView'
import { ShippingAddressesView } from './account/ShippingAddressesView'
import { WishlistView } from './account/WishlistView'
import { AccountSecurityView } from './account/AccountSecurityView'

type AccountSubPage = 'overview' | 'orders' | 'addresses' | 'wishlist' | 'security'

interface ProfileScreenProps {
  onNavigateToSignIn: () => void
  onNavigateToSignUp: () => void
  onNavigateToShop: () => void
  onSelectProduct?: (product: Product) => void
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigateToSignIn,
  onNavigateToSignUp,
  onNavigateToShop,
  onSelectProduct,
}) => {
  const { user, signOut } = useAuth()
  const { cartCount } = useCart()
  const [subPage, setSubPage] = useState<AccountSubPage>('overview')

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut()
        },
      },
    ])
  }

  // Handle subpage routing
  if (subPage === 'orders') {
    return (
      <OrdersHistoryView
        onBack={() => setSubPage('overview')}
        onNavigateToShop={onNavigateToShop}
      />
    )
  }

  if (subPage === 'addresses') {
    return (
      <ShippingAddressesView
        onBack={() => setSubPage('overview')}
      />
    )
  }

  if (subPage === 'wishlist') {
    return (
      <WishlistView
        onBack={() => setSubPage('overview')}
        onNavigateToShop={onNavigateToShop}
        onSelectProduct={onSelectProduct}
      />
    )
  }

  if (subPage === 'security') {
    return (
      <AccountSecurityView
        onBack={() => setSubPage('overview')}
      />
    )
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.display_name ||
    user?.email?.split('@')[0] ||
    '3legant Member'

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {user ? (
        <>
          {/* USER INFO HEADER */}
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <User size={36} color="#141718" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{displayName}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.syncBadge}>
                <CheckCircle size={12} color="#38CB89" />
                <Text style={styles.syncBadgeText}>Realtime Sync Active</Text>
              </View>
            </View>
          </View>

          {/* MENU OPTIONS */}
          <View style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>My Account</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setSubPage('orders')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <ShoppingBag size={20} color="#141718" />
                <Text style={styles.menuItemText}>Orders History</Text>
              </View>
              <ChevronRight size={18} color="#6C7275" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setSubPage('addresses')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <MapPin size={20} color="#141718" />
                <Text style={styles.menuItemText}>Shipping Addresses</Text>
              </View>
              <ChevronRight size={18} color="#6C7275" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setSubPage('wishlist')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <Heart size={20} color="#141718" />
                <Text style={styles.menuItemText}>Wishlist</Text>
              </View>
              <ChevronRight size={18} color="#6C7275" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setSubPage('security')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <ShieldCheck size={20} color="#141718" />
                <Text style={styles.menuItemText}>Account Security</Text>
              </View>
              <ChevronRight size={18} color="#6C7275" />
            </TouchableOpacity>
          </View>

          {/* SIGN OUT BUTTON */}
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <LogOut size={18} color="#DC2626" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </>
      ) : (
        /* GUEST STATE */
        <View style={styles.guestContainer}>
          <View style={styles.guestIconCircle}>
            <User size={48} color="#6C7275" />
          </View>
          <Text style={styles.guestTitle}>Welcome to 3legant</Text>
          <Text style={styles.guestDesc}>
            Sign in to access your profile, order history, and synchronize your shopping cart in real time with our web platform.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onNavigateToSignIn}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onNavigateToSignUp}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryButtonText}>Create an Account</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* APP VERSION FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>3legant Mobile v1.0.0</Text>
        <Text style={styles.footerSubtext}>Connected to Supabase Realtime</Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECEF',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#141718',
  },
  userEmail: {
    fontSize: 13,
    color: '#6C7275',
    marginTop: 2,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  syncBadgeText: {
    fontSize: 11,
    color: '#38CB89',
    fontWeight: '600',
  },
  menuSection: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E8ECEF',
    paddingHorizontal: 20,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6C7275',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingTop: 16,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#141718',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 14,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
  },
  signOutText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '600',
  },
  guestContainer: {
    alignItems: 'center',
    padding: 32,
    marginTop: 20,
  },
  guestIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#141718',
    marginBottom: 8,
  },
  guestDesc: {
    fontSize: 14,
    color: '#6C7275',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  primaryButton: {
    backgroundColor: '#141718',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBCBCB',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#141718',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
})
