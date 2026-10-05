import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Lock,
} from 'lucide-react-native'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { safeStorage } from '../lib/storage'
import {
  initializePaystackCheckout,
  verifyPaystackPayment,
  PAYSTACK_CALLBACK_URL,
} from '../lib/paystack'

interface CheckoutScreenProps {
  onBack: () => void
  onOrderComplete: () => void
}

const ADDRESS_STORAGE_KEY = '@3legant_saved_addresses'

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  onBack,
  onOrderComplete,
}) => {
  const { cart, subtotal, clearCart } = useCart()
  const { user } = useAuth()

  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name || user?.user_metadata?.display_name || ''
  )
  const [email, setEmail] = useState(user?.email || '')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [stateName, setStateName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'card'>('paystack')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [orderCode, setOrderCode] = useState('')

  const shippingCost = subtotal > 200 || subtotal === 0 ? 0 : 15
  const total = subtotal + shippingCost

  // Pre-fill address from saved user addresses if available
  useEffect(() => {
    safeStorage.getItem(ADDRESS_STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          const shipping = parsed.shipping || parsed.billing
          if (shipping) {
            if (shipping.fullName && !fullName) setFullName(shipping.fullName)
            if (shipping.street) setStreet(shipping.street)
            if (shipping.city) setCity(shipping.city)
            if (shipping.state) setStateName(shipping.state)
          }
        } catch {
          // ignore
        }
      }
    })
  }, [])

  const handlePlaceOrder = async () => {
    if (!fullName.trim()) {
      Alert.alert('Missing Name', 'Please provide your full name.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Missing Email', 'Please provide a valid email address for your order receipt.')
      return
    }
    if (!street.trim() || !city.trim()) {
      Alert.alert('Missing Address', 'Please provide your street address and city for shipping.')
      return
    }

    setIsSubmitting(true)

    // Generate unique order reference
    const reference = `3LEG_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`

    // Generate dynamic return deep link for this device (works seamlessly in Expo Go and standalone)
    const mobileReturnUrl = Linking.createURL('checkout-complete')
    const callbackUrl = `${PAYSTACK_CALLBACK_URL}?app_redirect=${encodeURIComponent(mobileReturnUrl)}`

    try {
      console.log('[Checkout] Initializing Paystack transaction with reference:', reference)
      console.log('[Checkout] Using dynamic return URL:', mobileReturnUrl)

      const initResult = await initializePaystackCheckout({
        email: email.trim(),
        amountUSD: total,
        reference,
        fullName: fullName.trim(),
        callbackUrl,
      })

      if (!initResult.success || !initResult.authorizationUrl) {
        Alert.alert('Payment Error', initResult.error || 'Failed to initialize Paystack gateway.')
        setIsSubmitting(false)
        return
      }

      console.log('[Checkout] Opening Paystack authorization URL in in-app browser session...')
      const browserResult = await WebBrowser.openAuthSessionAsync(
        initResult.authorizationUrl,
        mobileReturnUrl
      )

      console.log('[Checkout] In-app browser returned with result:', browserResult.type)

      // Verify payment directly with Paystack API
      console.log('[Checkout] Verifying transaction on Paystack:', reference)
      const verifyResult = await verifyPaystackPayment(reference)

      if (verifyResult.verified && verifyResult.status === 'success') {
        console.log('[Checkout] Payment verified successfully!')

        // 1. Create order record in Supabase
        if (user) {
          try {
            const { data: orderData, error: orderErr } = await (supabase.from('orders') as any)
              .insert({
                order_number: reference,
                profile_id: user.id,
                status: 'processing',
                payment_status: 'paid',
                fulfillment_status: 'unfulfilled',
                currency: 'USD',
                subtotal_amount: Math.round(subtotal * 100),
                shipping_amount: Math.round(shippingCost * 100),
                total_amount: Math.round(total * 100),
                shipping_address: {
                  fullName: fullName.trim(),
                  street: street.trim(),
                  city: city.trim(),
                  state: stateName.trim(),
                },
                billing_address: {
                  fullName: fullName.trim(),
                  street: street.trim(),
                  city: city.trim(),
                  state: stateName.trim(),
                },
                contact_email: email.trim(),
                payment_method: 'paystack',
              })
              .select('id')
              .single()

            if (!orderErr && orderData?.id) {
              const orderItems = cart.map((item) => ({
                order_id: orderData.id,
                sku: item.productId,
                name: item.name,
                color_name: item.color || 'Standard',
                unit_amount: Math.round(item.price * 100),
                quantity: item.quantity,
                total_amount: Math.round(item.price * item.quantity * 100),
                image_url: item.image,
              }))
              await (supabase.from('order_items') as any).insert(orderItems)
            }
          } catch (dbErr) {
            console.warn('[Checkout] Note: Could not insert order into Supabase:', dbErr)
          }
        }

        // 2. Clear cart across both mobile and web in real-time
        await clearCart()

        setOrderCode(reference)
        setIsSuccess(true)
      } else {
        if (browserResult.type === 'cancel' || browserResult.type === 'dismiss') {
          Alert.alert(
            'Payment Incomplete',
            'You closed the Paystack checkout before completing payment. Your cart items are still saved.'
          )
        } else {
          Alert.alert(
            'Payment Verification Failed',
            verifyResult.error || 'The payment was not marked as successful by Paystack. Please try again.'
          )
        }
      }
    } catch (err: any) {
      console.error('[Checkout] Error during payment flow:', err)
      Alert.alert('Checkout Error', err?.message || 'An unexpected error occurred during checkout.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIconCircle}>
          <CheckCircle2 size={54} color="#38CB89" />
        </View>
        <Text style={styles.successTitle}>Thank you!</Text>
        <Text style={styles.successSubtitle}>Your order has been placed successfully</Text>
        <Text style={styles.orderCode}>{orderCode}</Text>
        <Text style={styles.successDesc}>
          Payment of <Text style={{ fontWeight: '700', color: '#141718' }}>${total.toFixed(2)}</Text> verified via Paystack. Your shopping cart has been cleared on all devices and a confirmation has been sent to{' '}
          <Text style={{ fontWeight: '700', color: '#141718' }}>{email || 'your email'}</Text>.
        </Text>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={onOrderComplete}
          activeOpacity={0.85}
        >
          <Text style={styles.continueButtonText}>Return to Shop</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={22} color="#141718" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Checkout</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* CONTACT INFORMATION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#A0A0A0"
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#A0A0A0"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* SHIPPING ADDRESS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Street Address"
            placeholderTextColor="#A0A0A0"
            value={street}
            onChangeText={setStreet}
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              placeholder="City"
              placeholderTextColor="#A0A0A0"
              value={city}
              onChangeText={setCity}
            />
            <TextInput
              style={[styles.input, { flex: 1, marginLeft: 8 }]}
              placeholder="State / Province"
              placeholderTextColor="#A0A0A0"
              value={stateName}
              onChangeText={setStateName}
            />
          </View>
        </View>

        {/* PAYMENT METHOD */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'paystack' && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod('paystack')}
            activeOpacity={0.8}
          >
            <View style={styles.paymentOptionLeft}>
              <View style={styles.paystackBadge}>
                <CreditCard size={18} color="#141718" />
              </View>
              <View>
                <Text style={styles.paymentName}>Paystack Secure Checkout</Text>
                <Text style={styles.paymentSub}>Cards, Bank Transfer, USSD</Text>
              </View>
            </View>
            <View
              style={[
                styles.radio,
                paymentMethod === 'paystack' && styles.radioActive,
              ]}
            />
          </TouchableOpacity>
        </View>

        {/* ORDER REVIEW */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary ({cart.length} item{cart.length > 1 ? 's' : ''})</Text>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryVal}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryVal}>
                {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total to Pay</Text>
              <Text style={styles.totalVal}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* PAYSTACK NOTICE */}
        <View style={styles.securityNotice}>
          <Lock size={15} color="#15803D" />
          <Text style={styles.securityNoticeText}>
            You will be redirected to the secure Paystack checkout modal to complete payment.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handlePlaceOrder}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Pay with Paystack (${total.toFixed(2)})</Text>
          )}
        </TouchableOpacity>

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
  topNav: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8ECEF',
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#141718',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#141718',
    marginBottom: 12,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E8ECEF',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#141718',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8ECEF',
    borderRadius: 10,
  },
  paymentOptionActive: {
    borderColor: '#141718',
    backgroundColor: '#F9FAFB',
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paystackBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#141718',
  },
  paymentSub: {
    fontSize: 12,
    color: '#6C7275',
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E8ECEF',
  },
  radioActive: {
    borderColor: '#141718',
    borderWidth: 6,
  },
  summaryBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6C7275',
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#141718',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8ECEF',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#141718',
  },
  totalVal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#141718',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  securityNoticeText: {
    fontSize: 12,
    color: '#166534',
    flex: 1,
    lineHeight: 16,
  },
  submitButton: {
    height: 52,
    backgroundColor: '#141718',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#141718',
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#38CB89',
    fontWeight: '600',
    marginBottom: 16,
  },
  orderCode: {
    fontSize: 15,
    fontWeight: '700',
    color: '#141718',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  successDesc: {
    fontSize: 14,
    color: '#6C7275',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  continueButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#141718',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
})
