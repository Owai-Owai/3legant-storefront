import { useRef, useState } from "react"
import type { FormEvent } from "react"

export type AccountProfile = {
  firstName: string
  lastName: string
  displayName: string
  email: string
}

type AccountDetailsPageProps = {
  profile: AccountProfile
  onSave: (profile: AccountProfile) => void
}

const fields = [
  {
    key: "firstName",
    label: "First name *",
    placeholder: "First name",
    autocomplete: "given-name",
  },
  {
    key: "lastName",
    label: "Last name *",
    placeholder: "Last name",
    autocomplete: "family-name",
  },
  {
    key: "displayName",
    label: "Display name *",
    placeholder: "Display name",
    autocomplete: "nickname",
  },
  {
    key: "email",
    label: "Email *",
    placeholder: "Email",
    autocomplete: "email",
  },
] as const

const inputClass =
  "h-10 w-full min-w-0 rounded-[6px] border border-[#cbcbcb] bg-white px-4 font-['Inter:Regular'] text-[16px] font-normal leading-[26px] text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
const labelClass =
  "font-['Inter:Bold'] text-[12px] font-bold uppercase leading-3 text-muted-foreground"
const titleClass =
  "font-['Inter:Semi_Bold'] text-[20px] font-semibold leading-8 text-black"

export default function AccountDetailsPage({
  profile,
  onSave,
}: AccountDetailsPageProps) {
  const [draft, setDraft] = useState(profile)
  const [message, setMessage] = useState("")
  const oldPasswordRef = useRef<HTMLInputElement>(null)
  const newPasswordRef = useRef<HTMLInputElement>(null)
  const repeatPasswordRef = useRef<HTMLInputElement>(null)

  const passwordFields = [
    { id: "old", label: "Old password", ref: oldPasswordRef },
    { id: "new", label: "New password", ref: newPasswordRef },
    { id: "repeat", label: "Repeat new password", ref: repeatPasswordRef },
  ]

  const saveChanges = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    for (const field of fields) {
      const input = form.elements.namedItem(field.key) as HTMLInputElement
      input.setCustomValidity(
        input.value.trim() ? "" : "Please fill out this field.",
      )
    }
    const hasPassword = passwordFields.some(({ ref }) =>
      Boolean(ref.current?.value),
    )
    if (hasPassword) {
      for (const { ref } of passwordFields) {
        ref.current?.setCustomValidity(
          ref.current.value
            ? ""
            : "Complete all three password fields, or leave them all empty.",
        )
      }
      if (newPasswordRef.current?.value !== repeatPasswordRef.current?.value) {
        repeatPasswordRef.current?.setCustomValidity(
          "The new passwords must match.",
        )
      }
    }
    if (!form.reportValidity()) return
    const saved = {
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      displayName: draft.displayName.trim(),
      email: draft.email.trim(),
    }
    onSave(saved)
    setDraft(saved)
    for (const { ref } of passwordFields) {
      if (ref.current) ref.current.value = ""
    }
    setMessage(
      hasPassword
        ? "Profile changes saved for this preview only. Passwords were cleared, not saved or changed."
        : "Profile changes saved for this preview only. No account service was contacted.",
    )
  }

  return (
    <form
      className="flex w-full min-w-0 flex-col gap-10"
      onSubmit={saveChanges}
      onInput={(event) => {
        setMessage("")
        if (event.target instanceof HTMLInputElement)
          event.target.setCustomValidity("")
        for (const { ref } of passwordFields) ref.current?.setCustomValidity("")
      }}
      aria-describedby="account-preview-note"
      data-node-id="16:9774"
    >
      <fieldset
        className="flex w-full min-w-0 flex-col gap-6"
        aria-labelledby="details-title"
      >
        <h2 id="details-title" className={titleClass}>
          Account Details
        </h2>
        {fields.map((field) => (
          <div key={field.key} className="flex w-full flex-col gap-3">
            <label htmlFor={`account-${field.key}`} className={labelClass}>
              {field.label}
            </label>
            <input
              id={`account-${field.key}`}
              name={field.key}
              type={field.key === "email" ? "email" : "text"}
              autoComplete={field.autocomplete}
              required
              placeholder={field.placeholder}
              value={draft[field.key]}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  [field.key]: event.target.value,
                }))
              }
              className={inputClass}
              aria-describedby={
                field.key === "displayName" ? "display-name-help" : undefined
              }
            />
            {field.key === "displayName" && (
              <p
                id="display-name-help"
                className="font-['Inter:Italic'] text-[12px] font-normal italic leading-5 text-muted-foreground"
              >
                This will be how your name will be displayed in the account
                section and in reviews
              </p>
            )}
          </div>
        ))}
      </fieldset>
      <fieldset
        className="flex w-full min-w-0 flex-col items-start gap-6"
        aria-labelledby="password-title"
      >
        <h2 id="password-title" className={titleClass}>
          Password
        </h2>
        {passwordFields.map((field) => (
          <div key={field.id} className="flex w-full flex-col gap-3">
            <label
              htmlFor={`account-password-${field.id}`}
              className={labelClass}
            >
              {field.label}
            </label>
            <input
              ref={field.ref}
              id={`account-password-${field.id}`}
              type="password"
              autoComplete="off"
              placeholder={field.label}
              className={inputClass}
            />
          </div>
        ))}
        <button
          type="submit"
          className="rounded-lg bg-primary px-10 py-3 font-['Inter:Medium'] text-[16px] font-medium leading-7 tracking-[-0.4px] text-white transition-colors hover:bg-[#343839] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Save changes
        </button>
      </fieldset>
      <p id="account-preview-note" className="sr-only">
        UI preview only. Profile changes are temporary. Password changes are not
        connected to an account service and passwords are never saved or
        submitted.
      </p>
      {message && (
        <p
          role="status"
          className="rounded-lg bg-card p-4 text-[14px] leading-[22px] text-foreground"
        >
          {message}
        </p>
      )}
    </form>
  )
}
