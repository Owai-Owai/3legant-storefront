import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native'
import {
  ArrowLeft,
  Package,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react-native'
import { useAuth } from '../../context/AuthContext'
import { supabase, resolveProductImage } from '../../lib/supabase'

interface OrdersHistoryViewProps {
  onBack: () => void
  onNavigateToShop: () => void
}

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  image?: string
}

interface OrderRecord {
  id: string
  orderNumber: string
  date: string
  status: 'Delivered' | 'Processing' | 'Shipped' | 'Pending'
  totalAmount: number
  items: OrderItem[]
  shippingCity?: string
}

const SAMPLE_ORDERS: OrderRecord[] = [
  {
    id: 'ord-1',
    orderNumber: '#3456_768',
    date: 'October 17, 2023',
    status: 'Delivered',
    totalAmount: 1234.0,
    shippingCity: 'New York, USA',
    items: [
      {
        id: 'item-1',
        name: 'Black Tray Table',
        quantity: 2,
        price: 19.99,
        image: '/assets/shop/4925a.png',
      },
      {
        id: 'item-2',
        name: 'Loveseat Sofa Beige',
        quantity: 1,
        price: 345.0,
        image: '/assets/shop/76e8d.png',
      },
    ],
  },
  {
    id: 'ord-2',
    orderNumber: '#3456_980',
    date: 'October 11, 2023',
    status: 'Delivered',
    totalAmount: 345.0,
    shippingCity: 'Austin, USA',
    items: [
      {
        id: 'item-3',
        name: 'Bamboo Basket',
        quantity: 3,
        price: 8.8,
        image: '/assets/shop/c350a.png',
      },
    ],
  },
  {
    id: 'ord-3',
    orderNumber: '#3456_120',
    date: 'August 24, 2023',
    status: 'Delivered',
    totalAmount: 2345.0,
    shippingCity: 'London, UK',
    items: [
      {
        id: 'item-4',
        name: 'Round Coffee Table',
        quantity: 1,
        price: 199.0,
        image: '/assets/shop/f2503.png',
      },
    ],
  },
  {
    id: 'ord-4',
    orderNumber: '#3456_030',
    date: 'August 12, 2023',
    status: 'Delivered',
    totalAmount: 845.0,
    shippingCity: 'San Francisco, USA',
    items: [
      {
        id: 'item-5',
        name: 'Toasted Ceramic Lamp',
        quantity: 2,
        price: 39.0,
        image: '/assets/shop/fb624.png',
      },
    ],
  },
]

