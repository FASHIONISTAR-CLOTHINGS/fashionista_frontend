/**
 * features/admin-dashboard/catalog/hooks/useAdminCatalog.ts
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  archiveAdminCategory,
  fetchAdminBrands,
  createAdminBrand,
  updateAdminBrand,
  archiveAdminBrand,
  fetchAdminCollections,
  createAdminCollection,
  updateAdminCollection,
  archiveAdminCollection,
  fetchAdminBlogPosts,
  createAdminBlogPost,
  updateAdminBlogPost,
  archiveAdminBlogPost,
} from "../api";
import { toast } from "sonner";

// ── Categories ─────────────────────────────────────────────────────────────

export function useAdminCategories() {
  return useQuery({
    queryKey: ["admin", "catalog", "categories"],
    queryFn: fetchAdminCategories,
    staleTime: 30_000,
  });
}

export function useCreateAdminCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminCategory,
    onSuccess: () => {
      toast.success("Category created successfully.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "catalog", "categories"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to create category.");
    },
  });
}

export function useUpdateAdminCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateAdminCategory(id, data),
    onSuccess: () => {
      toast.success("Category updated successfully.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "catalog", "categories"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update category.");
    },
  });
}

export function useArchiveAdminCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: archiveAdminCategory,
    onSuccess: () => {
      toast.success("Category archived.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "catalog", "categories"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to archive category.");
    },
  });
}

// ── Brands ─────────────────────────────────────────────────────────────────

export function useAdminBrands() {
  return useQuery({
    queryKey: ["admin", "catalog", "brands"],
    queryFn: fetchAdminBrands,
    staleTime: 30_000,
  });
}

export function useCreateAdminBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminBrand,
    onSuccess: () => {
      toast.success("Brand created successfully.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "catalog", "brands"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to create brand.");
    },
  });
}

export function useUpdateAdminBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateAdminBrand(id, data),
    onSuccess: () => {
      toast.success("Brand updated successfully.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "catalog", "brands"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update brand.");
    },
  });
}

export function useArchiveAdminBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: archiveAdminBrand,
    onSuccess: () => {
      toast.success("Brand archived.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "catalog", "brands"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to archive brand.");
    },
  });
}

// ── Collections ────────────────────────────────────────────────────────────

export function useAdminCollections() {
  return useQuery({
    queryKey: ["admin", "catalog", "collections"],
    queryFn: fetchAdminCollections,
    staleTime: 30_000,
  });
}

export function useCreateAdminCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminCollection,
    onSuccess: () => {
      toast.success("Collection created successfully.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "catalog", "collections"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to create collection.");
    },
  });
}

export function useUpdateAdminCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateAdminCollection(id, data),
    onSuccess: () => {
      toast.success("Collection updated successfully.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "catalog", "collections"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update collection.");
    },
  });
}

export function useArchiveAdminCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: archiveAdminCollection,
    onSuccess: () => {
      toast.success("Collection archived.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "catalog", "collections"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to archive collection.");
    },
  });
}

// ── Blog Posts ─────────────────────────────────────────────────────────────

export function useAdminBlogPosts() {
  return useQuery({
    queryKey: ["admin", "catalog", "blog-posts"],
    queryFn: fetchAdminBlogPosts,
    staleTime: 30_000,
  });
}

export function useCreateAdminBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminBlogPost,
    onSuccess: () => {
      toast.success("Blog post created successfully.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "catalog", "blog-posts"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to create blog post.");
    },
  });
}

export function useUpdateAdminBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateAdminBlogPost(id, data),
    onSuccess: () => {
      toast.success("Blog post updated successfully.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "catalog", "blog-posts"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update blog post.");
    },
  });
}

export function useArchiveAdminBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: archiveAdminBlogPost,
    onSuccess: () => {
      toast.success("Blog post archived.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "catalog", "blog-posts"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to archive blog post.");
    },
  });
}
