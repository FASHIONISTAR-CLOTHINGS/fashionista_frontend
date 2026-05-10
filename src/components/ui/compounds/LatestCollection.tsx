import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
interface CollectionsProps {
  id: string;
  image: string;
  rating: number;
  title: string;
  price: string;
}
const LatestCollection = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  // Next.js 15: searchParams must be awaited before read
  const resolvedParams = await searchParams;

  // Mock collections for development
  const mockCollections: CollectionsProps[] = [
    {
      id: "1",
      image: "/minimalist.svg",
      rating: 4.5,
      title: "Minimalist Dress",
      price: "150",
    },
    {
      id: "2",
      image: "/gown.svg",
      rating: 5,
      title: "Elegant Gown",
      price: "280",
    },
    {
      id: "3",
      image: "/vintage.svg",
      rating: 4.8,
      title: "Vintage Coat",
      price: "220",
    },
  ];

  const catFunc = async () => {
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${backendUrl}/api/v1/collections/`, {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        cache: "no-cache",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) return mockCollections;
      const data = await res.json();
      return (data.results || data) as CollectionsProps[];
    } catch {
      // Backend offline — show mock data silently
      return mockCollections;
    }
  };
  const collections = (await catFunc()) || mockCollections;
  const collection = resolvedParams?.collection;

  const collectionsList = collections.map((item) => (
    <div
      key={item.id}
      className="flex flex-col w-[45%]  md:w-[30%] lg:w-[23%] max-w-[300px]"
    >
      <div className="relative ">
        <Image
          src={item.image}
          className="rounded-[8px] w-full h-[220px] md:h-[350px] object-contain"
          alt=""
          width={500}
          height={500}
        />
        <span className="absolute bottom-8 md:bottom-12 lg:bottom-4 right-3">
          <svg
            width="25"
            height="25"
            viewBox="0 0 25 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.5 22.2656L13.0391 23.3063C12.8725 23.3926 12.6876 23.4376 12.5 23.4376C12.3124 23.4376 12.1275 23.3926 11.9609 23.3063L11.9484 23.3L11.9203 23.2844C11.7566 23.1999 11.5951 23.1114 11.4359 23.0188C9.53126 21.9353 7.73455 20.6723 6.07031 19.2469C3.19531 16.7672 0 13.0469 0 8.59375C0 4.43125 3.25937 1.5625 6.64062 1.5625C9.05781 1.5625 11.1766 2.81562 12.5 4.71875C13.8234 2.81562 15.9422 1.5625 18.3594 1.5625C21.7406 1.5625 25 4.43125 25 8.59375C25 13.0469 21.8047 16.7672 18.9297 19.2469C17.1244 20.7912 15.164 22.1443 13.0797 23.2844L13.0516 23.3L13.0422 23.3047H13.0391L12.5 22.2656ZM6.64062 3.90625C4.55312 3.90625 2.34375 5.725 2.34375 8.59375C2.34375 11.9531 4.8125 15.0688 7.60156 17.4719C9.12336 18.7733 10.7633 19.9299 12.5 20.9266C14.2367 19.9299 15.8766 18.7733 17.3984 17.4719C20.1875 15.0688 22.6562 11.9531 22.6562 8.59375C22.6562 5.725 20.4469 3.90625 18.3594 3.90625C16.2141 3.90625 14.2828 5.44687 13.6266 7.74375C13.5575 7.98934 13.41 8.20561 13.2066 8.35965C13.0033 8.5137 12.7551 8.59706 12.5 8.59706C12.2449 8.59706 11.9967 8.5137 11.7934 8.35965C11.59 8.20561 11.4425 7.98934 11.3734 7.74375C10.7172 5.44687 8.78594 3.90625 6.64062 3.90625Z"
              fill="#01454A"
            />
          </svg>
        </span>
      </div>{" "}
      <div className="flex flex-col gap-3">
        <span className="text-[#fda600] text-xl">★★★★★</span>
        <p className="font-raleway font-semibold text-lg md:text-2xl text-black">
          {item.title}
        </p>
        <p className="font-raleway font-semibold text-lg md:text-2xl text-black">
          {formatCurrency(Number(item.price))}
        </p>
      </div>
    </div>
  ));
  return (
    <div className="px-5 py-10 md:p-10 lg:p-20 space-y-5 md:space-y-10">
      <h2 className="font-bon_foyage text-[30px] text-center md:text-left md:text-5xl text-[#333333]">
        Latest Collections
      </h2>
      <nav className="flex items-center justify-center md:justify-normal gap-1 lg:gap-3 flex-wrap">
        <Link
          href="/"
          scroll={false}
          className={`${
            !collection
              ? "bg-[#fda600] text-white"
              : "bg-[#fda600]/0 text-[#fda600]"
          } px-4 md:px-6 lg:px-10 py-2 md:py-3 lg:py-5 rounded-[100px] border-[#fda600] border text-sm lg:text-xl font-semibold font-raleway text-[#fda600] hover:bg-[#fda600] hover:text-white transition-colors duration-300 ease-in-out`}
        >
          All
        </Link>
        <Link
          href="/?collection=female-clothings"
          scroll={false}
          className={`${
            collection == "female-clothings"
              ? "bg-[#fda600] text-white"
              : "bg-[#fda600]/0 text-[#fda600]"
          } px-4 md:px-5 lg:px-10 py-2 md:py-3 lg:py-5 rounded-[100px] border-[#fda600] hidden lg:inline-block border text-sm lg:text-xl font-semibold font-raleway text-[#fda600] hover:bg-[#fda600] hover:text-white transition-colors duration-300 ease-in-out`}
        >
          Female Clothings
        </Link>
        <Link
          href="/?collection=senator"
          scroll={false}
          className={`${
            collection == "senator"
              ? "bg-[#fda600] text-white"
              : "bg-[#fda600]/0 text-[#fda600]"
          } px-4 md:px-5 lg:px-10 py-2 md:py-3 lg:py-5 rounded-[100px] border-[#fda600] hidden lg:inline-block border text-sm lg:text-xl font-semibold font-raleway text-[#fda600] hover:bg-[#fda600] hover:text-white transition-colors duration-300 ease-in-out`}
        >
          Senator
        </Link>
        <Link
          href="/?collection=kids-clothings"
          scroll={false}
          className={`${
            collection == "kids-clothings"
              ? "bg-[#fda600] text-white"
              : "bg-[#fda600]/0 text-[#fda600]"
          } px-4 md:px-5 lg:px-10 py-2 md:py-3 lg:py-5 rounded-[100px] border-[#fda600] hidden lg:inline-block border text-sm lg:text-xl font-semibold font-raleway text-[#fda600] hover:bg-[#fda600] hover:text-white transition-colors duration-300 ease-in-out`}
        >
          Kids Clothings
        </Link>
        <Link
          href="/?collection=vintage-clothings"
          scroll={false}
          className={`${
            collection == "vintage-clothings"
              ? "bg-[#fda600] text-white"
              : "bg-[#fda600]/0 text-[#fda600]"
          } px-4 md:px-5 lg:px-10 py-2 md:py-3 lg:py-5 rounded-[100px] border-[#fda600] border hidden lg:inline-block text-sm lg:text-xl font-semibold font-raleway text-[#fda600] hover:bg-[#fda600] hover:text-white transition-colors duration-300 ease-in-out`}
        >
          Vintage Clothings
        </Link>
        <Link
          href="/latest"
          scroll={false}
          className={` lg:hidden text-[#fda600] bg-white px-4 py-2 md:py-3 rounded-[100px] border-[#fda600] border text-sm font-semibold font-raleway hover:bg-[#fda600] hover:text-white transition-colors duration-300 ease-in-out`}
        >
          View More
        </Link>
      </nav>
      <div className="flex items-center flex-wrap gap-y-2 md:gap-3 lg:gap-5 justify-between">
        {collectionsList}
      </div>
      <div className="flex items-center justify-center">
        <Link
          href="/collection"
          className="px-10 py-5 rounded-[100px] bg-[#01454A] flex text-white font-raleway font-semibold text-xl"
        >
          Sell All
        </Link>
      </div>
    </div>
  );
};

export default LatestCollection;
