import { Link } from "react-router"

export const articleDetailPath =
  "/blog/how-to-make-a-busy-bathroom-a-place-to-relax"
const assetPathPrefix = "/assets/article"
const title = "How to make a busy bathroom a place to relax"
const sectionHeading =
  "font-['Poppins:Medium'] text-[28px] font-medium leading-[34px] tracking-[-0.6px] max-sm:text-[24px] max-sm:leading-8"
const relatedArticles = [
  {
    image: "1d87a.png",
    alt: "A grey sofa and round wooden tables in a sunlit living room",
  },
  {
    image: "656f9.png",
    alt: "A yellow armchair beside a television and framed artwork",
  },
  {
    image: "08829.png",
    alt: "A round mirror above a hallway bench with baskets",
  },
]

export default function ArticleDetailPage() {
  return (
    <div
      className="mx-auto w-full max-w-[1120px] max-[1199px]:px-6"
      data-node-id="18:12927"
    >
      <article
        aria-labelledby="article-title"
        className="flex flex-col gap-10 pb-20 pt-4 max-sm:gap-8 max-sm:pb-12"
        data-node-id="18:12929"
      >
        <header
          className="flex flex-col items-start gap-14 max-sm:gap-8"
          data-node-id="18:12930"
        >
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-x-4 gap-y-2 font-['Inter:Medium'] text-[14px] font-medium leading-6"
            data-node-id="18:12931"
          >
            <Link
              to="/"
              className="flex items-center gap-1 text-[#605f5f] hover:text-foreground"
            >
              Home
              <img src={`${assetPathPrefix}/5e713.svg`} alt="" />
            </Link>
            <Link
              to="/blog"
              className="flex items-center gap-1 text-[#605f5f] hover:text-foreground"
            >
              Blog
              <img src={`${assetPathPrefix}/5e713.svg`} alt="" />
            </Link>
            <span aria-current="page" className="text-[#121212]">
              {title}
            </span>
          </nav>
          <div
            className="flex w-full flex-col items-start gap-6"
            data-node-id="18:12932"
          >
            <p className="font-['Inter:Bold'] text-[12px] font-bold uppercase leading-3 text-black">
              Article
            </p>
            <h1
              id="article-title"
              className="w-full max-w-[834px] font-['Poppins:Medium'] text-[54px] font-medium leading-[58px] tracking-[-1px] text-foreground max-sm:text-[36px] max-sm:leading-[42px]"
            >
              {title}
            </h1>
            <div
              className="flex flex-wrap items-center gap-x-12 gap-y-3 font-['Inter:Regular'] text-[16px] leading-[26px] text-muted-foreground max-sm:gap-x-6"
              data-node-id="18:12935"
            >
              <p className="flex items-center gap-1">
                <img src={`${assetPathPrefix}/72dcb.svg`} alt="" />
                Henrik Annemark
              </p>
              <p className="flex items-center gap-1">
                <img src={`${assetPathPrefix}/c9173.svg`} alt="" />
                <time dateTime="2023-10-16">October 16, 2023</time>
              </p>
            </div>
          </div>
        </header>
        <div
          className="flex flex-col gap-10 font-['Inter:Regular'] text-[16px] leading-[26px] text-black max-sm:gap-8"
          data-node-id="18:12942"
        >
          <div
            className="flex flex-col gap-10 max-sm:gap-8"
            data-node-id="18:12943"
          >
            <div
              aria-hidden="true"
              className="relative aspect-[1119.985/646.923] w-full overflow-hidden bg-card min-[1200px]:h-[646.923px]"
              data-node-id="18:12624"
            >
              <img
                src={`${assetPathPrefix}/828a7.png`}
                alt=""
                className="invisible absolute left-0 top-[-14.94%] h-[115.56%] w-full max-w-none"
              />
            </div>
            <div className="flex flex-col gap-2" data-node-id="18:12945">
              <p>
                Your bathroom serves a string of busy functions on a daily
                basis. See how you can make all of them work, and still have
                room for comfort and relaxation.
              </p>
              <h2 className={sectionHeading}>
                A cleaning hub with built-in ventilation
              </h2>
              <p>
                Use a rod and a shower curtain to create a complement to your
                cleaning cupboard. Unsightly equipment is stored out of sight
                yet accessibly close – while the air flow helps dry any
                dampness.
              </p>
            </div>
          </div>
          <div
            className="flex flex-col gap-10 max-sm:gap-8"
            data-node-id="18:12946"
          >
            <div
              className="grid grid-cols-2 gap-6 max-sm:grid-cols-1"
              data-node-id="18:12947"
            >
              <div
                className="aspect-[548/729] overflow-hidden bg-card"
                data-node-id="18:12948"
              >
                <img
                  src={`${assetPathPrefix}/99cc7.png`}
                  alt="A white bathtub with a grey towel and a wooden stool holding plants and soap"
                  className="h-full w-full object-cover mix-blend-multiply"
                />
              </div>
              <div
                className="aspect-[548/729] overflow-hidden bg-card"
                data-node-id="18:12949"
              >
                <img
                  src={`${assetPathPrefix}/3ade6.png`}
                  alt="A grey-tiled bathroom with a round mirror, white basin and towel radiator"
                  className="h-full w-full object-cover mix-blend-multiply"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2" data-node-id="18:12950">
              <h2 className={sectionHeading}>Storage with a calming effect</h2>
              <p>
                Having a lot to store doesn’t mean it all has to go in a
                cupboard. Many bathroom items are better kept out in the open –
                either to be close at hand or are nice to look at. Add a plant
                or two to set a calm mood for the entire room (and they’ll
                thrive in the humid air).
              </p>
              <h2 className={sectionHeading}>
                Kit your clutter for easy access
              </h2>
              <p>
                Even if you have a cabinet ready to swallow the clutter, it’s
                worth resisting a little. Let containers hold kits for different
                activities – home spa, make-up, personal hygiene – to bring out
                or put back at a moment’s notice.
              </p>
            </div>
          </div>
          <div
            className="grid grid-cols-2 items-start gap-6 max-sm:grid-cols-1"
            data-node-id="18:12951"
          >
            <div
              className="aspect-[548/729] overflow-hidden bg-card"
              data-node-id="18:12952"
            >
              <img
                src={`${assetPathPrefix}/27524.png`}
                alt="Grey towels hanging against dark bathroom tiles"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-2" data-node-id="18:12953">
              <h2 className={sectionHeading}>An ecosystem of towels</h2>
              <p>
                Racks or hooks that allow air to circulate around each towel
                prolong their freshness. They dry quick and the need for
                frequent washing is minimized.
              </p>
              <h2 className={sectionHeading}>Make your mop disappear</h2>
              <p>
                Having your cleaning tools organized makes them easier to both
                use and return to. When they’re not needed, close the curtain
                and feel the peace of mind it brings.
              </p>
            </div>
          </div>
        </div>
      </article>
      <section
        aria-labelledby="related-articles-title"
        className="flex flex-col gap-12 py-20 max-sm:gap-8 max-sm:py-12"
        data-node-id="18:12954"
      >
        <div
          className="flex items-end justify-between gap-6 max-sm:flex-wrap"
          data-node-id="18:12955"
        >
          <h2
            id="related-articles-title"
            className={`${sectionHeading} text-black`}
          >
            You might also like
          </h2>
          <Link
            to="/blog"
            className="relative flex shrink-0 items-center gap-1 border-b border-[#121212] font-['Inter:Medium'] text-[16px] font-medium leading-7 tracking-[-0.4px] text-[#121212] after:absolute after:-inset-y-2"
          >
            More Articles
            <img src={`${assetPathPrefix}/b353c.svg`} alt="" />
          </Link>
        </div>
        <div
          className="grid w-full grid-cols-3 gap-[25px] min-[1200px]:w-[1121px] max-md:grid-cols-2 max-sm:grid-cols-1"
          data-node-id="18:12961"
        >
          {relatedArticles.map((article) => (
            <Link
              key={article.image}
              to={`${articleDetailPath}#article-title`}
              className="block min-w-0"
              aria-label="Read article: Modern texas home is beautiful and completely kid-friendly"
            >
              <article className="flex min-w-0 flex-col gap-6">
                <img
                  src={`/assets/blog/${article.image}`}
                  alt={article.alt}
                  className="h-[325px] w-full object-cover max-lg:aspect-[357/325] max-lg:h-auto"
                />
                <div className="flex w-full max-w-[352px] flex-col gap-2">
                  <h3 className="font-['Poppins:Medium'] text-[20px] font-medium leading-7 text-[#23262f]">
                    Modern texas home is beautiful and completely kid-friendly
                  </h3>
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
      </section>
    </div>
  )
}
