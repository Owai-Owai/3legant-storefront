import { useState } from "react"
import type { FormEvent } from "react"
import { Link } from "react-router"

type CartItem = {
  id: string
  name: string
  color?: string
  imageSrc: string
  unitPrice: number
  quantity: number
}

type CartPageProps = {
  items: CartItem[]
  onQuantityChange: (id: string, quantity: number) => void
  onRemove: (id: string) => void
  onCheckout: (deliveryFee: number) => void
  selectedDeliveryFee: number
  onDeliveryChange: (deliveryFee: number) => void
}

const heading = "font-['Poppins:Medium'] font-medium"
const medium = "font-['Inter:Medium'] font-medium"
const semibold = "font-['Inter:Semi_Bold'] font-semibold"
const price = (amount: number) => `$${amount.toFixed(2)}`
const deliveryOptions = [
  { label: "Standard delivery", fee: 0 },
  { label: "Express delivery", fee: 15 },
  { label: "Store pickup", fee: 21 },
]

export default function CartPage({
  items,
  onQuantityChange,
  onRemove,
  onCheckout,
  selectedDeliveryFee,
  onDeliveryChange,
}: CartPageProps) {
  const [coupon, setCoupon] = useState("")
  const [couponMessage, setCouponMessage] = useState("")
  const deliveryOption = Math.max(
    0,
    deliveryOptions.findIndex((option) => option.fee === selectedDeliveryFee),
  )
  const subtotal =
    items.reduce(
      (sum, item) => sum + Math.round(item.unitPrice * 100) * item.quantity,
      0,
    ) / 100
  const deliveryFee = items.length ? deliveryOptions[deliveryOption].fee : 0
  const total = (Math.round(subtotal * 100) + deliveryFee * 100) / 100
  const applyCoupon = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCouponMessage(
      coupon.trim()
        ? "Coupon validation is not available in this storefront preview. No discount has been applied."
        : "Enter a coupon code to apply.",
    )
  }

  return (
    <section
      aria-labelledby="cart-title"
      className="mx-auto w-full max-w-[1120px] py-20 max-[1199px]:px-6 max-md:py-10"
      data-node-id="5:7218"
    >
      <div className="flex flex-col items-center gap-10 max-sm:gap-6">
        <h1
          id="cart-title"
          className={`${heading} text-[54px] leading-[58px] tracking-[-1px] text-black max-sm:text-[40px] max-sm:leading-[44px]`}
        >
          Cart
        </h1>
        <ol
          aria-label="Checkout progress"
          className="grid w-full max-w-[832px] grid-cols-3 gap-8 max-sm:gap-3"
        >
          {["Shopping cart", "Checkout details", "Order complete"].map(
            (label, index) => (
              <li
                key={label}
                aria-current={index === 0 ? "step" : undefined}
                className={`h-[68px] pb-[26px] ${
                  index === 0
                    ? "border-b-2 border-primary text-[#23262f]"
                    : "text-[#b1b5c3]"
                } max-sm:h-auto max-sm:pb-4`}
              >
                <div className="flex items-center gap-[17px] max-sm:flex-col max-sm:items-start max-sm:gap-2">
                  <span
                    className={`${semibold} flex shrink-0 items-center justify-center rounded-full text-[16px] leading-[26px] text-[#fcfcfd] ${
                      index === 0
                        ? "size-[42px] bg-[#23262f]"
                        : index === 1
                          ? "size-10 bg-[#b1b5c3]"
                          : "h-[42px] w-10 bg-[#b1b5c3]"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span
                    className={`${semibold} text-[16px] leading-[26px] max-sm:text-[12px] max-sm:leading-5`}
                  >
                    {label}
                  </span>
                </div>
              </li>
            ),
          )}
        </ol>
      </div>

      <div className="grid grid-cols-[minmax(0,643px)_minmax(0,413px)] items-start gap-16 py-20 max-lg:grid-cols-1 max-lg:gap-10 max-md:py-10">
        <div
          className="min-h-[482px] min-w-0 max-lg:min-h-0"
          role="table"
          aria-label="Shopping cart products"
        >
          <div
            role="row"
            className={`${semibold} flex h-[50px] justify-between border-b border-muted-foreground pb-6 text-[16px] leading-[26px] text-[#121212] max-sm:text-[14px]`}
          >
            <span role="columnheader">Product</span>
            <div className="flex w-[322px] max-w-[51%] justify-between max-sm:w-auto">
              <span role="columnheader" className="max-sm:hidden">
                Quantity
              </span>
              <span role="columnheader" className="max-sm:hidden">
                Price
              </span>
              <span role="columnheader">Subtotal</span>
            </div>
          </div>
          {items.length ? (
            items.map((item) => (
              <div
                key={item.id}
                role="row"
                className="flex h-[144px] items-center justify-between gap-3 border-b border-border max-sm:h-auto max-sm:min-h-[144px] max-sm:items-start max-sm:py-6"
              >
                <div
                  role="cell"
                  className="flex min-w-0 flex-1 items-center gap-4 max-sm:items-start max-sm:gap-3"
                >
                  <img
                    src={item.imageSrc}
                    alt={item.name}
                    className="h-24 w-20 shrink-0 bg-card object-cover mix-blend-multiply max-sm:h-20 max-sm:w-16"
                  />
                  <div className="flex min-w-0 flex-col gap-2">
                    <p className={`${semibold} text-[14px] leading-[22px]`}>
                      {item.name}
                    </p>
                    {item.color && (
                      <p className="text-[12px] leading-5 text-muted-foreground">
                        Color: {item.color}
                      </p>
                    )}
                    <button
                      onClick={() => onRemove(item.id)}
                      aria-label={`Remove ${item.name}${
                        item.color ? `, ${item.color}` : ""
                      }`}
                      className={`${semibold} flex items-center gap-1 self-start text-[14px] leading-[22px] text-muted-foreground hover:text-foreground`}
                    >
                      <img
                        src="/assets/furniture/0367b.svg"
                        alt=""
                        aria-hidden="true"
                        className="shrink-0"
                      />
                      Remove
                    </button>
                    <div className="hidden max-sm:block">
                      <Quantity item={item} onChange={onQuantityChange} />
                    </div>
                  </div>
                </div>
                <div className="flex w-[328px] max-w-[51%] shrink-0 items-center justify-between max-sm:w-auto max-sm:pt-0">
                  <div role="cell" className="max-sm:hidden">
                    <Quantity item={item} onChange={onQuantityChange} />
                  </div>
                  <p
                    role="cell"
                    className="text-right text-[18px] leading-[30px] text-[#121212] max-sm:hidden"
                  >
                    {price(item.unitPrice)}
                  </p>
                  <p
                    role="cell"
                    className={`${semibold} text-right text-[18px] leading-[30px] text-[#121212] max-sm:text-[14px] max-sm:leading-[22px]`}
                  >
                    {price(item.unitPrice * item.quantity)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-5 text-center">
              <p className={`${heading} text-[24px] leading-8`}>
                Your cart is empty.
              </p>
              <p className="text-muted-foreground">
                Find something lovely for your home.
              </p>
              <Link
                to="/shop"
                className={`${medium} rounded-lg bg-primary px-8 py-3 text-white`}
              >
                Continue shopping
              </Link>
            </div>
          )}
        </div>

        <aside
          aria-labelledby="cart-summary-title"
          className="flex min-h-[476px] min-w-0 flex-col rounded-[6px] border border-muted-foreground bg-white p-[23px] max-lg:w-full max-lg:max-w-[643px]"
        >
          <h2
            id="cart-summary-title"
            className={`${heading} mb-4 text-[20px] leading-7`}
          >
            Cart summary
          </h2>
          <fieldset
            aria-label="Delivery options"
            aria-describedby="delivery-note"
            className="flex flex-col gap-3"
          >
            {deliveryOptions.map(({ label, fee }, option) => (
              <label
                key={option}
                className={`relative flex h-[52px] items-center gap-3 cursor-pointer rounded-[4px] border px-4 ${
                  deliveryOption === option
                    ? "border-primary bg-card"
                    : "border-muted-foreground bg-white"
                } focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-ring`}
              >
                <input
                  type="radio"
                  name="cart-delivery"
                  aria-label={label}
                  checked={deliveryOption === option}
                  onChange={() => onDeliveryChange(fee)}
                  className="size-[18px] shrink-0 cursor-pointer accent-primary"
                />
                <span className="min-w-0 flex-1 text-[16px] leading-[26px] max-sm:text-[14px] max-sm:leading-5">
                  {label}
                </span>
                <span className="shrink-0 text-[16px] leading-[26px] tabular-nums max-sm:text-[14px]">
                  {price(fee)}
                </span>
              </label>
            ))}
          </fieldset>
          <p
            id="delivery-note"
            className="mt-2 text-[12px] leading-4 text-muted-foreground"
          >
            Demo delivery prices. No payment will be collected.
          </p>
          <dl aria-live="polite" className="mb-4 mt-4">
            <div className="flex min-h-10 items-center justify-between gap-4 border-b border-border text-[16px] leading-[26px]">
              <dt>Subtotal</dt>
              <dd className={`${semibold} tabular-nums`}>{price(subtotal)}</dd>
            </div>
            <div
              className={`${heading} flex min-h-10 items-center justify-between gap-4 text-[20px] leading-7`}
            >
              <dt>Total</dt>
              <dd className="tabular-nums">{price(total)}</dd>
            </div>
          </dl>
          <button
            onClick={() => onCheckout(deliveryFee)}
            disabled={!items.length}
            className="group mt-auto h-[52px] shrink-0 rounded-lg bg-primary text-white transition-colors hover:bg-[#343839] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className={`${medium} text-[18px] leading-8`}>Checkout</span>
          </button>
        </aside>
      </div>

      <form
        onSubmit={applyCoupon}
        className="relative flex w-[424px] max-w-full flex-col gap-4"
        noValidate
      >
        <div className="flex flex-col gap-[7px]">
          <h2 className={`${heading} text-[20px] leading-7`}>Have a coupon?</h2>
          <p className="text-[16px] leading-[26px] text-muted-foreground">
            Add your code for an instant cart discount
          </p>
        </div>
        <div className="relative flex h-[52px] items-center gap-2 px-4 outline outline-1 outline-muted-foreground after:absolute after:inset-x-4 after:bottom-0 after:border-b after:border-[#6c727580]">
          <img
            src="/assets/cart-page/e9599.svg"
            alt=""
            aria-hidden="true"
            className="shrink-0"
          />
          <input
            aria-label="Coupon code"
            value={coupon}
            onChange={(event) => {
              setCoupon(event.target.value)
              setCouponMessage("")
            }}
            placeholder="Coupon Code"
            className={`${medium} min-w-0 flex-1 bg-transparent text-[16px] leading-7 tracking-[-0.4px] placeholder:text-muted-foreground focus:outline-none`}
            aria-describedby={couponMessage ? "coupon-message" : undefined}
          />
          <button
            type="submit"
            className={`${medium} text-[16px] leading-7 tracking-[-0.4px]`}
          >
            Apply
          </button>
        </div>
        {couponMessage && (
          <p
            id="coupon-message"
            role="status"
            className="text-[14px] leading-[22px] text-muted-foreground"
          >
            {couponMessage}
          </p>
        )}
      </form>
    </section>
  )
}

function Quantity({
  item,
  onChange,
}: {
  item: CartItem
  onChange: CartPageProps["onQuantityChange"]
}) {
  return (
    <div className="group relative flex h-8 w-20 items-center justify-between rounded-[4px] border border-black px-2">
      <button
        aria-label={`Decrease quantity of ${item.name}`}
        disabled={item.quantity <= 1}
        onClick={() => onChange(item.id, item.quantity - 1)}
        className="absolute inset-y-0 left-0 flex w-6 items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="sr-only">Decrease</span>
        <img
          src="/assets/cart/821a8.svg"
          alt=""
          aria-hidden="true"
          className="shrink-0"
        />
      </button>
      <span
        aria-live="polite"
        className={`${semibold} mx-auto text-[12px] leading-5 text-[#121212]`}
      >
        {item.quantity}
      </span>
      <button
        aria-label={`Increase quantity of ${item.name}`}
        onClick={() => onChange(item.id, item.quantity + 1)}
        className="absolute inset-y-0 right-0 flex w-6 items-center justify-center"
      >
        <span className="sr-only">Increase</span>
        <img
          src="/assets/cart/2ac81.svg"
          alt=""
          aria-hidden="true"
          className="shrink-0"
        />
      </button>
    </div>
  )
}
