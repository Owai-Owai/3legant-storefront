import { useEffect, useRef } from "react"

type DrawerItem = {
  id: string
  name: string
  color?: string
  imageSrc: string
  imageFit?: "contain" | "cover"
  unitPrice: number
  quantity: number
}

type CartDrawerProps = {
  items: DrawerItem[]
  onClose: () => void
  onQuantityChange: (id: string, quantity: number) => void
  onRemove: (id: string) => void
  onCheckout: () => void
  onViewCart: () => void
  onShop: () => void
}

const assetPathPrefix = "/assets/cart"
const semibold = "font-['Inter:Semi_Bold'] font-semibold"
const heading = "font-['Poppins:Medium'] font-medium"
const price = (amount: number) => `$${amount.toFixed(2)}`

function CartIcon({ file }: { file: string }) {
  return (
    <img
      src={`${assetPathPrefix}/${file}`}
      alt=""
      aria-hidden="true"
      className="max-w-none shrink-0"
    />
  )
}

export default function CartDrawer({
  items,
  onClose,
  onQuantityChange,
  onRemove,
  onCheckout,
  onViewCart,
  onShop,
}: CartDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closingRef = useRef(false)
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  )

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const previousOverflow = document.body.style.overflow
    const previousPadding = document.body.style.paddingRight
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth
    if (scrollbarWidth > 0)
      document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + scrollbarWidth}px`
    document.body.style.overflow = "hidden"
    dialog.showModal()
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dialog.animate(
        [{ transform: "translateX(100%)" }, { transform: "translateX(0)" }],
        { duration: 240, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      )
    }
    return () => {
      dialog.getAnimations().forEach((animation) => animation.cancel())
      dialog.close()
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPadding
      previousFocus?.focus({ preventScroll: true })
    }
  }, [])

  const close = () => {
    if (closingRef.current) return
    closingRef.current = true
    const dialog = dialogRef.current
    if (
      !dialog ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      onClose()
      return
    }
    dialog.getAnimations().forEach((animation) => animation.cancel())
    const animation = dialog.animate(
      [{ transform: "translateX(0)" }, { transform: "translateX(100%)" }],
      { duration: 180, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "forwards" },
    )
    animation.finished.then(onClose).catch(() => {})
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="cart-drawer-title"
      aria-modal="true"
      data-node-id="4:2367"
      onCancel={(event) => {
        event.preventDefault()
        close()
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault()
          close()
        }
        if (event.key === "Tab") {
          const controls = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",
            ),
          ).filter((control) => control.getClientRects().length > 0)
          const first = controls[0]
          const last = controls[controls.length - 1]
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault()
            last?.focus()
          }
          if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault()
            first?.focus()
          }
        }
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return
        const bounds = event.currentTarget.getBoundingClientRect()
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          close()
      }}
      className="fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-dvh w-[413px] max-w-full flex-col overflow-hidden border-0 bg-white px-6 py-10 text-foreground outline-none backdrop:bg-black/[0.32] open:flex max-[479px]:py-6"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex h-[34px] shrink-0 items-center justify-between gap-4">
          <h2
            id="cart-drawer-title"
            className={`${heading} text-[28px] leading-[34px] tracking-[-0.6px] text-[#121212]`}
          >
            Cart
          </h2>
          <button
            autoFocus
            onClick={close}
            aria-label="Close cart"
            className="relative flex size-6 shrink-0 items-center justify-center after:absolute after:-inset-2 focus-visible:rounded-sm"
          >
            <CartIcon file="ad34a.svg" />
          </button>
        </div>
        <div
          className="-mr-[11px] min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain pr-[11px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Cart items"
        >
          {items.length ? (
            <div className="flex flex-col gap-6">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="h-36 w-[376px] max-w-[calc(100%+11px)] shrink-0 border-b border-border pb-[23px] pt-6"
                >
                  <div className="flex h-24 w-[363px] max-w-[calc(100%-2px)] gap-4">
                    <div className="h-24 w-20 shrink-0 overflow-hidden bg-card">
                      <img
                        src={item.imageSrc}
                        alt={item.name}
                        className={`h-full w-full mix-blend-multiply ${
                          item.imageFit === "contain"
                            ? "object-contain"
                            : "object-cover"
                        }`}
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
                        <h3
                          className={`${semibold} max-w-full truncate text-[14px] leading-[22px]`}
                        >
                          {item.name}
                        </h3>
                        <p className="text-[12px] leading-5 text-muted-foreground">
                          {item.color ? `Color: ${item.color}` : "Standard"}
                        </p>
                        <div className="grid h-8 w-20 shrink-0 grid-cols-[16px_1fr_16px] items-center rounded border border-[#6c7275] px-2">
                          <button
                            disabled={item.quantity <= 1}
                            onClick={() =>
                              onQuantityChange(item.id, item.quantity - 1)
                            }
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="relative flex size-4 items-center justify-center after:absolute after:left-1/2 after:top-1/2 after:size-10 after:-translate-x-1/2 after:-translate-y-1/2 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <CartIcon file="821a8.svg" />
                          </button>
                          <span
                            className={`${semibold} text-center text-[12px] leading-5 tabular-nums`}
                            aria-label={`Quantity ${item.quantity}`}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              onQuantityChange(item.id, item.quantity + 1)
                            }
                            aria-label={`Increase quantity of ${item.name}`}
                            className="relative flex size-4 items-center justify-center after:absolute after:left-1/2 after:top-1/2 after:size-10 after:-translate-x-1/2 after:-translate-y-1/2"
                          >
                            <CartIcon file="2ac81.svg" />
                          </button>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <p
                          className={`${semibold} text-right text-[14px] leading-[22px] text-[#121212] tabular-nums`}
                        >
                          {price(item.unitPrice)}
                        </p>
                        <button
                          onClick={() => {
                            onRemove(item.id)
                            queueMicrotask(() =>
                              dialogRef.current
                                ?.querySelector<HTMLButtonElement>("button")
                                ?.focus({ preventScroll: true }),
                            )
                          }}
                          aria-label={`Remove ${item.name} from cart`}
                          className="relative flex size-6 items-center justify-center after:absolute after:-inset-2"
                        >
                          <CartIcon file="5a061.svg" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-start gap-5 py-10">
              <p className={`${heading} text-[20px] leading-7`}>
                Your cart is empty.
              </p>
              <p className="text-[14px] leading-[22px] text-muted-foreground">
                Find something lovely for your home.
              </p>
              <button
                onClick={onShop}
                className="rounded-md bg-primary px-6 py-3 font-['Inter:Medium'] text-sm font-medium text-white hover:bg-[#343839]"
              >
                Continue shopping
              </button>
            </div>
          )}
        </div>
      </div>
      <div
        className="flex h-[210px] shrink-0 flex-col items-center justify-between bg-white"
        data-node-id="4:2376"
      >
        <div className="w-full">
          <div className="flex h-[52px] items-center justify-between border-b border-border text-[16px] leading-[26px]">
            <span>Subtotal</span>
            <span className={`${semibold} tabular-nums`}>
              {price(subtotal)}
            </span>
          </div>
          <div
            className={`${heading} flex h-[52px] items-center justify-between text-[20px] leading-7`}
          >
            <span>Total</span>
            <span className="tabular-nums">{price(subtotal)}</span>
          </div>
        </div>
        <div className="flex w-full flex-col items-center gap-4">
          <button
            onClick={onCheckout}
            disabled={!items.length}
            className="w-full rounded-[6px] bg-primary px-[26px] py-[10px] font-['Inter:Medium'] text-[18px] font-medium leading-8 tracking-[-0.4px] text-white transition-colors hover:bg-[#343839] active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Checkout
          </button>
          <button
            onClick={onViewCart}
            className={`${semibold} h-[22px] border-b border-[#121212] text-[14px] leading-[22px] text-[#121212] hover:opacity-60`}
          >
            View Cart
          </button>
        </div>
      </div>
    </dialog>
  )
}