export const OrdersHistoryView: React.FC<OrdersHistoryViewProps> = ({
  onBack,
  onNavigateToShop,
}) => {
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderRecord[]>(SAMPLE_ORDERS)
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchOrders = async () => {
      if (!user) return
      setLoading(true)

      try {
        const { data, error } = await (supabase.from('orders') as any)
          .select('*, order_items(*)')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false })

        if (!error && data && data.length > 0 && isMounted) {
          const mapped: OrderRecord[] = data.map((o: any) => {
            const rawStatus = (o.status || o.fulfillment_status || 'Pending').toLowerCase()
            let formattedStatus: OrderRecord['status'] = 'Pending'
            if (rawStatus.includes('deliver') || rawStatus.includes('complete')) {
              formattedStatus = 'Delivered'
            } else if (rawStatus.includes('ship')) {
              formattedStatus = 'Shipped'
            } else if (rawStatus.includes('process')) {
              formattedStatus = 'Processing'
            }

            const rawItems = o.order_items || []
            const items: OrderItem[] = rawItems.map((item: any) => ({
              id: item.id,
              name: item.name || 'Storefront Item',
              quantity: Number(item.quantity) || 1,
              price: Number(item.total_amount ? item.total_amount / 100 : item.unit_amount ? item.unit_amount / 100 : 0),
              image: item.image_url,
            }))

            return {
              id: o.id,
              orderNumber: o.order_number || `#${o.id.slice(0, 8)}`,
              date: new Date(o.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
              status: formattedStatus,
              totalAmount: Number(o.total_amount ? o.total_amount / 100 : 0),
              shippingCity: o.shipping_address?.city || 'Default Address',
              items: items.length > 0 ? items : SAMPLE_ORDERS[0].items,
            }
          })
          setOrders(mapped)
        }
      } catch (err) {
        console.warn('[OrdersHistoryView] Error fetching orders:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchOrders()

    return () => {
      isMounted = false
    }
  }, [user])

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const renderStatusBadge = (status: OrderRecord['status']) => {
    switch (status) {
      case 'Delivered':
        return (
          <View style={[styles.statusBadge, styles.statusDelivered]}>
            <CheckCircle2 size={12} color="#15803D" />
            <Text style={[styles.statusText, styles.statusTextDelivered]}>Delivered</Text>
          </View>
        )
      case 'Processing':
      case 'Shipped':
        return (
          <View style={[styles.statusBadge, styles.statusProcessing]}>
            <Clock size={12} color="#B45309" />
            <Text style={[styles.statusText, styles.statusTextProcessing]}>{status}</Text>
          </View>
        )
      default:
        return (
          <View style={[styles.statusBadge, styles.statusPending]}>
            <Clock size={12} color="#4B5563" />
            <Text style={[styles.statusText, styles.statusTextPending]}>Pending</Text>
          </View>
        )
    }
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#141718" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orders History</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#141718" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Package size={48} color="#6C7275" />
          </View>
          <Text style={styles.emptyTitle}>No Orders Placed Yet</Text>
          <Text style={styles.emptySubtitle}>
            When you purchase items from 3legant, their tracking details and order receipts will appear here.
          </Text>
          <TouchableOpacity style={styles.shopNowButton} onPress={onNavigateToShop} activeOpacity={0.85}>
            <Text style={styles.shopNowButtonText}>Explore Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionSubtitle}>
            Showing {orders.length} order{orders.length > 1 ? 's' : ''}
          </Text>

          {orders.map((order) => {
            const isExpanded = expandedId === order.id
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)

            return (
              <View key={order.id} style={styles.orderCard}>
                {/* CARD SUMMARY HEADER */}
                <TouchableOpacity
                  style={styles.cardHeader}
                  onPress={() => toggleExpand(order.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.headerRow}>
                    <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                    {renderStatusBadge(order.status)}
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Calendar size={13} color="#6C7275" />
                      <Text style={styles.metaText}>{order.date}</Text>
                    </View>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.metaText}>{itemCount} item{itemCount > 1 ? 's' : ''}</Text>
                  </View>

                  <View style={styles.footerRow}>
                    <Text style={styles.totalPrice}>${order.totalAmount.toFixed(2)}</Text>
                    <View style={styles.expandTrigger}>
                      <Text style={styles.expandText}>{isExpanded ? 'Hide Details' : 'View Details'}</Text>
                      {isExpanded ? (
                        <ChevronUp size={16} color="#141718" />
                      ) : (
                        <ChevronDown size={16} color="#141718" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                {/* EXPANDED DETAILS */}
                {isExpanded && (
                  <View style={styles.expandedSection}>
                    <View style={styles.divider} />
                    <Text style={styles.itemsTitle}>Items Ordered</Text>

                    {order.items.map((item, idx) => (
                      <View key={item.id || idx} style={styles.itemRow}>
                        <Image
                          source={{ uri: resolveProductImage(item.image) }}
                          style={styles.itemThumb}
                          resizeMode="contain"
                        />
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemName} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Text style={styles.itemMeta}>Qty: {item.quantity}</Text>
                        </View>
                        <Text style={styles.itemPrice}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </Text>
                      </View>
                    ))}

                    {order.shippingCity && (
                      <View style={styles.shippingSummary}>
                        <Text style={styles.shippingSummaryLabel}>Delivered to:</Text>
                        <Text style={styles.shippingSummaryValue}>{order.shippingCity}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )
          })}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECEF',
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: '#141718',
  },
  headerPlaceholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6C7275',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6C7275',
    marginBottom: 16,
    fontWeight: '500',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8ECEF',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#141718',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDelivered: {
    backgroundColor: '#DCFCE7',
  },
  statusProcessing: {
    backgroundColor: '#FEF3C7',
  },
  statusPending: {
    backgroundColor: '#F3F4F6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextDelivered: {
    color: '#15803D',
  },
  statusTextProcessing: {
    color: '#B45309',
  },
  statusTextPending: {
    color: '#4B5563',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#6C7275',
  },
  metaDot: {
    color: '#9CA3AF',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#141718',
  },
  expandTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#141718',
  },
  expandedSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  itemsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C7275',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#141718',
  },
  itemMeta: {
    fontSize: 12,
    color: '#6C7275',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#141718',
  },
  shippingSummary: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shippingSummaryLabel: {
    fontSize: 12,
    color: '#6C7275',
  },
  shippingSummaryValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#141718',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#141718',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6C7275',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  shopNowButton: {
    backgroundColor: '#141718',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
  },
  shopNowButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
})
