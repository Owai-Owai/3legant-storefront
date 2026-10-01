import { useRef, useState } from "react"
import type { ReactNode } from "react"
import { Link } from "react-router"
import type { Product } from "./App"

const assetPathPrefix = "/assets/product"
const heading = "font-['Poppins:Medium'] font-medium"
const medium = "font-['Inter:Medium'] font-medium"
const semibold = "font-['Inter:Semi_Bold'] font-semibold"
const container = "mx-auto w-[calc(100%-48px)] max-w-[1120px]"
const price = (amount: number) => `$${amount.toFixed(2)}`
const variants = [
  { color: "Black", image: "4925a.png", width: "w-[72px]" },
  { color: "Natural", image: "813e1.png", width: "w-[71px]" },
  { color: "Red", image: "44165.png", width: "w-[71px]" },
  { color: "White", image: "981d8.png", width: "w-[72px]" },
]
const galleryFiles = [
  "4925a.png",
  "61e3f.png",
  "76350.png",
  "65a32.png",
  "c3e0f.png",
  "c98c2.png",
]
const galleryDescriptions = [
  "Black tray table",
  "Tray table beside a grey sofa",
  "Removable tray used for serving",
  "Overhead view of the tray table",
  "Close-up of the tray edge",
  "Tray table with coffee and a vase",
]

function DetailIcon({ file }: { file: string }) {
  return (
    <img
      src={`${assetPathPrefix}/${file}`}
      alt=""
      aria-hidden="true"
      className="block max-w-none shrink-0"
    />
  )
}

type ProductDetailPageProps = {
  product?: Product
  saved: boolean
  onSave: () => void
  onAdd: (product: Product, quantity: number) => void
  onViewImage: (src: string, alt: string) => void
  recommendations: Product[]
  renderRecommendation: (product: Product, first: boolean) => ReactNode
}

