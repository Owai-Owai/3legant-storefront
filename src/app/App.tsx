import { useEffect, useRef, useState } from "react"
import type { FormEvent, ReactNode } from "react"
import CartDrawer from "./CartDrawer"
import CartPage from "./CartPage"
import CheckoutPage from "./CheckoutPage"
import OrderCompletePage from "./OrderCompletePage"
import type { DemoOrder } from "./OrderCompletePage"
import OrdersHistoryPage from "./OrdersHistoryPage"
import { AddressEditor, sampleAddress } from "./AddressPage"
import type { AddressBook, AddressKind } from "./AddressPage"
import { demoWishlistProducts } from "./WishlistPage"
import ShopPage, { shopProducts } from "./ShopPage"
import ProductDetailPage from "./ProductDetailPage"
import BlogPage from "./BlogPage"
import ArticleDetailPage, { articleDetailPath } from "./ArticleDetailPage"
import ContactPage from "./ContactPage"
import SignUpPage from "./SignUpPage"
import SignInPage from "./SignInPage"
import PreviewAccountMenu from "./PreviewAccountMenu"
import {
  createBrowserRouter,
  Link,
  RouterProvider,
  useLocation,
  useMatch,
  useNavigate,
  useSearchParams,
} from "react-router"
import { useAuth, AuthProvider } from "@/lib/AuthContext"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { sendOrderConfirmationEmail } from "@/lib/email"
import {
  getOrCreateUserCart,
  loadRemoteCartItems,
  syncItemToRemoteCart,
  removeRemoteCartItem,
  clearRemoteCart,
} from "@/lib/cartSync"

const assetPathPrefix = "/assets/furniture"
const asset = (filename: string) => `${assetPathPrefix}/${filename}`
const heading = "font-['Poppins:Medium'] font-medium"
const medium = "font-['Inter:Medium'] font-medium"
const semibold = "font-['Inter:Semi_Bold'] font-semibold"
const container = "mx-auto w-full max-w-[1120px] max-[1199px]:px-6"
const sectionTitle = `${heading} text-[40px] leading-[44px] tracking-[-0.4px] max-sm:text-[30px] max-sm:leading-[36px]`
const blackButton = `${medium} rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-[#343839] active:scale-[0.96]`
const price = (value: number) => `$${value.toFixed(2)}`

export type Product = {
  id: string
  name: string
  price: number
  oldPrice?: number
  image: string
  geometry: string
  room: string
  blank?: boolean
  color?: string
  imagePrefix?: string
}
const productImage = (product: Product) =>
  `${product.imagePrefix ?? assetPathPrefix}/${product.image}`
const products: Product[] = [
  {
    id: "loveseat",
    color: "Grey",
    name: "Loveseat Sofa",
    price: 199,
    oldPrice: 400,
    image: "6c18f.png",
    geometry: "inset-0 size-full object-contain",
    room: "Living Room",
    blank: true,
  },
  {
    id: "table-lamp",
    color: "gold",
    name: "Table Lamp",
    price: 24.99,
    image: "6354d.png",
    geometry: "h-[52.03%] left-[8.19%] top-[23.93%] w-[83.63%]",
    room: "Living Room",
  },
  {
    id: "beige-lamp",
    color: "Beige",
    name: "Beige Table Lamp",
    price: 24.99,
    image: "040be.png",
    geometry: "h-[52.35%] left-0 top-[23.83%] w-full",
    room: "Bedroom",
  },
  {
    id: "basket",
    color: "Natural",
    name: "Bamboo basket",
    price: 24.99,
    image: "c350a.png",
    geometry: "inset-0 size-full object-contain",
    room: "Bedroom",
  },
  {
    id: "toaster",
    color: "Cream",
    name: "Toasted",
    price: 224.99,
    image: "af642.png",
    geometry: "h-[50.72%] left-[8.02%] top-[24.64%] w-[83.95%]",
    room: "Kitchen",
  },
  {
    id: "kitchen-basket",
    color: "Cream",
    name: "Bamboo basket",
    price: 24.99,
    image: "af642.png",
    geometry: "h-[50.72%] left-[8.02%] top-[24.64%] w-[83.95%]",
    room: "Kitchen",
  },
]
const articles = [
  {
    title: "7 ways to decor your home",
    image: "6350b.png",
    alt: "Cozy living room with a grey sofa, bookshelves, and wall art",
    text: "Start with a comfortable focal point, then build your room around it. Layer soft textiles, mix warm wood with natural textures, bring in greenery, add personal artwork, choose lighting at different heights, and leave room for the things you love.",
  },
  {
    title: "Kitchen organization",
    image: "84b87.png",
    alt: "Organized kitchen with open shelving and a wood breakfast bar",
    text: "Keep everyday essentials within easy reach. Group items by how you use them, give your counters space to breathe, and use baskets and trays to make open shelving both useful and beautiful.",
  },
  {
    title: "Decor your bedroom",
    image: "08d0a.png",
    alt: "Airy bedroom with neutral bedding and hanging plants",
    text: "Create a restful retreat with soft bedding, warm lighting, and a calm palette. Add a bedside lamp, a few favorite objects, and natural textures for a room that feels unmistakably yours.",
  },
]
const slides = [
  {
    image: "c376e.png",
    alt: "Tan leather sofa in a bright living room with large windows",
  },
  {
    image: "d3f04.png",
    alt: "Warm living room with an orange sectional, plants, and a patterned rug",
  },
  {
    image: "6350b.png",
    alt: "Thoughtfully decorated living room with books and artwork",
  },
]

function Icon({ file }: { file: string }) {
  return (
    <img
      src={asset(file)}
      alt=""
      className="max-w-none shrink-0"
      aria-hidden="true"
    />
  )
}

function TextLink({
  children,
  onClick,
  file = "d0175.svg",
  className = "",
}: {
  children: ReactNode
  onClick: () => void
  file?: string
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`${medium} flex h-7 w-fit items-center gap-1 border-b border-foreground text-[16px] leading-7 tracking-[-0.4px] transition-opacity hover:opacity-60 ${className}`}
    >
      {children}
      <Icon file={file} />
    </button>
  )
}

function ProductCard({
  product,
  featured,
  wishlistFeatured = featured,
  showBadges = true,
  saved,
  onSave,
  onAdd,
  onView,
}: {
  product: Product
  featured?: boolean
  wishlistFeatured?: boolean
  showBadges?: boolean
  saved: boolean
  onSave: () => void
  onAdd: () => void
  onView: () => void
}) {
  return (
    <article className="group flex min-w-0 flex-col gap-3">
      <div className="relative aspect-[262/349] overflow-hidden bg-card">
        <button
          onClick={onView}
          className="absolute inset-0 overflow-hidden"
          aria-label={`View ${product.name}`}
        >
          <img
            src={productImage(product)}
            alt={product.name}
            className={`absolute max-w-none mix-blend-multiply ${product.geometry} ${
              product.blank ? "invisible" : ""
            }`}
          />
        </button>
        {showBadges && (
          <div className="absolute left-4 top-4 flex flex-col items-start gap-2 font-['Inter:Bold'] text-[16px] font-bold uppercase leading-4">
            <span className="rounded bg-white px-[14px] py-1">NEW</span>
            <span className="rounded bg-[#38cb89] px-[14px] py-1 text-[#fefefe]">
              -50%
            </span>
          </div>
        )}
        <button
          onClick={onSave}
          aria-label={`${
            saved ? "Remove from" : "Add to"
          } wishlist: ${product.name}`}
          aria-pressed={saved}
          className={`absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-white shadow-[0_8px_8px_rgba(15,15,15,0.12)] transition-opacity after:absolute after:-inset-1 ${
            wishlistFeatured || saved
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 max-sm:opacity-100"
          }`}
        >
          {saved ? (
            <span className="text-[22px] text-[#c04444]">♥</span>
          ) : (
            <Icon file="3fa84.svg" />
          )}
        </button>
        <button
          onClick={onAdd}
          className={`absolute inset-x-4 bottom-4 py-2 text-[16px] leading-7 tracking-[-0.4px] ${blackButton} ${
            featured
              ? "opacity-100"
              : "opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
          }`}
        >
          Add to cart
        </button>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex h-4 gap-0.5" aria-label="5 out of 5 stars">
          {Array.from({ length: 5 }, (_, index) => (
            <Icon file="086dd.svg" key={index} />
          ))}
        </div>
        <button
          onClick={onView}
          className={`${semibold} text-left text-[16px] leading-[26px]`}
        >
          {product.name}
        </button>
        <div className="flex gap-3 text-[14px] leading-[22px]">
          <p className={semibold}>{price(product.price)}</p>
          {product.oldPrice && (
            <p className="text-muted-foreground line-through">
              {price(product.oldPrice)}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    ref.current?.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault()
          onClose()
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-32px)] max-w-[560px] overflow-y-auto rounded-xl bg-background p-6 text-foreground shadow-2xl backdrop:bg-black/45 sm:p-8"
      aria-labelledby="dialog-heading"
    >
      <div className="mb-6 flex items-center justify-between gap-6">
        <h2 id="dialog-heading" className={`${heading} text-[28px] leading-9`}>
          {title}
        </h2>
        <button
          autoFocus
          onClick={onClose}
          aria-label="Close dialog"
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-3xl hover:bg-muted"
        >
          ×
        </button>
      </div>
      {children}
    </dialog>
  )
}

