"use client";

import React, { useState } from "react";
import {
  useAdminBlogPosts,
  useCreateAdminBlogPost,
  useUpdateAdminBlogPost,
  useArchiveAdminBlogPost,
} from "@/features/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { TableRowSkeleton } from "@/shared/components/skeletons";

export default function BlogPostsPage() {
  const { data: blogPosts, isLoading } = useAdminBlogPosts();
  const createMutation = useCreateAdminBlogPost();
  const updateMutation = useUpdateAdminBlogPost();
  const archiveMutation = useArchiveAdminBlogPost();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    status: "draft" as "draft" | "review" | "published" | "archived",
    is_featured: false,
    tags: [] as string[],
    rawTags: "",
  });

  const handleOpenCreate = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      status: "draft",
      is_featured: false,
      tags: [],
      rawTags: "",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (post: any) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      excerpt: post.excerpt || "",
      content: post.content || "",
      status: post.status,
      is_featured: post.is_featured,
      tags: post.tags || [],
      rawTags: (post.tags || []).join(", "),
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagList = formData.rawTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      title: formData.title,
      excerpt: formData.excerpt,
      content: formData.content,
      status: formData.status,
      is_featured: formData.is_featured,
      tags: tagList,
    };

    if (editingPost) {
      updateMutation.mutate(
        { id: editingPost.id, data: payload },
        {
          onSuccess: () => setIsFormOpen(false),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => setIsFormOpen(false),
      });
    }
  };

  const handleArchive = (id: string) => {
    if (confirm("Are you sure you want to archive this blog post?")) {
      archiveMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8 bg-inherit">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-satoshi font-medium text-3xl text-black">
            Editorial Catalog Blog
          </h3>
          <p className="font-satoshi text-sm text-[#4E4E4E]">
            Compose SEO-optimized articles, couture stories, and style guides
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleOpenCreate}
            className="bg-[#fda600] text-black hover:bg-black hover:text-[#fda600] font-satoshi font-medium transition-colors"
          >
            Create Blog Post
          </Button>
        </div>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-[20px] shadow space-y-4 border border-[#e5e5e5]">
          <h4 className="font-satoshi font-bold text-lg text-black">
            {editingPost ? "Edit Blog Post" : "Compose Blog Post"}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="post-title">Title</Label>
                <Input
                  id="post-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full border-[#d9d9d9] focus:border-[#fda600]"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="post-status">Status</Label>
                <select
                  id="post-status"
                  value={formData.status}
                  onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-[#d9d9d9] focus:border-[#fda600] bg-white outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="review">Review</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="post-excerpt">Excerpt</Label>
              <Textarea
                id="post-excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={2}
                placeholder="Brief summary of the article..."
                className="w-full border-[#d9d9d9] focus:border-[#fda600]"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="post-content">Body Content</Label>
              <Textarea
                id="post-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={8}
                placeholder="Write your catalog story here..."
                required
                className="w-full border-[#d9d9d9] focus:border-[#fda600]"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="post-tags">Tags (comma-separated)</Label>
              <Input
                id="post-tags"
                value={formData.rawTags}
                onChange={(e) => setFormData({ ...formData, rawTags: e.target.value })}
                placeholder="couture, style, styling-education, agbada"
                className="w-full border-[#d9d9d9] focus:border-[#fda600]"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-t border-[#f4f4f4]">
              <Label htmlFor="post-featured">Feature on Catalog Spotlight</Label>
              <Switch
                id="post-featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                className="font-satoshi font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-[#fda600] text-black hover:bg-black hover:text-[#fda600] font-satoshi font-medium"
              >
                {editingPost ? "Save Changes" : "Publish"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[20px] p-6 shadow border border-[#e5e5e5]">
        {isLoading ? (
          <TableRowSkeleton columns={5} rows={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e5e5e5] pb-3">
                  <th className="font-satoshi font-medium text-sm text-[#858585] pb-3">Title</th>
                  <th className="font-satoshi font-medium text-sm text-[#858585] pb-3">Slug</th>
                  <th className="font-satoshi font-medium text-sm text-[#858585] pb-3">Status</th>
                  <th className="font-satoshi font-medium text-sm text-[#858585] pb-3">Spotlight</th>
                  <th className="font-satoshi font-medium text-sm text-[#858585] pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4f4f4]">
                {blogPosts && blogPosts.length > 0 ? (
                  blogPosts.map((post: any) => (
                    <tr key={post.id} className="hover:bg-[#fcfcfa] transition-colors">
                      <td className="py-4 font-satoshi font-medium text-black max-w-[200px] truncate">
                        {post.title}
                      </td>
                      <td className="py-4 font-mono text-xs text-gray-500 max-w-[150px] truncate">
                        {post.slug}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold font-satoshi capitalize ${
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
                        {post.is_featured ? "✨ Spotlight" : "Standard"}
                      </td>
                      <td className="py-4 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(post)}
                          className="font-satoshi font-medium"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleArchive(post.id)}
                          className="font-satoshi font-medium"
                        >
                          Archive
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-gray-500 font-satoshi">
                      No blog posts found.
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
