import { Link } from "react-router"

export type DemoOrderDraft = {
  items: ReadonlyArray<{
    id: string
    name: string
    color?: string
    imageSrc: string
    quantity: number
    unitPrice: number
  }>
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  paymentMethod: "Credit Card" | "PayPal" | "Paystack"
}

export type DemoOrder = DemoOrderDraft & {
  code: string
  createdAt: string
}

type OrderCompletePageProps = {
  order: DemoOrder | undefined
  onViewHistory: () => void
}

const heading = "font-['Poppins:Medium'] font-medium"
const semibold = "font-['Inter:Semi_Bold'] font-semibold"
const medium = "font-['Inter:Medium'] font-medium"
const price = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    amount,
  )

export default function OrderCompletePage({
  order,
  onViewHistory,
}: OrderCompletePageProps) {
  if (!order) {
    return (
      <section
        className="mx-auto flex min-h-[650px] w-full max-w-[832px] flex-col items-center justify-center gap-6 px-6 py-20 text-center"
        aria-labelledby="no-order-title"
      >
        <h1
          id="no-order-title"
          className={`${heading} text-[40px] leading-[44px] tracking-[-0.4px] max-sm:text-[30px] max-sm:leading-9`}
        >
          No demo order yet
        </h1>
        <p className="max-w-[448px] text-[16px] leading-[26px] text-muted-foreground">
          Complete checkout to see your order confirmation. Demo orders are only
          kept while this preview is open.
        </p>
        <Link
          to="/checkout"
          className={`${medium} rounded-full bg-primary px-10 py-3 text-[16px] leading-7 text-white transition-colors hover:bg-[#343839]`}
        >
          Return to checkout
        </Link>
      </section>
    )
  }

  const details = [
    { label: "Order code:", value: order.code },
    {
      label: "Date:",
      value: new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(order.createdAt)),
    },
    { label: "Total:", value: price(order.total) },
    { label: "Payment method:", value: order.paymentMethod },
  ]

  return (
    <section
      aria-labelledby="complete-title"
      aria-describedby="demo-order-note"
      className="mx-auto flex w-full max-w-[832px] flex-col items-center gap-20 py-20 max-[879px]:px-6 max-md:gap-12 max-md:py-10"
      data-node-id="11:9113"
    >
      <div className="flex w-full flex-col items-center gap-10 max-sm:gap-6">
        <h1
          id="complete-title"
          className={`${heading} text-[54px] leading-[58px] tracking-[-1px] text-black max-sm:text-[40px] max-sm:leading-[44px]`}
        >
          Complete!
        </h1>
        <ol
          aria-label="Checkout progress"
          className="grid w-full grid-cols-3 gap-8 max-sm:gap-3"
        >
          {["Shopping cart", "Checkout details", "Order complete"].map(
            (label, index) => (
              <li
                key={label}
                aria-current={index === 2 ? "step" : undefined}
                className={`h-[66px] border-b-2 pb-6 ${
                  index === 2
                    ? "border-primary text-[#23262f]"
                    : "border-[#38cb89] text-[#45b26b]"
                } max-sm:h-auto max-sm:pb-4`}
              >
                <div className="flex items-center gap-[17px] max-sm:flex-col max-sm:items-start max-sm:gap-2">
                  <span
                    className={`${semibold} flex size-10 shrink-0 items-center justify-center rounded-full text-[16px] leading-6 text-[#fcfcfd] ${
                      index === 2 ? "bg-[#23262f]" : "bg-[#45b26b]"
                    }`}
                  >
                    {index === 2 ? (
                      "3"
                    ) : (
                      <img
                        src="/assets/order-complete/98156.svg"
                        alt=""
                        aria-hidden="true"
                        className="max-w-none shrink-0"
                      />
                    )}
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

      <article
        className="flex w-[736px] max-w-full flex-col items-center gap-10 rounded-lg bg-white px-[95px] py-20 drop-shadow-[0px_32px_24px_rgba(18,18,18,0.1)] max-md:px-8 max-sm:gap-8 max-sm:px-5 max-sm:py-12"
        data-node-id="11:9117"
        aria-labelledby="order-received-title"
      >
        <div
          className={`${heading} flex w-[546px] max-w-full flex-col items-center gap-4 text-center`}
        >
          <p className="w-[448px] max-w-full text-[28px] leading-[34px] tracking-[-0.6px] text-muted-foreground max-sm:text-[24px] max-sm:leading-8">
            Thank you! 🎉
          </p>
          <h2
            id="order-received-title"
            className="w-[492px] max-w-full text-[40px] leading-[44px] tracking-[-0.4px] text-[#23262f] max-sm:text-[28px] max-sm:leading-[34px]"
          >
            Your order has been received
          </h2>
        </div>

        <div
          className="flex w-[546px] max-w-full flex-wrap items-start justify-center gap-10 max-sm:gap-4"
          aria-label="Confirmed order items"
        >
          {order.items.map((item) => (
            <figure
              key={item.id}
              className="relative h-[112px] w-24 shrink-0"
              aria-label={`${item.name}${
                item.color ? `, ${item.color}` : ""
              }, quantity ${item.quantity}`}
            >
              <img
                src={item.imageSrc}
                alt={item.name}
                title={`${item.name}${item.color ? ` — ${item.color}` : ""}`}
                className="absolute left-0 top-4 h-24 w-20 bg-card object-cover mix-blend-multiply"
              />
              <span
                className={`${semibold} absolute left-16 top-0 flex h-8 min-w-8 items-center justify-center rounded-full bg-primary px-1 text-[16px] leading-6 text-[#fcfcfd] tabular-nums`}
                aria-label={`Quantity ${item.quantity}`}
              >
                {item.quantity}
              </span>
            </figure>
          ))}
        </div>

        <dl
          className={`${semibold} grid max-w-full grid-cols-[max-content_minmax(0,max-content)] items-start justify-center gap-x-8 gap-y-5 text-[14px] leading-[22px] max-sm:w-full max-sm:grid-cols-[max-content_minmax(0,1fr)] max-sm:gap-x-3 max-sm:text-[12px] max-sm:leading-5`}
        >
          {details.map((detail) => (
            <div key={detail.label} className="contents">
              <dt className="text-muted-foreground">{detail.label}</dt>
              <dd className="min-w-0 break-words text-foreground">
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>

        <button
          type="button"
          onClick={onViewHistory}
          className={`${medium} rounded-full bg-primary px-10 py-3 text-[16px] leading-7 tracking-[-0.4px] text-white transition-colors hover:bg-[#343839]`}
        >
          Purchase history
        </button>
        <p id="demo-order-note" className="sr-only">
          This confirms a demo order only. No payment was collected, no email
          was sent, and no fulfillment was requested.
        </p>
      </article>
    </section>
  )
}
