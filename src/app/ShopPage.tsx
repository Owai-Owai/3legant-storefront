import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { Link } from "react-router"
import type { Product } from "./App"
import { supabase } from "@/lib/supabase"

const assetPathPrefix = "/assets/shop"
const heading = "font-['Poppins:Medium'] font-medium"
const semibold = "font-['Inter:Semi_Bold'] font-semibold"
const medium = "font-['Inter:Medium'] font-medium"
const contained = "inset-0 size-full object-contain"

export const shopProducts: Product[] = [
  {
    id: "loveseat",
    name: "Loveseat Sofa",
    price: 199,
    oldPrice: 400,
    image: "6c18f.png",
    geometry: contained,
    room: "Living Room",
    color: "Grey",
    blank: true,
  },
  {
    id: "shop-luxury-sofa",
    name: "Luxury Sofa",
    price: 299,
    oldPrice: 500,
    image: "f2503.png",
    geometry: contained,
    room: "Living Room",
    color: "Grey",
  },
  {
    id: "shop-mushroom-lamp",
    name: "Table Lamp",
    price: 19,
    image: "040be.png",
    geometry: contained,
    room: "Living Room",
    color: "Beige",
  },
  {
    id: "shop-white-drawers",
    name: "White Drawer unit",
    price: 89.99,
    image: "fb624.png",
    geometry: "h-[70.67%] left-[-16.74%] top-[14.66%] w-[133.48%]",
    room: "Living Room",
    color: "White",
  },
  {
    id: "shop-tray-table",
    name: "Black Tray table",
    price: 19.99,
    image: "4925a.png",
    geometry: contained,
    room: "Living Room",
    color: "Black",
  },
  {
    id: "shop-floor-lamp",
    name: "Lamp",
    price: 39,
    image: "4f814.png",
    geometry: "h-[87.47%] left-[-17.1%] top-[6.26%] w-[134.2%]",
    room: "Living Room",
    color: "Natural",
  },
  {
    id: "shop-beige-pillow",
    name: "Light Beige Pillow",
    price: 3.99,
    image: "86253.png",
    geometry: contained,
    room: "Living Room",
    color: "Beige",
  },
  {
    id: "shop-gold-lamp",
    name: "Table Lamp",
    price: 39.99,
    image: "6354d.png",
    geometry: "h-[51.21%] left-[8.84%] top-[24.39%] w-[82.31%]",
    room: "Living Room",
    color: "Gold",
  },
  {
    id: "shop-bamboo-basket",
    name: "Bamboo Basket",
    price: 9.99,
    image: "c350a.png",
    geometry: contained,
    room: "Living Room",
    color: "Natural",
  },
].map((product) => ({ ...product, imagePrefix: assetPathPrefix }))

const categories = [
  "All Rooms",
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Dinning",
  "Outdoor",
]
const priceRanges = [
  { label: "All Price", min: 0, max: Infinity },
  { label: "$0.00 - 99.99", min: 0, max: 99.99 },
  { label: "$100.00 - 199.99", min: 100, max: 199.99 },
  { label: "$200.00 - 299.99", min: 200, max: 299.99 },
  { label: "$300.00 - 399.99", min: 300, max: 399.99 },
  { label: "$400.00+", min: 400, max: Infinity },
]

function ShopIcon({ file }: { file: string }) {
  return (
    <img
      src={`${assetPathPrefix}/${file}`}
      alt=""
      aria-hidden="true"
      className="block max-w-none shrink-0"
    />
  )
}

