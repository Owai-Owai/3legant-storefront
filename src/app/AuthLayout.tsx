import type { ReactNode } from "react"
import { Link } from "react-router"

export default function AuthLayout({
  children,
  nodeId,
  contentNodeId,
  titleId,
}: {
  children: ReactNode
  nodeId: string
  contentNodeId: string
  titleId: string
}) {
  return (
    <main
      className="grid min-h-dvh w-full grid-cols-[736fr_704fr] overflow-x-clip bg-white text-foreground max-md:grid-cols-1"
      data-node-id={nodeId}
    >
      <section
        aria-label="3legant furniture"
        className="relative min-h-dvh overflow-hidden bg-card max-md:h-[360px] max-md:min-h-0"
      >
        <img
          src="/assets/furniture/bae71.png"
          alt="Grey armchair with a knitted cream throw"
          className="absolute left-[-0.9%] top-[18.28%] aspect-[1051.0816/701.028] h-auto w-[142.81%] max-w-none mix-blend-multiply max-md:left-1/2 max-md:top-16 max-md:aspect-auto max-md:w-[110%] max-md:max-w-[480px] max-md:-translate-x-1/2"
        />
        <Link
          to="/"
          aria-label="3legant home"
          className="absolute left-[calc(50%-0.5px)] top-8 w-[105px] -translate-x-1/2 pr-1.5 text-center font-['Poppins:Medium'] text-[24px] font-medium leading-6 text-black"
        >
          3legant<span className="text-muted-foreground">.</span>
        </Link>
      </section>
      <section
        aria-labelledby={titleId}
        className="min-w-0 pb-12 pl-[12.5%] pr-[22.727272%] pt-[clamp(64px,20.37037vh,220px)] max-[1199px]:px-10 max-md:py-12 max-sm:px-6"
      >
        <div
          className="flex w-full max-w-[456px] flex-col gap-8 bg-[#fefefe] max-md:mx-auto"
          data-node-id={contentNodeId}
        >
          {children}
        </div>
      </section>
    </main>
  )
}

export function GoogleAuthButton({
  onClick,
  nodeId,
  image = "/assets/signup/ddb5d.svg",
}: {
  onClick: () => void
  nodeId: string
  image?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-foreground px-6 font-['Inter:Medium'] text-[16px] font-medium leading-7 tracking-[-0.4px] hover:bg-card"
      data-node-id={nodeId}
    >
      <span
        aria-hidden="true"
        className="relative h-6 w-[23px] shrink-0 overflow-hidden"
      >
        <span className="absolute inset-[-0.43%_-0.75%_-0.73%_-0.75%] [mask-image:url('/assets/signup/c87b4.svg')] [mask-mode:alpha] [mask-repeat:no-repeat] [mask-position:0.172px_0.103px] [mask-size:23px_24px]">
          <img
            src={image}
            alt=""
            className="absolute left-[-3.97%] top-[-9.57%] max-w-none"
          />
        </span>
      </span>
      Continue with Google
    </button>
  )
}
