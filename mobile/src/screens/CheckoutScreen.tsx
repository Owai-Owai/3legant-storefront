import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { ArrowLeft, CheckCircle2, ShieldCheck, CreditCard } from 'lucide-react-native'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

interface CheckoutScreenProps {
  onBack: () => void
  onOrderComplete: () => void
}

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

  const handlePlaceOrder = async () => {
    setIsSubmitting(true)

    // Simulate order placement
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const generatedCode = `#3LEG-${Math.floor(100000 + Math.random() * 900000)}`
    setOrderCode(generatedCode)

    // Clear cart both locally and in remote Supabase database!
    await clearCart()

    setIsSubmitting(false)
    setIsSuccess(true)
  }

  if (isSuccess) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIconCircle}>
          <CheckCircle2 size={54} color="#38CB89" />
        </View>
        <Text style={styles.successTitle}>Thank you!</Text>
        <Text style={styles.successSubtitle}>Your order has been received</Text>
        <Text style={styles.orderCode}>{orderCode}</Text>
        <Text style={styles.successDesc}>
          Your shopping cart has been cleared on all your devices. A confirmation email has been sent to{' '}
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
              <CreditCard size={20} color="#141718" />
              <View>
                <Text style={styles.paymentName}>Paystack Sandbox</Text>
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
          <Text style={styles.sectionTitle}>Order Summary ({cart.length} items)</Text>
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

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handlePlaceOrder}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Place Order (${total.toFixed(2)})</Text>
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
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#141718',
    backgroundColor: '#FAFAFA',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E8ECEF',
    borderRadius: 8,
    padding: 14,
    backgroundColor: '#FAFAFA',
  },
  paymentOptionActive: {
    borderColor: '#141718',
    backgroundColor: '#F3F5F7',
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#141718',
  },
  paymentSub: {
    fontSize: 12,
    color: '#6C7275',
    marginTop: 2,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#6C7275',
  },
  radioActive: {
    borderColor: '#141718',
    backgroundColor: '#141718',
  },
  summaryBox: {
    backgroundColor: '#F3F5F7',
    borderRadius: 8,
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
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#141718',
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#141718',
  },
  submitButton: {
    height: 52,
    backgroundColor: '#141718',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  successIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F0FDF4',
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
    color: '#6C7275',
    marginBottom: 12,
  },
  orderCode: {
    fontSize: 18,
    fontWeight: '800',
    color: '#141718',
    letterSpacing: 1,
    backgroundColor: '#F3F5F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 16,
  },
  successDesc: {
    fontSize: 14,
    color: '#6C7275',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  continueButton: {
    backgroundColor: '#141718',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
})
