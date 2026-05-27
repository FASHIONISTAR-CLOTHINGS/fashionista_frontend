"use client";

import React, { useState, useTransition } from "react";
import { useQueryState } from "nuqs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useAdminCollections,
  useCreateAdminCollection,
  useUpdateAdminCollection,
  useArchiveAdminCollection,
} from "../hooks";
import { AdminCollection } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { TableRowSkeleton } from "@/shared/components/skeletons";
import { toast } from "sonner";
import { Search, RotateCcw, Edit3, Archive, Plus, AlertCircle, X } from "lucide-react";

const collectionFormSchema = z.object({
  name: z.string().min(2, "Collection Name must be at least 2 characters."),
  description: z.string().max(500, "Description cannot exceed 500 characters.").optional().or(z.literal("")),
  active: z.boolean().default(true),
});

type CollectionFormValues = z.infer<typeof collectionFormSchema>;

export function CollectionsDashboard() {
  const { data: collections, isLoading, error, refetch } = useAdminCollections();
  const createMutation = useCreateAdminCollection();
  const updateMutation = useUpdateAdminCollection();
  const archiveMutation = useArchiveAdminCollection();

  // Nuqs URL state synchronization
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const [statusFilter, setStatusFilter] = useQueryState("status", { defaultValue: "all" });
  const [sortBy, setSortBy] = useQueryState("sortBy", { defaultValue: "name" });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<AdminCollection | null>(null);
  const [, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues: {
      name: "",
      description: "",
      active: true,
    },
  });

  const activeWatch = watch("active");

  const handleOpenCreate = () => {
    setEditingCollection(null);
    reset({ name: "", description: "", active: true });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (collection: AdminCollection) => {
    setEditingCollection(collection);
    reset({
      name: collection.name,
      description: collection.description || "",
      active: collection.active,
    });
    setIsFormOpen(true);
  };

  const onSubmit = async (values: CollectionFormValues) => {
    try {
      if (editingCollection) {
        await updateMutation.mutateAsync({ id: editingCollection.id, data: values });
        setIsFormOpen(false);
      } else {
        await createMutation.mutateAsync(values);
        setIsFormOpen(false);
      }
      reset();
    } catch {
      // Handled in mutation onError
    }
  };

  const handleArchive = async (id: string) => {
    if (confirm("Are you sure you want to archive this collection? This operation is idempotent and will clean up featured spotlight arrays.")) {
      try {
        await archiveMutation.mutateAsync(id);
      } catch {
        // Handled in mutation onError
      }
    }
  };

  const handleResetFilters = () => {
    startTransition(() => {
      void setSearch("");
      void setStatusFilter("all");
      void setSortBy("name");
    });
    toast.success("Filters reset successfully");
  };

  // Filter and sort collections based on search and statusFilter state
  const filteredCollections = React.useMemo(() => {
    if (!collections) return [];
    return collections
      .filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.slug.toLowerCase().includes(search.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(search.toLowerCase()));

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && item.active) ||
          (statusFilter === "inactive" && !item.active);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === "slug") {
          return a.slug.localeCompare(b.slug);
        }
        return 0;
      });
  }, [collections, search, statusFilter, sortBy]);

  return (
    <div className="space-y-8 bg-inherit">
      {/* Upper Action Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white/40 backdrop-blur-md rounded-[24px] border border-white/20 shadow-sm">
        <div>
          <h3 className="font-satoshi font-semibold text-3xl tracking-tight text-black">
            Catalog Collections
          </h3>
          <p className="font-satoshi text-sm text-[#5a5a5a] mt-1">
            Curate design capsule lines, seasonal couture releases, and spotlight groupings
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleOpenCreate}
            className="bg-[#fda600] text-black hover:bg-black hover:text-[#fda600] font-satoshi font-medium transition-all duration-300 rounded-xl px-5 shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Collection
          </Button>
        </div>
      </div>

      {/* URL Synchronized Filter Toolkit */}
      <div className="bg-white p-5 rounded-[20px] shadow-sm border border-[#e5e5e5] grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="relative col-span-1 md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.4" />
          <Input
            placeholder="Search collections by collection name, slug or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 border-[#d9d9d9] focus:border-[#fda600] rounded-xl font-satoshi"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-[#d9d9d9] focus:border-[#fda600] bg-white outline-none font-satoshi text-sm text-[#333]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 h-11 px-3 rounded-xl border border-[#d9d9d9] focus:border-[#fda600] bg-white outline-none font-satoshi text-sm text-[#333]"
          >
            <option value="name">Sort by Name</option>
            <option value="slug">Sort by Slug</option>
          </select>

          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="h-11 px-3 rounded-xl border-[#d9d9d9] hover:bg-gray-50 text-gray-500"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Form Dialog/Card */}
      {isFormOpen && (
        <div className="bg-white p-6 rounded-[24px] shadow-md space-y-4 border border-[#fda600]/30 animate-in fade-in-50 slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b border-[#f4f4f4] pb-3">
            <h4 className="font-satoshi font-bold text-xl text-black">
              {editingCollection ? "Edit Collection Details" : "New Runway Collection"}
            </h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFormOpen(false)}
              className="text-gray-400 hover:text-black rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="collection-name" className="font-satoshi font-medium text-black">
                  Collection Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="collection-name"
                  {...register("name")}
                  className="w-full h-11 border-[#d9d9d9] focus:border-[#fda600] rounded-xl font-satoshi"
                  placeholder="e.g. Summer Regency 2026"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1 font-satoshi">
                    <AlertCircle className="w-3 h-3" /> {errors.name.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col justify-end">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="font-satoshi text-sm font-medium text-black">Active Status</span>
                  <Switch
                    checked={activeWatch}
                    onCheckedChange={(checked) => setValue("active", checked)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="collection-desc" className="font-satoshi font-medium text-black">
                Luxury Description
              </Label>
              <Textarea
                id="collection-desc"
                {...register("description")}
                rows={3}
                placeholder="Narrate the inspiration, textures and creative fabrics undergirding this capsule collection..."
                className="w-full border-[#d9d9d9] focus:border-[#fda600] rounded-xl font-satoshi"
              />
              {errors.description && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1 font-satoshi">
                  <AlertCircle className="w-3 h-3" /> {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#f4f4f4]">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                className="font-satoshi font-medium rounded-xl h-11 px-5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
                className="bg-[#fda600] text-black hover:bg-black hover:text-[#fda600] font-satoshi font-medium rounded-xl h-11 px-6 transition-all duration-300"
              >
                {isSubmitting || createMutation.isPending || updateMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : editingCollection ? (
                  "Update Collection"
                ) : (
                  "Create Collection"
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Main Table / Grid Container */}
      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#e5e5e5] overflow-hidden">
        {error ? (
          <div className="p-8 text-center bg-red-50/50 rounded-2xl border border-red-100 max-w-lg mx-auto my-6 space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h5 className="font-satoshi font-bold text-lg text-black">Failed to Load Collections</h5>
            <p className="font-satoshi text-sm text-gray-500">
              {error instanceof Error ? error.message : "A secure connection to the backend could not be established."}
            </p>
            <Button onClick={() => refetch()} className="bg-red-500 text-white hover:bg-black">
              Try Again
            </Button>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            <TableRowSkeleton columns={4} rows={6} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e5e5e5] pb-3">
                  <th className="font-satoshi font-medium text-sm text-[#858585] pb-3">Collection Name</th>
                  <th className="font-satoshi font-medium text-sm text-[#858585] pb-3">Unique Slug</th>
                  <th className="font-satoshi font-medium text-sm text-[#858585] pb-3">Collection Description</th>
                  <th className="font-satoshi font-medium text-sm text-[#858585] pb-3">Status</th>
                  <th className="font-satoshi font-medium text-sm text-[#858585] pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4f4f4]">
                {filteredCollections.length > 0 ? (
                  filteredCollections.map((collection: AdminCollection) => (
                    <tr key={collection.id} className="hover:bg-[#fcfcfa]/60 transition-colors group">
                      <td className="py-4 font-satoshi font-semibold text-black">
                        {collection.name}
                      </td>
                      <td className="py-4 font-mono text-xs text-[#fda600] font-semibold bg-gray-50 px-2 py-1 rounded-md max-w-max">
                        {collection.slug}
                      </td>
                      <td className="py-4 font-satoshi text-sm text-gray-500 max-w-[280px] truncate" title={collection.description}>
                        {collection.description || <span className="italic text-gray-300">No description provided</span>}
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-satoshi ${
                            collection.active
                              ? "bg-[#C5FECB] text-[#20AB2C]"
                              : "bg-[#FEF3D3] text-[#ECB219]"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${collection.active ? "bg-[#20AB2C]" : "bg-[#ECB219]"}`} />
                          {collection.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-4 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(collection)}
                          className="font-satoshi font-semibold text-[#fda600] hover:text-black hover:bg-amber-50 rounded-xl px-3 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={archiveMutation.isPending}
                          onClick={() => handleArchive(collection.id)}
                          className="font-satoshi font-semibold text-red-500 hover:text-white hover:bg-red-500 rounded-xl px-3 transition-all"
                        >
                          <Archive className="w-3.5 h-3.5 mr-1" />
                          Archive
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-gray-500 font-satoshi">
                      <div className="space-y-2 max-w-sm mx-auto">
                        <AlertCircle className="w-8 h-8 text-gray-300 mx-auto" />
                        <p className="font-semibold text-black">No collections found matching criteria</p>
                        <p className="text-xs text-gray-400">
                          Try adjusting your search queries or status filters to discover hidden records.
                        </p>
                        <Button
                          variant="outline"
                          onClick={handleResetFilters}
                          className="rounded-xl mt-2 text-xs"
                        >
                          Reset Filters
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
