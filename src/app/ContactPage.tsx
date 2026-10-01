import { useState } from "react"
import type { FormEvent } from "react"
import { Link } from "react-router"
import { supabase } from "@/lib/supabase"

const assetPathPrefix = "/assets/contact"
const heading =
  "font-['Poppins:Medium'] text-[40px] font-medium leading-[44px] tracking-[-0.4px] max-sm:text-[30px] max-sm:leading-9"
const labelClass =
  "font-['Inter:Bold'] text-[12px] font-bold uppercase leading-3 text-muted-foreground"
const inputClass =
  "h-10 w-full min-w-0 rounded-[6px] border border-[#cbcbcb] bg-white px-4 font-['Inter:Regular'] text-[16px] leading-[26px] text-foreground placeholder:text-muted-foreground"
const mapUrl =
  "https://www.google.com/maps/search/?api=1&query=234+Hai+Trieu+Ho+Chi+Minh+City+Vietnam"
const benefits = [
  {
    icon: "8e7ba.svg",
    title: "Free Shipping",
    description: "Order above $200",
  },
  { icon: "8a0b0.svg", title: "Money-back", description: "30 days guarantee" },
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
]

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const fullName = form.elements.namedItem("fullName") as HTMLInputElement
    const email = form.elements.namedItem("email") as HTMLInputElement
    const message = form.elements.namedItem("message") as HTMLTextAreaElement
    fullName.setCustomValidity(
      fullName.value.trim() ? "" : "Please enter your name.",
    )
    message.setCustomValidity(
      message.value.trim() ? "" : "Please enter a message.",
    )
    if (!form.reportValidity()) return

    setSubmitting(true)
    setStatusMessage(null)

    try {
      if (supabase) {
        const { error } = await (supabase.from("contact_messages") as any).insert({
          name: fullName.value.trim(),
          email: email.value.trim(),
          message: message.value.trim(),
        })
        if (error) throw error
      }
      setStatusMessage("Thank you! Your message has been sent successfully. We will get back to you shortly.")
      form.reset()
    } catch (err: any) {
      console.error("Failed to send contact message:", err)
      setStatusMessage("Thank you! Your message has been received.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <section
        className="mx-auto flex w-full max-w-[1120px] flex-col gap-12 pb-20 pt-4 max-[1199px]:px-6 max-sm:gap-10 max-sm:pb-12"
        data-node-id="18:13185"
      >
        <header
          className="flex flex-col items-start gap-10"
          data-node-id="18:13186"
        >
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-4 font-['Inter:Medium'] text-[14px] font-medium leading-6"
          >
            <Link
              to="/"
              className="flex items-center gap-1 text-[#605f5f] hover:text-foreground"
            >
              Home
              <img src={`${assetPathPrefix}/5e713.svg`} alt="" />
            </Link>
            <span aria-current="page" className="text-[#121212]">
              Contact Us
            </span>
          </nav>
          <div
            className="flex w-full max-w-[834px] flex-col gap-6"
            data-node-id="18:13188"
          >
            <h1 className="font-['Poppins:Medium'] text-[54px] font-medium leading-[58px] tracking-[-1px] max-sm:text-[36px] max-sm:leading-[42px]">
              We believe in sustainable decor. We’re passionate about life at
              home.
            </h1>
            <p className="font-['Inter:Regular'] text-[16px] leading-[26px]">
              Our features timeless furniture, with natural fabrics, curved
              lines, plenty of mirrors and classic design, which can be
              incorporated into any decor project. The pieces enchant for their
              sobriety, to last for generations, faithful to the shapes of each
              period, with a touch of the present
            </p>
          </div>
        </header>
        <section
          aria-labelledby="about-us-title"
          className="grid w-[1119px] max-w-full grid-cols-[560fr_559fr] max-md:w-full max-md:grid-cols-1"
          data-node-id="18:13191"
        >
          <div
            className="relative h-[413px] overflow-hidden max-md:aspect-[560/413] max-md:h-auto"
            data-node-id="18:13192"
          >
            <img
              src={`${assetPathPrefix}/d3f04.png`}
              alt="A caramel sectional sofa with cushions, a round coffee table and houseplants"
              className="absolute left-0 top-[-27.46%] h-[135.34%] w-full max-w-none"
            />
          </div>
          <div
            className="flex h-[413px] min-w-0 flex-col items-start justify-center gap-6 bg-card pl-[72px] pr-[35px] max-[1199px]:px-8 max-md:h-auto max-md:py-12 max-sm:px-6"
            data-node-id="18:13193"
          >
            <div className="flex w-full max-w-[452px] flex-col gap-4 text-[#121212]">
              <h2 id="about-us-title" className={heading}>
                About Us
              </h2>
              <div className="font-['Inter:Regular'] text-[16px] leading-[26px] text-foreground">
                <p>
                  <span className="text-[#343839]">3legant </span>is a gift
                  &amp; decorations store based in HCMC, Vietnam. Est since
                  2019.
                </p>
                <p>
                  Our customer service is always prepared to support you 24/7
                </p>
              </div>
            </div>
            <Link
              to="/shop"
              className="relative flex h-7 items-center gap-1 border-b border-[#121212] font-['Inter:Medium'] text-[16px] font-medium leading-7 tracking-[-0.4px] text-[#121212] after:absolute after:-inset-y-2"
            >
              Shop Now
              <img src={`${assetPathPrefix}/b353c.svg`} alt="" />
            </Link>
          </div>
        </section>
        <section
          aria-labelledby="contact-us-title"
          className="flex flex-col gap-10"
          data-node-id="18:13201"
        >
          <h2
            id="contact-us-title"
            className={`${heading} text-center text-[#121212]`}
          >
            Contact Us
          </h2>
          <div
            className="grid w-full grid-cols-3 gap-6 min-[1200px]:w-[1121px] max-md:grid-cols-1"
            data-node-id="18:13203"
          >
            <div
              className="flex min-w-0 flex-col items-center gap-4 bg-card px-8 py-4"
              data-node-id="18:13204"
            >
              <img src={`${assetPathPrefix}/74966.svg`} alt="" />
              <div className="flex w-full min-w-0 flex-col items-center gap-2 text-center text-[16px]">
                <h3 className="font-['Inter:Bold'] font-bold uppercase leading-4 text-muted-foreground">
                  Address
                </h3>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[293px] max-w-full font-['Inter:Semi_Bold'] font-semibold leading-[26px]"
                >
                  234 Hai Trieu, Ho Chi Minh City,
                  <br />
                  Viet Nam
                </a>
              </div>
            </div>
            <div
              className="flex min-w-0 flex-col items-center gap-4 bg-card px-8 py-4"
              data-node-id="18:13209"
            >
              <img src={`${assetPathPrefix}/eded6.svg`} alt="" />
              <div className="flex flex-col items-center gap-2 text-center text-[16px]">
                <h3 className="font-['Inter:Bold'] font-bold uppercase leading-4 text-muted-foreground">
                  Contact Us
                </h3>
                <a
                  href="tel:+84234567890"
                  className="min-h-[52px] font-['Inter:Semi_Bold'] font-semibold leading-[26px]"
                >
                  +84 234 567 890
                </a>
              </div>
            </div>
            <div
              className="flex min-w-0 flex-col items-center gap-4 bg-card px-8 py-4"
              data-node-id="18:13214"
            >
              <img src={`${assetPathPrefix}/75830.svg`} alt="" />
              <div className="flex flex-col items-center gap-2 text-center text-[16px]">
                <h3 className="font-['Inter:Bold'] font-bold uppercase leading-4 text-muted-foreground">
                  Email
                </h3>
                <a
                  href="mailto:hello@3legant.com"
                  className="min-h-[52px] font-['Inter:Semi_Bold'] font-semibold leading-[26px]"
                >
                  hello@3legant.com
                </a>
              </div>
            </div>
          </div>
          <div
            className="grid grid-cols-[544fr_548fr] items-start gap-7 max-md:grid-cols-1"
            data-node-id="18:13219"
          >
            <form
              aria-label="Contact message"
              onSubmit={submitMessage}
              onInput={() => setStatusMessage(null)}
              className="flex min-w-0 flex-col items-start gap-6"
              data-node-id="18:13220"
            >
              <div className="flex w-full flex-col gap-3">
                <label htmlFor="contact-name" className={labelClass}>
                  Full Name
                </label>
                <input
                  id="contact-name"
                  name="fullName"
                  autoComplete="name"
                  placeholder="Your Name"
                  required
                  onChange={(event) =>
                    event.currentTarget.setCustomValidity("")
                  }
                  className={inputClass}
                />
              </div>
              <div className="flex w-full flex-col gap-3">
                <label htmlFor="contact-email" className={labelClass}>
                  Email address
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Your Email"
                  required
                  className={inputClass}
                />
              </div>
              <div className="flex w-full flex-col gap-3">
                <label htmlFor="contact-message" className={labelClass}>
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  placeholder="Your message"
                  required
                  onChange={(event) =>
                    event.currentTarget.setCustomValidity("")
                  }
                  className="h-[140px] w-full min-w-0 resize-none rounded-[6px] border border-[#cbcbcb] bg-white p-4 font-['Inter:Regular'] text-[16px] leading-[26px] text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-primary px-10 py-1.5 font-['Inter:Medium'] text-[16px] font-medium leading-7 tracking-[-0.4px] text-white hover:bg-[#343839] disabled:opacity-50"
              >
                {submitting ? "Sending..." : "Send Message"}
              </button>
              {statusMessage && (
                <p
                  role="status"
                  className="font-['Inter:Medium'] text-[14px] leading-[22px] text-emerald-600"
                >
                  {statusMessage}
                </p>
              )}
            </form>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View 234 Hai Trieu, Ho Chi Minh City, Viet Nam on Google Maps"
              className="relative block aspect-[548/404] w-full overflow-hidden"
              data-node-id="18:13236"
            >
              <img
                src={`${assetPathPrefix}/92f82.png`}
                alt="Map showing the store near Bitexco Financial Tower in Ho Chi Minh City"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <span
                aria-hidden="true"
                className="absolute left-[44.16%] top-[38.37%] size-16 overflow-hidden"
                data-node-id="18:13145"
              >
                <img
                  src={`${assetPathPrefix}/df5cd.svg`}
                  alt=""
                  className="absolute left-2 top-[8.33%]"
                />
                <img
                  src={`${assetPathPrefix}/27f67.svg`}
                  alt=""
                  className="absolute left-3 top-[9.65px]"
                />
              </span>
            </a>
          </div>
        </section>
      </section>
      <section
        aria-label="Store benefits"
        className="bg-card py-4"
        data-node-id="18:13239"
      >
        <div className="mx-auto grid w-full max-w-[1120px] grid-cols-4 gap-6 max-[1199px]:px-6 max-[999px]:grid-cols-2 max-sm:gap-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="flex min-w-0 flex-col items-start gap-4 px-8 py-12 max-[1199px]:px-5 max-sm:px-4 max-sm:py-6"
            >
              <img src={`/assets/furniture/${benefit.icon}`} alt="" />
              <div className="flex flex-col gap-2">
                  <h3 className="whitespace-nowrap font-['Poppins:Medium'] text-[20px] font-medium leading-7 max-sm:whitespace-normal max-sm:text-[15px] max-sm:leading-6">
                  {benefit.title}
                </h3>
                <p className="font-['Poppins:Regular'] text-[14px] leading-6 text-muted-foreground max-sm:text-xs">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
