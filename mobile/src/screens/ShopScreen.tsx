import React, { useState, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native'
import { Search, SlidersHorizontal, X } from 'lucide-react-native'
import { PRODUCTS, ROOM_CATEGORIES } from '../data/products'
import { ProductCard } from '../components/ProductCard'
import { Product } from '../types'

interface ShopScreenProps {
  initialCategory?: string
  onSelectProduct: (product: Product) => void
}

export const ShopScreen: React.FC<ShopScreenProps> = ({
  initialCategory = 'All Rooms',
  onSelectProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high'>('default')

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchCat =
        selectedCategory === 'All Rooms' ||
        (p.room && p.room.toLowerCase() === selectedCategory.toLowerCase())

      const matchQuery =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.color?.toLowerCase().includes(searchQuery.toLowerCase())

      return matchCat && matchQuery
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price
      if (sortBy === 'price-high') return b.price - a.price
      return 0
    })
  }, [selectedCategory, searchQuery, sortBy])

  return (
    <View style={styles.container}>
      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color="#6C7275" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search furniture, lamps, decor..."
            placeholderTextColor="#6C7275"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color="#6C7275" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* CATEGORY CHIPS */}
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {ROOM_CATEGORIES.map((category) => {
            const isActive = selectedCategory === category
            return (
              <TouchableOpacity
                key={category}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setSelectedCategory(category)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {category}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {/* FILTER & SORT BAR */}
      <View style={styles.filterBar}>
        <Text style={styles.resultsCount}>
          Showing {filteredProducts.length} items
        </Text>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => {
            setSortBy((current) =>
              current === 'default'
                ? 'price-low'
                : current === 'price-low'
                ? 'price-high'
                : 'default'
            )
          }}
        >
          <SlidersHorizontal size={14} color="#141718" />
          <Text style={styles.sortButtonText}>
            {sortBy === 'price-low'
              ? 'Price: Low'
              : sortBy === 'price-high'
              ? 'Price: High'
              : 'Default'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* PRODUCT GRID */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
      >
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptyDesc}>
              Try adjusting your search terms or selecting a different room category.
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredProducts.map((product) => (
              <View key={product.id} style={styles.gridItem}>
                <ProductCard
                  product={product}
                  onPress={() => onSelectProduct(product)}
                />
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F5F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#141718',
  },
  categoryContainer: {
    paddingVertical: 8,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#F3F5F7',
  },
  chipActive: {
    backgroundColor: '#141718',
  },
  chipText: {
    fontSize: 13,
    color: '#6C7275',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8ECEF',
  },
  resultsCount: {
    fontSize: 12,
    color: '#6C7275',
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#F3F5F7',
    borderRadius: 6,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#141718',
  },
  gridContainer: {
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#141718',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#6C7275',
    textAlign: 'center',
    lineHeight: 18,
  },
})
