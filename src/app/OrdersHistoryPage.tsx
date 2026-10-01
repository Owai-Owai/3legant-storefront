import { useEffect, useRef, useState } from "react"
import { Link } from "react-router"
import type { DemoOrder } from "./OrderCompletePage"
import AccountDetailsPage from "./AccountDetailsPage"
import type { AccountProfile } from "./AccountDetailsPage"
import AddressPage from "./AddressPage"
import type { AddressBook, AddressKind } from "./AddressPage"
import WishlistPage from "./WishlistPage"
import type { Product } from "./App"
import { useAuth } from "@/lib/AuthContext"

type OrdersHistoryPageProps = {
  orders: readonly DemoOrder[]
  onMenuAction: (label: string) => void
  activeSection?: "Account" | "Address" | "Orders" | "Wishlist"
  addresses: AddressBook
  onEditAddress: (kind: AddressKind) => void
  wishlistItems: readonly Product[]
  onRemoveWishlist: (product: Product) => void
  onAddWishlist: (product: Product) => void
}

const sampleOrders = [
  {
    code: "#3456_768",
    date: "October 17, 2023",
    status: "Delivered",
    price: "$1234.00",
  },
  {
    code: "#3456_980",
    date: "October 11, 2023",
    status: "Delivered",
    price: "$345.00",
  },
  {
    code: "#3456_120",
    date: "August 24, 2023",
    status: "Delivered",
    price: "$2345.00",
  },
  {
    code: "#3456_030",
    date: "August 12, 2023",
    status: "Delivered",
    price: "$845.00",
  },
]

const semibold = "font-['Inter:Semi_Bold'] font-semibold"
const columns = "grid grid-cols-[160px_120px_120px_137px] justify-between"

