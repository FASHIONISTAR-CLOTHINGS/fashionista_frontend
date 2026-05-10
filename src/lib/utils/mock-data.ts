// ── Product cards (shops page) ────────────────────────────────────────────────
// IDs added to guarantee unique React keys — avoids "Encountered two children
// with the same key" console errors when titles are non-unique.
const data = [
  {
    id: "prod-001",
    image: "/minimalist.svg",
    title: "Pink Knitted Sweat Shirt",
    vendor: "Romelles Collections",
    rating: 4.6,
    price: 120,
  },
  {
    id: "prod-002",
    image: "/vintage.svg",
    title: "Men Leather Jacket",
    vendor: "Lavida Wears",
    rating: 5.0,
    price: 220,
  },
  {
    id: "prod-003",
    image: "/senator.svg",
    title: "Men Senator (Classic)",
    vendor: "Lyta Collections",
    rating: 4.6,
    price: 120,
  },
  {
    id: "prod-004",
    image: "/gown.svg",
    title: "Women Asoebi",
    vendor: "Romelles Collections",
    rating: 4.6,
    price: 120,
  },
  {
    id: "prod-005",
    image: "/senator.svg",
    title: "Men Senator (Premium)",
    vendor: "Lyta Collections",
    rating: 4.8,
    price: 145,
  },
  {
    id: "prod-006",
    image: "/gown.svg",
    title: "Women Native Attire",
    vendor: "Romelles Collections",
    rating: 5.0,
    price: 220,
  },
  {
    id: "prod-007",
    image: "/minimalist.svg",
    title: "Turtle Neck Sleeve",
    vendor: "Romelles Collections",
    rating: 4.6,
    price: 120,
  },
  {
    id: "prod-008",
    image: "/vintage.svg",
    title: "Vintage Jacket",
    vendor: "Lavida Wears",
    rating: 4.6,
    price: 120,
  },
];
export default data;

export const data2 = [
  {
    id: "deal-001",
    image: "/minimalist.svg",
    title: "Pink Knitted Sweat Shirt",
    vendor: "Romelles Collections",
    rating: 4.6,
    price: 120,
    timer: "365, 14, 06, 59",
  },
  {
    id: "deal-002",
    image: "/vintage.svg",
    title: "Men Leather Jacket",
    vendor: "Lavida Wears",
    rating: 5.0,
    price: 220,
    timer: "765, 12, 06, 00",
  },
  {
    id: "deal-003",
    image: "/senator.svg",
    title: "Men Senator",
    vendor: "Lyta Collections",
    rating: 4.6,
    price: 120,
    timer: "365, 14, 06, 59",
  },
  {
    id: "deal-004",
    image: "/gown.svg",
    title: "Women Asoebi",
    vendor: "Romelles Collections",
    rating: 4.6,
    price: 120,
    timer: "365, 14, 06, 59",
  },
];

export const reviews = [
  {
    comment:
      "Lorem ipsum dolor sit amet consectetur. Turpis sed fames sed consectetur nec arcu laoreet ipsum. Eget vulputate pharetra at mauris elit fames amet. Ac massa sed ante placerat enim sed consequat magna gravida. Enim in platea venenatis volutpat urna lorem.",
    user: {
      name: "Jessical Alba",
      role: "Science Teacher",
      image: "/man2_asset.svg",
    },
  },
  {
    comment:
      "Lorem ipsum dolor sit amet consectetur. Turpis sed fames sed consectetur nec arcu laoreet ipsum. Eget vulputate pharetra at mauris elit fames amet. Ac massa sed ante placerat enim sed consequat magna gravida. Enim in platea venenatis volutpat urna lorem.",
    user: {
      name: "Jessical Alba",
      role: "Science Teacher",
      image: "/man3_assets.svg",
    },
  },
  {
    comment:
      "Lorem ipsum dolor sit amet consectetur. Turpis sed fames sed consectetur nec arcu laoreet ipsum. Eget vulputate pharetra at mauris elit fames amet. Ac massa sed ante placerat enim sed consequat magna gravida. Enim in platea venenatis volutpat urna lorem.",
    user: {
      name: "Jessical Alba",
      role: "Science Teacher",
      image: "/woman.svg",
    },
  },
  {
    comment:
      "Lorem ipsum dolor sit amet consectetur. Turpis sed fames sed consectetur nec arcu laoreet ipsum. Eget vulputate pharetra at mauris elit fames amet. Ac massa sed ante placerat enim sed consequat magna gravida. Enim in platea venenatis volutpat urna lorem.",
    user: {
      name: "Jessical Alba",
      role: "Science Teacher",
      image: "/woman2.svg",
    },
  },
];

