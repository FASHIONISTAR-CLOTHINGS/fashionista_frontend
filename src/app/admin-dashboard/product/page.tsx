"use client";

import { useState } from "react";
import Link from "next/link";
import { useCatalogCategories } from "@/features/catalog/hooks/use-catalog";
import { useAdminProducts, useDeleteAdminProduct } from "@/features/product";
import { toast } from "sonner";
import { 
  Search, 
  Trash2, 
  Edit3, 
  Plus, 
  AlertCircle, 
  Loader2, 
  ShoppingBag, 
  Tag, 
  Sparkles, 
  X, 
  FilterX,
  Star
} from "lucide-react";

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ── Fetch live products from admin feature hook ─────────────────────────
  const { data: productsData, isLoading: productsLoading, isError: productsError, refetch: refetchProducts } = useAdminProducts({
    page,
    page_size: pageSize,
    q: search || undefined,
    category: category || undefined,
  });

  // ── Fetch live categories ───────────────────────────────────────────────
  const { data: categoriesData } = useCatalogCategories();

  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteAdminProduct();

  const products = productsData?.results ?? [];
  const categories = categoriesData ?? [];
  const totalCount = productsData?.count ?? 0;

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteProduct(deleteId, {
        onSuccess: () => {
          setDeleteId(null);
        },
        onError: () => {
          setDeleteId(null);
        }
      });
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setPage(1);
  };

  // Helper to format Nigerian Naira
  const formatCurrency = (amount: string | number) => {
    const numeric = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numeric)) return "₦0.00";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(numeric);
  };

  return (
    <div className="space-y-10 bg-inherit min-h-screen pb-12">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bon_foyage text-4xl text-black md:text-5xl">
            Products Catalog
          </h3>
          <p className="font-satoshi text-sm text-[#5A6465] mt-1">
            Browse, manage, and verify Ankara, Agbada, and bespoke garments on displayed.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/vendor/products"
            className="bg-[#01454A] hover:bg-[#01454A]/90 text-[#F8F5ED] hover:text-[#FDA600] flex items-center gap-2 font-satoshi font-bold transition-all duration-200 px-5 py-3 rounded-xl shadow-sm hover:shadow"
          >
            <Plus className="w-5 h-5" />
            Create Product
          </Link>
        </div>
      </div>

      {/* Main Grid Container */}
      <div className="w-full bg-[#F8F5ED]/30 border border-[#ECE6D6] rounded-3xl p-6 md:p-8 space-y-6">
        
        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Text Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A9596]" />
            <input
              type="text"
              placeholder="Search by SKU, title, vendor name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full h-12 pl-12 pr-4 bg-white border border-[#ECE6D6] focus:border-[#01454A] rounded-2xl outline-none font-satoshi text-sm text-black placeholder:text-[#8A9596] transition-all"
            />
          </div>

          {/* Dynamic Categories Dropdown */}
          <div className="relative">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A9596]" />
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full h-12 pl-12 pr-10 bg-white border border-[#ECE6D6] focus:border-[#01454A] rounded-2xl outline-none font-satoshi text-sm text-black appearance-none transition-all cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.title || cat.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#8A9596] h-0 w-0"></div>
          </div>
        </div>

        {/* Filter Applied Badge */}
        {(search || category) && (
          <div className="flex items-center justify-between bg-white/50 border border-[#ECE6D6] px-4 py-2.5 rounded-xl">
            <span className="text-xs text-[#5A6465] font-satoshi font-medium">
              Displaying {totalCount} garments
            </span>
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-[#EA1705] hover:underline flex items-center gap-1.5"
            >
              <FilterX className="w-3.5 h-3.5" />
              Reset filters
            </button>
          </div>
        )}

        {/* Loading and Error Indicators */}
        {productsLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-10 h-10 text-[#01454A] animate-spin" />
            <p className="text-sm font-bold text-black font-satoshi">Loading premium apparel...</p>
          </div>
        )}

        {productsError && (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 max-w-md mx-auto">
            <div className="bg-[#EA1705]/10 p-4 rounded-full text-[#EA1705]">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-lg text-black font-satoshi">Database connection failed</h4>
              <p className="text-xs text-[#5A6465] leading-relaxed">
                Unable to fetch catalog items. Make sure your Django backend is actively running on Port 8001.
              </p>
            </div>
            <button
              onClick={() => refetchProducts()}
              className="bg-[#01454A] text-white px-5 py-2.5 text-xs font-bold rounded-xl transition"
            >
              Retry Load
            </button>
          </div>
        )}

        {/* Empty State */}
        {!productsLoading && !productsError && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-white border border-[#ECE6D6] rounded-2xl max-w-lg mx-auto">
            <div className="bg-[#FDA600]/10 p-4 rounded-full text-[#FDA600]">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="space-y-2 px-6">
              <h4 className="font-bold text-lg text-black font-satoshi">No garments matching query</h4>
              <p className="text-xs text-[#5A6465] leading-relaxed">
                Adjust your filters or query parameter above. No styles currently match this combination.
              </p>
            </div>
            <button
              onClick={clearFilters}
              className="bg-[#FDA600] text-white px-5 py-2.5 text-xs font-bold rounded-xl transition-all hover:bg-black"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Catalog apparel grid */}
        {!productsLoading && !productsError && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <div 
                key={product.id} 
                className="group bg-white border border-[#ECE6D6] hover:border-[#01454A] rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full shadow-sm hover:shadow-md"
              >
                {/* Image panel & Status badges overlay */}
                <div className="relative h-64 bg-[#1A1208]/10 overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=400&h=400&q=80";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1A1208]/5 flex items-center justify-center">
                      <ShoppingBag className="w-12 h-12 text-[#8A9596]/30" />
                    </div>
                  )}

                  {/* Stock Availability Pill */}
                  <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                    product.in_stock 
                      ? "bg-[#01454A] text-[#F8F5ED]" 
                      : "bg-[#EA1705]/15 text-[#EA1705]"
                  }`}>
                    {product.in_stock ? "In Stock" : "Out of Stock"}
                  </div>

                  {/* Rating Overlay */}
                  {product.computed_avg_rating > 0 && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-black px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
                      <Star className="w-3.5 h-3.5 text-[#FDA600] fill-[#FDA600]" />
                      <span>{Number(product.computed_avg_rating).toFixed(1)}</span>
                    </div>
                  )}

                  {/* Customization Ribbon */}
                  {product.requires_measurement && (
                    <div className="absolute bottom-3 left-3 bg-[#FDA600] text-black px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      <span>Bespoke / Sized</span>
                    </div>
                  )}
                </div>

                {/* Info and Actions */}
                <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#8A9596] font-satoshi font-bold">
                      <span className="uppercase">{product.category_name || "Uncategorized"}</span>
                      <span>{product.sku || "N/A"}</span>
                    </div>
                    
                    <h4 className="font-bon_foyage text-2xl text-black leading-tight truncate group-hover:text-[#01454A] transition-colors">
                      {product.title}
                    </h4>

                    {/* Price and Old Price line */}
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-lg font-bold text-black font-satoshi">
                        {formatCurrency(product.price)}
                      </span>
                      {product.old_price && (
                        <span className="text-xs text-[#8A9596] line-through font-satoshi">
                          {formatCurrency(product.old_price)}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-[#5A6465] font-satoshi truncate">
                      Designer: <span className="font-bold text-black">{product.vendor_name || "Independent"}</span>
                    </p>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#ECE6D6]/80">
                    <Link
                      href={`/products/${product.slug}`}
                      className="flex-1 text-center bg-[#F8F5ED] hover:bg-[#01454A]/5 border border-[#ECE6D6] text-black py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#01454A]" />
                      Edit Garment
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="bg-[#EA1705]/10 hover:bg-[#EA1705] text-[#EA1705] hover:text-white p-2.5 rounded-xl transition-all duration-150"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal Overlay */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-[#ECE6D6] rounded-3xl w-full max-w-md p-6 md:p-8 space-y-6 shadow-2xl relative">
            <button 
              onClick={() => setDeleteId(null)}
              className="absolute top-4 right-4 text-[#8A9596] hover:text-black transition"
            >
              <X className="w-5 h-5" />
            </button>Optionally, confirm if any files are missing in your plans.

            <div className="flex items-center gap-4 text-[#EA1705]">
              <div className="bg-[#EA1705]/10 p-3 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-black font-satoshi">Remove garment?</h4>
                <p className="text-xs text-[#5A6465] mt-0.5">This operation cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-[#5A6465] leading-relaxed bg-[#F8F5ED]/50 border border-[#ECE6D6] p-4 rounded-xl font-satoshi">
              Deleting this garment will immediately de-list it from the FASHIONISTAR marketplace. Existing custom cart items or client order records referring to this style snapshot will not be broken, but new checkouts will be blocked.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 bg-white border border-[#ECE6D6] text-black h-11 rounded-xl text-xs font-bold transition hover:bg-[#F8F5ED]"
              >
                Keep Garment
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 bg-[#EA1705] hover:bg-[#EA1705]/90 text-white h-11 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Confirm Deletion"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
