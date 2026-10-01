import { useState } from "react"
import { Link } from "react-router"
import { articleDetailPath } from "./ArticleDetailPage"

const assetPathPrefix = "/assets/blog"
const articles = [
  {
    image: "6350b.png",
    title: "7 ways to decor your home like a professional",
    alt: "A grey sofa beside a bookcase in a plant-filled living room",
  },
  {
    image: "84b87.png",
    title: "Inside a beautiful kitchen organization",
    alt: "A bright kitchen with a marble island and wire stools",
  },
  {
    image: "08d0a.png",
    title: "Decor your bedroom for your children",
    alt: "A welcoming bedroom with houseplants and a white duvet",
  },
  {
    image: "1d87a.png",
    title: "Modern texas home is beautiful and completely kid-friendly",
    alt: "A grey sofa and round wooden tables in a sunlit living room",
  },
  {
    image: "656f9.png",
    title: "Modern texas home is beautiful and completely kid-friendly",
    alt: "A yellow armchair beside a television and framed artwork",
  },
  {
    image: "08829.png",
    title: "Modern texas home is beautiful and completely kid-friendly",
    alt: "A round mirror above a hallway bench with baskets",
  },
  {
    image: "38fda.png",
    title: "Modern texas home is beautiful and completely kid-friendly",
    alt: "A caramel sofa with plants and a floor lamp",
  },
  {
    image: "ee640.png",
    title: "Modern texas home is beautiful and completely kid-friendly",
    alt: "A grey sofa and leather stools beneath landscape artwork",
  },
  {
    image: "f7861.png",
    title: "Modern texas home is beautiful and completely kid-friendly",
    alt: "A wooden bed in a bright room with framed pictures",
  },
]
const views = [
  { label: "Three-column view", icon: "7a81f.svg", columns: 3 },
  { label: "Compact grid view", icon: "b4cae.svg", columns: 4 },
  { label: "Two-column view", icon: "d5589.svg", columns: 2 },
  { label: "List view", icon: "99fd2.svg", columns: 1 },
]

