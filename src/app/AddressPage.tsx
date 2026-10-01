import { useState } from "react"
import type { FormEvent } from "react"

export type AddressKind = "billing" | "shipping"
export type AddressRecord = {
  fullName: string
  phone: string
  street: string
  city: string
  country: string
}
export type AddressBook = Record<AddressKind, AddressRecord>

export const sampleAddress: AddressRecord = {
  fullName: "Sofia Havertz",
  phone: "(+1) 234 567 890",
  street: "345 Long Island",
  city: "NewYork",
  country: "United States",
}

const addressKinds: AddressKind[] = ["billing", "shipping"]
const titles: Record<AddressKind, string> = {
  billing: "Billing Address",
  shipping: "Shipping Address",
}
const semibold = "font-['Inter:Semi_Bold'] font-semibold"

export default function AddressPage({
  addresses,
  onEdit,
}: {
  addresses: AddressBook
  onEdit: (kind: AddressKind) => void
}) {
  return (
    <section
      className="flex w-full min-w-0 flex-col gap-[19px]"
      aria-labelledby="address-title"
      data-node-id="17:10158"
    >
      <h2
        id="address-title"
        className={`${semibold} text-[20px] leading-8 text-black`}
      >
        Address
      </h2>
      <div className="grid w-full grid-cols-2 items-start gap-[23px] max-[1199px]:grid-cols-1">
        {addressKinds.map((kind) => (
          <article
            key={kind}
            className="flex min-h-[140px] min-w-0 flex-col items-center gap-2 rounded-lg border border-muted-foreground px-4 py-[15px]"
            aria-labelledby={`${kind}-address-title`}
          >
            <div
              className={
                kind === "billing"
                  ? "flex w-max max-w-full items-start gap-[127px] max-[1199px]:w-[291px] max-[1199px]:justify-between max-[1199px]:gap-2"
                  : "flex w-[291px] max-w-full items-start justify-between gap-2"
              }
            >
              <h3
                id={`${kind}-address-title`}
                className={`${semibold} text-[16px] leading-[26px] text-black`}
              >
                {titles[kind]}
              </h3>
              <button
                type="button"
                aria-label={`Edit ${titles[kind].toLowerCase()}`}
                onClick={() => onEdit(kind)}
                className={`${semibold} relative flex shrink-0 items-center gap-1 text-[16px] leading-[26px] text-muted-foreground transition-colors after:absolute after:inset-x-0 after:-inset-y-[7px] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring`}
              >
                <img
                  src="/assets/address/3b02c.svg"
                  alt=""
                  aria-hidden="true"
                  className="max-w-none shrink-0"
                />
                Edit
              </button>
            </div>
            <address className="flex w-[293px] max-w-full flex-col gap-1 break-words font-['Inter:Regular'] text-[14px] font-normal not-italic leading-[22px] text-black">
              <p>{addresses[kind].fullName}</p>
              <p>{addresses[kind].phone}</p>
              <p>
                {addresses[kind].street}, {addresses[kind].city},{" "}
                {addresses[kind].country}
              </p>
            </address>
          </article>
        ))}
      </div>
      <p className="sr-only">
        Sample addresses for this UI preview. Changes stay in memory until
        refresh and are not submitted to a database or used for delivery.
      </p>
    </section>
  )
}

const editorFields = [
  { key: "fullName", label: "Full name", autocomplete: "name" },
  { key: "phone", label: "Phone number", autocomplete: "tel" },
  { key: "street", label: "Street address", autocomplete: "address-line1" },
  { key: "city", label: "City", autocomplete: "address-level2" },
  { key: "country", label: "Country", autocomplete: "country-name" },
] as const

export function AddressEditor({
  address,
  onSave,
  onCancel,
}: {
  address: AddressRecord
  onSave: (address: AddressRecord) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState(address)
  const saveAddress = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    for (const field of editorFields) {
      const input = event.currentTarget.elements.namedItem(
        field.key,
      ) as HTMLInputElement
      input.setCustomValidity(
        input.value.trim() ? "" : "Please fill out this field.",
      )
    }
    if (!event.currentTarget.reportValidity()) return
    onSave({
      fullName: draft.fullName.trim(),
      phone: draft.phone.trim(),
      street: draft.street.trim(),
      city: draft.city.trim(),
      country: draft.country.trim(),
    })
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={saveAddress}>
      <p className="text-[14px] leading-[22px] text-muted-foreground">
        Edit this sample address for the current preview only. Nothing is
        uploaded or saved to an account.
      </p>
      {editorFields.map((field) => (
        <div key={field.key} className="flex flex-col gap-3">
          <label
            htmlFor={`edit-address-${field.key}`}
            className="font-['Inter:Bold'] text-[12px] font-bold uppercase leading-3 text-muted-foreground"
          >
            {field.label} *
          </label>
          <input
            id={`edit-address-${field.key}`}
            name={field.key}
            type={field.key === "phone" ? "tel" : "text"}
            autoComplete={field.autocomplete}
            required
            value={draft[field.key]}
            onChange={(event) => {
              event.currentTarget.setCustomValidity("")
              setDraft((current) => ({
                ...current,
                [field.key]: event.target.value,
              }))
            }}
            className="h-10 w-full min-w-0 rounded-[6px] border border-[#cbcbcb] bg-white px-4 font-['Inter:Regular'] text-[16px] font-normal leading-[26px] text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-lg bg-primary px-6 py-3 font-['Inter:Medium'] text-[16px] font-medium leading-7 text-white transition-colors hover:bg-[#343839]"
        >
          Save changes
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-6 py-3 text-[16px] leading-7 transition-colors hover:bg-card"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
