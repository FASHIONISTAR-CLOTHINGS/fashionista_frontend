/**
 * features/catalog/admin-dashboard/hooks.ts
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
  fetchAdminDashboardKPI,
} from "./api";
import { toast } from "sonner";
import type { AdminCategory, AdminBrand, AdminCollection, AdminBlogPost, AdminDashboardKPI } from "./types";

// ── Categories ───────────────────────────────────────────────────────────────

export function useAdminCategories() {
  return useQuery({
    queryKey: ["admin", "catalog", "categories"],
    queryFn: fetchAdminCategories,
    staleTime: 60_000,
  });
}

export function useCreateAdminCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AdminCategory>) => createAdminCategory(data),
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
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminCategory> }) =>
      updateAdminCategory(id, data),
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
    mutationFn: (id: string) => archiveAdminCategory(id),
    onSuccess: () => {
      toast.success("Category archived successfully.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "catalog", "categories"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to archive category.");
    },
  });
}

// ── Brands ───────────────────────────────────────────────────────────────────

export function useAdminBrands() {
  return useQuery({
    queryKey: ["admin", "catalog", "brands"],
    queryFn: fetchAdminBrands,
    staleTime: 60_000,
  });
}

export function useCreateAdminBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AdminBrand>) => createAdminBrand(data),
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
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminBrand> }) =>
      updateAdminBrand(id, data),
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
    mutationFn: (id: string) => archiveAdminBrand(id),
    onSuccess: () => {
      toast.success("Brand archived successfully.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "catalog", "brands"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to archive brand.");
    },
  });
}

// ── Collections ──────────────────────────────────────────────────────────────

export function useAdminCollections() {
  return useQuery({
    queryKey: ["admin", "catalog", "collections"],
    queryFn: fetchAdminCollections,
    staleTime: 60_000,
  });
}

export function useCreateAdminCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AdminCollection>) => createAdminCollection(data),
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
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminCollection> }) =>
      updateAdminCollection(id, data),
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
    mutationFn: (id: string) => archiveAdminCollection(id),
    onSuccess: () => {
      toast.success("Collection archived successfully.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "catalog", "collections"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to archive collection.");
    },
  });
}

// ── Blog Posts ───────────────────────────────────────────────────────────────

export function useAdminBlogPosts() {
  return useQuery({
    queryKey: ["admin", "catalog", "blogs"],
    queryFn: fetchAdminBlogPosts,
    staleTime: 60_000,
  });
}

export function useCreateAdminBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AdminBlogPost>) => createAdminBlogPost(data),
    onSuccess: () => {
      toast.success("Blog post created successfully.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "catalog", "blogs"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to create blog post.");
    },
  });
}

export function useUpdateAdminBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminBlogPost> }) =>
      updateAdminBlogPost(id, data),
    onSuccess: () => {
      toast.success("Blog post updated successfully.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "catalog", "blogs"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update blog post.");
    },
  });
}

export function useArchiveAdminBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveAdminBlogPost(id),
    onSuccess: () => {
      toast.success("Blog post archived successfully.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "catalog", "blogs"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to archive blog post.");
    },
  });
}

export function useAdminDashboardKPI() {
  return useQuery({
    queryKey: ["admin", "dashboard", "kpi"],
    queryFn: fetchAdminDashboardKPI,
    staleTime: 30_000,
  });
}

