import { redirect } from "next/navigation";

export default function LegacyVendorProductCreateRedirectPage() {
  redirect("/vendor/products");
}
