import { useRef, useState } from "react"
import type { FormEvent, InputHTMLAttributes } from "react"
import { Link } from "react-router"
import type { DemoOrderDraft } from "./OrderCompletePage"

type CheckoutItem = {
  id: string
  name: string
  color?: string
  imageSrc: string
  quantity: number
  unitPrice: number
}

type CheckoutPageProps = {
  items: CheckoutItem[]
  deliveryFee: number
  couponApplied: boolean
  onCouponChange: (applied: boolean) => void
  onQuantityChange: (id: string, quantity: number) => void
  onComplete: (order: DemoOrderDraft) => void
}

const heading = "font-['Poppins:Medium'] font-medium"
const medium = "font-['Inter:Medium'] font-medium"
const semibold = "font-['Inter:Semi_Bold'] font-semibold"
const inputClass =
  "h-10 w-full min-w-0 rounded-[6px] border bg-background px-4 text-[16px] leading-[26px] placeholder:text-muted-foreground"
const panelClass =
  "flex min-w-0 flex-col gap-6 rounded-[4px] border border-muted-foreground px-[23px] py-[39px] max-sm:px-[19px] max-sm:py-7"
const price = (amount: number) => `$${amount.toFixed(2)}`
const countries = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Nigeria",
  "Ghana",
  "South Africa",
  "Germany",
  "France",
  "India",
  "Other",
]

function CheckoutIcon({ file }: { file: string }) {
  return (
    <img
      src={`/assets/checkout/${file}`}
      alt=""
      aria-hidden="true"
      className="max-w-none shrink-0"
    />
  )
}

function Field({
  label,
  id,
  softBorder,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string
  id: string
  softBorder?: boolean
}) {
  return (
    <label htmlFor={id} className="flex min-w-0 flex-col gap-3">
      <span className="font-['Inter:Bold'] text-[12px] font-bold uppercase leading-3 text-muted-foreground">
        {label}
      </span>
      <input
        id={id}
        className={`${inputClass} ${
          softBorder ? "border-[#cbcbcb]" : "border-muted-foreground"
        }`}
        {...props}
      />
    </label>
  )
}

function AddressFields({ prefix }: { prefix: string }) {
  return (
    <>
      <Field
        id={`${prefix}-street`}
        label="Street Address *"
        placeholder="Stress Address"
        autoComplete={`${prefix} address-line1`}
        required
      />
      <label
        htmlFor={`${prefix}-country`}
        className="flex min-w-0 flex-col gap-3"
      >
        <span className="font-['Inter:Bold'] text-[12px] font-bold uppercase leading-3 text-muted-foreground">
          Country *
        </span>
        <div className="relative">
          <select
            id={`${prefix}-country`}
            defaultValue=""
            required
            autoComplete={`${prefix} country-name`}
            className={`${inputClass} appearance-none border-muted-foreground pr-12 text-muted-foreground`}
            onChange={(event) =>
              event.currentTarget.classList.remove("text-muted-foreground")
            }
          >
            <option value="" disabled>
              Country
            </option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            <CheckoutIcon file="b2101.svg" />
          </span>
        </div>
      </label>
      <Field
        id={`${prefix}-city`}
        label="Town / City *"
        placeholder="Town / City"
        autoComplete={`${prefix} address-level2`}
        required
      />
      <div className="grid grid-cols-2 gap-6 max-sm:gap-3">
        <Field
          id={`${prefix}-state`}
          label="State"
          placeholder="State"
          autoComplete={`${prefix} address-level1`}
        />
        <Field
          id={`${prefix}-zip`}
          label="Zip Code"
          placeholder="Zip Code"
          autoComplete={`${prefix} postal-code`}
        />
      </div>
    </>
  )
}

