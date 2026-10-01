import { useEffect, useRef, useState } from "react"
import type { FormEvent } from "react"
import { Link, useLocation, useNavigate, useSearchParams } from "react-router"
import AuthLayout, { GoogleAuthButton } from "./AuthLayout"
import { useAuth } from "@/lib/AuthContext"

const inputClass =
  "h-[26px] w-full min-w-0 bg-transparent p-0 font-['Inter:Regular'] text-[16px] font-normal leading-[26px] text-foreground placeholder:text-muted-foreground"

export default function SignInPage({
  onPreviewLogin,
}: {
  onPreviewLogin?: () => void
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const redirectTarget = searchParams.get("redirect") || (location.state as any)?.from || "/account"

  const { signIn, signInWithGoogle, isConfigured } = useAuth()
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [remembered, setRemembered] = useState(false)
  const [message, setMessage] = useState(() => {
    if (searchParams.get("verified") === "true") {
      return "Your email has been verified! You can now sign in."
    }
    return ""
  })
  const [loading, setLoading] = useState(false)
  const passwordRef = useRef<HTMLInputElement>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")
    const form = event.currentTarget
    const identityInput = form.elements.namedItem("identity") as HTMLInputElement
    const passwordInput = passwordRef.current

    const identity = identityInput.value.trim()
    const password = passwordInput?.value ?? ""

    if (!identity) {
      identityInput.setCustomValidity("Please enter your email address.")
      form.reportValidity()
      return
    }

    if (!password) {
      passwordInput?.setCustomValidity("Please enter your password.")
      form.reportValidity()
      return
    }

    setLoading(true)

    if (isConfigured) {
      const { error } = await signIn(identity, password)
      setLoading(false)
      if (error) {
        setMessage(error.message || "Failed to sign in. Please check your credentials.")
        return
      }
      navigate(redirectTarget)
    } else {
      // Fallback preview mode
      setLoading(false)
      if (onPreviewLogin) onPreviewLogin()
      else navigate(redirectTarget)
    }
  }

  async function handleGoogleLogin() {
    setMessage("")
    if (!isConfigured) {
      setMessage("Google sign-in requires Supabase credentials in .env.local.")
      return
    }
    setLoading(true)
    const { error } = await signInWithGoogle()
    setLoading(false)
    if (error) {
      setMessage(error.message)
    }
  }

  return (
    <AuthLayout
      nodeId="20:13699"
      contentNodeId="20:13705"
      titleId="signin-title"
    >
      <div className="flex flex-col gap-6" data-node-id="20:13706">
        <h1
          id="signin-title"
          className="font-['Poppins:Medium'] text-[40px] font-medium leading-[44px] tracking-[-0.4px]"
        >
          Sign In
        </h1>
        <p className="font-['Inter:Regular'] text-[16px] leading-[26px] text-muted-foreground">
          Don’t have an account yet?{" "}
          <Link
            to={searchParams.get("redirect") ? `/signup?redirect=${encodeURIComponent(searchParams.get("redirect")!)}` : "/signup"}
            className="relative font-['Inter:Semi_Bold'] font-semibold text-[#38cb89] after:absolute after:-inset-y-2"
          >
            Sign Up
          </Link>
        </p>
      </div>
      <form
        method="post"
        onSubmit={submit}
        onInput={() => setMessage("")}
        className="flex w-full flex-col gap-8"
      >
        <div className="flex w-full flex-col gap-8" data-node-id="20:13712">
          <div
            className="h-10 w-full border-b border-border"
            data-node-id="20:13713"
          >
            <label htmlFor="signin-identity" className="sr-only">
              Email address
            </label>
            <input
              id="signin-identity"
              name="identity"
              type="email"
              autoComplete="username"
              placeholder="Your email address"
              required
              onChange={(event) => event.currentTarget.setCustomValidity("")}
              className={inputClass}
            />
          </div>
          <div
            className="relative h-10 w-full border-b border-border"
            data-node-id="20:13717"
          >
            <label htmlFor="signin-password" className="sr-only">
              Password
            </label>
            <input
              ref={passwordRef}
              id="signin-password"
              type={passwordVisible ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Password"
              required
              onChange={(event) => event.currentTarget.setCustomValidity("")}
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              aria-label={passwordVisible ? "Hide password" : "Show password"}
              aria-pressed={passwordVisible}
              onClick={() => setPasswordVisible((visible) => !visible)}
              className="absolute right-0 top-1 after:absolute after:-inset-2"
            >
              <img src="/assets/signup/89b80.svg" alt="" />
            </button>
          </div>
          <div
            className="flex min-h-[26px] flex-wrap items-center justify-between gap-x-4 gap-y-3"
            data-node-id="20:13722"
          >
            <label
              htmlFor="signin-remember"
              className="flex cursor-pointer items-center gap-3 font-['Inter:Regular'] text-[16px] leading-[26px] text-muted-foreground"
            >
              <span className="relative flex size-6 shrink-0 items-center justify-center">
                <input
                  id="signin-remember"
                  type="checkbox"
                  checked={remembered}
                  onChange={(event) => setRemembered(event.target.checked)}
                  className="size-6 cursor-pointer appearance-none rounded-[4px] border-[1.5px] border-muted-foreground bg-[#fcfcfd] checked:border-foreground"
                />
                {remembered && (
                  <img
                    src="/assets/signup/3a7bd.svg"
                    alt=""
                    className="pointer-events-none absolute inset-0"
                  />
                )}
              </span>
              Remember me
            </label>
            <button
              type="button"
              onClick={() =>
                setMessage(
                  "Password recovery link can be sent to your email. Check your inbox.",
                )
              }
              className="relative font-['Inter:Semi_Bold'] text-[16px] font-semibold leading-[26px] after:absolute after:-inset-y-2"
            >
              Forgot password?
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-lg bg-primary px-10 font-['Inter:Medium'] text-[16px] font-medium leading-7 tracking-[-0.4px] text-white hover:bg-[#343839] disabled:opacity-50"
          data-node-id="20:13726"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p
          className="text-center font-['Inter:Regular'] text-[16px] leading-[26px]"
          data-node-id="20:13727"
        >
          or
        </p>
        <GoogleAuthButton
          nodeId="20:13728"
          image="/assets/signin/ddb5d.svg"
          onClick={handleGoogleLogin}
        />
        {message && (
          <p
            role="status"
            className="font-['Inter:Regular'] text-[14px] leading-[22px] text-muted-foreground"
          >
            {message}
          </p>
        )}
      </form>
    </AuthLayout>
  )
}
