"use client";

import React, { useState, useTransition } from "react";
import { useQueryState } from "nuqs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useAdminBlogPosts,
  useCreateAdminBlogPost,
  useUpdateAdminBlogPost,
  useArchiveAdminBlogPost,
} from "../hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { TableRowSkeleton } from "@/shared/components/skeletons";
import { toast } from "sonner";
import { Search, RotateCcw, Edit3, Archive, Plus, AlertCircle, X, Sparkles, BookOpen } from "lucide-react";

const blogFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  excerpt: z.string().max(300, "Excerpt cannot exceed 300 characters.").optional().or(z.literal("")),
  content: z.string().min(10, "Content must be at least 10 characters."),
  status: z.enum(["draft", "review", "published", "archived"]),
  is_featured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

export function BlogsDashboard() {
  const { data: blogPosts, isLoading, error, refetch } = useAdminBlogPosts();
  const createMutation = useCreateAdminBlogPost();
  const updateMutation = useUpdateAdminBlogPost();
  const archiveMutation = useArchiveAdminBlogPost();

  // Nuqs URL state synchronization
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const [statusFilter, setStatusFilter] = useQueryState("status", { defaultValue: "all" });
  const [isFeaturedFilter, setIsFeaturedFilter] = useQueryState("featured", { defaultValue: "all" });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [rawTags, setRawTags] = useState("");
  const [, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      status: "draft",
      is_featured: false,
      tags: [],
    },
  });

  const statusWatch = watch("status");
  const isFeaturedWatch = watch("is_featured");

  const handleOpenCreate = () => {
    setEditingPost(null);
    setRawTags("");
    reset({
      title: "",
      excerpt: "",
      content: "",
      status: "draft",
      is_featured: false,
      tags: [],
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (post: any) => {
    setEditingPost(post);
    setRawTags((post.tags || []).join(", "));
    reset({
      title: post.title,
      excerpt: post.excerpt || "",
      content: post.content || "",
      status: post.status,
      is_featured: post.is_featured,
      tags: post.tags || [],
    });
    setIsFormOpen(true);
  };

  const onSubmit = async (values: BlogFormValues) => {
    try {
      const tagList = rawTags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const payload = {
        ...values,
        tags: tagList,
      };

      if (editingPost) {
        await updateMutation.mutateAsync({ id: editingPost.id, data: payload });
        setIsFormOpen(false);
      } else {
        await createMutation.mutateAsync(payload);
        setIsFormOpen(false);
      }
      reset();
      setRawTags("");
    } catch (err) {
      // Handled in mutation onError
    }
  };

  const handleArchive = async (id: string) => {
    if (confirm("Are you sure you want to archive this blog post? This operation is idempotent and will update active couture tags.")) {
      try {
        await archiveMutation.mutateAsync(id);
      } catch (err) {
        // Handled in mutation
      }
    }
  };

  const handleResetFilters = () => {
    startTransition(() => {
      void setSearch("");
      void setStatusFilter("all");
      void setIsFeaturedFilter("all");
    });
    toast.success("Filters reset successfully");
  };

  // Filter and sort blog posts based on search state
  const filteredBlogPosts = React.useMemo(() => {
    if (!blogPosts) return [];
    return blogPosts.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.slug.toLowerCase().includes(search.toLowerCase()) ||
        (item.excerpt && item.excerpt.toLowerCase().includes(search.toLowerCase())) ||
        (item.content && item.content.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      const matchesFeatured =
        isFeaturedFilter === "all" ||
        (isFeaturedFilter === "featured" && item.is_featured) ||
        (isFeaturedFilter === "standard" && !item.is_featured);

      return matchesSearch && matchesStatus && matchesFeatured;
    });
  }, [blogPosts, search, statusFilter, isFeaturedFilter]);

  return (
    <div className="space-y-8 bg-inherit">
      {/* Upper Action Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white/40 backdrop-blur-md rounded-[24px] border border-white/20 shadow-sm">
        <div>
          <h3 className="font-satoshi font-semibold text-3xl tracking-tight text-black flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-[#fda600]" />
            Editorial Catalog Blog
          </h3>
          <p className="font-satoshi text-sm text-[#5a5a5a] mt-1">
            Compose high-performance luxury stories, styling articles, and verified couture advice
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleOpenCreate}
            className="bg-[#fda600] text-black hover:bg-black hover:text-[#fda600] font-satoshi font-medium transition-all duration-300 rounded-xl px-5 shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Compose Article
          </Button>
        </div>
      </div>

      {/* URL Synchronized Filter Toolkit */}
      <div className="bg-white p-5 rounded-[20px] shadow-sm border border-[#e5e5e5] grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="relative col-span-1 md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.4" />
          <Input
            placeholder="Search blogs by title, tags or content..."
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
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="flex gap-2">
          <select
            value={isFeaturedFilter}
            onChange={(e) => setIsFeaturedFilter(e.target.value)}
            className="flex-1 h-11 px-3 rounded-xl border border-[#d9d9d9] focus:border-[#fda600] bg-white outline-none font-satoshi text-sm text-[#333]"
          >
            <option value="all">Spotlight (All)</option>
            <option value="featured">✨ Spotlight Only</option>
            <option value="standard">Standard Only</option>
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
              {editingPost ? "Edit Written Article" : "Compose Masterpiece Story"}
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
                <Label htmlFor="post-title" className="font-satoshi font-medium text-black">
                  Article Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="post-title"
                  {...register("title")}
                  className="w-full h-11 border-[#d9d9d9] focus:border-[#fda600] rounded-xl font-satoshi"
                  placeholder="e.g. The Craft of Bespoke Agbadas"
                />
                {errors.title && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1 font-satoshi">
                    <AlertCircle className="w-3 h-3" /> {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="post-status" className="font-satoshi font-medium text-black">
                  Editorial Status <span className="text-red-500">*</span>
                </Label>
                <select
                  id="post-status"
                  value={statusWatch}
                  onChange={(e: any) => setValue("status", e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-[#d9d9d9] focus:border-[#fda600] bg-white outline-none font-satoshi text-sm text-[#333]"
                >
                  <option value="draft">Draft</option>
                  <option value="review">Review</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="post-excerpt" className="font-satoshi font-medium text-black">
                Article Excerpt
              </Label>
              <Textarea
                id="post-excerpt"
                {...register("excerpt")}
                rows={2}
                placeholder="Write a brief, high-end teaser describing the couture article narrative..."
                className="w-full border-[#d9d9d9] focus:border-[#fda600] rounded-xl font-satoshi"
              />
              {errors.excerpt && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1 font-satoshi">
                  <AlertCircle className="w-3 h-3" /> {errors.excerpt.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="post-content" className="font-satoshi font-medium text-black">
                Interactive Content <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="post-content"
                {...register("content")}
                rows={8}
                placeholder="Narrate your luxury editorial in full detail..."
                className="w-full border-[#d9d9d9] focus:border-[#fda600] rounded-xl font-satoshi font-medium leading-relaxed"
              />
              {errors.content && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1 font-satoshi">
                  <AlertCircle className="w-3 h-3" /> {errors.content.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="post-tags" className="font-satoshi font-medium text-black">
                  Tags (comma-separated list)
                </Label>
                <Input
                  id="post-tags"
                  value={rawTags}
                  onChange={(e) => setRawTags(e.target.value)}
                  placeholder="couture, style-guide, agbada, embroidery"
                  className="w-full h-11 border-[#d9d9d9] focus:border-[#fda600] rounded-xl font-satoshi"
                />
              </div>

              <div className="flex flex-col justify-end pt-5">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="font-satoshi text-sm font-medium text-black flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-[#fda600]" />
                    Spotlight Highlight
                  </span>
                  <Switch
                    checked={isFeaturedWatch}
                    onCheckedChange={(checked) => setValue("is_featured", checked)}
                  />
                </div>
              </div>
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
                    Publishing...
                  </span>
                ) : editingPost ? (
                  "Update Article"
                ) : (
                  "Publish Article"
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
            <h5 className="font-satoshi font-bold text-lg text-black">Failed to Load Blog Posts</h5>
            <p className="font-satoshi text-sm text-gray-500">
              {(error as any)?.message || "A secure connection to the backend could not be established."}
            </p>
            <Button onClick={() => refetch()} className="bg-red-500 text-white hover:bg-black">
              Try Again
            </Button>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            <TableRowSkeleton columns={5} rows={6} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e5e5e5] pb-3">
                  <th className="font-satoshi font-medium text-sm text-[#858585] pb-3">Article Title</th>
                  <th className="font-satoshi font-medium text-sm text-[#858585] pb-3">Unique Slug</th>
                  <th className="font-satoshi font-medium text-sm text-[#858585] pb-3">Status</th>
                  <th className="font-satoshi font-medium text-sm text-[#858585] pb-3">Type</th>
                  <th className="font-satoshi font-medium text-sm text-[#858585] pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4f4f4]">
                {filteredBlogPosts.length > 0 ? (
                  filteredBlogPosts.map((post: any) => (
                    <tr key={post.id} className="hover:bg-[#fcfcfa]/60 transition-colors group">
                      <td className="py-4 font-satoshi font-semibold text-black max-w-[240px] truncate">
                        {post.title}
                      </td>
                      <td className="py-4 font-mono text-xs text-gray-500 max-w-[160px] truncate">
                        {post.slug}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold font-satoshi capitalize ${
                            post.status === "published"
                              ? "bg-[#C5FECB] text-[#20AB2C]"
                              : post.status === "review"
                              ? "bg-[#FEF3D3] text-[#ECB219]"
                              : "bg-[#e5e5e5] text-gray-600"
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>
                      <td className="py-4 font-satoshi text-sm text-black">
                        {post.is_featured ? (
                          <span className="inline-flex items-center gap-1 text-[#fda600] font-semibold bg-amber-50 px-2 py-1 rounded-md">
                            <Sparkles className="w-3.5 h-3.5" /> Spotlight
                          </span>
                        ) : (
                          <span className="text-gray-400">Standard</span>
                        )}
                      </td>
                      <td className="py-4 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(post)}
                          className="font-satoshi font-semibold text-[#fda600] hover:text-black hover:bg-amber-50 rounded-xl px-3 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={archiveMutation.isPending}
                          onClick={() => handleArchive(post.id)}
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
                        <p className="font-semibold text-black">No articles found matching criteria</p>
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