export default function CheckoutPage({
  items,
  deliveryFee,
  couponApplied,
  onCouponChange,
  onQuantityChange,
  onComplete,
}: CheckoutPageProps) {
  const [differentBilling, setDifferentBilling] = useState(false)
  const [payment, setPayment] = useState("card")
  const [coupon, setCoupon] = useState("")
  const [couponMessage, setCouponMessage] = useState("")
  const formRef = useRef<HTMLFormElement>(null)
  const submittedRef = useRef(false)
  const subtotalCents = items.reduce(
    (sum, item) => sum + Math.round(item.unitPrice * 100) * item.quantity,
    0,
  )
  const discountCents = couponApplied ? Math.min(2500, subtotalCents) : 0
  const shipping = items.length ? deliveryFee : 0
  const total =
    (subtotalCents - discountCents + Math.round(shipping * 100)) / 100

  const applyCoupon = () => {
    if (coupon.trim().toLowerCase() === "jenkatemw") {
      onCouponChange(true)
      setCouponMessage("Demo coupon applied: $25 off, up to your subtotal.")
    } else {
      setCouponMessage(
        coupon.trim()
          ? "This coupon isn't available. Try the demo code JenkateMW."
          : "Enter a coupon code first.",
      )
    }
  }

  const completeOrder = () => {
    formRef.current
      ?.querySelectorAll<HTMLInputElement>("[data-payment-field]")
      .forEach((input) => {
        input.value = ""
      })
    onComplete({
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        color: item.color,
        imageSrc: item.imageSrc,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      subtotal: subtotalCents / 100,
      deliveryFee: shipping,
      discount: discountCents / 100,
      total,
      paymentMethod:
        payment === "card"
          ? "Credit Card"
          : payment === "paypal"
            ? "PayPal"
            : "Paystack",
    })
  }

  const placeOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (
      !items.length ||
      submittedRef.current ||
      !event.currentTarget.reportValidity()
    )
      return

    submittedRef.current = true

    if (payment === "paystack") {
      const emailInput = formRef.current?.querySelector<HTMLInputElement>("#email-address")
      const customerEmail = emailInput?.value || "customer@example.com"
      const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY

      if (paystackKey && !paystackKey.includes("pk_test_xxx")) {
        const loadScript = () => {
          return new Promise<boolean>((resolve) => {
            if ((window as any).PaystackPop) return resolve(true)
            const script = document.createElement("script")
            script.src = "https://js.paystack.co/v1/inline.js"
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.head.appendChild(script)
          })
        }

        loadScript().then((loaded) => {
          if (!loaded || !(window as any).PaystackPop) {
            completeOrder()
            return
          }

          const paystackCurrency = (import.meta.env.VITE_PAYSTACK_CURRENCY || "NGN").toUpperCase()
          // Nigerian and African Paystack accounts expect their domestic currency (NGN, GHS, ZAR, KES).
          // Convert USD to NGN using configured rate or benchmark 1500 NGN/USD
          const exchangeRate = Number(import.meta.env.VITE_PAYSTACK_EXCHANGE_RATE) || (paystackCurrency === "NGN" ? 1500 : 1)
          const computedAmount = Math.round(total * exchangeRate * 100)
          // Paystack minimum amount in NGN is 100 NGN (10,000 kobo)
          const finalAmount = paystackCurrency === "NGN" ? Math.max(computedAmount, 10000) : computedAmount

          const handler = (window as any).PaystackPop.setup({
            key: paystackKey,
            email: customerEmail,
            amount: finalAmount,
            currency: paystackCurrency,
            ref: "3LEGANT_" + Math.floor(Math.random() * 1000000000 + 1),
            callback: function () {
              completeOrder()
            },
            onClose: function () {
              submittedRef.current = false
            },
          })
          handler.openIframe()
        })
        return
      }
    }

    completeOrder()
  }

  return (
    <section
      className="mx-auto w-full max-w-[1120px] py-20 max-[1199px]:px-6 max-md:py-10"
      aria-labelledby="checkout-title"
      data-node-id="7:8345"
    >
      <div className="flex flex-col items-center gap-10 max-sm:gap-6">
        <h1
          id="checkout-title"
          className={`${heading} text-[54px] leading-[58px] tracking-[-1px] text-black max-sm:text-[40px] max-sm:leading-[44px]`}
        >
          Check Out
        </h1>
        <ol
          aria-label="Checkout progress"
          className="grid w-full max-w-[832px] grid-cols-3 gap-8 max-sm:gap-3"
        >
          {["Shopping cart", "Checkout details", "Order complete"].map(
            (label, index) => (
              <li
                key={label}
                aria-current={index === 1 ? "step" : undefined}
                className={`h-[68px] pb-[26px] ${
                  index === 0
                    ? "border-b-2 border-[#38cb89] text-[#38cb89]"
                    : index === 1
                      ? "border-b-2 border-primary text-[#23262f]"
                      : "text-[#b1b5c3]"
                } max-sm:h-auto max-sm:pb-4`}
              >
                <div className="flex items-center gap-[17px] max-sm:flex-col max-sm:items-start max-sm:gap-2">
                  <span
                    className={`${semibold} flex size-10 shrink-0 items-center justify-center rounded-full text-[16px] leading-6 text-[#fcfcfd] ${
                      index === 0
                        ? "bg-[#38cb89]"
                        : index === 1
                          ? "bg-[#23262f]"
                          : "bg-[#b1b5c3]"
                    }`}
                  >
                    {index === 0 ? (
                      <CheckoutIcon file="8c3b7.svg" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  {index === 0 ? (
                    <Link
                      to="/cart"
                      className={`${semibold} text-[16px] leading-[26px] max-sm:text-[12px] max-sm:leading-5`}
                    >
                      {label}
                    </Link>
                  ) : (
                    <span
                      className={`${semibold} text-[16px] leading-[26px] max-sm:text-[12px] max-sm:leading-5`}
                    >
                      {label}
                    </span>
                  )}
                </div>
              </li>
            ),
          )}
        </ol>
      </div>

      <div className="grid grid-cols-[minmax(0,643px)_minmax(0,413px)] items-start gap-16 py-20 max-lg:grid-cols-1 max-lg:gap-10 max-md:py-10">
        <form
          ref={formRef}
          onSubmit={placeOrder}
          className="flex min-w-0 flex-col gap-6"
        >
          <fieldset className={panelClass} aria-labelledby="contact-title">
            <h2
              id="contact-title"
              className={`${heading} text-[20px] leading-7`}
            >
              Contact Information
            </h2>
            <div className="grid grid-cols-2 gap-6 max-sm:gap-3">
              <Field
                id="first-name"
                label="First name"
                placeholder="First name"
                autoComplete="given-name"
                softBorder
                required
              />
              <Field
                id="last-name"
                label="Last name"
                placeholder="Last name"
                autoComplete="family-name"
                softBorder
                required
              />
            </div>
            <Field
              id="phone-number"
              label="Phone number"
              placeholder="Phone number"
              type="tel"
              autoComplete="tel"
              softBorder
              required
            />
            <Field
              id="email-address"
              label="Email address"
              placeholder="Your Email"
              type="email"
              autoComplete="email"
              softBorder
              required
            />
          </fieldset>

          <fieldset className={panelClass} aria-labelledby="shipping-title">
            <h2
              id="shipping-title"
              className={`${heading} text-[20px] leading-7`}
            >
              Shipping Address
            </h2>
            <AddressFields prefix="shipping" />
            <label className="flex cursor-pointer items-center gap-3 text-[16px] leading-[26px] text-muted-foreground max-sm:items-start max-sm:text-[14px]">
              <input
                type="checkbox"
                checked={differentBilling}
                onChange={(event) => setDifferentBilling(event.target.checked)}
                className="size-6 shrink-0 cursor-pointer accent-primary"
              />
              Use a different billing address (optional)
            </label>
          </fieldset>

          {differentBilling && (
            <fieldset className={panelClass} aria-labelledby="billing-title">
              <h2
                id="billing-title"
                className={`${heading} text-[20px] leading-7`}
              >
                Billing Address
              </h2>
              <AddressFields prefix="billing" />
            </fieldset>
          )}

          <fieldset
            className={panelClass}
            aria-labelledby="payment-title"
            aria-describedby="payment-note"
          >
            <h2
              id="payment-title"
              className={`${heading} text-[20px] leading-7`}
            >
              Payment method
            </h2>
            <div className="flex flex-col gap-6 border-b border-muted-foreground pb-[31px]">
              {[
                { id: "card", label: "Pay by Card Credit" },
                { id: "paypal", label: "Paypal" },
                { id: "paystack", label: "Paystack" },
              ].map((method) => (
                <label
                  key={method.id}
                  className={`flex h-[52px] cursor-pointer items-center gap-3 rounded-[4px] border px-4 ${
                    payment === method.id
                      ? "border-primary bg-card"
                      : "border-muted-foreground bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="checkout-payment"
                    value={method.id}
                    checked={payment === method.id}
                    onChange={() => setPayment(method.id)}
                    className="size-[18px] shrink-0 cursor-pointer accent-primary"
                  />
                  <span className="min-w-0 flex-1 text-[16px] leading-[26px] max-sm:text-[14px] max-sm:leading-5">
                    {method.label}
                  </span>
                  {method.id === "card" && <CheckoutIcon file="49a52.svg" />}
                </label>
              ))}
            </div>
            <p id="payment-note" className="sr-only">
              This is a local demo. Use test card details only. No payment data
              is sent or stored.
            </p>
            {payment === "card" ? (
              <>
                <Field
                  id="card-number"
                  label="Card number"
                  placeholder="1234 1234 1234"
                  inputMode="numeric"
                  autoComplete="off"
                  required
                  pattern="[0-9 ]{13,23}"
                  maxLength={23}
                  title="Enter a test card number containing 13 to 19 digits."
                  data-payment-field
                  onInput={(event) => {
                    const input = event.currentTarget
                    const digits = input.value.replace(/\s/g, "")
                    input.setCustomValidity(
                      /^\d{13,19}$/.test(digits)
                        ? ""
                        : "Enter a test card number containing 13 to 19 digits.",
                    )
                  }}
                />
                <div className="grid grid-cols-2 gap-6 max-sm:gap-3">
                  <Field
                    id="card-expiry"
                    label="Expiration date"
                    placeholder="MM/YY"
                    inputMode="numeric"
                    autoComplete="off"
                    required
                    maxLength={5}
                    pattern="(0[1-9]|1[0-2])/[0-9]{2}"
                    title="Enter a valid future expiration date as MM/YY."
                    data-payment-field
                    onInput={(event) => {
                      const input = event.currentTarget
                      const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(
                        input.value,
                      )
                      const now = new Date()
                      const valid =
                        match &&
                        new Date(2000 + Number(match[2]), Number(match[1]), 1) >
                          new Date(now.getFullYear(), now.getMonth(), 1)
                      input.setCustomValidity(
                        valid
                          ? ""
                          : "Enter a valid future expiration date as MM/YY.",
                      )
                    }}
                  />
                  <Field
                    id="card-cvc"
                    label="CVC"
                    placeholder="CVC code"
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    required
                    pattern="[0-9]{3,4}"
                    maxLength={4}
                    title="Enter a 3 or 4 digit test security code."
                    data-payment-field
                  />
                </div>
              </>
            ) : payment === "paystack" ? (
              <p className="text-[16px] leading-[26px] text-muted-foreground">
                You will be redirected to the secure Paystack checkout modal to complete your payment with test card or bank transfer.
              </p>
            ) : (
              <p className="text-[16px] leading-[26px] text-muted-foreground">
                PayPal is a demo selection. No external payment connection will be made.
              </p>
            )}
          </fieldset>
          <button
            type="submit"
            disabled={!items.length}
            className={`${medium} flex h-[50px] items-center justify-center rounded-lg bg-primary px-10 text-[16px] leading-[26px] text-white transition-colors hover:bg-[#343839] disabled:cursor-not-allowed disabled:opacity-40`}
          >
            Place Order
          </button>
        </form>

        <aside
          aria-labelledby="order-summary-title"
          className="flex min-w-0 flex-col gap-4 rounded-[6px] border border-muted-foreground px-[23px] py-[15px] max-lg:max-w-[643px] max-sm:px-[19px]"
        >
          <h2
            id="order-summary-title"
            className={`${heading} text-[28px] leading-[34px] tracking-[-0.6px] text-[#121212]`}
          >
            Order summary
          </h2>
          <div className="flex flex-col gap-6">
            {items.length ? (
              items.map((item) => (
                <article
                  key={item.id}
                  className="flex h-[144px] min-w-0 gap-4 border-b border-border py-[23px] max-sm:gap-3"
                >
                  <img
                    src={item.imageSrc}
                    alt={item.name}
                    className="h-24 w-20 shrink-0 bg-card object-cover mix-blend-multiply max-sm:h-20 max-sm:w-14"
                  />
                  <div className="flex min-w-0 flex-1 justify-between gap-2">
                    <div className="flex min-w-0 flex-col gap-2">
                      <h3 className={`${semibold} text-[14px] leading-[22px]`}>
                        {item.name}
                      </h3>
                      {item.color && (
                        <p className="text-[12px] leading-5 text-muted-foreground">
                          Color: {item.color}
                        </p>
                      )}
                      <div className="flex h-8 w-20 shrink-0 items-center justify-between rounded-[4px] border border-muted-foreground px-2">
                        <button
                          type="button"
                          onClick={() =>
                            onQuantityChange(
                              item.id,
                              Math.max(1, item.quantity - 1),
                            )
                          }
                          disabled={item.quantity <= 1}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="relative disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <CheckoutIcon file="2387e.svg" />
                        </button>
                        <span
                          className={`${semibold} text-[12px] leading-5 tabular-nums`}
                          aria-live="polite"
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onQuantityChange(item.id, item.quantity + 1)
                          }
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <CheckoutIcon file="04804.svg" />
                        </button>
                      </div>
                    </div>
                    <p
                      className={`${semibold} shrink-0 text-[14px] leading-[22px] tabular-nums max-sm:text-[12px]`}
                    >
                      {price(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                </article>
              ))
            ) : (
              <div className="py-6">
                <p className="mb-4 text-[16px] leading-[26px]">
                  Your cart is empty.
                </p>
                <Link to="/shop" className={`${medium} underline`}>
                  Continue shopping
                </Link>
              </div>
            )}
            <div className="flex min-w-0 gap-3">
              <input
                aria-label="Checkout coupon code"
                value={coupon}
                onChange={(event) => {
                  setCoupon(event.target.value)
                  setCouponMessage("")
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    applyCoupon()
                  }
                }}
                placeholder="Input"
                className="h-[52px] min-w-0 flex-1 rounded-[6px] border border-[#cbcbcb] bg-white px-4 text-[16px] leading-[26px] placeholder:text-muted-foreground"
                aria-describedby={
                  couponMessage ? "checkout-coupon-status" : undefined
                }
              />
              <button
                type="button"
                onClick={applyCoupon}
                className={`${medium} rounded-lg bg-primary px-[26px] py-3 text-[16px] leading-7 text-white max-sm:px-4`}
              >
                Apply
              </button>
            </div>
            {couponMessage && (
              <p
                id="checkout-coupon-status"
                role="status"
                className="text-[14px] leading-[22px] text-muted-foreground"
              >
                {couponMessage}
              </p>
            )}
          </div>
          <dl className="text-[16px] leading-[26px]" aria-live="polite">
            <div className="flex min-h-[52px] items-center justify-between gap-2 border-b border-border max-sm:flex-wrap max-sm:py-3">
              <dt className="flex items-center gap-2">
                <CheckoutIcon file="86632.svg" />
                JenkateMW
              </dt>
              <dd>
                <button
                  type="button"
                  onClick={() => {
                    onCouponChange(!couponApplied)
                    setCouponMessage(
                      couponApplied
                        ? "Demo coupon removed."
                        : "Demo coupon applied.",
                    )
                  }}
                  className={`${semibold} text-[#38cb89]`}
                >
                  {couponApplied
                    ? `-${price(discountCents / 100)} [Remove]`
                    : "-$25.00 [Apply]"}
                </button>
              </dd>
            </div>
            <div className="flex h-[52px] items-center justify-between gap-4 border-b border-border">
              <dt>Shipping</dt>
              <dd className={`${semibold} tabular-nums`}>
                {shipping ? price(shipping) : "Free"}
              </dd>
            </div>
            <div className="flex h-[52px] items-center justify-between gap-4 border-b border-border">
              <dt>Subtotal</dt>
              <dd className={`${semibold} tabular-nums`}>
                {price(subtotalCents / 100)}
              </dd>
            </div>
            <div
              className={`${heading} flex h-[52px] items-center justify-between gap-4 text-[20px] leading-7`}
            >
              <dt>Total</dt>
              <dd className="tabular-nums">{price(total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  )
}
