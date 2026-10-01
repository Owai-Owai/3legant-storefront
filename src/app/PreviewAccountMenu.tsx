import { useEffect, useRef } from "react"
import { Link } from "react-router"
import { useAuth } from "@/lib/AuthContext"

export default function PreviewAccountMenu({
  onSignOut,
}: {
  onSignOut?: () => void
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const { user, profile, signOut } = useAuth()

  const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "My Account"
  const email = profile?.email || user?.email || ""
  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part: string) => part[0])
    .join("")
    .toUpperCase() || "ME"

  function close() {
    if (detailsRef.current) detailsRef.current.open = false
  }

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!detailsRef.current?.contains(event.target as Node)) close()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && detailsRef.current?.open) {
        close()
        detailsRef.current.querySelector("summary")?.focus()
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  const handleSignOut = async () => {
    close()
    await signOut()
    if (onSignOut) onSignOut()
  }

  return (
    <details ref={detailsRef} className="group relative">
      <summary
        aria-label={`Account menu for ${displayName}`}
        className="relative flex size-7 cursor-pointer list-none items-center justify-center rounded-full bg-primary font-['Inter:Semi_Bold'] text-[11px] font-semibold leading-4 text-white after:absolute after:-inset-2 hover:bg-[#343839] overflow-hidden [&::-webkit-details-marker]:hidden"
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="size-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </summary>
      <div className="absolute right-0 top-[calc(100%+16px)] z-30 w-64 rounded-lg border border-border bg-white p-2 text-foreground shadow-lg max-sm:-right-8">
        <div className="mb-2 border-b border-border px-3 py-3">
          <p className="font-['Inter:Semi_Bold'] text-[16px] font-semibold leading-[26px] truncate">
            {displayName}
          </p>
          {email && (
            <p className="text-[12px] leading-5 text-muted-foreground truncate">
              {email}
            </p>
          )}
        </div>
        <nav aria-label="Signed-in account">
          {[
            { label: "My account", path: "/account" },
            { label: "Orders", path: "/account/orders" },
            { label: "Wishlist", path: "/account/wishlist" },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={close}
              className="flex min-h-11 items-center rounded px-3 text-[14px] leading-6 hover:bg-card"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-2 flex min-h-11 w-full items-center border-t border-border px-3 text-left text-[14px] leading-6 text-red-600 hover:bg-card"
        >
          Sign out
        </button>
      </div>
    </details>
  )
}