export default function ProductDetailPage({
  product,
  saved,
  onSave,
  onAdd,
  onViewImage,
  recommendations,
  renderRecommendation,
}: ProductDetailPageProps) {
  const [quantity, setQuantity] = useState(1)
  const [variantIndex, setVariantIndex] = useState(0)
  const [openPanels, setOpenPanels] = useState(["additional"])
  const [scrollProgress, setScrollProgress] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const reviewsRef = useRef<HTMLButtonElement>(null)

  if (!product) {
    return (
      <section
        className={`${container} flex min-h-96 flex-col items-start justify-center gap-6 py-16`}
      >
        <h1 className={`${heading} text-[40px] leading-[44px]`}>
          Product not found
        </h1>
        <p className="text-muted-foreground">
          This product is not available in the current catalog.
        </p>
        <Link
          to="/shop"
          className={`${medium} rounded-lg bg-primary px-8 py-3 text-white`}
        >
          Back to Shop
        </Link>
      </section>
    )
  }

  const isTrayTable = product.id === "shop-tray-table"
  const color = isTrayTable
    ? variants[variantIndex].color
    : (product.color ?? "Standard")
  const mainImage = isTrayTable
    ? `${assetPathPrefix}/${variants[variantIndex].image}`
    : `${product.imagePrefix ?? "/assets/furniture"}/${product.image}`
  const photos = isTrayTable
    ? galleryFiles.map((file, index) => ({
        src: index === 0 ? mainImage : `${assetPathPrefix}/${file}`,
        alt: index === 0 ? `${color} tray table` : galleryDescriptions[index],
      }))
    : [{ src: mainImage, alt: product.name }]
  const description = isTrayTable
    ? "Buy one or buy a few and make every space where you sit more convenient. Light and easy to move around with removable tray top, handy for serving snacks."
    : "Product details are not available in this preview."
  const togglePanel = (panel: string) =>
    setOpenPanels((current) =>
      current.includes(panel)
        ? current.filter((value) => value !== panel)
        : [...current, panel],
    )
  const cartProduct =
    isTrayTable && variantIndex !== 0
      ? {
          ...product,
          id: `${product.id}--${color.toLowerCase()}`,
          color,
          image: variants[variantIndex].image,
          imagePrefix: assetPathPrefix,
        }
      : product

  return (
    <>
      <section
        className="flex flex-col gap-4 pb-10 pt-4"
        aria-label="Product details"
        data-node-id="5:4858"
      >
        <nav
          aria-label="Breadcrumb"
          className={`${container} ${medium} flex flex-wrap items-center gap-4 text-[14px] leading-6 text-[#605f5f] max-sm:gap-2`}
        >
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-foreground"
          >
            Home
            <DetailIcon file="9029f.svg" />
          </Link>
          <Link
            to="/shop"
            className="flex items-center gap-1 hover:text-foreground"
          >
            Shop
            <DetailIcon file="9029f.svg" />
          </Link>
          <Link
            to="/shop"
            className="flex items-center gap-1 hover:text-foreground"
          >
            {product.room}
            <DetailIcon file="9029f.svg" />
          </Link>
          <span aria-current="page" className="text-[#121212]">
            Product
          </span>
        </nav>

        <div
          className={`${container} grid grid-cols-[548px_508px] items-start gap-[63px] max-[1199px]:grid-cols-2 max-[1199px]:gap-8 max-lg:grid-cols-1`}
        >
          <div
            className="grid min-w-0 grid-cols-2 items-start gap-6 max-[379px]:gap-3"
            aria-label="Product gallery"
            data-node-id="5:4861"
          >
            {photos.map((photo, index) => (
              <button
                key={photo.src}
                onClick={() => onViewImage(photo.src, photo.alt)}
                aria-label={`Enlarge product photo ${index + 1}: ${photo.alt}`}
                className={`relative aspect-[262/349] overflow-hidden bg-card ${
                  !isTrayTable ? "col-span-2" : ""
                }`}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className={`absolute max-w-none ${
                    isTrayTable && index === 0
                      ? "left-[-15.06%] top-[5.17%] h-[89.66%] w-[130.12%] mix-blend-multiply"
                      : isTrayTable
                        ? "inset-0 size-full object-cover mix-blend-multiply"
                        : `mix-blend-multiply ${product.geometry}`
                  }`}
                />
                {index === 0 && (
                  <div className="absolute left-4 top-4 flex flex-col items-start gap-[9px] font-['Inter:Bold'] text-[18px] font-bold leading-[18px] max-[379px]:left-3 max-[379px]:top-3 max-[379px]:text-[16px]">
                    <span className="rounded bg-white px-[18px] py-2 text-[#121212] max-[379px]:px-3">
                      NEW
                    </span>
                    <span className="rounded bg-[#38cb89] px-[18px] py-2 text-[#fefefe] max-[379px]:px-3">
                      -50%
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="min-w-0" data-node-id="5:4875">
            <div className="flex flex-col items-start gap-4 border-b border-border pb-[15px]">
              <button
                onClick={() => {
                  setOpenPanels((current) =>
                    current.includes("reviews")
                      ? current
                      : [...current, "reviews"],
                  )
                  requestAnimationFrame(() => {
                    reviewsRef.current?.focus({ preventScroll: true })
                    reviewsRef.current?.scrollIntoView({
                      block: "center",
                      behavior: window.matchMedia(
                        "(prefers-reduced-motion: reduce)",
                      ).matches
                        ? "instant"
                        : "smooth",
                    })
                  })
                }}
                className="flex items-center gap-[10px] text-[12px] leading-5"
                aria-label={isTrayTable ? "Read 11 reviews" : "View reviews"}
              >
                {isTrayTable && (
                  <span
                    className="flex h-4 gap-0.5"
                    aria-label="5 out of 5 stars"
                  >
                    {Array.from({ length: 5 }, (_, index) => (
                      <DetailIcon key={index} file="c4bac.svg" />
                    ))}
                  </span>
                )}
                {isTrayTable ? "11 Reviews" : "Reviews not available"}
              </button>
              <h1
                className={`${heading} text-[40px] leading-[44px] tracking-[-0.4px] max-sm:text-[32px] max-sm:leading-[38px]`}
              >
                {product.name}
              </h1>
              <p className="text-[16px] leading-[26px] text-muted-foreground">
                {description}
              </p>
              <div className={`${heading} flex items-center gap-3`}>
                <p className="text-[28px] leading-[34px] tracking-[-0.6px] text-[#121212]">
                  {price(product.price)}
                </p>
                {product.oldPrice && (
                  <p className="text-[20px] leading-7 text-muted-foreground line-through">
                    {price(product.oldPrice)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-start gap-4 py-4">
              <div className="flex flex-col gap-2">
                <h2
                  className={`${semibold} text-[16px] leading-[26px] text-muted-foreground`}
                >
                  Measurements
                </h2>
                <p className="text-[20px] leading-8 text-black">
                  {isTrayTable ? '17 1/2x20 5/8 "' : "Not specified"}
                </p>
              </div>
              <fieldset className="flex flex-col gap-4">
                <legend className="sr-only">Product color</legend>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <span
                      className={`${semibold} text-[16px] leading-[26px] text-muted-foreground`}
                    >
                      Choose Color
                    </span>
                    <DetailIcon file="01d1b.svg" />
                  </div>
                  <p
                    className="text-[20px] leading-8 text-black"
                    aria-live="polite"
                  >
                    {color}
                  </p>
                </div>
                <div className="flex gap-4 max-[379px]:gap-2">
                  {isTrayTable ? (
                    variants.map((variant, index) => (
                      <button
                        type="button"
                        key={variant.color}
                        onClick={() => setVariantIndex(index)}
                        aria-label={`Choose ${variant.color}`}
                        aria-pressed={variantIndex === index}
                        className={`relative h-[72px] overflow-hidden ${variant.width} max-[379px]:h-[60px] max-[379px]:w-[60px] ${
                          index === 0 ? "bg-card" : "bg-white"
                        }`}
                      >
                        <img
                          src={`${assetPathPrefix}/${variant.image}`}
                          alt={`${variant.color} tray table`}
                          className={`size-full ${
                            index === 3 ? "object-cover" : "object-contain"
                          }`}
                        />
                        {variantIndex === index && (
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 border border-foreground"
                          />
                        )}
                      </button>
                    ))
                  ) : (
                    <span className="relative size-[72px] overflow-hidden border border-foreground bg-card">
                      <img
                        src={mainImage}
                        alt={`${color} ${product.name}`}
                        className="size-full object-contain"
                      />
                    </span>
                  )}
                </div>
              </fieldset>
            </div>

            <div className="flex flex-col gap-4 py-6">
              <div className="flex gap-6 max-sm:gap-3">
                <div
                  className="flex h-[52px] w-[127px] shrink-0 items-center justify-between rounded-lg bg-[#f5f5f5] px-4 max-sm:w-[110px]"
                  aria-label="Product quantity"
                >
                  <button
                    disabled={quantity <= 1}
                    onClick={() =>
                      setQuantity((current) => Math.max(1, current - 1))
                    }
                    aria-label="Decrease quantity"
                    className="relative flex size-5 items-center justify-center after:absolute after:-inset-2 disabled:cursor-not-allowed"
                  >
                    <DetailIcon file="09e7d.svg" />
                  </button>
                  <span
                    className={`${semibold} text-[16px] leading-[26px] text-[#121212] tabular-nums`}
                    aria-live="polite"
                    aria-label={`Quantity ${quantity}`}
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((current) => current + 1)}
                    aria-label="Increase quantity"
                    className="relative flex size-5 items-center justify-center after:absolute after:-inset-2"
                  >
                    <DetailIcon file="47773.svg" />
                  </button>
                </div>
                <button
                  onClick={onSave}
                  aria-pressed={saved}
                  className={`${medium} flex h-[52px] min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border border-foreground px-10 text-[18px] leading-8 tracking-[-0.4px] transition-colors hover:bg-card max-sm:px-3`}
                >
                  <DetailIcon file="c62c4.svg" />
                  {saved ? "Saved" : "Wishlist"}
                </button>
              </div>
              <button
                onClick={() => onAdd(cartProduct, quantity)}
                className={`${medium} h-[52px] rounded-lg bg-primary px-10 text-[18px] leading-8 tracking-[-0.4px] text-white transition-colors hover:bg-[#343839] active:scale-[0.99] motion-reduce:transition-none`}
              >
                Add to Cart
              </button>
            </div>

            <dl className="flex flex-col gap-2 py-4 text-[12px] leading-5">
              <div className="grid grid-cols-[122px_1fr]">
                <dt className="text-muted-foreground">SKU</dt>
                <dd>{isTrayTable ? "1117" : "Not specified"}</dd>
              </div>
              <div className="grid grid-cols-[122px_1fr]">
                <dt className="text-muted-foreground">CATEGORY</dt>
                <dd>{isTrayTable ? "Living Room, Bedroom" : product.room}</dd>
              </div>
            </dl>

            <div className="py-2">
              <button
                onClick={() => togglePanel("additional")}
                aria-expanded={openPanels.includes("additional")}
                aria-controls="product-additional"
                className={`${medium} flex h-10 w-full items-start justify-between border-b border-muted-foreground pb-[7px] text-left text-[18px] leading-8 tracking-[-0.4px]`}
              >
                <span>Additional Info</span>
                <span
                  className={`flex h-8 items-center transition-transform motion-reduce:transition-none ${
                    openPanels.includes("additional") ? "" : "-rotate-90"
                  }`}
                >
                  <DetailIcon file="76403.svg" />
                </span>
              </button>
              {openPanels.includes("additional") && (
                <div
                  id="product-additional"
                  className="flex flex-col gap-4 py-2"
                >
                  <div className="flex flex-col gap-2">
                    <h3
                      className={`${semibold} text-[14px] leading-[22px] text-muted-foreground`}
                    >
                      Details
                    </h3>
                    <p className="text-[12px] leading-5">
                      {isTrayTable
                        ? "You can use the removable tray for serving. The design makes it easy to put the tray back after use since you place it directly on the table frame without having to fit it into any holes."
                        : "Additional specifications have not been provided for this product."}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3
                      className={`${semibold} text-[14px] leading-[22px] text-muted-foreground`}
                    >
                      Packaging
                    </h3>
                    <div className="text-[12px] leading-5">
                      {isTrayTable ? (
                        <>
                          <p>{'Width: 20 " Height: 1 ½ " Length: 21 ½ "'}</p>
                          <p>Weight: 7 lb 8 oz</p>
                          <p>Package(s): 1</p>
                        </>
                      ) : (
                        <p>Packaging information is not available.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={() => togglePanel("questions")}
                aria-expanded={openPanels.includes("questions")}
                aria-controls="product-questions"
                className={`${medium} flex h-10 w-full items-start justify-between border-b border-muted-foreground pb-[7px] text-left text-[18px] leading-8 tracking-[-0.4px]`}
              >
                <span>Questions</span>
                <span className="flex h-8 items-center">
                  <DetailIcon file="76403.svg" />
                </span>
              </button>
              {openPanels.includes("questions") && (
                <div
                  id="product-questions"
                  className="py-4 text-[14px] leading-[22px]"
                >
                  Questions about this product?{" "}
                  <a
                    href="mailto:hello@3legant.com"
                    className="underline underline-offset-4"
                  >
                    Contact our team.
                  </a>
                </div>
              )}
              <button
                ref={reviewsRef}
                onClick={() => togglePanel("reviews")}
                aria-expanded={openPanels.includes("reviews")}
                aria-controls="product-reviews"
                className={`${medium} flex h-10 w-full items-start justify-between border-b border-muted-foreground pb-[7px] text-left text-[18px] leading-8 tracking-[-0.4px]`}
              >
                <span>{isTrayTable ? "Reviews (11)" : "Reviews"}</span>
                <span className="flex h-8 items-center">
                  <DetailIcon file="76403.svg" />
                </span>
              </button>
              {openPanels.includes("reviews") && (
                <div
                  id="product-reviews"
                  className="py-4 text-[14px] leading-[22px]"
                >
                  {isTrayTable
                    ? "Individual reviews are not included in this preview."
                    : "Reviews are not available for this product."}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        className="flex flex-col gap-12 pb-20 pt-10 max-sm:gap-8 max-sm:pb-14"
        aria-labelledby="recommendations-heading"
        data-node-id="5:4916"
      >
        <div
          className={`${container} flex items-end justify-between gap-6 max-sm:flex-col max-sm:items-start`}
        >
          <h2
            id="recommendations-heading"
            className={`${heading} text-[28px] leading-[34px] tracking-[-0.6px] text-black max-sm:text-[24px]`}
          >
            You might also like
          </h2>
          <Link
            to="/shop"
            className={`${medium} flex h-7 shrink-0 items-center gap-1 border-b border-foreground text-[16px] leading-7 tracking-[-0.4px] hover:opacity-60`}
          >
            More Products
            <DetailIcon file="d580a.svg" />
          </Link>
        </div>
        <div
          ref={carouselRef}
          id="product-recommendations"
          aria-label="Recommended products"
          className="ml-[max(24px,calc(50vw_-_560px))] flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain pr-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={() => {
            const scroller = carouselRef.current
            if (scroller)
              setScrollProgress(
                scroller.scrollLeft /
                  Math.max(1, scroller.scrollWidth - scroller.clientWidth),
              )
          }}
        >
          {recommendations.map((recommendation, index) => (
            <div
              key={recommendation.id}
              className="w-[262px] shrink-0 snap-start"
            >
              {renderRecommendation(recommendation, index === 0)}
            </div>
          ))}
        </div>
        <div className={`${container} relative h-1 rounded-[80px] bg-border`}>
          <button
            aria-label="Scroll recommended products"
            aria-controls="product-recommendations"
            onClick={() => {
              const scroller = carouselRef.current
              if (scroller)
                scroller.scrollTo({
                  left: scrollProgress < 0.5 ? scroller.scrollWidth : 0,
                  behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)",
                  ).matches
                    ? "instant"
                    : "smooth",
                })
            }}
            className="absolute top-0 h-1 w-[74.464%] rounded-[80px] bg-[#343839] after:absolute after:-inset-y-2"
            style={{ left: `${scrollProgress * 25.536}%` }}
          />
        </div>
      </section>
    </>
  )
}
