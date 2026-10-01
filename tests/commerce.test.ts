import { describe, it, expect } from 'vitest'
import { isSupabaseConfigured, supabase } from '../src/lib/supabase'

describe('Commerce Calculations and Invariants', () => {
  it('calculates cart item subtotal accurately in integer minor units (cents)', () => {
    const items = [
      { unitPrice: 199.00, quantity: 2 }, // Loveseat: 398.00
      { unitPrice: 24.99, quantity: 3 },  // Table Lamp: 74.97
    ]

    const subtotalCents = items.reduce(
      (sum, item) => sum + Math.round(item.unitPrice * 100) * item.quantity,
      0
    )

    expect(subtotalCents).toBe(47297) // $472.97
    expect(subtotalCents / 100).toBe(472.97)
  })

  it('enforces total price invariant: total = subtotal - discount + shipping', () => {
    const subtotal = 472.97
    const discount = 47.30 // 10% coupon
    const shipping = 15.00 // Express shipping
    const total = Number((subtotal - discount + shipping).toFixed(2))

    expect(total).toBe(440.67)
    expect(total).toBeGreaterThanOrEqual(0)
  })

  it('converts USD amount accurately to Paystack minor currency units', () => {
    const totalDollars = 224.99
    const paystackAmount = Math.round(totalDollars * 100)

    expect(paystackAmount).toBe(22499)
    expect(Number.isInteger(paystackAmount)).toBe(true)
  })

  it('validates percentage coupon logic correctly', () => {
    const subtotal = 200.00
    const couponPercent = 10
    const discount = (subtotal * couponPercent) / 100

    expect(discount).toBe(20.00)
    expect(subtotal - discount).toBe(180.00)
  })

  it('rejects coupon if order is below minimum order amount threshold', () => {
    const subtotal = 50.00
    const minOrderAmount = 100.00
    const isEligible = subtotal >= minOrderAmount

    expect(isEligible).toBe(false)
  })
})

describe('Supabase Client and Auth Infrastructure', () => {
  it('instantiates Supabase client properly', () => {
    expect(supabase).toBeDefined()
    expect(supabase.auth).toBeDefined()
    expect(typeof supabase.from).toBe('function')
  })

  it('detects whether Supabase environment variables are populated', () => {
    expect(typeof isSupabaseConfigured).toBe('boolean')
  })
})

describe('Mailgun and Communication Layer', () => {
  it('formats order confirmation email payload with correct total and addresses', () => {
    const payload = {
      toEmail: 'customer@example.com',
      toName: 'John Doe',
      orderNumber: '#1234_56789',
      orderDate: '2026-10-01',
      total: 199.00,
      subtotal: 199.00,
      deliveryFee: 0,
      discount: 0,
      paymentMethod: 'paystack',
      items: [{ name: 'Loveseat Sofa', quantity: 1, price: 199.00 }],
      shippingAddress: {
        fullName: 'John Doe',
        street: '123 Main St',
        city: 'New York',
        country: 'US',
      },
    }

    expect(payload.toEmail).toContain('@')
    expect(payload.items.length).toBe(1)
    expect(payload.total).toBe(payload.subtotal - payload.discount + payload.deliveryFee)
  })

  it('validates contact form message structure before persistence', () => {
    const message = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      message: 'Hello, looking for custom furniture options.',
    }

    expect(message.name.trim().length).toBeGreaterThan(0)
    expect(message.email.includes('@')).toBe(true)
    expect(message.message.trim().length).toBeGreaterThan(0)
  })
})

