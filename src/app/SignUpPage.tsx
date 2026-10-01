import { useRef, useState } from "react"
import type { FormEvent } from "react"
import { Link, useLocation, useNavigate, useSearchParams } from "react-router"
import AuthLayout, { GoogleAuthButton } from "./AuthLayout"
import { useAuth } from "@/lib/AuthContext"

const assetPathPrefix = "/assets/signup"
const inputClass =
  "h-[26px] w-full min-w-0 bg-transparent p-0 font-['Inter:Regular'] text-[16px] font-normal leading-[26px] text-foreground placeholder:text-muted-foreground"
const fields = [
  {
    name: "fullName",
    label: "Your name",
    type: "text",
    autocomplete: "name",
    node: "19:13630",
  },
  {
    name: "username",
    label: "Username",
    type: "text",
    autocomplete: "username",
    node: "19:13634",
  },
  {
    name: "email",
    label: "Email address",
    type: "email",
    autocomplete: "email",
    node: "19:13638",
  },
]

export default function SignUpPage({
  onPreviewLogin,
}: {
  onPreviewLogin?: () => void
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const redirectTarget = searchParams.get("redirect") || (location.state as any)?.from || "/"

  const { signUp, signInWithGoogle, isConfigured } = useAuth()
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const passwordRef = useRef<HTMLInputElement>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")
    const form = event.currentTarget
    
    for (const fieldName of ["fullName", "username", "email"]) {
      const field = form.elements.namedItem(fieldName) as HTMLInputElement
      field.setCustomValidity(
        field.value.trim() ? "" : "Please complete this field.",
      )
    }
    if (!form.reportValidity()) return

    const fullNameInput = form.elements.namedItem("fullName") as HTMLInputElement
    const emailInput = form.elements.namedItem("email") as HTMLInputElement
    const password = passwordRef.current?.value ?? ""

    if (password.length < 6) {
      passwordRef.current?.setCustomValidity("Password must be at least 6 characters.")
      form.reportValidity()
      return
    }

    setLoading(true)

    if (isConfigured) {
      const email = emailInput.value.trim()
      const { error, data } = await signUp(email, password, fullNameInput.value.trim(), redirectTarget)
      setLoading(false)
      if (error) {
        setMessage(error.message || "Failed to create account.")
        return
      }

      if (data?.session) {
        // Automatically signed in
        navigate(redirectTarget)
      } else {
        // Confirmation email sent!
        // Return the user back to where they came from with verification state
        const separator = redirectTarget.includes("?") ? "&" : "?"
        navigate(`${redirectTarget}${separator}email_verification_sent=true&email=${encodeURIComponent(email)}`)
      }
    } else {
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
      nodeId="19:13615"
      contentNodeId="19:13621"
      titleId="signup-title"
    >
      <div className="flex flex-col gap-6" data-node-id="19:13622">
        <h1
          id="signup-title"
          className="font-['Poppins:Medium'] text-[40px] font-medium leading-[44px] tracking-[-0.4px]"
        >
          Sign up
        </h1>
        <p className="font-['Inter:Regular'] text-[16px] leading-[26px] text-muted-foreground">
          Already have an account?{" "}
          <Link
            to={searchParams.get("redirect") ? `/signin?redirect=${encodeURIComponent(searchParams.get("redirect")!)}` : "/signin"}
            className="relative font-['Inter:Semi_Bold'] font-semibold text-[#38cb89] after:absolute after:-inset-y-2"
          >
            Sign in
          </Link>
        </p>
      </div>
      <form
        method="post"
        onSubmit={submit}
        onInput={() => setMessage("")}
        className="flex w-full flex-col gap-8"
      >
        <div className="flex w-full flex-col gap-8" data-node-id="19:13629">
          {fields.map((field) => (
            <div
              key={field.name}
              className="h-10 w-full border-b border-border"
              data-node-id={field.node}
            >
              <label htmlFor={`signup-${field.name}`} className="sr-only">
                {field.label}
              </label>
              <input
                id={`signup-${field.name}`}
                name={field.name}
                type={field.type}
                autoComplete={field.autocomplete}
                placeholder={field.label}
                required
                onChange={(event) => event.currentTarget.setCustomValidity("")}
                className={inputClass}
              />
            </div>
          ))}
          <div
            className="relative h-10 w-full border-b border-border"
            data-node-id="19:13642"
          >
            <label htmlFor="signup-password" className="sr-only">
              Password
            </label>
            <input
              ref={passwordRef}
              id="signup-password"
              type={passwordVisible ? "text" : "password"}
              autoComplete="new-password"
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
              <img src={`${assetPathPrefix}/89b80.svg`} alt="" />
            </button>
          </div>
          <div className="flex items-center gap-3" data-node-id="19:13648">
            <span className="relative flex size-6 shrink-0 items-center justify-center">
              <input
                id="signup-agreement"
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                required
                aria-label="I agree with Privacy Policy and Terms of Use"
                className="size-6 cursor-pointer appearance-none rounded-[4px] border-[1.5px] border-muted-foreground bg-[#fcfcfd] checked:border-foreground"
              />
              {agreed && (
                <img
                  src={`${assetPathPrefix}/3a7bd.svg`}
                  alt=""
                  className="pointer-events-none absolute inset-0"
                />
              )}
            </span>
            <p className="min-w-0 flex-1 font-['Inter:Regular'] text-[16px] leading-[26px] text-muted-foreground">
              <label htmlFor="signup-agreement" className="cursor-pointer">
                I agree with{" "}
              </label>
              <span className="font-['Inter:Semi_Bold'] font-semibold text-foreground">
                Privacy Policy
              </span>{" "}
              and{" "}
              <span className="font-['Inter:Semi_Bold'] font-semibold text-foreground">
                Terms of Use
              </span>
            </p>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-lg bg-primary px-10 font-['Inter:Medium'] text-[16px] font-medium leading-7 tracking-[-0.4px] text-white hover:bg-[#343839] disabled:opacity-50"
          data-node-id="19:13651"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
        <p
          className="text-center font-['Inter:Regular'] text-[16px] leading-[26px]"
          data-node-id="19:13652"
        >
          or
        </p>
        <GoogleAuthButton
          onClick={handleGoogleLogin}
          nodeId="19:13653"
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