export default function OrdersHistoryPage({
  orders,
  onMenuAction,
  activeSection = "Orders",
  addresses,
  onEditAddress,
  wishlistItems,
  onRemoveWishlist,
  onAddWishlist,
}: OrdersHistoryPageProps) {
  const { user, profile: authProfile, updateProfile, uploadAvatar, signOut } = useAuth()

  const [profile, setProfile] = useState<AccountProfile>({
    firstName: authProfile?.first_name || "",
    lastName: authProfile?.last_name || "",
    displayName: authProfile?.display_name || user?.user_metadata?.full_name || "",
    email: authProfile?.email || user?.email || "",
  })

  useEffect(() => {
    if (authProfile || user) {
      setProfile({
        firstName: authProfile?.first_name || "",
        lastName: authProfile?.last_name || "",
        displayName: authProfile?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "",
        email: authProfile?.email || user?.email || "",
      })
    }
  }, [authProfile, user])

  const profileName = profile.displayName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Sofia Havertz"
  const initials = profileName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part: string) => part[0])
    .join("")
    .toUpperCase()
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [avatarSrc, setAvatarSrc] = useState<string | null>(authProfile?.avatar_url || null)
  const [avatarError, setAvatarError] = useState("")

  useEffect(() => {
    if (authProfile?.avatar_url) {
      setAvatarSrc(authProfile.avatar_url)
    }
  }, [authProfile?.avatar_url])

  const rows = [...[...orders].reverse().map((order) => ({
      code: order.code,
      date: new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(order.createdAt)),
      status: "Demo order",
      price: `$${order.total.toFixed(2)}`,
    })), ...sampleOrders]

  return (
    <section
      className="mx-auto w-full max-w-[1120px] pb-20 max-[1199px]:px-6 max-md:pb-12"
      aria-labelledby="account-title"
      data-node-id={
        activeSection === "Wishlist"
          ? "17:10346"
          : activeSection === "Address"
            ? "17:10143"
            : activeSection === "Account"
              ? "16:9759"
              : "11:9326"
      }
    >
      <div className="flex justify-center py-20 max-md:py-10">
        <h1
          id="account-title"
          className="font-['Poppins:Medium'] text-[54px] font-medium leading-[58px] tracking-[-1px] text-black max-sm:text-[40px] max-sm:leading-[44px]"
        >
          My Account
        </h1>
      </div>
      <div className="flex items-start gap-[7px] max-lg:gap-8 max-md:flex-col">
        <aside
          className={`${semibold} flex w-[262px] shrink-0 flex-col items-center gap-10 rounded-lg bg-card px-4 py-10 max-md:w-full max-sm:gap-6 max-sm:py-6`}
          aria-label="Account menu"
          data-node-id="11:9330"
        >
          <div className="flex flex-col items-center gap-1.5">
            <div className="relative size-[82px]">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={`${profileName} profile photo`}
                  className="size-[82px] rounded-full object-cover"
                  onError={() => {
                    setAvatarSrc(null)
                    setAvatarError(
                      "This image could not be opened. Please choose another photo.",
                    )
                  }}
                />
              ) : (
                <div
                  role="img"
                  aria-label={`${profileName} avatar placeholder`}
                  className="flex size-[82px] items-center justify-center rounded-full border-2 border-white bg-secondary font-['Poppins:Medium'] text-[28px] font-medium leading-8 text-muted-foreground"
                >
                  {initials}
                </div>
              )}
              <button
                type="button"
                aria-label="Edit profile photo"
                aria-describedby="profile-photo-note"
                onClick={() => photoInputRef.current?.click()}
                className="absolute left-[45px] top-[47px] flex size-10 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <span className="flex size-[30px] items-center justify-center rounded-full border-[1.5px] border-white bg-primary transition-colors hover:bg-[#343839]">
                  <img
                    src="/assets/account/camera.svg"
                    alt=""
                    aria-hidden="true"
                  />
                </span>
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                tabIndex={-1}
                aria-label="Choose profile photo"
                className="hidden"
                onChange={async (event) => {
                  const file = event.currentTarget.files?.[0]
                  event.currentTarget.value = ""
                  if (!file) return
                  if (
                    ![
                      "image/jpeg",
                      "image/png",
                      "image/webp",
                      "image/gif",
                    ].includes(file.type)
                  ) {
                    setAvatarError("Choose a JPG, PNG, WebP, or GIF image.")
                    return
                  }
                  if (file.size > 5 * 1024 * 1024) {
                    setAvatarError("Choose an image smaller than 5 MB.")
                    return
                  }
                  setAvatarError("")
                  const res = await uploadAvatar(file)
                  if (res.error) {
                    setAvatarError("Failed to upload avatar.")
                  } else if (res.url) {
                    setAvatarSrc(res.url)
                  }
                }}
              />
            </div>
            <p className="max-w-full break-words text-center text-[20px] leading-8 text-black">
              {profileName}
            </p>
            <span id="profile-photo-note" className="sr-only">
              Choose a photo up to 5 MB.
            </span>
            {avatarError && (
              <p
                role="alert"
                className="max-w-[230px] text-center text-[12px] font-normal leading-5 text-destructive"
              >
                {avatarError}
              </p>
            )}
          </div>
          <nav
            className="flex w-full flex-col gap-3 max-md:grid max-md:grid-cols-3 max-sm:grid-cols-2"
            aria-label="Account sections"
          >
            {["Account", "Address", "Orders", "Wishlist", "Log Out"].map(
              (label) => {
                const className = `flex h-[42px] items-center border-b text-left text-[16px] leading-[26px] transition-colors hover:text-foreground ${
                  label === activeSection
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground"
                }`
                return label === "Orders" ||
                  label === "Account" ||
                  label === "Address" ||
                  label === "Wishlist" ? (
                  <Link
                    key={label}
                    to={
                      label === "Account"
                        ? "/account"
                        : label === "Address"
                          ? "/account/address"
                          : label === "Wishlist"
                            ? "/account/wishlist"
                            : "/account/orders"
                    }
                    aria-current={label === activeSection ? "page" : undefined}
                    className={className}
                  >
                    {label}
                  </Link>
                ) : (
                  <button
                    key={label}
                    type="button"
                    className={className}
                    onClick={async () => {
                      if (label === "Log Out") {
                        await signOut()
                      }
                      onMenuAction(label)
                    }}
                  >
                    {label}
                  </button>
                )
              },
            )}
          </nav>
        </aside>
        <div
          className="flex min-w-0 flex-1 flex-col gap-10 px-[72px] max-lg:px-0 max-md:w-full max-sm:gap-6"
          data-node-id={
            activeSection === "Wishlist"
              ? "17:10361"
              : activeSection === "Address"
                ? "17:10158"
                : activeSection === "Account"
                  ? "16:9774"
                  : "11:9340"
          }
        >
          {activeSection === "Wishlist" ? (
            <WishlistPage
              items={wishlistItems}
              onRemove={onRemoveWishlist}
              onAdd={onAddWishlist}
            />
          ) : activeSection === "Address" ? (
            <AddressPage addresses={addresses} onEdit={onEditAddress} />
          ) : activeSection === "Account" ? (
            <AccountDetailsPage
              profile={profile}
              onSave={async (saved) => {
                setProfile(saved)
                await updateProfile({
                  first_name: saved.firstName,
                  last_name: saved.lastName,
                  display_name: saved.displayName,
                  email: saved.email,
                })
              }}
            />
          ) : (
            <>
              <h2
                id="history-title"
                className={`${semibold} text-[20px] leading-8 text-black`}
              >
                Orders History
              </h2>
              <div
                className="w-full overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                role="region"
                aria-labelledby="history-title"
                tabIndex={0}
              >
                <table className="w-full min-w-[707px] border-collapse font-['Inter:Regular'] text-[14px] font-normal leading-[22px] text-foreground">
                  <caption className="sr-only">
                    Preview orders from this session followed by four sample
                    orders from the design. Sofia Havertz is a sample profile.
                    No real payments or deliveries are recorded.
                  </caption>
                  <thead>
                    <tr
                      className={`${columns} h-[30px] border-b border-border pb-2 text-muted-foreground`}
                    >
                      {["Number ID", "Dates", "Status", "Price"].map(
                        (label) => (
                          <th
                            key={label}
                            scope="col"
                            className="text-left font-normal"
                          >
                            {label}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((order) => (
                      <tr
                        key={order.code}
                        className={`${columns} h-[70px] items-center border-b border-border`}
                      >
                        <td>{order.code}</td>
                        <td>{order.date}</td>
                        <td>{order.status}</td>
                        <td>{order.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
