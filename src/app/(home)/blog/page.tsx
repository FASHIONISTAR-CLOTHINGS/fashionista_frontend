import type { Metadata } from "next";

import { CatalogBlogList } from "@/features/catalog";

export const metadata: Metadata = {
  title: "Fashionistar Blog | Digital Measurements, Tailoring, Fashion Commerce",
  description:
    "Read Fashionistar guides on digital body measurements, tailor marketplaces, custom clothing orders, vendor growth, and secure fashion commerce.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Fashionistar Blog",
    description:
      "Style intelligence, measurement education, vendor notes, and commerce guides from Fashionistar.",
    url: "/blog",
    type: "website",
  },
};

export default function BlogPage() {
  return (
    <main className="bg-background">
      <CatalogBlogList />
    </main>
  );
}
