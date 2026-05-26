import Link from "next/link";
import Image from "next/image";
import { Hero } from "@/components";
import { CatalogCategoryGrid, CatalogCollectionGrid } from "@/features/catalog";
import { Suspense } from "react";
import FeaturedProductsSection from "./FeaturedProductsSection";
import { ProductGridSkeleton } from "@/features/product";
import { RecentlyViewedSection } from "./_components/RecentlyViewedSection";
import { DealsCountdown } from "./_components/DealsCountdown";

// ─────────────────────────────────────────────────────────────────────────────
// HOMEPAGE — Production 2027 Enterprise Design
// Live: Category Grid, Featured Products, Collection Grid
// Live Countdown for Deals of the Week
// ─────────────────────────────────────────────────────────────────────────────

export default async function Home(props: { searchParams?: Promise<Record<string, string>> }) {
  void props;

  return (
    <div className="flex flex-col gap-5">
      {/* ── Slide Carousel Hero (3 animated slides) ─────────────── */}
      <Hero />

      {/* ── Mobile email waitlist ─────────────────────────────────── */}
      <div className="mt-10 md:hidden flex z-30 px-4">
        <form className="flex w-full">
          <div className="h-[60px] w-full bg-[#F4F5FB] rounded-r-[100px] flex items-center p-1.5">
            <input
              type="email"
              className="w-2/3 h-full outline-none bg-inherit placeholder:not-italic placeholder:font-raleway placeholder:font-medium placeholder:text-xl placeholder:text-[#333] text-[#333]"
              placeholder="Enter Email Address"
            />
            <button className="w-1/3 h-full rounded-r-[100px] bg-[#01454a] text-white shrink-0 text-sm font-bold font-raleway">
              Join Waitlist
            </button>
          </div>
        </form>
      </div>

      {/* ── Live Category Grid ─────────────────────────────────────── */}
      <CatalogCategoryGrid />

      {/* ── Live Featured Products ─────────────────────────────────── */}
      <section className="px-5 py-10 md:px-10 lg:px-20 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bon_foyage text-4xl md:text-5xl text-[#333]">
            Featured Products
          </h2>
          <Link
            href="/categories"
            className="font-raleway text-sm font-semibold text-[#01454A] hover:text-[#fda600] transition-colors"
          >
            View all →
          </Link>
        </div>
        <Suspense fallback={<ProductGridSkeleton count={4} />}>
          <FeaturedProductsSection />
        </Suspense>
      </section>

      {/* ── Recently Viewed Rail ───────────────────────────────────── */}
      <RecentlyViewedSection />

      {/* ── Live Collection Grid ───────────────────────────────────── */}
      <CatalogCollectionGrid />

      {/* ── Campaign Banner ───────────────────────────────────────── */}
      <div className="w-full h-[593px] bg-[#fda600] md:h-[746px] relative p-10 md:p-14 lg:p-24 flex flex-col gap-5 md:gap-10 items-center overflow-hidden">
        {/* Decorative overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent" />
        </div>
        <p className="font-raleway font-semibold text-xl text-black relative z-10">SENATOR OUTFITS</p>
        <p className="font-bon_foyage text-[42px] md:text-6xl lg:text-[75px] lg:leading-[74px] leading-[42px] text-center text-black md:w-1/2 relative z-10">
          {" "}The New Fashion Collection
        </p>
        <Link
          href="/categories"
          className="px-10 py-3 md:py-5 rounded-[100px] bg-[#01454A] flex text-white font-raleway font-semibold text-xl relative z-10 hover:bg-[#01454A]/90 transition-all duration-300 hover:scale-105 shadow-lg"
        >
          Shop Now
        </Link>
        <Image
          src="/man.png"
          alt=""
          width={500}
          height={582}
          className="w-[200px] md:w-[370px] lg:w-[500px] h-auto absolute left-0 md:left-6 bottom-0"
          style={{ height: "auto" }}
        />
        <Image
          src="/adunni.png"
          alt=""
          width={1000}
          height={1000}
          className="w-[200px] h-[321px] md:w-[350px] md:h-[550px] lg:w-[592px] lg:h-[758px] absolute right-0 bottom-0 object-cover"
        />
      </div>

      {/* ── Deals of the Week (Live Countdown) ───────────────────── */}
      <div className="px-5 py-10 md:p-10 lg:p-20 space-y-5 md:space-y-10">
        <div className="flex flex-wrap justify-center md:justify-normal items-center gap-5 lg:gap-20">
          <h3 className="font-bon_foyage whitespace-nowrap text-center text-5xl leading-[48px] text-[#333]">
            {" "}Deals of the Week
          </h3>
          {/* Live countdown timer */}
          <DealsCountdown />
        </div>

        {/* Featured deal cards — live from featured products */}
        <div className="flex items-center flex-wrap gap-y-6 md:gap-3 lg:gap-6 justify-between">
          <Suspense fallback={
            <div className="flex gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="flex flex-col w-[45%] md:w-[32%] max-w-[300px] gap-3">
                  <div className="w-full h-[220px] md:h-[350px] rounded-[8px] bg-[#F4F5FB] animate-pulse" />
                  <div className="h-4 w-2/3 bg-[#F4F5FB] animate-pulse rounded" />
                  <div className="h-4 w-1/2 bg-[#F4F5FB] animate-pulse rounded" />
                </div>
              ))}
            </div>
          }>
            <FeaturedDealsSection />
          </Suspense>
        </div>
      </div>

      {/* ── Reviews Section ───────────────────────────────────────── */}
      <div className="px-5 py-10 md:p-10 lg:p-20 space-y-5">
        <h2 className="font-bon_foyage text-5xl text-[#333]">Our Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_REVIEWS.map((review) => (
            <div
              key={review.id}
              style={{ boxShadow: "0px 4px 25px 0px #0000001A" }}
              className="flex flex-col md:flex-row items-center gap-6 py-8 px-8 border border-[#D9D9D9] rounded-2xl hover:border-[#FDA600] transition-colors duration-300 group"
            >
              <div className="relative w-[80px] h-[80px] rounded-full overflow-hidden shrink-0 ring-2 ring-[#FDA600]/30 group-hover:ring-[#FDA600] transition-all">
                <Image src={review.image} alt={review.name} fill className="object-cover" />
              </div>
              <div className="flex flex-col items-center md:items-start gap-2">
                <span className="text-[#fda600] text-xl">★★★★★</span>
                <p className="font-raleway text-center md:text-left text-lg text-[#333] leading-relaxed">
                  &ldquo;{review.text}&rdquo;
                </p>
                <p className="font-raleway font-semibold text-xl text-black">{review.name}</p>
                <p className="font-raleway text-sm text-[#848484]">{review.role}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 justify-center pt-4">
          <span className="w-6 h-6 rounded-full bg-[#01454A] border-2 border-[#01454A]" />
          <span className="w-4 h-4 rounded-full bg-transparent border-2 border-[#01454A]/40" />
          <span className="w-4 h-4 rounded-full bg-transparent border-2 border-[#01454A]/40" />
        </div>
      </div>

      {/* ── Newsletter CTA ────────────────────────────────────────── */}
      <div className="mx-5 md:mx-10 lg:mx-20 mb-10 rounded-3xl bg-gradient-to-r from-[#01454A] to-[#01454A]/80 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h3 className="font-bon_foyage text-3xl md:text-4xl text-white mb-2">Stay in Style</h3>
          <p className="font-raleway text-[#ECE6D6]/80 text-base md:text-lg">
            Get exclusive deals, new arrivals and style tips delivered to your inbox.
          </p>
        </div>
        <form className="flex w-full md:w-auto gap-2" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Your email address"
            className="flex-1 min-w-[220px] px-4 py-3 rounded-[100px] bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-[#FDA600] transition"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-[100px] bg-[#FDA600] text-black font-bold font-raleway hover:bg-[#FDA600]/90 transition-all shrink-0"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEAL CARDS — lightweight placeholder with real product images from catalog
// ─────────────────────────────────────────────────────────────────────────────

async function FeaturedDealsSection() {
  const { getFeaturedProductsServer } = await import("@/features/product/api/product.server");
  let products: Awaited<ReturnType<typeof getFeaturedProductsServer>> = [];
  try {
    products = await getFeaturedProductsServer();
    products = products.slice(0, 3);
  } catch {
    products = [];
  }

  if (!products.length) {
    return (
      <p className="text-[#848484] font-raleway">
        New deals dropping soon — check back later!
      </p>
    );
  }

  return (
    <>
      {products.map((product) => {
        const image = product.image_url ?? "/heroimg.png";
        const priceNum = parseFloat(product.price);
        const oldPriceNum = product.old_price ? parseFloat(product.old_price) : null;
        return (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="flex flex-col w-[45%] md:w-[32%] max-w-[300px] group"
          >
            <div className="relative overflow-hidden rounded-[8px]">
              <Image
                src={image}
                className="w-full h-[220px] md:h-[350px] object-contain group-hover:scale-105 transition-transform duration-500"
                alt={product.title}
                width={500}
                height={500}
              />
              {product.hot_deal && (
                <div className="absolute top-7 left-2 md:top-10">
                  <p className="w-[83px] h-7 rounded-[5px] flex items-center justify-center uppercase bg-[#fda600] text-white font-semibold font-raleway text-xs">
                    sales
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 pt-3">
              <span className="text-[#fda600] text-lg">
                {"★".repeat(Math.round(product.rating || 5))}{"☆".repeat(5 - Math.round(product.rating || 5))}
              </span>
              <p className="font-raleway font-semibold text-base md:text-xl text-black line-clamp-2">
                {product.title}
              </p>
              <div className="flex items-center gap-2">
                <p className="font-raleway font-semibold text-lg md:text-xl text-[#01454A]">
                  ₦{priceNum.toLocaleString()}
                </p>
                {oldPriceNum && (
                  <p className="font-raleway md:text-lg line-through text-[#848484]">
                    ₦{oldPriceNum.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </>
  );
}



// ─────────────────────────────────────────────────────────────────────────────
// STATIC REVIEW DATA (upgrade to API later)
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_REVIEWS = [
  {
    id: "1",
    image: "/man2_asset.svg",
    text: "Amazing quality and perfect fit! The AI measurement system is a game-changer. My senator outfit fit perfectly from day one.",
    rating: 5,
    name: "Emeka Okafor",
    role: "Business Executive, Lagos",
  },
  {
    id: "2",
    image: "/woman.svg",
    text: "Exceeded all my expectations! Fashionistar delivered an exquisite gown that made me the star of my event. Will order again!",
    rating: 5,
    name: "Adunni Bello",
    role: "Fashion Enthusiast, Abuja",
  },
  {
    id: "3",
    image: "/man2_asset.svg",
    text: "The custom order feature is outstanding. I uploaded my measurement and the vendor delivered exactly what I envisioned.",
    rating: 5,
    name: "Chukwuemeka Eze",
    role: "Legal Practitioner, Enugu",
  },
  {
    id: "4",
    image: "/woman.svg",
    text: "Fashionistar has redefined online fashion for me. The quality, service, and attention to detail are unmatched in Nigeria.",
    rating: 5,
    name: "Fatima Aliyu",
    role: "Entrepreneur, Kano",
  },
];
