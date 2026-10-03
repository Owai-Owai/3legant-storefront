import React from 'react'
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

interface ProfileScreenProps {
  onNavigateToSignIn: () => void
  onNavigateToSignUp: () => void
  onNavigateToShop: () => void
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigateToSignIn,
  onNavigateToSignUp,
  onNavigateToShop,
}) => {
  const { user, signOut } = useAuth()
  const { cartCount } = useCart()

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

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <ShoppingBag size={20} color="#141718" />
                <Text style={styles.menuItemText}>Orders History</Text>
              </View>
              <ChevronRight size={18} color="#6C7275" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <MapPin size={20} color="#141718" />
                <Text style={styles.menuItemText}>Shipping Addresses</Text>
              </View>
              <ChevronRight size={18} color="#6C7275" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <Heart size={20} color="#141718" />
                <Text style={styles.menuItemText}>Wishlist</Text>
              </View>
              <ChevronRight size={18} color="#6C7275" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
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
    backgroundColor: '#FFFFFF',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8ECEF',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
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
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 6,
    gap: 4,
  },
  syncBadgeText: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '600',
  },
  menuSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#6C7275',
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8ECEF',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#141718',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 28,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    gap: 8,
  },
  signOutText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '600',
  },
  guestContainer: {
    alignItems: 'center',
    padding: 32,
    paddingTop: 48,
  },
  guestIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
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
    lineHeight: 20,
    marginBottom: 28,
  },
  primaryButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#141718',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#141718',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#141718',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 36,
  },
  footerText: {
    fontSize: 12,
    color: '#A0A0A0',
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 11,
    color: '#38CB89',
    marginTop: 2,
    fontWeight: '500',
  },
})
