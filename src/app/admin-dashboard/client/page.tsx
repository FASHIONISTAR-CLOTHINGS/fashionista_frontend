"use client";

import React, { useState } from "react";
import { useAdminClients, useUpdateAdminClient } from "@/features/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TableRowSkeleton } from "@/shared/components/skeletons";

export default function ClientsPage() {
  const { data: clients, isLoading } = useAdminClients();
  const updateMutation = useUpdateAdminClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    is_active: true,
  });

  const handleOpenEdit = (client: any) => {
    setEditingClient(client);
    setFormData({
      first_name: client.first_name || "",
      last_name: client.last_name || "",
      phone_number: client.phone_number || "",
      is_active: client.is_active,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      updateMutation.mutate(
        { id: editingClient.id, data: formData },
        {
          onSuccess: () => setIsFormOpen(false),
        }
      );
    }
  };

  return (
    <div className="space-y-8 bg-inherit">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-satoshi font-medium text-3xl text-black">
            Client Governance
          </h3>
          <p className="font-satoshi text-sm text-[#4E4E4E]">
            Monitor, edit, suspend and reactivate client profiles
          </p>
        </div>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-[20px] shadow space-y-4 border border-[#e5e5e5]">
          <h4 className="font-satoshi font-bold text-lg text-black">
            Edit Client: {editingClient?.user_email}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="first-name">First Name</Label>
                <Input
                  id="first-name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full border-[#d9d9d9] focus:border-[#fda600]"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="last-name">Last Name</Label>
                <Input
                  id="last-name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full border-[#d9d9d9] focus:border-[#fda600]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone-number">Phone Number</Label>
              <Input
                id="phone-number"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full border-[#d9d9d9] focus:border-[#fda600]"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-t border-[#f4f4f4]">
              <Label htmlFor="client-active">Status Active</Label>
              <Switch
                id="client-active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
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
                disabled={updateMutation.isPending}
                className="bg-[#fda600] text-black hover:bg-black hover:text-[#fda600] font-satoshi font-medium"
              >
                Save Changes
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
                  <th className="font-satoshi font-medium text-sm text-[#858585] pb-3">Email</th>
                  <th className="font-satoshi font-medium text-sm text-[#858585] pb-3">Full Name</th>
                  <th className="font-satoshi font-medium text-sm text-[#858585] pb-3">Phone</th>
                  <th className="font-satoshi font-medium text-sm text-[#858585] pb-3">Status</th>
                  <th className="font-satoshi font-medium text-sm text-[#858585] pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4f4f4]">
                {clients && clients.length > 0 ? (
                  clients.map((client) => (
                    <tr key={client.id} className="hover:bg-[#fcfcfa] transition-colors">
                      <td className="py-4 font-satoshi font-medium text-black">{client.user_email}</td>
                      <td className="py-4 font-satoshi text-sm text-black">
                        {client.first_name || client.last_name
                          ? `${client.first_name || ""} ${client.last_name || ""}`.trim()
                          : "—"}
                      </td>
                      <td className="py-4 font-mono text-xs text-gray-500">{client.phone_number || "—"}</td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold font-satoshi ${
                            client.is_active
                              ? "bg-[#C5FECB] text-[#20AB2C]"
                              : "bg-[#FEF3D3] text-[#ECB219]"
                          }`}
                        >
                          {client.is_active ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(client)}
                          className="font-satoshi font-medium"
                        >
                          Moderate
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-gray-500 font-satoshi">
                      No clients found.
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