export default function BlogPage({
  onNotice,
}: {
  onNotice: (message: string) => void
}) {
  const [featured, setFeatured] = useState(false)
  const [sort, setSort] = useState("default")
  const [columns, setColumns] = useState(3)
  const visibleArticles = (
    featured ? articles.slice(0, 3) : [...articles]
  ).sort((first, second) =>
    sort === "ascending"
      ? first.title.localeCompare(second.title)
      : sort === "descending"
        ? second.title.localeCompare(first.title)
        : 0,
  )
  const gridClass =
    columns === 4
      ? "grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1"
      : columns === 2
        ? "grid-cols-2 max-sm:grid-cols-1"
        : columns === 1
          ? "grid-cols-1"
          : "grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1"

  return (
    <section
      data-node-id="17:12040"
      aria-label="Our Blog"
      className="mx-auto w-full max-w-[1120px] max-[1199px]:px-6"
    >
      <div
        data-node-id="17:12042"
        className="relative flex h-[392px] items-center justify-center overflow-hidden bg-card max-sm:h-[300px]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-40 mix-blend-multiply"
        >
          <img
            src={`${assetPathPrefix}/dca7f.png`}
            alt=""
            className="absolute left-0 top-[-12.7%] h-[428.52%] w-full max-w-none"
          />
        </div>
        <div className="relative flex flex-col items-center gap-6 px-4 text-center">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-4 font-['Inter:Medium'] text-[14px] font-medium leading-6"
          >
            <Link
              to="/"
              className="flex items-center gap-1 text-[#605f5f] hover:text-foreground"
            >
              Home
              <img src={`${assetPathPrefix}/84485.svg`} alt="" />
            </Link>
            <span aria-current="page" className="text-[#121212]">
              Blog
            </span>
          </nav>
          <h1 className="font-['Poppins:Medium'] text-[54px] font-medium leading-[58px] tracking-[-1px] text-black max-sm:text-[40px] max-sm:leading-[44px]">
            Our Blog
          </h1>
          <p className="font-['Inter:Regular'] text-[20px] leading-8 text-[#121212] max-sm:text-[16px] max-sm:leading-6">
            Home ideas and design inspiration
          </p>
        </div>
      </div>
      <div className="pt-6" data-node-id="17:12043">
        <div
          data-node-id="17:12044"
          className="flex items-center justify-between gap-4 max-sm:flex-wrap"
        >
          <div
            role="group"
            aria-label="Filter articles"
            className="flex items-center gap-10 font-['Inter:Semi_Bold'] text-[14px] font-semibold leading-[22px]"
          >
            {([false, true] as const).map((value) => (
              <button
                key={String(value)}
                onClick={() => setFeatured(value)}
                aria-pressed={featured === value}
                className={`relative after:absolute after:-inset-y-2 ${
                  featured === value
                    ? "border-b border-[#121212] text-[#121212]"
                    : "border-b border-transparent text-[#807e7e] hover:text-foreground"
                }`}
              >
                {value ? "Featured" : "All Blog"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-8 max-sm:w-full max-sm:flex-wrap max-sm:justify-between max-sm:gap-2">
            <div className="relative flex items-center gap-1 font-['Inter:Semi_Bold'] text-[16px] font-semibold leading-[26px] text-[#121212] focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-ring">
              <span>
                {sort === "ascending"
                  ? "Title: A–Z"
                  : sort === "descending"
                    ? "Title: Z–A"
                    : "Sort by"}
              </span>
              <img src={`${assetPathPrefix}/4afb5.svg`} alt="" />
              <select
                aria-label="Sort articles"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              >
                <option value="default">Sort by</option>
                <option value="ascending">Title: A–Z</option>
                <option value="descending">Title: Z–A</option>
              </select>
            </div>
            <div
              role="group"
              aria-label="Article layout"
              className="flex h-10 w-[184px] shrink-0 overflow-hidden border border-[#eaeaea] bg-white"
            >
              {views.map((view, index) => (
                <button
                  key={view.columns}
                  aria-label={view.label}
                  aria-pressed={columns === view.columns}
                  onClick={() => setColumns(view.columns)}
                  className={`flex h-full w-[46px] shrink-0 items-center justify-center border-r border-border ${
                    columns === view.columns
                      ? "bg-card"
                      : "bg-white hover:bg-card"
                  }`}
                >
                  <img
                    src={`${assetPathPrefix}/${view.icon}`}
                    alt=""
                    className={index === 3 ? "-rotate-90" : ""}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div
          data-node-id="17:12055"
          className="flex flex-col items-center gap-20 pb-20 pt-10 max-sm:gap-12 max-sm:pb-12 max-sm:pt-8"
        >
          <div
            data-node-id="17:12056"
            className={`grid w-full gap-x-[25px] gap-y-10 ${
              columns === 3 ? "min-[1200px]:w-[1121px]" : ""
            } ${gridClass}`}
          >
            {visibleArticles.map((article) => (
              <Link
                key={article.image}
                to={articleDetailPath}
                aria-label={`Read article: ${article.title}`}
                className="block min-w-0"
              >
                <article
                  className={`flex min-w-0 gap-6 ${
                    columns === 1
                      ? "flex-row items-center max-sm:flex-col max-sm:items-start"
                      : "flex-col"
                  }`}
                >
                  <img
                    src={`${assetPathPrefix}/${article.image}`}
                    alt={article.alt}
                    className={`object-cover ${
                      columns === 1
                        ? "h-[240px] w-[45%] max-sm:aspect-[357/325] max-sm:h-auto max-sm:w-full"
                        : columns === 3
                          ? "h-[325px] w-full max-lg:aspect-[357/325] max-lg:h-auto"
                          : "aspect-[357/325] w-full"
                    }`}
                  />
                  <div
                    className={`flex min-w-0 flex-col gap-2 ${
                      columns === 3 ? "w-full max-w-[352px]" : "flex-1"
                    }`}
                  >
                    <h2 className="font-['Poppins:Medium'] text-[20px] font-medium leading-7 text-[#23262f]">
                      {article.title}
                    </h2>
                    <time
                      dateTime="2023-10-16"
                      className="font-['Inter:Regular'] text-[12px] leading-5 text-muted-foreground"
                    >
                      October 16, 2023
                    </time>
                  </div>
                </article>
              </Link>
            ))}
          </div>
          <button
            onClick={() => {
              if (featured) setFeatured(false)
              else
                onNotice("All 9 articles available in this preview are shown.")
            }}
            className="flex h-10 items-center rounded-[80px] border border-foreground px-10 font-['Inter:Medium'] text-[16px] font-medium leading-7 tracking-[-0.4px] hover:bg-card"
          >
            Show more
          </button>
        </div>
      </div>
    </section>
  )
}
