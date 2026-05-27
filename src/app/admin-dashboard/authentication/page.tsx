"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useAdminUsers,
  useAdminUserDetail,
  useSuspendUser,
  useReactivateUser,
  useVerifyUser,
  useForcePasswordReset,
  useUpdateUserRole,
} from "@/features/admin";
import {
  Search,
  User,
  Activity,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FilterX,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  ArrowUpDown,
  Lock,
  Unlock,
  Loader2,
} from "lucide-react";

export default function AdminAccountsPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // ── Query: Fetch Live Registered Users (Admin Only) ────────────────────────
  const { data: usersData, isLoading, isError, refetch } = useAdminUsers({
    role: roleFilter,
    is_active: statusFilter === "active" ? true : statusFilter === "blocked" ? false : undefined,
    is_verified: statusFilter === "verified" ? true : statusFilter === "unverified" ? false : undefined,
    search: search || undefined,
    ordering: sortOrder === "newest" ? "-date_joined" : "date_joined",
    page: 1,
    page_size: 100,
  });

  // ── Query: Fetch User Detail for Inspector Panel ───────────────────────────
  const { data: selectedUser } = useAdminUserDetail(selectedUserId);

  // ── Mutation hooks ────────────────────────────────────────────────────────
  const suspendMutation = useSuspendUser();
  const reactivateMutation = useReactivateUser();
  const verifyMutation = useVerifyUser();
  const forcePasswordResetMutation = useForcePasswordReset();
  const updateRoleMutation = useUpdateUserRole();

  const rawUsers = usersData?.results || [];

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
    setSortOrder("newest");
  };

  const handleToggleActive = (user: any) => {
    if (user.is_active) {
      suspendMutation.mutate({ userId: user.id, reason: "Administrative action" });
    } else {
      reactivateMutation.mutate({ userId: user.id });
    }
  };

  const handleVerify = (user: any) => {
    verifyMutation.mutate({ userId: user.id });
  };

  const handleForcePasswordReset = (user: any) => {
    forcePasswordResetMutation.mutate({ userId: user.id });
  };

  const handleRoleChange = (user: any, newRole: string) => {
    updateRoleMutation.mutate({ userId: user.id, role: newRole });
  };

  // Helper to format ISO Date
  const formatDate = (isoString: string | null) => {
    if (!isoString) return "-N/A-";
    return new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-10 bg-inherit min-h-screen pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bon_foyage text-4xl text-black md:text-5xl">
            Accounts Directory
          </h3>
          <p className="font-satoshi text-sm text-[#5A6465] mt-1">
            Supervise accounts, override permissions, and manage verification states across FASHIONISTAR.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="border border-[#ECE6D6] bg-white hover:bg-[#F4F3EC] text-black font-satoshi font-bold transition-all duration-200 px-5 py-3 rounded-xl shadow-sm flex items-center gap-2 text-sm"
          >
            Refresh Directory
          </button>
        </div>
      </div>

      {/* Main Filter Section */}
      <div className="w-full bg-[#F8F5ED]/40 border border-[#ECE6D6] rounded-[32px] p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
          {/* Text Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A9596]" />
            <input
              type="text"
              placeholder="Search by name, email, phone, member ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border border-[#ECE6D6] focus:border-[#01454A] rounded-2xl outline-none font-satoshi text-sm text-black placeholder:text-[#8A9596] transition-all"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A9596]" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border border-[#ECE6D6] focus:border-[#01454A] rounded-2xl outline-none font-satoshi text-sm text-black appearance-none transition-all cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="client">Clients</option>
              <option value="vendor">Vendors</option>
              <option value="staff">Staff</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A9596]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border border-[#ECE6D6] focus:border-[#01454A] rounded-2xl outline-none font-satoshi text-sm text-black appearance-none transition-all cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Accounts</option>
              <option value="blocked">Blocked Accounts</option>
              <option value="verified">KYC Verified</option>
              <option value="unverified">KYC Pending / Unverified</option>
            </select>
          </div>
        </div>

        {/* Action Controls & Metric */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#ECE6D6]/60">
          <div className="flex items-center gap-2 font-satoshi text-xs font-semibold text-[#5A6465]">
            <Sparkles className="w-4 h-4 text-[#FDA600]" />
            <span>Showing {rawUsers.length} users</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Sorting */}
            <button
              onClick={() => setSortOrder(prev => prev === "newest" ? "oldest" : "newest")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#ECE6D6] bg-white text-xs text-black hover:bg-[#F4F3EC] font-satoshi font-semibold transition"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Joined: {sortOrder === "newest" ? "Newest First" : "Oldest First"}</span>
            </button>

            {/* Clear Filter */}
            {(search || roleFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs font-bold text-[#01454A] hover:text-black transition"
              >
                <FilterX className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 text-[#01454A] animate-spin" />
            <p className="font-satoshi text-sm text-[#5A6465] animate-pulse">Retrieving registered users list...</p>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto space-y-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-full">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bon_foyage text-xl text-black">Data Fetch Failure</p>
              <p className="font-satoshi text-sm text-[#5A6465] mt-1">
                Unable to query users list from the backend admin endpoint. Please make sure your token is valid and you are logged in as admin.
              </p>
            </div>
          </div>
        )}

        {/* Directory Grid */}
        {!isLoading && !isError && rawUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto space-y-3 bg-white border border-dashed border-[#ECE6D6] rounded-[24px]">
            <p className="font-bon_foyage text-2xl text-black">No Profiles Match</p>
            <p className="font-satoshi text-sm text-[#5A6465]">
              Try adjusting your active keywords or filters. Use precise details for IDs.
            </p>
          </div>
        )}

        {!isLoading && !isError && rawUsers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rawUsers.map((user) => {
              const userInitials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || "U";
              return (
                <div
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className="bg-white border border-[#ECE6D6] hover:border-[#01454A] rounded-[24px] p-5 space-y-4 shadow-sm hover:shadow transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Top Row: Avatar & Badges */}
                    <div className="flex items-start justify-between">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.first_name}
                          className="w-14 h-14 rounded-2xl object-cover border border-[#ECE6D6] group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-[#01454A]/5 border border-[#01454A]/15 text-[#01454A] font-bon_foyage text-lg flex items-center justify-center group-hover:bg-[#01454A]/10 transition-colors">
                          {userInitials}
                        </div>
                      )}

                      <div className="flex flex-col items-end gap-1.5">
                        {/* Role tag */}
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            user.role === "admin"
                              ? "bg-red-50 text-red-600 border border-red-200"
                              : user.role === "staff"
                                ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                                : user.role === "vendor"
                                  ? "bg-[#01454A]/10 text-[#01454A]"
                                  : "bg-[#FDA600]/10 text-[#FDA600]"
                          }`}
                        >
                          {user.role}
                        </span>

                        {/* Status Check */}
                        <div className="flex items-center gap-1">
                          {user.is_verified ? (
                            <span className="flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              VERIFIED
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5 bg-amber-50 text-[#FDA600] text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-100">
                              <XCircle className="w-3 h-3" />
                              UNVERIFIED
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Identity Details */}
                    <div>
                      <h4 className="font-bon_foyage text-xl text-black truncate">
                        {user.first_name || user.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : "Anonymous User"}
                      </h4>
                      <p className="font-satoshi text-xs text-[#8A9596] mt-0.5">
                        {user.member_id || `-N/A-`}
                      </p>
                    </div>

                    {/* Bio Snippet */}
                    {user.bio && (
                      <p className="font-satoshi text-xs text-[#5A6465] line-clamp-2 h-8">
                        {user.bio}
                      </p>
                    )}

                    {/* Contact Links & Location */}
                    <div className="space-y-1.5 pt-3 border-t border-[#ECE6D6]/50 text-xs font-satoshi text-[#5A6465]">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-[#8A9596]" />
                        <span className="truncate">{user.email || "-N/A-"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#8A9596]" />
                        <span>{user.phone || "-N/A-"}</span>
                      </div>
                      {(user.city || user.country) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#8A9596]" />
                          <span className="truncate">
                            {[user.city, user.state, user.country].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Foot Timestamps & Status Controls */}
                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#ECE6D6]/50 text-[10px] font-satoshi text-[#8A9596]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Joined: {formatDate(user.date_joined)}
                    </span>

                    <span
                      className={`font-semibold flex items-center gap-1 ${
                        user.is_active ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {user.is_active ? "Active" : "Blocked"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Account Details & Management Drawer (Modal) */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs transition-opacity duration-300">
          <div className="w-full max-w-md h-full bg-[#F8F5ED] p-6 md:p-8 overflow-y-auto shadow-2xl flex flex-col justify-between border-l border-[#ECE6D6] animate-in slide-in-from-right duration-300">
            {/* Drawer Body */}
            <div className="space-y-6">
              {/* Close Row */}
              <div className="flex items-center justify-between">
                <span className="font-satoshi text-xs font-semibold uppercase tracking-widest text-[#5A6465]">
                  Inspector Panel
                </span>
                <button
                  onClick={() => setSelectedUserId(null)}
                  className="p-1 rounded-full border border-[#ECE6D6] bg-white hover:bg-black hover:text-white transition"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Header Visual */}
              <div className="flex items-center gap-4 py-4 border-b border-[#ECE6D6]/80">
                {selectedUser.avatar ? (
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.first_name}
                    className="w-16 h-16 rounded-2xl object-cover border border-[#ECE6D6]"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#01454A]/5 border border-[#01454A]/15 text-[#01454A] font-bon_foyage text-2xl flex items-center justify-center">
                    {`${selectedUser.first_name?.[0] || ""}${selectedUser.last_name?.[0] || ""}`.toUpperCase() || "U"}
                  </div>
                )}
                <div>
                  <h4 className="font-bon_foyage text-2xl text-black">
                    {selectedUser.first_name || selectedUser.last_name
                      ? `${selectedUser.first_name} ${selectedUser.last_name}`
                      : "Anonymous User"}
                  </h4>
                  <p className="font-satoshi text-sm text-[#8A9596] mt-0.5">
                    ID: {selectedUser.member_id || selectedUser.id}
                  </p>
                </div>
              </div>

              {/* Roles & Status indicators */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-[#ECE6D6] rounded-xl p-3 flex flex-col">
                  <span className="text-[10px] font-bold text-[#8A9596] uppercase">Account Role</span>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => handleRoleChange(selectedUser, e.target.value)}
                    className="font-satoshi text-sm font-bold text-[#01454A] bg-transparent outline-none mt-1 capitalize cursor-pointer"
                  >
                    <option value="client">Client</option>
                    <option value="vendor">Vendor</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="bg-white border border-[#ECE6D6] rounded-xl p-3 flex flex-col">
                  <span className="text-[10px] font-bold text-[#8A9596] uppercase">Verifications</span>
                  <span
                    className={`font-satoshi text-sm font-bold mt-1 capitalize ${
                      selectedUser.is_verified ? "text-emerald-600" : "text-amber-500"
                    }`}
                  >
                    {selectedUser.is_verified ? "KYC Approved" : "Unverified"}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4 bg-white border border-[#ECE6D6] rounded-2xl p-5 font-satoshi text-sm">
                <p className="font-bon_foyage text-lg text-black border-b border-[#ECE6D6]/50 pb-2">
                  Contact Coordinates
                </p>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-[#8A9596] block">Email Address</span>
                    <span className="text-black font-medium">{selectedUser.email || "-N/A-"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#8A9596] block">Mobile Number</span>
                    <span className="text-black font-medium">{selectedUser.phone || "-N/A-"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#8A9596] block">Address</span>
                    <span className="text-black font-medium">
                      {selectedUser.address || "-N/A-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#8A9596] block">Geography</span>
                    <span className="text-black font-medium">
                      {[selectedUser.city, selectedUser.state, selectedUser.country].filter(Boolean).join(", ") || "-N/A-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio & Description */}
              <div className="space-y-2 bg-white border border-[#ECE6D6] rounded-2xl p-5 font-satoshi text-sm">
                <span className="text-xs text-[#8A9596] block font-semibold uppercase">Biography</span>
                <p className="text-[#5A6465] italic leading-relaxed">
                  {selectedUser.bio || "No biography details supplied by this user."}
                </p>
              </div>

              {/* Joined timestamp */}
              <div className="text-xs font-satoshi text-[#8A9596] flex items-center gap-2 px-1">
                <Calendar className="w-4 h-4 text-[#8A9596]" />
                <span>Account created: {formatDate(selectedUser.date_joined)}</span>
              </div>
            </div>

            {/* Admin Overrides Actions Footer */}
            <div className="pt-6 border-t border-[#ECE6D6]/80 bg-inherit space-y-3">
              <span className="font-satoshi text-xs font-bold uppercase text-[#8A9596] tracking-wider block px-1">
                Administrative Overrides
              </span>

              {/* Status Action Button */}
              <button
                onClick={() => handleToggleActive(selectedUser)}
                disabled={suspendMutation.isPending || reactivateMutation.isPending}
                className={`w-full py-3.5 rounded-xl font-satoshi font-bold text-sm flex items-center justify-center gap-2 border shadow-sm transition-all duration-200 ${
                  selectedUser.is_active
                    ? "bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                }`}
              >
                {suspendMutation.isPending || reactivateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : selectedUser.is_active ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Suspend User (Block Account)
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    Restore User (Unblock Account)
                  </>
                )}
              </button>

              {/* Verify Action Button */}
              {!selectedUser.is_verified && (
                <button
                  onClick={() => handleVerify(selectedUser)}
                  disabled={verifyMutation.isPending}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-satoshi font-bold text-sm py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50"
                >
                  {verifyMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Manually Approve Verification
                    </>
                  )}
                </button>
              )}

              {/* Force Password Reset Button */}
              <button
                onClick={() => handleForcePasswordReset(selectedUser)}
                disabled={forcePasswordResetMutation.isPending}
                className="w-full bg-white hover:bg-[#F4F3EC] border border-[#ECE6D6] text-black font-satoshi font-bold text-sm py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50"
              >
                {forcePasswordResetMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 text-[#FDA600]" />
                    Trigger Force Password Reset
                  </>
                )}
              </button>

              {/* View details on Django Admin helper */}
              <Link
                href={`${process.env.NEXT_PUBLIC_API_V1_URL || "http://127.0.0.1:8001"}/admin/authentication/unifieduser/${selectedUser.id}/change/`}
                target="_blank"
                className="w-full bg-white hover:bg-[#F4F3EC] border border-[#ECE6D6] text-black font-satoshi font-bold text-sm py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition duration-200"
              >
                <ExternalLink className="w-4 h-4 text-[#8A9596]" />
                Open In Django Super-Admin
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