export default function ShopPage({
  renderProduct,
  extraProducts,
}: {
  renderProduct: (product: Product, featured: boolean) => ReactNode
  extraProducts: Product[]
}) {
  const [category, setCategory] = useState("Living Room")
  const [selectedPrices, setSelectedPrices] = useState([1])
  const [priceFilterActive, setPriceFilterActive] = useState(false)
  const [sort, setSort] = useState("featured")
  const [layout, setLayout] = useState(3)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [dbProducts, setDbProducts] = useState<Product[]>([])

  useEffect(() => {
    async function loadDbProducts() {
      if (!supabase) return
      try {
        const { data, error } = await (supabase.from("products") as any)
          .select("*, product_variants(*), product_media(*)")
          .eq("is_published", true)
        if (!error && data && data.length > 0) {
          const mapped: Product[] = data.map((p: any) => {
            const firstVariant = p.product_variants?.[0]
            const firstMedia = p.product_media?.[0]
            return {
              id: p.slug || p.id,
              name: p.name,
              price: firstVariant ? firstVariant.unit_amount / 100 : 0,
              oldPrice: firstVariant?.compare_at_amount ? firstVariant.compare_at_amount / 100 : undefined,
              room: p.room || "Living Room",
              color: firstVariant?.color_name || "Default",
              image: firstMedia?.url?.includes("/") ? firstMedia.url : "4925a.png",
              geometry: contained,
            }
          })
          if (mapped.length > 0) {
            setDbProducts(mapped)
          }
        }
      } catch (e) {
        console.debug("Using fallback catalog:", e)
      }
    }
    loadDbProducts()
  }, [])

  const catalog = dbProducts.length > 0 ? dbProducts : [
    ...shopProducts,
    ...extraProducts.filter((product) => product.id !== "loveseat"),
  ]
  const filteredProducts = catalog.filter((product) => {
    const matchesRoom = category === "All Rooms" || product.room === category
    const matchesPrice =
      !priceFilterActive ||
      !selectedPrices.length ||
      selectedPrices.includes(0) ||
      selectedPrices.some(
        (index) =>
          product.price >= priceRanges[index].min &&
          product.price <= priceRanges[index].max,
      )
    return matchesRoom && matchesPrice
  })
  const sortedProducts = [...filteredProducts].sort((first, second) => {
    if (sort === "price-low") return first.price - second.price
    if (sort === "price-high") return second.price - first.price
    if (sort === "name") return first.name.localeCompare(second.name)
    return 0
  })
  const visibleProducts = sortedProducts.slice(
    0,
    expanded ? sortedProducts.length : 9,
  )
  const gridClass =
    layout === 3
      ? "grid-cols-3"
      : layout === 4
        ? "grid-cols-4"
        : layout === 2
          ? "grid-cols-2"
          : "grid-cols-1"

  const togglePrice = (index: number) => {
    setPriceFilterActive(true)
    setSelectedPrices((current) =>
      index === 0
        ? [0]
        : current.includes(index)
          ? current.filter((value) => value !== index)
          : [...current.filter((value) => value !== 0), index],
    )
  }

  return (
    <>
      <section
        className="relative mx-auto h-[392px] w-[calc(100%-48px)] max-w-[1120px] overflow-hidden bg-card max-sm:h-[300px]"
        aria-labelledby="shop-heading"
        data-node-id="4:3184"
      >
        <img
          src={`${assetPathPrefix}/0e839.png`}
          alt=""
          className="invisible absolute inset-0 size-full object-cover mix-blend-multiply"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[rgba(243,245,247,0)] from-[27.684%] via-[rgba(243,245,247,0.6)] via-[66.631%] to-[rgba(243,245,247,0.2)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center">
          <nav
            aria-label="Breadcrumb"
            className={`${medium} flex items-center gap-4 text-[14px] leading-6`}
          >
            <Link
              to="/"
              className="flex items-center gap-1 text-[#605f5f] hover:text-foreground"
            >
              Home
              <ShopIcon file="8931d.svg" />
            </Link>
            <span aria-current="page" className="text-[#121212]">
              Shop
            </span>
          </nav>
          <h1
            id="shop-heading"
            className={`${heading} text-[54px] leading-[58px] tracking-[-1px] text-black max-sm:text-[40px] max-sm:leading-[44px]`}
          >
            Shop Page
          </h1>
          <p className="text-[20px] leading-8 text-[#121212] max-sm:text-[16px] max-sm:leading-[26px]">
            Let’s design the place you always imagined.
          </p>
        </div>
      </section>

      <section
        className="mx-auto flex w-[calc(100%-48px)] max-w-[1120px] items-start gap-6 pb-[100px] pt-[60px] max-lg:flex-col max-sm:pb-16 max-sm:pt-8"
        aria-label="Shop products"
        data-node-id="4:3190"
      >
        <button
          onClick={() => setFiltersOpen((current) => !current)}
          aria-expanded={filtersOpen}
          aria-controls="shop-filters"
          className={`${semibold} hidden items-center gap-2 text-[20px] leading-8 max-lg:flex`}
        >
          <ShopIcon file="1eede.svg" />
          Filter
        </button>
        <aside
          id="shop-filters"
          aria-label="Product filters"
          className={`w-[262px] shrink-0 flex-col gap-8 lg:flex ${
            filtersOpen ? "flex" : "hidden"
          } max-lg:w-full max-lg:flex-row max-lg:flex-wrap max-lg:rounded-lg max-lg:bg-card max-lg:p-5`}
        >
          <div
            className={`${semibold} flex items-center gap-2 text-[20px] leading-8 text-[#121212] max-lg:hidden`}
          >
            <ShopIcon file="1eede.svg" />
            Filter
          </div>
          <div className="flex w-[262px] max-w-full flex-col gap-4">
            <h2
              className={`${semibold} h-[22px] text-[16px] leading-[26px] text-[#121212]`}
            >
              CATEGORIES
            </h2>
            <div className="relative flex min-h-[226px] justify-between">
              <div className="flex flex-col items-start gap-3">
                {categories.map((value) => (
                  <button
                    key={value}
                    onClick={() => {
                      setCategory(value)
                      setExpanded(false)
                    }}
                    aria-pressed={category === value}
                    className={`${semibold} text-[14px] leading-[22px] ${
                      category === value
                        ? "border-b border-[#121212] text-[#121212]"
                        : "text-[#807e7e] hover:text-foreground"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <span
                aria-hidden="true"
                className="absolute right-0 top-0 h-[226px] w-2 rounded-[100px] bg-[#eaeaea]"
              >
                <span className="block h-[180px] w-2 rounded-[28px] bg-[#6c7275]" />
              </span>
            </div>
          </div>
          <fieldset className="flex w-[254px] max-w-full flex-col gap-4">
            <legend
              className={`${semibold} mb-4 h-[22px] text-[16px] leading-[26px] text-[#121212]`}
            >
              PRICE
            </legend>
            <div className="flex flex-col gap-2">
              {priceRanges.map((range, index) => (
                <label
                  key={range.label}
                  className={`${semibold} relative flex cursor-pointer items-center justify-between text-[14px] leading-[22px] text-muted-foreground`}
                >
                  {range.label}
                  <input
                    type="checkbox"
                    checked={selectedPrices.includes(index)}
                    onChange={() => togglePrice(index)}
                    className="peer absolute right-0 z-10 size-6 cursor-pointer opacity-0"
                  />
                  <span
                    className={`flex size-6 items-center justify-center overflow-hidden rounded peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-ring ${
                      selectedPrices.includes(index)
                        ? "bg-foreground"
                        : "border-[1.5px] border-muted-foreground bg-[#fcfcfd]"
                    }`}
                  >
                    {selectedPrices.includes(index) && (
                      <ShopIcon file="3345f.svg" />
                    )}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-10 max-lg:w-full">
          <div className="flex h-10 items-start justify-between gap-4 max-sm:h-auto max-sm:flex-wrap">
            <h2 className={`${semibold} text-[20px] leading-8 text-black`}>
              {category}
            </h2>
            <div className="flex items-center gap-8 max-sm:gap-4">
              <div className="relative">
                <button
                  onClick={() => setSortOpen((current) => !current)}
                  aria-expanded={sortOpen}
                  aria-controls="shop-sort"
                  className={`${semibold} flex h-10 items-center gap-1 text-[16px] leading-[26px] text-[#121212]`}
                >
                  {sort === "featured"
                    ? "Sort by"
                    : sort === "price-low"
                      ? "Price: Low"
                      : sort === "price-high"
                        ? "Price: High"
                        : "Name"}
                  <ShopIcon file="6391a.svg" />
                </button>
                {sortOpen && (
                  <div
                    id="shop-sort"
                    className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-md border border-border bg-white py-1 shadow-lg"
                    onKeyDown={(event) => {
                      if (event.key === "Escape") setSortOpen(false)
                    }}
                  >
                    {[
                      { value: "featured", label: "Featured" },
                      { value: "price-low", label: "Price: Low to high" },
                      { value: "price-high", label: "Price: High to low" },
                      { value: "name", label: "Name: A to Z" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSort(option.value)
                          setSortOpen(false)
                        }}
                        className="block w-full px-4 py-3 text-left text-[14px] hover:bg-card"
                        aria-pressed={sort === option.value}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div
                className="flex h-10 shrink-0 overflow-hidden border border-[#eaeaea]"
                aria-label="Product layout"
              >
                {[
                  { columns: 3, icon: "44aaa.svg", label: "Three columns" },
                  { columns: 4, icon: "5e448.svg", label: "Four columns" },
                  { columns: 2, icon: "d399d.svg", label: "Two columns" },
                  { columns: 1, icon: "9cf54.svg", label: "One column" },
                ].map((option, index) => (
                  <button
                    key={option.columns}
                    aria-label={option.label}
                    aria-pressed={layout === option.columns}
                    onClick={() => setLayout(option.columns)}
                    className={`flex h-[38px] w-[46px] items-center justify-center border-r border-border last:border-r-0 max-sm:w-9 ${
                      layout === option.columns
                        ? "bg-card"
                        : "bg-white hover:bg-card"
                    }`}
                  >
                    <span className={`flex ${index === 3 ? "-rotate-90" : ""}`}>
                      <ShopIcon file={option.icon} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-20 max-sm:gap-12">
            <div
              className={`grid w-full items-start gap-6 ${gridClass} ${
                layout !== 1
                  ? "min-[380px]:max-sm:grid-cols-2 max-[379px]:grid-cols-1"
                  : ""
              }`}
              aria-label="Products"
            >
              {visibleProducts.map((product) => (
                <div key={product.id} className="min-w-0">
                  {renderProduct(product, product.id === "shop-tray-table")}
                </div>
              ))}
            </div>
            {!visibleProducts.length && (
              <div
                role="status"
                className="flex min-h-64 flex-col items-center justify-center gap-4 text-center"
              >
                <p className={`${heading} text-[24px]`}>
                  No products match your filters.
                </p>
                <button
                  onClick={() => {
                    setCategory("All Rooms")
                    setSelectedPrices([0])
                    setPriceFilterActive(false)
                  }}
                  className="border-b border-foreground text-[14px]"
                >
                  Clear filters
                </button>
              </div>
            )}
            {visibleProducts.length > 0 && (
              <button
                onClick={() => setExpanded(true)}
                disabled={
                  expanded || sortedProducts.length <= visibleProducts.length
                }
                className={`${medium} flex h-10 items-center justify-center rounded-[80px] border border-foreground px-10 text-[16px] leading-7 tracking-[-0.4px] transition-colors hover:bg-foreground hover:text-white disabled:cursor-default disabled:hover:bg-transparent disabled:hover:text-foreground`}
              >
                {expanded ? "All products shown" : "Show more"}
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
