"use client";

import { useState } from "react";
import { useAdminUsers, useAdminUserDetail, useSuspendUser, useReactivateUser } from "@/features/auth";
import {
  Search,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldAlert,
  Loader2,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";

export default function AdminClientsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // ── Query: Fetch Live Client Profiles ─────────────────────────────────────
  const { data: clientsData, isLoading, isError, refetch } = useAdminUsers({
    role: "client",
    is_active: statusFilter === "active" ? true : statusFilter === "blocked" ? false : undefined,
    search: search || undefined,
    page: 1,
    page_size: 100,
  });

  // ── Query: Fetch Client Detail for Inspector Panel ───────────────────────────
  const { data: selectedClient } = useAdminUserDetail(selectedUserId);

  const suspendMutation = useSuspendUser();
  const reactivateMutation = useReactivateUser();

  const clients = clientsData?.results || [];

  const handleToggleActive = (user: any) => {
    if (user.is_active) {
      suspendMutation.mutate({ userId: user.id, reason: "Administrative client action" });
    } else {
      reactivateMutation.mutate({ userId: user.id });
    }
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return "-N/A-";
    return new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-10 bg-inherit min-h-screen pb-12 font-satoshi">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bon_foyage text-4xl text-black md:text-5xl">
            Clients Directory
          </h3>
          <p className="text-sm text-[#5A6465] mt-1">
            Supervise registered clients, audit purchase privileges, and manage verification states.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="border border-[#ECE6D6] bg-white hover:bg-[#F4F3EC] text-black font-bold transition px-5 py-3 rounded-xl shadow-sm text-sm"
        >
          Refresh Directory
        </button>
      </div>

      {/* Filter Section */}
      <div className="w-full bg-[#F8F5ED]/40 border border-[#ECE6D6] rounded-[32px] p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A9596]" />
            <input
              type="text"
              placeholder="Search clients by name, email, phone, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border border-[#ECE6D6] focus:border-[#01454A] rounded-2xl outline-none text-sm text-black placeholder:text-[#8A9596] transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-12 px-4 bg-white border border-[#ECE6D6] focus:border-[#01454A] rounded-2xl outline-none text-sm text-black cursor-pointer appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Clients</option>
              <option value="blocked">Suspended Clients</option>
            </select>
          </div>
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 text-[#01454A] animate-spin" />
            <p className="text-sm text-[#5A6465] animate-pulse">Retrieving registered clients...</p>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto space-y-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-full">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <p className="font-bon_foyage text-xl text-black">Directory Retrieval Error</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && clients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto space-y-3 bg-white border border-dashed border-[#ECE6D6] rounded-[24px]">
            <p className="font-bon_foyage text-2xl text-black">No Clients Found</p>
            <p className="text-sm text-[#5A6465]">Try modifying your active query parameters.</p>
          </div>
        )}

        {/* Clients Grid */}
        {!isLoading && !isError && clients.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => {
              const initials = `${client.first_name?.[0] || ""}${client.last_name?.[0] || ""}`.toUpperCase() || "C";
              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedUserId(client.id)}
                  className="bg-white border border-[#ECE6D6] hover:border-[#01454A] rounded-[24px] p-5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      {client.avatar ? (
                        <img
                          src={client.avatar}
                          alt={client.first_name}
                          className="w-12 h-12 rounded-2xl object-cover border border-[#ECE6D6]"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-[#01454A]/5 border border-[#01454A]/15 text-[#01454A] font-bon_foyage text-lg flex items-center justify-center">
                          {initials}
                        </div>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          client.is_active
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-red-50 text-red-500 border border-red-100"
                        }`}
                      >
                        {client.is_active ? "Active" : "Suspended"}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bon_foyage text-lg text-black truncate">
                        {client.first_name || client.last_name
                          ? `${client.first_name} ${client.last_name}`
                          : "Anonymous Client"}
                      </h4>
                      <p className="text-xs text-[#8A9596]">{client.member_id || `-N/A-`}</p>
                    </div>

                    <div className="space-y-1.5 pt-3 border-t border-[#ECE6D6]/50 text-xs text-[#5A6465]">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-[#8A9596]" />
                        <span className="truncate">{client.email || "-N/A-"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#8A9596]" />
                        <span>{client.phone || "-N/A-"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-4 border-t border-[#ECE6D6]/50 text-[10px] text-[#8A9596]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Joined: {formatDate(client.date_joined)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Inspector Panel Drawer */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md h-full bg-[#F8F5ED] p-6 md:p-8 overflow-y-auto shadow-2xl flex flex-col justify-between border-l border-[#ECE6D6] animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#5A6465]">
                  Client Details
                </span>
                <button
                  onClick={() => setSelectedUserId(null)}
                  className="p-1 rounded-full border border-[#ECE6D6] bg-white hover:bg-black hover:text-white transition"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 py-4 border-b border-[#ECE6D6]/80">
                {selectedClient.avatar ? (
                  <img
                    src={selectedClient.avatar}
                    alt={selectedClient.first_name}
                    className="w-16 h-16 rounded-2xl object-cover border border-[#ECE6D6]"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#01454A]/5 border border-[#01454A]/15 text-[#01454A] font-bon_foyage text-2xl flex items-center justify-center">
                    {`${selectedClient.first_name?.[0] || ""}${selectedClient.last_name?.[0] || ""}`.toUpperCase() || "C"}
                  </div>
                )}
                <div>
                  <h4 className="font-bon_foyage text-2xl text-black">
                    {selectedClient.first_name} {selectedClient.last_name}
                  </h4>
                  <p className="text-sm text-[#8A9596]">ID: {selectedClient.id}</p>
                </div>
              </div>

              <div className="space-y-4 bg-white border border-[#ECE6D6] rounded-2xl p-5 text-sm">
                <p className="font-bon_foyage text-lg text-black border-b border-[#ECE6D6]/50 pb-2">
                  Contact Details
                </p>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-[#8A9596] block">Email</span>
                    <span className="text-black font-medium">{selectedClient.email || "-N/A-"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#8A9596] block">Phone</span>
                    <span className="text-black font-medium">{selectedClient.phone || "-N/A-"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#8A9596] block">Geography</span>
                    <span className="text-black font-medium">
                      {[selectedClient.city, selectedClient.state, selectedClient.country].filter(Boolean).join(", ") || "-N/A-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#ECE6D6]/80 bg-inherit space-y-3">
              <button
                onClick={() => handleToggleActive(selectedClient)}
                disabled={suspendMutation.isPending || reactivateMutation.isPending}
                className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border shadow-sm transition ${
                  selectedClient.is_active
                    ? "bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                }`}
              >
                {suspendMutation.isPending || reactivateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : selectedClient.is_active ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Suspend Account
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    Activate Account
                  </>
                )}
              </button>

              <Link
                href={`${process.env.NEXT_PUBLIC_API_V1_URL || "http://127.0.0.1:8001"}/admin/authentication/unifieduser/${selectedClient.id}/change/`}
                target="_blank"
                className="w-full bg-white hover:bg-[#F4F3EC] border border-[#ECE6D6] text-black font-bold text-sm py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition"
              >
                <ExternalLink className="w-4 h-4 text-[#8A9596]" />
                Modify In Django Super-Admin
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