// ── Category filters (unique IDs to prevent duplicate key warnings) ───────────
export const category = [
  { id: "cat-001", image: "/minimalist.svg", title: "Minimalist" },
  { id: "cat-002", image: "/gown.svg", title: "Native Gown" },
  { id: "cat-003", image: "/man3_assets.svg", title: "Kaftan" },
  { id: "cat-004", image: "/senator.svg", title: "Native" },
  { id: "cat-005", image: "/vintage.svg", title: "Vintage Sleeves" },
  { id: "cat-006", image: "/gown.svg", title: "Ankara Gown" },
  { id: "cat-007", image: "/senator.svg", title: "Senator" },
  { id: "cat-008", image: "/minimalist.svg", title: "Knitwear" },
];

export const blog = [
  {
    image: "/man2_asset.svg",
    time: "10 - 20 minutes read",
    title: "How to Wear Senator and Not Look Tragic",
    author: "ALICE NEWBOLD",
    content:
      "Lorem ipsum dolor sit amet consectetur. Turpis sed fames sed consectetur nec arcu laoreet ipsum. Eget vulputate pharetra at mauris elit fames amet.",
  },
  {
    image: "/senator.svg",
    time: "5 - 15 minutes read",
    title: "Why you should wear a senator to your next Owambe",
    author: "Annalise Keating",
    content:
      "Lorem ipsum dolor sit amet consectetur. Turpis sed fames sed consectetur nec arcu laoreet ipsum. Eget vulputate pharetra at mauris elit fames amet.",
  },
  {
    image: "/gown.svg",
    time: "5 - 10 minutes read",
    title: "A church girl gown? or not...",
    author: "Carina Pope",
    content:
      "Lorem ipsum dolor sit amet consectetur. Turpis sed fames sed consectetur nec arcu laoreet ipsum. Eget vulputate pharetra at mauris elit fames amet.",
  },
];

export const vendor = [
  {
    image: "/vendor/sapphire.svg",
    name: "Sapphire",
    rating: 4.6,
    address: "512 Alfred Ave. Lagos. Nigeria",
    mobile: "(+234) 90 0000 000",
  },
  {
    image: "/vendor/fashion.svg",
    name: "Fashion Network",
    rating: 4.6,
    address: "512 Alfred Ave. Lagos. Nigeria",
    mobile: "(+234) 90 0000 000",
  },
  {
    image: "/vendor/gucci.svg",
    name: "Gucci",
    rating: 4.6,
    address: "512 Alfred Ave. Lagos. Nigeria",
    mobile: "(+234) 90 0000 000",
  },
  {
    image: "/vendor/burberry.svg",
    name: "Burberry",
    rating: 4.6,
    address: "512 Alfred Ave. Lagos. Nigeria",
    mobile: "(+234) 90 0000 000",
  },
  {
    image: "/vendor/calvin.svg",
    name: "Calvin Klein",
    rating: 4.6,
    address: "512 Alfred Ave. Lagos. Nigeria",
    mobile: "(+234) 90 0000 000",
  },
  {
    image: "/vendor/versace.svg",
    name: "Versace",
    rating: 4.6,
    address: "512 Alfred Ave. Lagos. Nigeria",
    mobile: "(+234) 90 0000 000",
  },
  {
    image: "/vendor/ralph.svg",
    name: "Ralph and Lauren",
    rating: 4.6,
    address: "512 Alfred Ave. Lagos. Nigeria",
    mobile: "(+234) 90 0000 000",
  },
  {
    image: "/vendor/burberry.svg",
    name: "Burberry Studio",
    rating: 4.7,
    address: "45 Victoria Island. Lagos. Nigeria",
    mobile: "(+234) 80 1234 567",
  },
];