function Storefront() {
  const navigate = useNavigate()
  const { pathname, hash } = useLocation()
  const [searchParams] = useSearchParams()
  const isShop = pathname === "/shop"
  const isBlog = pathname === "/blog"
  const isArticleDetail = pathname === articleDetailPath
  const isContact = pathname === "/contact"
  const isCart = pathname === "/cart"
  const isCheckout = pathname === "/checkout"
  const isOrderComplete = pathname === "/order-complete"
  const isOrdersHistory = pathname === "/account/orders"
  const isAccountDetails = pathname === "/account"
  const isAddressPage = pathname === "/account/address"
  const isWishlistPage = pathname === "/account/wishlist"
  const isAccountPage =
    isOrdersHistory || isAccountDetails || isAddressPage || isWishlistPage
  const productMatch = useMatch("/product/:productId")
  const isProduct = Boolean(productMatch)
  const isInnerPage =
    isShop ||
    isBlog ||
    isArticleDetail ||
    isContact ||
    isProduct ||
    isCart ||
    isCheckout ||
    isOrderComplete ||
    isAccountPage
  const detailProduct = [...shopProducts, ...products].find(
    (product) => product.id === productMatch?.params.productId,
  )
  const { user, profile: authProfile, signOut, isConfigured } = useAuth()
  const [announcement, setAnnouncement] = useState(true)
  const [slide, setSlide] = useState(0)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [demoSignedIn, setDemoSignedIn] = useState(false)
  const isSignedIn = isConfigured ? Boolean(user) : demoSignedIn
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("3legant_wishlist")
      if (saved) return JSON.parse(saved)
    } catch {}
    return demoWishlistProducts.map((product) => product.id)
  })

  useEffect(() => {
    try {
      localStorage.setItem("3legant_wishlist", JSON.stringify(wishlist))
    } catch {}
  }, [wishlist])
  const wishlistItems = wishlist.flatMap((id) => {
    const product = [
      ...demoWishlistProducts,
      ...products,
      ...shopProducts,
    ].find((item) => item.id === id)
    return product ? [product] : []
  })
  const [checkoutDeliveryFee, setCheckoutDeliveryFee] = useState(0)
  const [checkoutCouponApplied, setCheckoutCouponApplied] = useState(false)
  const [completedOrders, setCompletedOrders] = useState<DemoOrder[]>([])
  const [addresses, setAddresses] = useState<AddressBook>(() => ({
    billing: { ...sampleAddress },
    shipping: { ...sampleAddress },
  }))
  const [editingAddress, setEditingAddress] = useState<AddressKind | null>(null)
  useEffect(() => {
    setEditingAddress(null)
  }, [pathname])

  // Sync addresses with Supabase when user is authenticated
  useEffect(() => {
    if (!isConfigured || !user) return
    async function loadAddresses() {
      const { data, error } = await (supabase.from("addresses") as any)
        .select("*")
        .eq("profile_id", user!.id)
      if (!error && data && data.length > 0) {
        const billing = data.find((a: any) => a.is_default_billing) || data[0]
        const shipping = data.find((a: any) => a.is_default_shipping) || data[0]
        setAddresses({
          billing: {
            fullName: billing.full_name,
            phone: billing.phone || "",
            street: billing.street_line1,
            city: billing.city,
            country: billing.country_code,
          },
          shipping: {
            fullName: shipping.full_name,
            phone: shipping.phone || "",
            street: shipping.street_line1,
            city: shipping.city,
            country: shipping.country_code,
          },
        })
      }
    }
    loadAddresses()
  }, [user, isConfigured])

  // Sync orders with Supabase
  useEffect(() => {
    if (!isConfigured || !user) return
    async function loadOrders() {
      const { data, error } = await (supabase.from("orders") as any)
        .select("*")
        .eq("profile_id", user!.id)
        .order("created_at", { ascending: false })
      if (!error && data && data.length > 0) {
        const mappedOrders: DemoOrder[] = data.map((o: any) => ({
          code: o.order_number,
          createdAt: o.created_at,
          total: o.total_amount / 100,
          subtotal: o.subtotal_amount / 100,
          discount: o.discount_amount / 100,
          deliveryFee: o.shipping_amount / 100,
          paymentMethod: o.payment_method,
          items: [],
        }))
        setCompletedOrders(mappedOrders)
      }
    }
    loadOrders()
  }, [user, isConfigured])

  // Guard account and checkout routes for unauthenticated users
  useEffect(() => {
    if (isCheckout && !isSignedIn) {
      if (searchParams.get("email_verification_sent") === "true") {
        setNotice(
          searchParams.get("email")
            ? `Verification email sent to ${searchParams.get("email")}! Please click the link in your email to verify.`
            : "Verification email sent! Please click the link in your email to verify."
        )
        return
      }
      setNotice("Please sign in or create an account to proceed with checkout.")
      navigate("/signin?redirect=/checkout")
    }
  }, [isCheckout, isSignedIn, navigate, searchParams])

  useEffect(() => {
    if (isAccountPage && !isSignedIn) {
      if (searchParams.get("email_verification_sent") === "true") {
        setNotice(
          searchParams.get("email")
            ? `Verification email sent to ${searchParams.get("email")}! Please click the link in your email to verify.`
            : "Verification email sent! Please click the link in your email to verify."
        )
        return
      }
      setNotice("Please sign in to view your account.")
      navigate("/signin?redirect=/account")
    }
  }, [isAccountPage, isSignedIn, navigate, searchParams])

  // Listen for email verified flag
  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setNotice("Email verified successfully! Welcome to 3legant.")
    }
  }, [searchParams])
  const [cart, setCart] = useState<Array<{ product: Product; quantity: number }>>(() => {
    try {
      const version = localStorage.getItem("3legant_cart_version")
      if (version === "v2") {
        const saved = localStorage.getItem("3legant_cart")
        if (saved) return JSON.parse(saved)
      } else {
        localStorage.setItem("3legant_cart_version", "v2")
        localStorage.removeItem("3legant_cart")
      }
    } catch {}
    return []
  })

  useEffect(() => {
    try {
      localStorage.setItem("3legant_cart", JSON.stringify(cart))
    } catch {}
  }, [cart])
  const [modal, setModal] =
    useState<"cart" | "cart-details" | "search" | "account" | "checkout" | "catalog" | "article" | "articles" | "info" | "gallery" | null>(
      null,
    )
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [galleryImage, setGalleryImage] = useState({ src: "", alt: "" })
  const [selectedArticle, setSelectedArticle] = useState(articles[0])
  const [search, setSearch] = useState("")
  const [room, setRoom] = useState("All")
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [notice, setNotice] = useState("")
  const [info, setInfo] = useState({ title: "", text: "" })
  const [progress, setProgress] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const target = hash ? document.getElementById(hash.slice(1)) : null
      if (target) target.scrollIntoView({ behavior: "instant" })
      else window.scrollTo({ top: 0, behavior: "instant" })
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])
  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(""), 3500)
    return () => window.clearTimeout(timer)
  }, [notice])
  useEffect(() => {
    if (!mobileMenu) return
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenu(false)
    }
    window.addEventListener("keydown", close)
    return () => window.removeEventListener("keydown", close)
  }, [mobileMenu])
  const changeSlide = (direction: number) =>
    setSlide((current) => (current + direction + slides.length) % slides.length)
  const shop = (nextRoom = "All") => {
    setRoom(nextRoom)
    setSearch("")
    setMobileMenu(false)
    setModal("catalog")
  }
  const showInfo = (title: string, text: string) => {
    setInfo({ title, text })
    setModal("info")
  }
  const [userCartId, setUserCartId] = useState<string | null>(null)

  // Real-time bidirectional cart sync with Supabase
  useEffect(() => {
    if (!isConfigured || !user) {
      setUserCartId(null)
      return
    }

    let activeChannel: any = null

    async function initCartSync() {
      const cartId = await getOrCreateUserCart(user!.id)
      if (!cartId) return
      setUserCartId(cartId)

      // Fetch remote items
      const remoteItems = await loadRemoteCartItems(cartId)
      if (remoteItems.length > 0) {
        setCart(remoteItems)
      } else if (cart.length > 0) {
        for (const item of cart) {
          await syncItemToRemoteCart(cartId, item.product, item.quantity, productImage(item.product), cart)
        }
      }

      // Listen for instant real-time changes
      activeChannel = supabase
        .channel(`cart-sync-${cartId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cart_items',
            filter: `cart_id=eq.${cartId}`,
          },
          async () => {
            const updated = await loadRemoteCartItems(cartId)
            setCart(updated)
          }
        )
        .subscribe()
    }

    initCartSync()

    return () => {
      if (activeChannel) {
        supabase.removeChannel(activeChannel)
      }
    }
  }, [user, isConfigured])

  const updateCartQuantity = (id: string, quantity: number) => {
    setCart((current) =>
      current.map((item) =>
        item.product.id === id
          ? { ...item, quantity: Math.max(1, quantity) }
          : item,
      ),
    )
    if (userCartId) {
      const item = cart.find((i) => i.product.id === id)
      if (item) {
        syncItemToRemoteCart(userCartId, item.product, quantity - item.quantity, productImage(item.product), cart)
      }
    }
  }

  const removeCartItem = (id: string) => {
    setCart((current) => current.filter((item) => item.product.id !== id))
    if (userCartId) {
      removeRemoteCartItem(userCartId, id)
    }
  }

  const save = (product: Product) =>
    setWishlist((current) =>
      current.includes(product.id)
        ? current.filter((id) => id !== product.id)
        : [...current, product.id],
    )
  const addToCart = (product: Product, quantity = 1) => {
    setCart((current) =>
      current.some((item) => item.product.id === product.id)
        ? current.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          )
        : [...current, { product, quantity }],
    )
    if (userCartId) {
      syncItemToRemoteCart(userCartId, product, quantity, productImage(product), cart)
    } else if (user) {
      getOrCreateUserCart(user.id).then((newCartId) => {
        if (newCartId) {
          setUserCartId(newCartId)
          syncItemToRemoteCart(newCartId, product, quantity, productImage(product), cart)
        }
      })
    }
    setNotice(`${product.name} added to your cart`)
  }
  const openProduct = (product: Product) => {
    setModal(null)
    setSelectedProduct(product)
  }
  const subscribe = async (event: FormEvent) => {
    event.preventDefault()
    setSubscribed(true)
    if (isConfigured && email) {
      try {
        await (supabase.from("newsletter_subscriptions") as any).insert({
          email: email.trim().toLowerCase(),
        })
      } catch (e) {
        console.error("Newsletter subscription error:", e)
      }
    }
  }
  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  )
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0)
  const filteredProducts = products.filter(
    (product) =>
      (room === "All" || product.room === room) &&
      product.name.toLowerCase().includes(search.toLowerCase()),
  )

  const previewLogin = () => {
    setDemoSignedIn(true)
    setModal(null)
    setMobileMenu(false)
    setNotice("Signed in successfully.")
    navigate("/")
  }
  const previewSignOut = async () => {
    if (isConfigured) {
      await signOut()
    }
    setDemoSignedIn(false)
    setModal(null)
    setMobileMenu(false)
    setNotice("Signed out successfully.")
    navigate("/")
  }

  if (pathname === "/signup") return <SignUpPage onPreviewLogin={previewLogin} />
  if (pathname === "/signin") return <SignInPage onPreviewLogin={previewLogin} />
  if (pathname === "/auth/callback" || pathname === "/auth-callback.html") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-white text-center p-6">
        <div className="size-10 animate-spin rounded-full border-4 border-gray-200 border-t-black mb-4" />
        <h2 className="text-xl font-bold">Signing you into 3legant...</h2>
        <p className="text-sm text-gray-500 mt-2">Returning you to the app</p>
      </div>
    )
  }

  return (
    <div
      className="min-h-dvh w-full overflow-x-clip bg-background text-foreground"
      data-node-id={
        isContact
          ? "18:13183"
          : isArticleDetail
          ? "18:12927"
          : isBlog
          ? "17:12040"
          : isWishlistPage
          ? "17:10345"
          : isAddressPage
            ? "17:10142"
            : isAccountDetails
              ? "16:9758"
              : isOrdersHistory
                ? "11:9324"
                : isOrderComplete
                  ? "11:9111"
                  : isCheckout
                    ? "7:8343"
                    : isCart
                      ? "5:7216"
                      : isProduct
                        ? "5:4855"
                        : isShop
                          ? "4:3181"
                          : "4:1728"
      }
    >
      {announcement &&
        !isContact &&
        !isArticleDetail &&
        !isBlog &&
        !isCart &&
        !isCheckout &&
        !isOrderComplete &&
        !isAccountPage && (
          <div
            className="relative flex h-10 items-center justify-center gap-3 bg-card pl-10 pr-[60px] text-[#343839] max-sm:gap-2 max-sm:pr-10"
            data-node-id="4:1729"
          >
            <span className="max-sm:hidden">
              <Icon file="59339.svg" />
            </span>
            <p
              className={`${semibold} text-[14px] leading-[22px] max-sm:text-[11px]`}
            >
              30% off storewide — Limited time!
            </p>
            <button
              onClick={() => shop()}
              className={`${medium} flex items-center gap-1 border-b border-accent text-[14px] leading-6 text-accent max-sm:text-[11px]`}
            >
              Shop Now
              <span className="max-sm:hidden">
                <Icon file="0d19e.svg" />
              </span>
            </button>
            <button
              onClick={() => setAnnouncement(false)}
              aria-label="Dismiss promotion"
              className="absolute right-[6px] flex size-10 items-center justify-center"
            >
              <Icon file="0367b.svg" />
            </button>
          </div>
        )}

      <header
        className={`relative z-20 h-[60px] bg-white ${
          isProduct ? "border-b border-card" : ""
        }`}
        data-node-id="4:46"
      >
        <div
          className={`${container} flex h-full items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              aria-label="Open menu"
              aria-expanded={mobileMenu}
              className="hidden size-7 flex-col justify-center gap-1.5 max-md:flex"
            >
              <span className="h-px w-5 bg-primary" />
              <span className="h-px w-5 bg-primary" />
              <span className="h-px w-5 bg-primary" />
            </button>
            <Link
              to={isInnerPage ? "/" : "#"}
              className={`${heading} w-[105px] shrink-0 pr-1.5 text-center text-[24px] leading-6 text-black`}
            >
              3legant<span className="text-muted-foreground">.</span>
            </Link>
          </div>
          <nav
            aria-label="Main navigation"
            className="flex items-center gap-10 font-['Space_Grotesk:Medium'] text-[14px] font-medium leading-6 max-md:hidden"
          >
            {isInnerPage ? <Link to="/">Home</Link> : <a href="#">Home</a>}
            <button
              onClick={() => navigate("/shop")}
              className="text-muted-foreground hover:text-foreground"
            >
              Shop
            </button>
            <Link
              to={isInnerPage ? "/#new-arrivals" : "#new-arrivals"}
              className="text-muted-foreground hover:text-foreground"
            >
              Product
            </Link>
            <Link
              to="/contact"
              className="text-muted-foreground hover:text-foreground"
            >
              Contact Us
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setRoom("All")
                setModal("search")
              }}
              aria-label="Search products"
              className="relative after:absolute after:-inset-2 max-sm:hidden"
            >
              <Icon file="f97d4.svg" />
            </button>
            {isSignedIn ? (
              <PreviewAccountMenu onSignOut={previewSignOut} />
            ) : (
              <button
                onClick={() => navigate(isSignedIn ? "/account" : "/signin")}
                aria-label="Your account"
                className="relative after:absolute after:-inset-2 max-sm:hidden"
              >
                <Icon file="acb96.svg" />
              </button>
            )}
            <button
              onClick={() => setModal("cart")}
              aria-label={`Shopping cart, ${cartCount} items`}
              className="relative flex h-7 items-center gap-1.5 after:absolute after:-inset-2"
            >
              <Icon file="9a1aa.svg" />
              <span className="relative flex size-5 items-center justify-center">
                <span className="absolute inset-0">
                  <Icon file="647c2.svg" />
                </span>
                <span className="relative font-['Inter:Bold'] text-xs font-bold leading-[10px] text-white">
                  {cartCount}
                </span>
              </span>
            </button>
          </div>
        </div>
        {mobileMenu && (
          <nav className="absolute inset-x-0 top-[60px] flex flex-col gap-2 border-b border-border bg-white p-6 shadow-lg">
            <a href="#" onClick={() => setMobileMenu(false)}>
              Home
            </a>
            {["All", "Living Room", "Bedroom", "Kitchen"].map((value) => (
              <button
                key={value}
                onClick={() => shop(value)}
                className="py-2 text-left"
              >
                {value === "All" ? "Shop all" : value}
              </button>
            ))}
            <button
              onClick={() => {
                setMobileMenu(false)
                setRoom("All")
                setModal("search")
              }}
              className="py-2 text-left"
            >
              Search products
            </button>
            <button
              onClick={() => {
                setMobileMenu(false)
                if (isSignedIn) navigate("/account")
                else navigate("/signin")
              }}
              className="py-2 text-left"
            >
              Your account
            </button>
            {isSignedIn && (
              <button onClick={previewSignOut} className="py-2 text-left">
                Sign out
              </button>
            )}
            <Link
              to="/contact"
              onClick={() => setMobileMenu(false)}
              className="py-2 text-left"
            >
              Contact Us
            </Link>
          </nav>
        )}
      </header>
      {searchParams.get("email_verification_sent") === "true" && (
        <div className="border-b border-[#38cb89]/30 bg-[#38cb89]/10 px-4 py-3.5 text-center">
          <p className="font-['Inter:Medium'] text-[14px] text-[#141718]">
            ✉️ Verification email sent to <strong>{searchParams.get("email") || "your inbox"}</strong>! Please click the confirmation link in your email to activate your account.
          </p>
        </div>
      )}
      {searchParams.get("verified") === "true" && (
        <div className="border-b border-[#38cb89]/30 bg-[#38cb89]/10 px-4 py-3.5 text-center">
          <p className="font-['Inter:Medium'] text-[14px] text-[#141718]">
            ✅ Email verified successfully! Welcome to 3legant.
          </p>
        </div>
      )}
      <main>
        {isContact ? (
          <ContactPage />
        ) : isArticleDetail ? (
          <ArticleDetailPage />
        ) : isBlog ? (
          <BlogPage onNotice={setNotice} />
        ) : isAccountPage ? (
          <OrdersHistoryPage
            orders={completedOrders}
            activeSection={
              isWishlistPage
                ? "Wishlist"
                : isAddressPage
                  ? "Address"
                  : isAccountDetails
                    ? "Account"
                    : "Orders"
            }
            addresses={addresses}
            onEditAddress={setEditingAddress}
            wishlistItems={wishlistItems}
            onAddWishlist={addToCart}
            onRemoveWishlist={(product) => {
              setWishlist((current) =>
                current.filter((id) => id !== product.id),
              )
              setNotice(`${product.name} removed from your wishlist`)
            }}
            onMenuAction={(label) => {
              if (label === "Account") setModal("account")
              else if (label === "Log Out" && demoSignedIn) previewSignOut()
              else
                setNotice(
                  label === "Log Out"
                    ? "This preview has no signed-in account to log out of."
                    : `${label} is not connected to an account service in this UI preview.`,
                )
            }}
          />
        ) : isOrderComplete ? (
          <OrderCompletePage
            order={completedOrders.at(-1)}
            onViewHistory={() => navigate("/account/orders")}
          />
        ) : isCheckout ? (
          <CheckoutPage
            items={cart.map(({ product, quantity }) => ({
              id: product.id,
              name: product.name,
              color: product.color,
              imageSrc: productImage(product),
              unitPrice: product.price,
              quantity,
            }))}
            deliveryFee={checkoutDeliveryFee}
            couponApplied={checkoutCouponApplied}
            onCouponChange={setCheckoutCouponApplied}
            onComplete={async (order) => {
              const code = `#${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}_${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`
              const snapshot: DemoOrder = {
                ...order,
                items: order.items.map((item) => ({ ...item })),
                code,
                createdAt: new Date().toISOString(),
              }
              setCompletedOrders((current) => [...current, snapshot])

              if (isConfigured && user) {
                try {
                  const { data: dbOrder } = await (supabase.from("orders") as any)
                    .insert({
                      order_number: code,
                      profile_id: user.id,
                      status: "completed",
                      payment_status: "paid",
                      fulfillment_status: "unfulfilled",
                      currency: "USD",
                      subtotal_amount: Math.round(order.subtotal * 100),
                      discount_amount: Math.round(order.discount * 100),
                      shipping_amount: Math.round(order.deliveryFee * 100),
                      total_amount: Math.round(order.total * 100),
                      shipping_address: addresses.shipping,
                      billing_address: addresses.billing,
                      contact_email: user.email || "",
                      payment_method: order.paymentMethod,
                    })
                    .select()
                    .single()

                  if (dbOrder) {
                    const orderItems = order.items.map((item) => ({
                      order_id: dbOrder.id,
                      sku: item.id,
                      name: item.name,
                      color_name: item.color || null,
                      unit_amount: Math.round(item.unitPrice * 100),
                      quantity: item.quantity,
                      total_amount: Math.round(item.unitPrice * item.quantity * 100),
                      image_url: item.imageSrc,
                    }))
                    await (supabase.from("order_items") as any).insert(orderItems)
                  }
                } catch (e) {
                  console.error("Failed to save order to Supabase:", e)
                }
              }

              sendOrderConfirmationEmail({
                toEmail: user?.email || "",
                toName: user?.user_metadata?.full_name || authProfile?.display_name || addresses.shipping.fullName || "Valued Customer",
                orderNumber: code,
                orderDate: new Date().toLocaleDateString(),
                total: order.total,
                subtotal: order.subtotal,
                deliveryFee: order.deliveryFee,
                discount: order.discount,
                paymentMethod: order.paymentMethod,
                items: order.items.map((item) => ({
                  name: item.name,
                  quantity: item.quantity,
                  price: item.unitPrice,
                  color: item.color,
                })),
                shippingAddress: {
                  fullName: addresses.shipping.fullName,
                  street: addresses.shipping.street,
                  city: addresses.shipping.city,
                  country: addresses.shipping.country,
                  phone: addresses.shipping.phone,
                },
              }).catch((err) => console.warn("Email dispatch warning:", err))

              setCart([])
              try {
                localStorage.removeItem("3legant_cart")
              } catch {}
              setModal(null)
              navigate("/order-complete")
            }}
            onQuantityChange={(id, quantity) =>
              setCart((current) =>
                current.map((item) =>
                  item.product.id === id
                    ? { ...item, quantity: Math.max(1, quantity) }
                    : item,
                ),
              )
            }
          />
        ) : isCart ? (
          <CartPage
            selectedDeliveryFee={checkoutDeliveryFee}
            onDeliveryChange={setCheckoutDeliveryFee}
            items={cart.map(({ product, quantity }) => ({
              id: product.id,
              name: product.name,
              color: product.color,
              imageSrc: productImage(product),
              unitPrice: product.price,
              quantity,
            }))}
            onQuantityChange={(id, quantity) =>
              setCart((current) =>
                current.map((item) =>
                  item.product.id === id
                    ? { ...item, quantity: Math.max(1, quantity) }
                    : item,
                ),
              )
            }
            onRemove={(id) =>
              setCart((current) =>
                current.filter((item) => item.product.id !== id),
              )
            }
            onCheckout={(deliveryFee) => {
              if (!isSignedIn) {
                setNotice("Please sign in or create an account to proceed with checkout.")
                navigate("/signin")
                return
              }
              setCheckoutDeliveryFee(deliveryFee)
              setModal(null)
              navigate("/checkout")
            }}
          />
        ) : isProduct ? (
          <ProductDetailPage
            key={detailProduct?.id ?? "not-found"}
            product={detailProduct}
            recommendations={products}
            saved={Boolean(
              detailProduct && wishlist.includes(detailProduct.id),
            )}
            onSave={() => {
              if (detailProduct) save(detailProduct)
            }}
            onAdd={addToCart}
            onViewImage={(src, alt) => {
              setGalleryImage({ src, alt })
              setModal("gallery")
            }}
            renderRecommendation={(product, first) => (
              <ProductCard
                product={{ ...product, blank: true }}
                showBadges={first}
                wishlistFeatured={first}
                saved={wishlist.includes(product.id)}
                onSave={() => save(product)}
                onAdd={() => addToCart(product)}
                onView={() => navigate(`/product/${product.id}`)}
              />
            )}
          />
        ) : isShop ? (
          <ShopPage
            extraProducts={products}
            renderProduct={(product, featured) => (
              <ProductCard
                product={product}
                featured={featured}
                saved={wishlist.includes(product.id)}
                onSave={() => save(product)}
                onAdd={() => addToCart(product)}
                onView={() => navigate(`/product/${product.id}`)}
              />
            )}
          />
        ) : (
          <>
            <section
              className={`${container} flex flex-col gap-8 pb-10 max-sm:gap-6 max-sm:pb-8`}
              data-node-id="4:1740"
            >
              <div
                className="relative aspect-[1120/536] w-full overflow-hidden max-sm:aspect-[342/320]"
                aria-roledescription="carousel"
                aria-label="Room inspiration"
              >
                <img
                  src={asset(slides[slide].image)}
                  alt={slides[slide].alt}
                  className={`absolute inset-0 h-full w-full object-bottom max-sm:object-cover ${
                    slide === 0 ? "" : "object-cover"
                  }`}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent from-[83.215%] to-[rgba(52,56,57,0.4)]" />
                <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-4 max-sm:bottom-5">
                  {slides.map((item, index) => (
                    <button
                      key={item.image}
                      onClick={() => setSlide(index)}
                      aria-label={`Show inspiration slide ${index + 1}`}
                      aria-pressed={slide === index}
                      className="relative flex h-2 items-center justify-center after:absolute after:-inset-3"
                    >
                      {slide === index ? (
                        <span className="h-2 w-[30px] rounded-full bg-[#fefefe]" />
                      ) : (
                        <Icon file="f716f.svg" />
                      )}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => changeSlide(-1)}
                  aria-label="Previous inspiration slide"
                  className="absolute left-8 top-[45.336%] flex size-[52px] items-center justify-center rounded-full bg-white shadow-[0_8px_16px_rgba(0,0,0,0.04)] max-sm:left-3 max-sm:top-1/2 max-sm:size-10 max-sm:-translate-y-1/2"
                >
                  <Icon file="70dfa.svg" />
                </button>
                <button
                  onClick={() => changeSlide(1)}
                  aria-label="Next inspiration slide"
                  className="absolute right-[33px] top-[45.336%] flex size-[52px] items-center justify-center rounded-full bg-white shadow-[0_8px_16px_rgba(0,0,0,0.04)] max-sm:right-3 max-sm:top-1/2 max-sm:size-10 max-sm:-translate-y-1/2"
                >
                  <Icon file="e09d6.svg" />
                </button>
              </div>
              <div className="grid w-full grid-cols-[643px_1fr] items-center gap-6 max-[1199px]:grid-cols-[1.45fr_1fr] max-md:grid-cols-1 max-md:gap-4">
                <h1
                  className={`${heading} text-[72px] leading-[76px] tracking-[-2px] max-[1199px]:text-[58px] max-[1199px]:leading-[64px] max-sm:text-[40px] max-sm:leading-[44px] max-sm:tracking-[-1px]`}
                >
                  Simply Unique<span className="text-muted-foreground">/</span>
                  <br />
                  Simply Better<span className="text-muted-foreground">.</span>
                </h1>
                <p className="w-[424px] max-w-full text-[16px] leading-[26px] text-muted-foreground">
                  <span className={`${semibold} text-[#343839]`}>3legant </span>
                  is a gift &amp; decorations store based in HCMC, Vietnam. Est
                  since 2019.
                </p>
              </div>
            </section>

            <section
              className={`${container} grid grid-cols-2 gap-6 max-sm:grid-cols-1 max-sm:gap-4`}
              aria-label="Shop by room"
              data-node-id="4:1757"
            >
              <div className="relative aspect-[548/664] overflow-hidden bg-card">
                <img
                  src={asset("bd276.png")}
                  alt="Light grey tufted armchair with a white cushion"
                  className="absolute inset-0 h-full w-full max-w-none object-bottom mix-blend-multiply"
                />
                <div className="absolute left-[8.76%] top-[7.23%] flex flex-col items-start gap-3">
                  <h2
                    className={`${heading} text-[34px] leading-[38px] tracking-[-0.6px] max-md:text-[26px]`}
                  >
                    Living Room
                  </h2>
                  <TextLink
                    onClick={() => shop("Living Room")}
                    file="d4df3.svg"
                  >
                    Shop Now
                  </TextLink>
                </div>
              </div>
              <div className="flex flex-col gap-6 max-sm:gap-4">
                <div className="relative aspect-[548/319] overflow-hidden bg-card">
                  <img
                    src={asset("b892e.png")}
                    alt="White chest of drawers with a natural wood frame"
                    className="absolute inset-0 h-full w-full max-w-none object-bottom mix-blend-multiply"
                  />
                  <div className="absolute bottom-[12.54%] left-[5.84%] flex flex-col items-start gap-3">
                    <h2
                      className={`${heading} text-[34px] leading-[38px] tracking-[-0.6px] max-md:text-[26px]`}
                    >
                      Bedroom
                    </h2>
                    <TextLink onClick={() => shop("Bedroom")} file="d4df3.svg">
                      Shop Now
                    </TextLink>
                  </div>
                </div>
                <div className="relative aspect-[548/319] overflow-hidden bg-card">
                  <img
                    src={asset("af642.png")}
                    alt="Cream retro toaster"
                    className="absolute left-[43.7%] top-[18.58%] h-[69.11%] w-1/2 max-w-none mix-blend-multiply"
                  />
                  <div className="absolute bottom-[12.54%] left-[5.84%] flex flex-col items-start gap-3">
                    <h2
                      className={`${heading} text-[34px] leading-[38px] tracking-[-0.6px] max-md:text-[26px]`}
                    >
                      Kitchen
                    </h2>
                    <TextLink onClick={() => shop("Kitchen")} file="d0175.svg">
                      Shop Now
                    </TextLink>
                  </div>
                </div>
              </div>
            </section>

            <section
              id="new-arrivals"
              className="pt-12 max-sm:pt-8"
              data-node-id="4:1770"
            >
              <div
                className={`${container} mb-12 flex items-end justify-between max-sm:mb-6`}
              >
                <h2 className={`${sectionTitle} text-black`}>
                  New
                  <br />
                  Arrivals
                </h2>
                <TextLink onClick={() => shop()} className="max-sm:text-sm">
                  More Products
                </TextLink>
              </div>
              <div
                ref={carouselRef}
                onScroll={() => {
                  const carousel = carouselRef.current
                  if (carousel)
                    setProgress(
                      carousel.scrollLeft /
                        Math.max(
                          1,
                          carousel.scrollWidth - carousel.clientWidth,
                        ),
                    )
                }}
                className="ml-[max(24px,calc((100%-1120px)/2))] flex gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-sm:gap-4"
              >
                {products.map((product, index) => (
                  <div
                    className="w-[262px] shrink-0 max-sm:w-[230px]"
                    key={product.id}
                  >
                    <ProductCard
                      product={product}
                      featured={index === 0}
                      saved={wishlist.includes(product.id)}
                      onSave={() => save(product)}
                      onAdd={() => addToCart(product)}
                      onView={() => openProduct(product)}
                    />
                  </div>
                ))}
              </div>
              <div className={`${container} mt-12`}>
                <input
                  aria-label="Scroll through new arrivals"
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(progress * 100)}
                  onChange={(event) => {
                    const carousel = carouselRef.current
                    const value = Number(event.target.value) / 100
                    setProgress(value)
                    if (carousel)
                      carousel.scrollTo({
                        left:
                          (carousel.scrollWidth - carousel.clientWidth) * value,
                        behavior: "instant",
                      })
                  }}
                  className="block h-1 w-full cursor-pointer appearance-none rounded-full bg-[#e8ecef] [&::-webkit-slider-thumb]:h-1 [&::-webkit-slider-thumb]:w-[74.464%] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#343839] [&::-moz-range-thumb]:h-1 [&::-moz-range-thumb]:w-[74.464%] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#343839]"
                />
              </div>
            </section>

            <section
              aria-label="Store benefits"
              className={`${container} grid grid-cols-4 gap-6 py-12 max-[999px]:grid-cols-2 max-sm:gap-3 max-sm:py-8`}
              data-node-id="4:1804"
            >
              {[
                {
                  icon: "8e7ba.svg",
                  title: "Free Shipping",
                  description: "Order above $200",
                },
                {
                  icon: "8a0b0.svg",
                  title: "Money-back",
                  description: "30 days guarantee",
                },
                {
                  icon: "7b757.svg",
                  title: "Secure Payments",
                  description: "Secured by Stripe",
                },
                {
                  icon: "1457b.svg",
                  title: "24/7 Support",
                  description: "Phone and Email support",
                },
              ].map((benefit) => (
                <div
                  key={benefit.title}
                  className="flex flex-col items-start gap-4 bg-card px-8 py-12 max-[1199px]:px-5 max-sm:px-4 max-sm:py-6"
                >
                  <Icon file={benefit.icon} />
                  <div className="flex flex-col gap-2">
                    <h3
                      className={`${heading} whitespace-nowrap text-[20px] leading-7 max-sm:text-[15px]`}
                    >
                      {benefit.title}
                    </h3>
                    <p className="font-['Poppins:Regular'] text-[14px] leading-6 text-muted-foreground max-sm:text-xs">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </section>

            <section
              className="grid h-[532px] grid-cols-2 max-md:h-auto max-md:grid-cols-1"
              data-node-id="4:1825"
            >
              <div className="relative overflow-hidden max-md:aspect-[720/532]">
                <img
                  src={asset("d3f04.png")}
                  alt="Orange sectional sofa in a room with houseplants, an arched mirror, and a patterned rug"
                  className="absolute left-0 top-[-27.46%] h-[135.34%] w-full max-w-none"
                />
              </div>
              <div className="flex flex-col items-start justify-center gap-6 bg-card pl-[72px] pr-6 max-[1199px]:px-10 max-md:py-12 max-sm:px-6">
                <div className="flex flex-col gap-4">
                  <p className="font-['Inter:Bold'] text-[16px] font-bold uppercase leading-4 text-accent">
                    SALE UP TO 35% OFF
                  </p>
                  <h2 className={sectionTitle}>
                    HUNDREDS of
                    <br />
                    New lower prices!
                  </h2>
                  <p className="w-[452px] max-w-full text-[20px] leading-8 max-sm:text-base">
                    It’s more affordable than ever to give every room in your
                    home a stylish makeover
                  </p>
                </div>
                <TextLink onClick={() => shop()}>Shop Now</TextLink>
              </div>
            </section>

            <section
              id="articles"
              className={`${container} py-20 max-sm:py-12`}
              data-node-id="4:1837"
            >
              <div className="mb-10 flex w-[1121px] items-center justify-between max-[1199px]:w-full">
                <h2 className={`${sectionTitle} text-black`}>Articles</h2>
                <TextLink
                  onClick={() => setModal("articles")}
                  className="max-sm:text-sm"
                >
                  More Articles
                </TextLink>
              </div>
              <div className="grid grid-cols-[repeat(3,357px)] gap-[25px] max-[1199px]:grid-cols-3 max-md:grid-cols-1 max-md:gap-8">
                {articles.map((article) => (
                  <article key={article.title} className="flex flex-col gap-6">
                    <button
                      onClick={() => {
                        setSelectedArticle(article)
                        setModal("article")
                      }}
                      className="aspect-[357/325] overflow-hidden"
                    >
                      <img
                        src={asset(article.image)}
                        alt={article.alt}
                        className="h-full w-full object-cover"
                      />
                    </button>
                    <div className="flex flex-col items-start gap-2">
                      <h3
                        className={`${heading} text-[20px] leading-7 text-[#23262f]`}
                      >
                        {article.title}
                      </h3>
                      <TextLink
                        file="97b05.svg"
                        onClick={() => {
                          setSelectedArticle(article)
                          setModal("article")
                        }}
                      >
                        Read More
                      </TextLink>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
        {!isContact && !isCart && !isCheckout && !isOrderComplete && !isAccountPage && (
          <section
            className="relative flex h-[360px] items-start justify-center overflow-hidden bg-[#f2f4f6] max-sm:h-[320px]"
            data-node-id="4:1872"
          >
            <img
              src={asset("bae71.png")}
              alt="Grey armchair with a knitted cream throw"
              className={`absolute left-[68.96%] top-[-27.69%] h-[184.1%] w-[69%] max-w-none mix-blend-multiply max-md:opacity-20 ${
                isInnerPage ? "invisible" : ""
              }`}
            />
            <img
              src={asset("bec81.png")}
              alt="White chest of drawers"
              className={`absolute left-[-20.29%] top-[-32.78%] h-[174.22%] w-[52.37%] max-w-none mix-blend-multiply max-md:hidden ${
                isInnerPage ? "invisible" : ""
              }`}
            />
            <div className="relative mt-[101px] flex w-[540px] max-w-[calc(100%-48px)] flex-col items-center gap-8 max-sm:mt-16">
              <div className="flex flex-col gap-2 text-center">
                <h2 className={sectionTitle}>Join Our Newsletter</h2>
                <p className="text-[18px] leading-[30px] max-sm:text-[15px]">
                  Sign up for deals, new products and promotions
                </p>
              </div>
              <form
                onSubmit={subscribe}
                className="flex h-[52px] w-[488px] max-w-full items-center gap-2 border-b border-input"
              >
                <Icon file="78ae7.svg" />
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setSubscribed(false)
                  }}
                  required
                  placeholder="Email address"
                  className={`${medium} min-w-0 flex-1 bg-transparent text-[16px] leading-7 tracking-[-0.4px] placeholder:text-muted-foreground focus:outline-none`}
                />
                <button
                  type="submit"
                  disabled={subscribed}
                  className={`${medium} text-[16px] leading-7 tracking-[-0.4px] text-muted-foreground hover:text-foreground`}
                >
                  {subscribed ? "Subscribed!" : "Signup"}
                </button>
              </form>
              {subscribed && (
                <p role="status" className="absolute top-full mt-2 text-sm">
                  You're on the list. Welcome to 3legant!
                </p>
              )}
            </div>
          </section>
        )}
      </main>

      <footer
        id="footer"
        className="bg-primary pb-8 pt-20 text-white max-md:pt-12"
        data-node-id="4:1888"
      >
        <div className={`${container} flex flex-col gap-[49px]`}>
          <div className="flex min-h-8 items-start justify-between gap-8 max-md:flex-col max-md:items-center">
            <div className="flex items-center gap-8 max-sm:flex-col max-sm:gap-4">
              <Link
                to={isInnerPage ? "/" : "#"}
                className={`${heading} w-[105px] shrink-0 pr-1.5 text-center text-[24px] leading-6`}
              >
                3legant
                <span
                  className={isCart ? "text-white" : "text-muted-foreground"}
                >
                  .
                </span>
              </Link>
              <span className="h-6 w-px bg-muted-foreground max-sm:h-px max-sm:w-6" />
              <p className="text-[14px] leading-[22px] text-[#e8ecef]">
                Gift &amp; Decoration Store
              </p>
            </div>
            <nav
              aria-label="Footer navigation"
              className="flex gap-10 pt-px text-[14px] leading-[22px] max-sm:flex-wrap max-sm:justify-center max-sm:gap-6"
            >
              {isInnerPage ? <Link to="/">Home</Link> : <a href="#">Home</a>}
              <button
                onClick={() =>
                  isContact || isArticleDetail || isBlog || isCart || isCheckout || isOrderComplete || isAccountPage
                    ? navigate("/shop")
                    : shop()
                }
              >
                Shop
              </button>
              <Link to={isInnerPage ? "/#new-arrivals" : "#new-arrivals"}>
                Product
              </Link>
              <Link to="/blog">Blog</Link>
              <Link to="/contact">Contact Us</Link>
            </nav>
          </div>
          <div className="flex w-[1118px] max-w-full items-start justify-between gap-6 border-t-[0.5px] border-[#6c7275] pb-[15px] pt-4 max-md:flex-col max-md:items-center">
            <div className="flex items-start gap-7 text-[12px] leading-5 max-sm:flex-wrap max-sm:justify-center max-sm:gap-4">
              <p className="font-['Poppins:Regular'] text-[#e8ecef]">
                Copyright © 2023 3legant. All rights reserved
              </p>
              <button
                className="font-['Poppins:SemiBold'] font-semibold"
                onClick={() =>
                  showInfo(
                    "Privacy Policy",
                    "This storefront preview does not transmit or store personal data on a server. Newsletter and account forms are local demonstrations.",
                  )
                }
              >
                Privacy Policy
              </button>
              <button
                className="font-['Poppins:SemiBold'] font-semibold"
                onClick={() =>
                  showInfo(
                    "Terms of Use",
                    "This is a storefront preview. Purchases and payments are not processed. Product availability and pricing are for demonstration purposes.",
                  )
                }
              >
                Terms of Use
              </button>
            </div>
            <div className="flex gap-6">
              {[
                {
                  icon: "4c463.svg",
                  name: "Instagram",
                  url: "https://www.instagram.com/",
                },
                {
                  icon: "32b36.svg",
                  name: "Facebook",
                  url: "https://www.facebook.com/",
                },
                {
                  icon: "edaba.svg",
                  name: "YouTube",
                  url: "https://www.youtube.com/",
                },
              ].map((social) => (
                <a
                  href={social.url}
                  key={social.name}
                  aria-label={social.name}
                  target="_blank"
                  rel="noreferrer"
                  className="relative after:absolute after:-inset-2"
                >
                  <Icon file={social.icon} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {editingAddress && isAddressPage && (
        <Modal
          title={`Edit ${editingAddress} address`}
          onClose={() => setEditingAddress(null)}
        >
          <AddressEditor
            address={addresses[editingAddress]}
            onCancel={() => setEditingAddress(null)}
            onSave={(address) => {
              setAddresses((current) => ({
                ...current,
                [editingAddress]: address,
              }))
              setEditingAddress(null)
              setNotice(
                "Address updated for this preview only. Changes reset on refresh.",
              )
            }}
          />
        </Modal>
      )}

      {modal === "gallery" && (
        <Modal title={galleryImage.alt} onClose={() => setModal(null)}>
          <img
            src={galleryImage.src}
            alt={galleryImage.alt}
            className="max-h-[70dvh] w-full object-contain"
          />
        </Modal>
      )}
      {notice && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 w-max max-w-[calc(100%-32px)] -translate-x-1/2 rounded-lg bg-primary px-6 py-4 text-sm text-white shadow-xl"
        >
          {notice}
        </div>
      )}
      {modal === "cart" && (
        <CartDrawer
          items={cart.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            color: item.product.color,
            imageSrc: productImage(item.product),
            imageFit: item.product.id === "table-lamp" ? "contain" : "cover",
            unitPrice: item.product.price,
            quantity: item.quantity,
          }))}
          onClose={() => setModal(null)}
          onQuantityChange={(id, quantity) =>
            setCart((current) =>
              current.map((item) =>
                item.product.id === id
                  ? { ...item, quantity: Math.max(1, quantity) }
                  : item,
              ),
            )
          }
          onRemove={(id) =>
            setCart((current) =>
              current.filter((item) => item.product.id !== id),
            )
          }
          onCheckout={() => {
            setModal(null)
            navigate("/cart")
          }}
          onViewCart={() => setModal("cart-details")}
          onShop={() => shop()}
        />
      )}
      {modal === "cart-details" && (
        <Modal title="Your shopping cart" onClose={() => setModal(null)}>
          {cart.length ? (
            <>
              <div className="divide-y divide-border">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex gap-4 py-4">
                    <img
                      src={productImage(item.product)}
                      alt={item.product.name}
                      className="size-20 bg-card object-contain mix-blend-multiply"
                    />
                    <div className="flex-1">
                      <p className={`${semibold} text-sm`}>
                        {item.product.name}
                      </p>
                      <p className="mt-1 text-sm">
                        {price(item.product.price)}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <button
                          aria-label={`Decrease quantity of ${item.product.name}`}
                          onClick={() =>
                            setCart((current) =>
                              current.flatMap((entry) =>
                                entry.product.id !== item.product.id
                                  ? [entry]
                                  : entry.quantity > 1
                                    ? [
                                        {
                                          ...entry,
                                          quantity: entry.quantity - 1,
                                        },
                                      ]
                                    : [],
                              ),
                            )
                          }
                          className="size-8 rounded border border-border"
                        >
                          −
                        </button>
                        <span className="tabular-nums">{item.quantity}</span>
                        <button
                          aria-label={`Increase quantity of ${item.product.name}`}
                          onClick={() => addToCart(item.product)}
                          className="size-8 rounded border border-border"
                        >
                          +
                        </button>
                        <button
                          onClick={() =>
                            setCart((current) =>
                              current.filter(
                                (entry) => entry.product.id !== item.product.id,
                              ),
                            )
                          }
                          className="ml-auto text-xs text-muted-foreground underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="my-6 flex justify-between border-t border-border pt-4">
                <span className={semibold}>Subtotal</span>
                <span className={semibold}>{price(total)}</span>
              </div>
              <button
                className={`${blackButton} w-full py-3`}
                onClick={() => {
                  setCheckoutDeliveryFee(0)
                  setModal("checkout")
                }}
              >
                Checkout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-4">
              <p>Your cart is empty. Find something lovely for your home.</p>
              <button className={`${blackButton} py-3`} onClick={() => shop()}>
                Explore products
              </button>
            </div>
          )}
        </Modal>
      )}
      {modal === "checkout" && (
        <Modal title="You're almost there" onClose={() => setModal(null)}>
          <p className="mb-6 leading-7">
            Your cart is ready, with a subtotal of {price(total)}. This is a
            storefront preview; no payment will be collected.
          </p>
          {checkoutDeliveryFee > 0 && (
            <dl className="mb-6 space-y-3">
              <div className="flex justify-between gap-4">
                <dt>Demo delivery fee</dt>
                <dd>{price(checkoutDeliveryFee)}</dd>
              </div>
              <div className={`${semibold} flex justify-between gap-4`}>
                <dt>Total</dt>
                <dd>{price(total + checkoutDeliveryFee)}</dd>
              </div>
            </dl>
          )}
          <button
            onClick={() => setModal("cart")}
            className={`${blackButton} w-full py-3`}
          >
            Back to your cart
          </button>
        </Modal>
      )}
      {(modal === "search" || modal === "catalog") && (
        <Modal
          title={
            modal === "search"
              ? "Find something lovely"
              : room === "All"
                ? "Shop our collection"
                : room
          }
          onClose={() => setModal(null)}
        >
          <label htmlFor="product-search" className="sr-only">
            Search products
          </label>
          <input
            id="product-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search furniture, lighting, and more…"
            className="mb-4 w-full rounded-lg border border-border px-4 py-3"
          />
          <div className="mb-5 flex flex-wrap gap-2">
            {["All", "Living Room", "Bedroom", "Kitchen"].map((value) => (
              <button
                key={value}
                aria-pressed={room === value}
                onClick={() => setRoom(value)}
                className={`rounded-full border border-border px-3 py-2 text-xs ${
                  room === value ? "bg-primary text-white" : "hover:bg-card"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => openProduct(product)}
                className="flex items-center gap-4 rounded-lg p-2 text-left hover:bg-card"
              >
                <img
                  src={productImage(product)}
                  alt=""
                  className="size-16 object-contain"
                />
                <span className="flex-1 text-sm">{product.name}</span>
                <span className="text-sm">{price(product.price)}</span>
              </button>
            ))}
            {!filteredProducts.length && (
              <p className="py-6 text-muted-foreground">
                No products found. Try a different room or search.
              </p>
            )}
          </div>
        </Modal>
      )}
      {modal === "account" && (
        <Modal title="Welcome to 3legant." onClose={() => setModal(null)}>
          <p className="mb-6 text-muted-foreground">
            Make yourself at home. Sign in to save your favorites.
          </p>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              setNotice("This preview does not connect to an account service.")
            }}
          >
            <label className="flex flex-col gap-2 text-sm">
              Email address
              <input
                type="email"
                required
                className="rounded-lg border border-border px-4 py-3"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Password
              <input
                type="password"
                required
                minLength={8}
                className="rounded-lg border border-border px-4 py-3"
              />
            </label>
            <Link
              to="/signin"
              onClick={() => setModal(null)}
              className={`${blackButton} mt-2 py-3 text-center`}
            >
              Sign in
            </Link>
          </form>
        </Modal>
      )}
      {modal === "articles" && (
        <Modal title="Stories for a better home" onClose={() => setModal(null)}>
          <div className="flex flex-col gap-6">
            {articles.map((article) => (
              <button
                key={article.title}
                onClick={() => {
                  setSelectedArticle(article)
                  setModal("article")
                }}
                className="flex items-center gap-4 text-left"
              >
                <img
                  src={asset(article.image)}
                  alt={article.alt}
                  className="size-24 shrink-0 object-cover"
                />
                <span className={`${heading} text-lg`}>{article.title}</span>
              </button>
            ))}
          </div>
        </Modal>
      )}
      {modal === "article" && (
        <Modal title={selectedArticle.title} onClose={() => setModal(null)}>
          <img
            src={asset(selectedArticle.image)}
            alt={selectedArticle.alt}
            className="mb-6 aspect-[357/250] w-full object-cover"
          />
          <p className="leading-7">{selectedArticle.text}</p>
          <div className="mt-6 flex flex-col gap-3">
            {articles
              .filter((article) => article !== selectedArticle)
              .map((article) => (
                <button
                  key={article.title}
                  onClick={() => setSelectedArticle(article)}
                  className="text-left text-sm underline"
                >
                  {article.title}
                </button>
              ))}
          </div>
        </Modal>
      )}
      {modal === "info" && (
        <Modal title={info.title} onClose={() => setModal(null)}>
          <p className="leading-7">{info.text}</p>
        </Modal>
      )}
      {selectedProduct && (
        <Modal
          title={selectedProduct.name}
          onClose={() => setSelectedProduct(null)}
        >
          <img
            src={productImage(selectedProduct)}
            alt={selectedProduct.name}
            className="mx-auto mb-6 h-64 w-full bg-card object-contain mix-blend-multiply"
          />
          <div className="mb-4 flex justify-between">
            <span className={`${semibold} text-xl`}>
              {price(selectedProduct.price)}
            </span>
            <span className="text-sm text-muted-foreground">
              {selectedProduct.room}
            </span>
          </div>
          <p className="mb-6 leading-7">
            A thoughtful addition to your home. Free shipping on orders above
            $200, with a 30-day money-back guarantee.
          </p>
          <button
            onClick={() => addToCart(selectedProduct)}
            className={`${blackButton} w-full py-3`}
          >
            Add to cart
          </button>
          <button
            onClick={() => save(selectedProduct)}
            className="mt-3 w-full py-3 text-sm underline"
          >
            {wishlist.includes(selectedProduct.id)
              ? "Remove from wishlist"
              : "Save to wishlist"}
          </button>
        </Modal>
      )}
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: "/",
    Component: Storefront,
    children: [
      { index: true, element: null },
      { path: "shop", element: null },
      { path: "blog", element: null },
      { path: "contact", element: null },
      { path: "signup", element: null },
      { path: "signin", element: null },
      { path: "auth/callback", element: null },
      { path: "auth-callback.html", element: null },
      { path: articleDetailPath.slice(1), element: null },
      { path: "cart", element: null },
      { path: "checkout", element: null },
      { path: "order-complete", element: null },
      { path: "account/orders", element: null },
      { path: "account", element: null },
      { path: "account/address", element: null },
      { path: "account/wishlist", element: null },
      { path: "product/:productId", element: null },
      { path: "*", element: null },
    ],
  },
])

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
