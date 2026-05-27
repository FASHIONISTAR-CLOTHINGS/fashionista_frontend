"use client";

import React, { useState } from "react";
import {
  useAdminBrands,
  useCreateAdminBrand,
  useUpdateAdminBrand,
  useArchiveAdminBrand,
} from "@/features/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { TableRowSkeleton } from "@/shared/components/skeletons";

export default function BrandsPage() {
  const { data: brands, isLoading } = useAdminBrands();
  const createMutation = useCreateAdminBrand();
  const updateMutation = useUpdateAdminBrand();
  const archiveMutation = useArchiveAdminBrand();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    active: true,
  });

  const handleOpenCreate = () => {
    setEditingBrand(null);
    setFormData({ name: "", description: "", active: true });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (brand: any) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description || "",
      active: brand.active,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBrand) {
      updateMutation.mutate(
        { id: editingBrand.id, data: formData },
        {
          onSuccess: () => setIsFormOpen(false),
        }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => setIsFormOpen(false),
      });
    }
  };

  const handleArchive = (id: string) => {
    if (confirm("Are you sure you want to archive this brand?")) {
      archiveMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8 bg-inherit">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-satoshi font-medium text-3xl text-black">
            Catalog Brands
          </h3>
          <p className="font-satoshi text-sm text-[#4E4E4E]">
            Manage couture brands and luxury vendor profiles
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleOpenCreate}
            className="bg-[#fda600] text-black hover:bg-black hover:text-[#fda600] font-satoshi font-medium transition-colors"
          >
            Create Brand
          </Button>
        </div>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-[20px] shadow space-y-4 border border-[#e5e5e5]">
          <h4 className="font-satoshi font-bold text-lg text-black">
            {editingBrand ? "Edit Brand" : "New Brand"}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="brand-name">Name</Label>
              <Input
                id="brand-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full border-[#d9d9d9] focus:border-[#fda600]"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="brand-desc">Description</Label>
              <Textarea
                id="brand-desc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full border-[#d9d9d9] focus:border-[#fda600]"
              />
            </div>
            <div className="flex items-center justify-between py-2 border-t border-[#f4f4f4]">
              <Label htmlFor="brand-active">Status Active</Label>
              <Switch
                id="brand-active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
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
                {editingBrand ? "Save Changes" : "Create"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[20px] p-6 shadow border border-[#e5e5e5]">
        {isLoading ? (
          <TableRowSkeleton columns={4} rows={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e5e5e5] pb-3">
                  <th className="font-satoshi font-medium text-sm text-[#858585] pb-3">Name</th>
                  <th className="font-satoshi font-medium text-sm text-[#858585] pb-3">Slug</th>
                  <th className="font-satoshi font-medium text-sm text-[#858585] pb-3">Status</th>
                  <th className="font-satoshi font-medium text-sm text-[#858585] pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4f4f4]">
                {brands && brands.length > 0 ? (
                  brands.map((brand: any) => (
                    <tr key={brand.id} className="hover:bg-[#fcfcfa] transition-colors">
                      <td className="py-4 font-satoshi font-medium text-black">{brand.name}</td>
                      <td className="py-4 font-mono text-xs text-gray-500">{brand.slug}</td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold font-satoshi ${
                            brand.active
                              ? "bg-[#C5FECB] text-[#20AB2C]"
                              : "bg-[#FEF3D3] text-[#ECB219]"
                          }`}
                        >
                          {brand.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-4 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(brand)}
                          className="font-satoshi font-medium"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleArchive(brand.id)}
                          className="font-satoshi font-medium"
                        >
                          Archive
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-gray-500 font-satoshi">
                      No brands found.
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
