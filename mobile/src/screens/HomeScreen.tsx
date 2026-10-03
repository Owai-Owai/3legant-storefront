import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native'
import { ArrowRight, Truck, ShieldCheck, Headphones, CreditCard } from 'lucide-react-native'
import { PRODUCTS, ROOM_CATEGORIES } from '../data/products'
import { ProductCard } from '../components/ProductCard'
import { Product } from '../types'

const { width } = Dimensions.get('window')

interface HomeScreenProps {
  onSelectProduct: (product: Product) => void
  onNavigateToShop: (category?: string) => void
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectProduct,
  onNavigateToShop,
}) => {
  const newArrivals = PRODUCTS.slice(0, 4)

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HERO BANNER */}
      <View style={styles.hero}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1000&auto=format&fit=crop&q=80',
          }}
          style={styles.heroImage}
        />
        <View style={styles.heroOverlay}>
          <Text style={styles.heroSubtitle}>3legant Living</Text>
          <Text style={styles.heroTitle}>Simply Unique /{"\n"}Simply Better.</Text>
          <Text style={styles.heroDesc}>
            Experience modern Scandinavian craftsmanship crafted for effortless living.
          </Text>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => onNavigateToShop()}
            activeOpacity={0.85}
          >
            <Text style={styles.heroButtonText}>Explore Shop</Text>
            <ArrowRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ROOM CATEGORIES */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Rooms</Text>
          <TouchableOpacity onPress={() => onNavigateToShop()}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {ROOM_CATEGORIES.map((room, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.categoryChip}
              onPress={() => onNavigateToShop(room === 'All Rooms' ? undefined : room)}
              activeOpacity={0.7}
            >
              <Text style={styles.categoryChipText}>{room}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* NEW ARRIVALS */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>New Arrivals</Text>
            <Text style={styles.sectionSubtitle}>More than just furniture</Text>
          </View>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => onNavigateToShop()}
          >
            <Text style={styles.seeAllText}>More Products</Text>
            <ArrowRight size={14} color="#141718" />
          </TouchableOpacity>
        </View>

        <View style={styles.productGrid}>
          {newArrivals.map((product) => (
            <View key={product.id} style={styles.gridItem}>
              <ProductCard
                product={product}
                onPress={() => onSelectProduct(product)}
              />
            </View>
          ))}
        </View>
      </View>

      {/* VALUE PROPOSITIONS */}
      <View style={styles.featuresSection}>
        <View style={styles.featureCard}>
          <Truck size={24} color="#141718" />
          <Text style={styles.featureTitle}>Free Shipping</Text>
          <Text style={styles.featureDesc}>Orders over $200</Text>
        </View>

        <View style={styles.featureCard}>
          <ShieldCheck size={24} color="#141718" />
          <Text style={styles.featureTitle}>Money-back</Text>
          <Text style={styles.featureDesc}>30 days guarantee</Text>
        </View>

        <View style={styles.featureCard}>
          <CreditCard size={24} color="#141718" />
          <Text style={styles.featureTitle}>Secure Payments</Text>
          <Text style={styles.featureDesc}>Secured by Paystack</Text>
        </View>

        <View style={styles.featureCard}>
          <Headphones size={24} color="#141718" />
          <Text style={styles.featureTitle}>24/7 Support</Text>
          <Text style={styles.featureDesc}>Phone & Email assistance</Text>
        </View>
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
  hero: {
    height: 340,
    width: '100%',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(20, 23, 24, 0.45)',
    padding: 24,
    justifyContent: 'flex-end',
  },
  heroSubtitle: {
    color: '#E8ECEF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    marginBottom: 8,
  },
  heroDesc: {
    color: '#E8ECEF',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
    maxWidth: '90%',
  },
  heroButton: {
    backgroundColor: '#141718',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
  },
  heroButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#141718',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6C7275',
    marginTop: 2,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#141718',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F5F7',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#141718',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  gridItem: {
    width: '50%',
  },
  featuresSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginTop: 24,
    gap: 12,
  },
  featureCard: {
    width: (width - 36) / 2,
    backgroundColor: '#F3F5F7',
    padding: 16,
    borderRadius: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#141718',
    marginTop: 10,
  },
  featureDesc: {
    fontSize: 12,
    color: '#6C7275',
    marginTop: 2,
  },
})
