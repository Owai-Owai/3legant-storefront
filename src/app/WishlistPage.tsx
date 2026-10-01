import { Link } from "react-router"
import type { Product } from "./App"

const assetPathPrefix = "/assets/wishlist"
const contained = "inset-0 size-full object-contain"
const semibold = "font-['Inter:Semi_Bold'] font-semibold"

export const demoWishlistProducts: Product[] = [
  {
    id: "demo-wishlist-tray-table",
    name: "Tray Table",
    color: "Black",
    price: 19.19,
    image: "4925a.png",
    imagePrefix: assetPathPrefix,
    geometry: "inset-0 size-full object-cover",
    room: "Living Room",
  },
  {
    id: "demo-wishlist-sofa",
    name: "Sofa",
    color: "Beige",
    price: 345,
    image: "76e8d.png",
    imagePrefix: assetPathPrefix,
    geometry: contained,
    room: "Living Room",
  },
  {
    id: "demo-wishlist-basket",
    name: "Bamboo basket",
    color: "Beige",
    price: 8.8,
    image: "c350a.png",
    imagePrefix: assetPathPrefix,
    geometry: contained,
    room: "Bedroom",
  },
  {
    id: "demo-wishlist-pillow",
    name: "Pillow",
    color: "Beige",
    price: 8.8,
    image: "cb5ed.png",
    imagePrefix: assetPathPrefix,
    geometry: contained,
    room: "Bedroom",
  },
]

type WishlistPageProps = {
  items: readonly Product[]
  onRemove: (product: Product) => void
  onAdd: (product: Product) => void
}

export default function WishlistPage({
  items,
  onRemove,
  onAdd,
}: WishlistPageProps) {
  return (
    <section
      className="flex w-full min-w-0 flex-col gap-10 max-sm:gap-6"
      aria-labelledby="wishlist-title"
      data-node-id="17:10361"
    >
      <h2
        id="wishlist-title"
        className={`${semibold} text-[20px] leading-8 text-black`}
      >
        Your Wishlist
      </h2>
      {items.length ? (
        <table className="w-full border-collapse font-['Inter:Regular'] text-[14px] font-normal leading-[22px] text-foreground">
          <caption className="sr-only">
            Your preview wishlist. The four initial products and their prices
            are demo examples from the design. Saved catalog products keep their
            catalog prices. No account service is connected.
          </caption>
          <thead className="max-[1199px]:hidden">
            <tr className="grid h-[30px] grid-cols-[160px_120px_137px] justify-between border-b border-border pb-2 pl-8 text-muted-foreground">
              {["Product", "Price", "Action"].map((label) => (
                <th key={label} scope="col" className="text-left font-normal">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((product) => (
              <tr
                key={product.id}
                className="grid min-h-[120px] grid-cols-[minmax(0,320fr)_minmax(0,251fr)_136px] items-center border-b border-border pt-px max-[1199px]:grid-cols-[minmax(0,1fr)_auto] max-[1199px]:gap-y-4 max-[1199px]:py-6"
              >
                <td className="min-w-0 max-[1199px]:col-span-2">
                  <div className="flex min-w-0 items-center gap-[10px]">
                    <button
                      type="button"
                      aria-label={`Remove ${product.name} from wishlist`}
                      onClick={() => onRemove(product)}
                      className="relative flex size-6 shrink-0 items-center justify-center rounded-sm after:absolute after:-inset-2 hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                    >
                      <img
                        src={`${assetPathPrefix}/0b668.svg`}
                        alt=""
                        aria-hidden="true"
                        className="max-w-none shrink-0"
                      />
                    </button>
                    <div className="h-[72px] w-[60px] shrink-0 overflow-hidden bg-card">
                      <img
                        src={`${product.imagePrefix ?? "/assets/furniture"}/${product.image}`}
                        alt={product.name}
                        className={`h-full w-full mix-blend-multiply ${
                          product.geometry.includes("object-cover")
                            ? "object-cover"
                            : "object-contain"
                        }`}
                      />
                    </div>
                    <div className="ml-[6px] flex min-w-0 flex-col gap-2">
                      <p
                        className={`${semibold} break-words text-[14px] leading-[22px]`}
                      >
                        {product.name}
                      </p>
                      {product.color && (
                        <p className="text-[12px] leading-5 text-muted-foreground">
                          Color: {product.color}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="max-[1199px]:pl-[34px]">
                  <span className="min-[1200px]:sr-only">Price: </span>$
                  {Number.isInteger(product.price)
                    ? product.price
                    : product.price.toFixed(2)}
                </td>
                <td>
                  <button
                    type="button"
                    aria-label={`Add ${product.name} to cart`}
                    onClick={() => onAdd(product)}
                    className="whitespace-nowrap rounded-lg bg-primary px-6 py-1.5 font-['Inter:Medium'] text-[16px] font-medium leading-7 tracking-[-0.4px] text-white transition-colors hover:bg-[#343839] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    Add to cart
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="flex flex-col items-start gap-5">
          <p className="text-[16px] leading-[26px] text-muted-foreground">
            Your wishlist is empty. Save products while browsing the shop to see
            them here.
          </p>
          <Link
            to="/shop"
            className="rounded-lg bg-primary px-6 py-1.5 font-['Inter:Medium'] text-[16px] font-medium leading-7 text-white transition-colors hover:bg-[#343839]"
          >
            Explore the shop
          </Link>
        </div>
      )}
    </section>
  )
}
