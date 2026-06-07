"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useAdminUsers,
  useAdminUserDetail,
  useAdminUserStats,
  useSuspendUser,
  useReactivateUser,
  useVerifyUser,
  useForcePasswordReset,
  useUpdateUserRole,
  useAdminUserLoginEvents,
  useAdminUserSessions,
} from "../hooks";
import { ADMIN_ROLE_OPTIONS } from "../types";
import type { AdminUser } from "../types";
import {
  Search,
  User,
  Users,
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
  Shield,
  Globe,
  AlertTriangle,
  Star,
  KeyRound,
  BarChart2,
  Fingerprint,
  BadgeCheck,
  Ban,
  RefreshCw,
  Languages,
  Timer,
} from "lucide-react";

// ── Role color helper ──────────────────────────────────────────────────────────

function getRoleBadgeClass(role: string) {
  if (role.includes("admin") || role === "super_admin") return "bg-red-50 text-red-600 border border-red-200";
  if (role === "staff" || role === "super_staff") return "bg-indigo-50 text-indigo-600 border border-indigo-200";
  if (role === "vendor" || role === "super_vendor") return "bg-[#01454A]/10 text-[#01454A] border border-[#01454A]/20";
  if (role === "editor" || role === "super_editor") return "bg-violet-50 text-violet-600 border border-violet-200";
  if (role === "support" || role === "super_support") return "bg-sky-50 text-sky-600 border border-sky-200";
  if (role === "moderator" || role === "super_moderator") return "bg-orange-50 text-orange-600 border border-orange-200";
  return "bg-[#FDA600]/10 text-[#FDA600] border border-amber-200";
}

function getProviderBadge(provider: string) {
  if (provider === "google") return "bg-blue-50 text-blue-600 border border-blue-200";
  if (provider === "phone") return "bg-green-50 text-green-600 border border-green-200";
  return "bg-gray-50 text-gray-600 border border-gray-200";
}

// ── KPI metric card ────────────────────────────────────────────────────────────

function MetricCard({ label, value, icon: Icon, accent }: {
  label: string;
  value: number | undefined;
  icon: any;
  accent: string;
}) {
  return (
    <div className={`bg-white border border-[#ECE6D6] rounded-2xl p-4 flex items-center gap-4 shadow-sm`}>
      <div className={`p-2.5 rounded-xl ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="font-satoshi text-2xl font-bold text-black">
          {value ?? <span className="text-[#8A9596] text-base">—</span>}
        </p>
        <p className="font-satoshi text-xs text-[#8A9596] mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── Risk Score Badge ───────────────────────────────────────────────────────────

function RiskBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = score > 0.7 ? "text-red-600 bg-red-50" : score > 0.3 ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50";
  return (
    <span className={`font-satoshi text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      Risk {pct}%
    </span>
  );
}

// ── Inspector Tab ──────────────────────────────────────────────────────────────

type InspectorTab = "overview" | "security" | "gdpr" | "activity";

// ── Main Component ─────────────────────────────────────────────────────────────

export function AccountsDashboard() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("overview");

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

  // ── Detail Query ──────────────────────────────────────────────────────────
  const { data: selectedUser, isLoading: isDetailLoading } = useAdminUserDetail(selectedUserId);

  // ── KPI Stats ─────────────────────────────────────────────────────────────
  const { data: metrics } = useAdminUserStats();

  // ── Activity Queries (lazy) ───────────────────────────────────────────────
  const { data: loginEvents } = useAdminUserLoginEvents(
    inspectorTab === "activity" ? selectedUserId : null
  );
  const { data: sessions } = useAdminUserSessions(
    inspectorTab === "activity" ? selectedUserId : null
  );

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

  // ── BUG FIX: Always use selectedUserId (not selectedUser.id) ─────────────
  // selectedUser.id can be undefined if the detail query hasn't resolved yet,
  // but selectedUserId is the reliable state set from the card click.

  const handleToggleActive = () => {
    if (!selectedUserId) return;
    if (selectedUser?.is_active) {
      suspendMutation.mutate({ userId: selectedUserId, reason: "Administrative action" });
    } else {
      reactivateMutation.mutate({ userId: selectedUserId });
    }
  };

  const handleVerify = () => {
    if (!selectedUserId) return;
    verifyMutation.mutate({ userId: selectedUserId });
  };

  const handleForcePasswordReset = () => {
    if (!selectedUserId) return;
    forcePasswordResetMutation.mutate({ userId: selectedUserId });
  };

  const handleRoleChange = (newRole: string) => {
    if (!selectedUserId) return;
    updateRoleMutation.mutate({ userId: selectedUserId, role: newRole });
  };

  const handleOpenInspector = (user: AdminUser) => {
    setSelectedUserId(user.id);
    setInspectorTab("overview");
  };

  const formatDate = (isoString: string | null | undefined) => {
    if (!isoString) return "-N/A-";
    return new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  const formatDateTime = (isoString: string | null | undefined) => {
    if (!isoString) return "-N/A-";
    return new Date(isoString).toLocaleString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const INSPECTOR_TABS: { key: InspectorTab; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: User },
    { key: "security", label: "Security", icon: Shield },
    { key: "gdpr", label: "GDPR", icon: Fingerprint },
    { key: "activity", label: "Activity", icon: Activity },
  ];

  return (
    <div className="space-y-8 bg-inherit min-h-screen pb-16">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bon_foyage text-4xl text-black md:text-5xl">Accounts Directory</h3>
          <p className="font-satoshi text-sm text-[#5A6465] mt-1">
            Supervise accounts, override permissions, and manage verification states across FASHIONISTAR.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="border border-[#ECE6D6] bg-white hover:bg-[#F4F3EC] text-black font-satoshi font-bold transition-all duration-200 px-5 py-3 rounded-xl shadow-sm flex items-center gap-2 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Directory
        </button>
      </div>

      {/* ── KPI Metrics Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <MetricCard label="Total Users" value={metrics?.total_users} icon={Users} accent="bg-[#01454A]/10 text-[#01454A]" />
        <MetricCard label="Active Accounts" value={metrics?.active_users} icon={CheckCircle2} accent="bg-emerald-50 text-emerald-600" />
        <MetricCard label="Unverified" value={metrics?.unverified_users} icon={AlertTriangle} accent="bg-amber-50 text-amber-600" />
        <MetricCard label="Vendors" value={metrics?.vendors_count} icon={Star} accent="bg-[#01454A]/10 text-[#01454A]" />
        <MetricCard label="Clients" value={metrics?.clients_count} icon={User} accent="bg-[#FDA600]/10 text-[#FDA600]" />
        <MetricCard label="Staff" value={metrics?.staff_count} icon={Shield} accent="bg-indigo-50 text-indigo-600" />
        <MetricCard label="Admins" value={metrics?.admins_count} icon={ShieldAlert} accent="bg-red-50 text-red-600" />
        <MetricCard label="Editors" value={metrics?.editors_count} icon={BarChart2} accent="bg-violet-50 text-violet-600" />
        <MetricCard label="Support" value={metrics?.supports_count} icon={Activity} accent="bg-sky-50 text-sky-600" />
      </div>

      {/* ── Filter Panel ─────────────────────────────────────────────────── */}
      <div className="w-full bg-[#F8F5ED]/40 border border-[#ECE6D6] rounded-[32px] p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
          {/* Search */}
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
              {ADMIN_ROLE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
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

        {/* Sort & Clear */}
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
            <p className="font-satoshi text-sm text-[#5A6465]">Try adjusting your filters or search keywords.</p>
          </div>
        )}

        {/* ── User Card Grid ─────────────────────────────────────────────── */}
        {!isLoading && !isError && rawUsers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rawUsers.map((user) => {
              const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || "U";
              const riskPct = user.risk_score != null ? Math.round(user.risk_score * 100) : null;
              return (
                <div
                  key={user.id}
                  onClick={() => handleOpenInspector(user)}
                  className="bg-white border border-[#ECE6D6] hover:border-[#01454A] rounded-[24px] p-5 space-y-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Top Row: Avatar & Badges */}
                    <div className="flex items-start justify-between">
                      {user.avatar ? (
                        <FashionistarImage
                          src={user.avatar}
                          alt={`${user.first_name || ""} ${user.last_name || ""}`.trim() || "User avatar"}
                          width={56}
                          height={56}
                          className="w-14 h-14 rounded-2xl border border-[#ECE6D6] group-hover:scale-105 transition-transform duration-200"
                          objectFit="cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-[#01454A]/5 border border-[#01454A]/15 text-[#01454A] font-bon_foyage text-lg flex items-center justify-center group-hover:bg-[#01454A]/10 transition-colors">
                          {initials}
                        </div>
                      )}

                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getRoleBadgeClass(user.role)}`}>
                          {user.role.replace("_", " ")}
                        </span>

                        {/* Status Check */}
                        <div className="flex items-center gap-1">
                          {user.is_verified ? (
                            <span className="flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> VERIFIED
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5 bg-amber-50 text-[#FDA600] text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-100">
                              <XCircle className="w-3 h-3" /> UNVERIFIED
                            </span>
                          )}
                        </div>
                        {user.two_factor_enabled && (
                          <span className="flex items-center gap-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-indigo-200">
                            <KeyRound className="w-3 h-3" /> 2FA ON
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Name + Member ID */}
                    <div>
                      <h4 className="font-bon_foyage text-xl text-black truncate">
                        {user.first_name || user.last_name
                          ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                          : "Anonymous User"}
                      </h4>
                      <p className="font-satoshi text-xs text-[#8A9596] mt-0.5">{user.member_id || "-N/A-"}</p>
                    </div>

                    {/* Bio Snippet */}
                    {user.bio && (
                      <p className="font-satoshi text-xs text-[#5A6465] line-clamp-2">{user.bio}</p>
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
                    <div className="flex items-center gap-2">
                      {riskPct != null && riskPct > 30 && <RiskBadge score={user.risk_score} />}
                      <span className={`font-semibold ${user.is_active ? "text-emerald-600" : "text-red-500"}`}>
                        {user.is_active ? "Active" : "Blocked"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Inspector Panel (Drawer) ──────────────────────────────────────── */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm transition-opacity duration-300">
          <div className="w-full max-w-lg h-full bg-[#F8F5ED] overflow-y-auto shadow-2xl flex flex-col border-l border-[#ECE6D6] animate-in slide-in-from-right duration-300">

            {/* Drawer Header */}
            <div className="sticky top-0 z-10 bg-[#F8F5ED] border-b border-[#ECE6D6] px-6 py-4 flex items-center justify-between">
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

            {/* Loading State */}
            {isDetailLoading && (
              <div className="flex flex-col items-center justify-center flex-1 py-20 gap-4">
                <Loader2 className="w-8 h-8 text-[#01454A] animate-spin" />
                <p className="font-satoshi text-sm text-[#5A6465]">Loading user details...</p>
              </div>
            )}

            {selectedUser && !isDetailLoading && (
              <div className="flex flex-col flex-1">
                {/* Identity Header */}
                <div className="px-6 py-5 border-b border-[#ECE6D6]/80 flex items-center gap-4">
                  {selectedUser.avatar ? (
                    <FashionistarImage
                      src={selectedUser.avatar}
                      alt={`${selectedUser.first_name || ""} ${selectedUser.last_name || ""}`.trim() || "User avatar"}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-2xl border border-[#ECE6D6]"
                      objectFit="cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-[#01454A]/5 border border-[#01454A]/15 text-[#01454A] font-bon_foyage text-2xl flex items-center justify-center">
                      {`${selectedUser.first_name?.[0] || ""}${selectedUser.last_name?.[0] || ""}`.toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bon_foyage text-2xl text-black truncate">
                      {selectedUser.first_name || selectedUser.last_name
                        ? `${selectedUser.first_name || ""} ${selectedUser.last_name || ""}`.trim()
                        : "Anonymous User"}
                    </h4>
                    <p className="font-satoshi text-xs text-[#8A9596] mt-0.5 truncate">
                      {selectedUser.member_id || selectedUser.id}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getRoleBadgeClass(selectedUser.role)}`}>
                        {selectedUser.role.replace(/_/g, " ")}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getProviderBadge(selectedUser.auth_provider)}`}>
                        via {selectedUser.auth_provider}
                      </span>
                      {selectedUser.is_superuser && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300">
                          Superuser
                        </span>
                      )}
                      {selectedUser.is_staff && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Staff
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Indicators Row */}
                <div className="grid grid-cols-3 divide-x divide-[#ECE6D6] border-b border-[#ECE6D6]">
                  <div className="px-4 py-3 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-[#8A9596] uppercase">Account</span>
                    <span className={`font-satoshi text-sm font-bold mt-0.5 ${selectedUser.is_active ? "text-emerald-600" : "text-red-500"}`}>
                      {selectedUser.is_active ? "Active" : "Suspended"}
                    </span>
                  </div>
                  <div className="px-4 py-3 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-[#8A9596] uppercase">Verification</span>
                    <span className={`font-satoshi text-sm font-bold mt-0.5 ${selectedUser.is_verified ? "text-emerald-600" : "text-amber-500"}`}>
                      {selectedUser.is_verified ? "KYC Approved" : "Unverified"}
                    </span>
                  </div>
                  <div className="px-4 py-3 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-[#8A9596] uppercase">Risk Score</span>
                    <span className={`font-satoshi text-sm font-bold mt-0.5 ${selectedUser.risk_score > 0.7 ? "text-red-600" : selectedUser.risk_score > 0.3 ? "text-amber-600" : "text-emerald-600"}`}>
                      {selectedUser.risk_score != null ? `${Math.round(selectedUser.risk_score * 100)}%` : "-N/A-"}
                    </span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#ECE6D6] bg-white px-4 overflow-x-auto">
                  {INSPECTOR_TABS.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setInspectorTab(tab.key)}
                      className={`flex items-center gap-1.5 px-4 py-3 font-satoshi text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                        inspectorTab === tab.key
                          ? "border-[#01454A] text-[#01454A]"
                          : "border-transparent text-[#8A9596] hover:text-black"
                      }`}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 px-6 py-5 space-y-5 overflow-y-auto">

                  {/* ── OVERVIEW TAB ─────────────────────────────────── */}
                  {inspectorTab === "overview" && (
                    <>
                      {/* Role Control */}
                      <div className="bg-white border border-[#ECE6D6] rounded-2xl p-4">
                        <span className="text-[10px] font-bold text-[#8A9596] uppercase block mb-2">Account Role</span>
                        <select
                          value={selectedUser.role}
                          onChange={(e) => handleRoleChange(e.target.value)}
                          disabled={updateRoleMutation.isPending}
                          className="w-full font-satoshi text-sm font-bold text-[#01454A] bg-white border border-[#ECE6D6] rounded-xl px-3 py-2 outline-none cursor-pointer transition"
                        >
                          {ADMIN_ROLE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Contact Information */}
                      <div className="bg-white border border-[#ECE6D6] rounded-2xl p-5 space-y-3 font-satoshi text-sm">
                        <p className="font-bon_foyage text-lg text-black border-b border-[#ECE6D6]/50 pb-2">Contact Coordinates</p>
                        {[
                          { label: "Email Address", value: selectedUser.email, icon: Mail },
                          { label: "Mobile Number", value: selectedUser.phone, icon: Phone },
                          { label: "Address", value: selectedUser.address, icon: MapPin },
                          { label: "Geography", value: [selectedUser.city, selectedUser.state, selectedUser.country].filter(Boolean).join(", ") || null, icon: Globe },
                        ].map(({ label, value, icon: Icon }) => (
                          <div key={label} className="flex items-start gap-3">
                            <Icon className="w-4 h-4 text-[#8A9596] mt-0.5 shrink-0" />
                            <div>
                              <span className="text-xs text-[#8A9596] block">{label}</span>
                              <span className="text-black font-medium">{value || "-N/A-"}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Preferences */}
                      <div className="bg-white border border-[#ECE6D6] rounded-2xl p-5 space-y-3 font-satoshi text-sm">
                        <p className="font-bon_foyage text-lg text-black border-b border-[#ECE6D6]/50 pb-2">Preferences</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-start gap-2">
                            <Languages className="w-4 h-4 text-[#8A9596] mt-0.5" />
                            <div>
                              <span className="text-xs text-[#8A9596] block">Language</span>
                              <span className="text-black font-medium">{selectedUser.preferred_language || "en"}</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Timer className="w-4 h-4 text-[#8A9596] mt-0.5" />
                            <div>
                              <span className="text-xs text-[#8A9596] block">Timezone</span>
                              <span className="text-black font-medium text-xs">{selectedUser.timezone || "Africa/Lagos"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="bg-white border border-[#ECE6D6] rounded-2xl p-5 font-satoshi text-sm">
                        <span className="text-xs text-[#8A9596] block font-semibold uppercase mb-2">Biography</span>
                        <p className="text-[#5A6465] italic leading-relaxed">
                          {selectedUser.bio || "No biography details supplied by this user."}
                        </p>
                      </div>

                      {/* Timestamps */}
                      <div className="bg-white border border-[#ECE6D6] rounded-2xl p-5 grid grid-cols-2 gap-4 font-satoshi text-sm">
                        <div>
                          <span className="text-xs text-[#8A9596] block">Date Joined</span>
                          <span className="text-black font-medium">{formatDate(selectedUser.date_joined)}</span>
                        </div>
                        <div>
                          <span className="text-xs text-[#8A9596] block">Last Updated</span>
                          <span className="text-black font-medium">{formatDate(selectedUser.updated_at)}</span>
                        </div>
                        {selectedUser.last_login && (
                          <div>
                            <span className="text-xs text-[#8A9596] block">Last Login</span>
                            <span className="text-black font-medium">{formatDateTime(selectedUser.last_login)}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-xs text-[#8A9596] block">Login Count</span>
                          <span className="text-black font-medium">{selectedUser.login_count ?? "—"}</span>
                        </div>
                        {selectedUser.referral_code && (
                          <div>
                            <span className="text-xs text-[#8A9596] block">Referral Code</span>
                            <span className="text-black font-medium font-mono">{selectedUser.referral_code}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* ── SECURITY TAB ─────────────────────────────────── */}
                  {inspectorTab === "security" && (
                    <>
                      <div className="bg-white border border-[#ECE6D6] rounded-2xl p-5 space-y-4 font-satoshi text-sm">
                        <p className="font-bon_foyage text-lg text-black border-b border-[#ECE6D6]/50 pb-2">Security Overview</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-[#8A9596] block">2FA Enabled</span>
                            <span className={`font-bold ${selectedUser.two_factor_enabled ? "text-emerald-600" : "text-[#8A9596]"}`}>
                              {selectedUser.two_factor_enabled ? "✓ Active" : "Disabled"}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-[#8A9596] block">Risk Score</span>
                            {selectedUser.risk_score != null ? (
                              <RiskBadge score={selectedUser.risk_score} />
                            ) : <span className="text-[#8A9596]">—</span>}
                          </div>
                          <div>
                            <span className="text-xs text-[#8A9596] block">Last Login IP</span>
                            <span className="text-black font-mono text-xs">{selectedUser.last_login_ip || "-N/A-"}</span>
                          </div>
                          <div>
                            <span className="text-xs text-[#8A9596] block">Last Device</span>
                            <span className="text-black text-xs truncate block">{selectedUser.last_login_device || "-N/A-"}</span>
                          </div>
                          <div>
                            <span className="text-xs text-[#8A9596] block">Auth Provider</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getProviderBadge(selectedUser.auth_provider)}`}>
                              {selectedUser.auth_provider}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-[#8A9596] block">Total Logins</span>
                            <span className="text-black font-bold">{selectedUser.login_count ?? "—"}</span>
                          </div>
                        </div>
                      </div>

                      {selectedUser.is_deleted && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 font-satoshi text-sm">
                          <div className="flex items-center gap-2 text-red-700 font-bold mb-1">
                            <Ban className="w-4 h-4" /> Account Soft-Deleted
                          </div>
                          <p className="text-red-600 text-xs">Deleted at: {formatDateTime(selectedUser.deleted_at)}</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* ── GDPR TAB ─────────────────────────────────────── */}
                  {inspectorTab === "gdpr" && (
                    <>
                      <div className="bg-white border border-[#ECE6D6] rounded-2xl p-5 space-y-4 font-satoshi text-sm">
                        <p className="font-bon_foyage text-lg text-black border-b border-[#ECE6D6]/50 pb-2">GDPR & Compliance</p>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[#8A9596]">Processing Restricted (Art. 18)</span>
                            <span className={`font-bold text-sm ${selectedUser.is_processing_restricted ? "text-red-600" : "text-emerald-600"}`}>
                              {selectedUser.is_processing_restricted ? "Yes" : "No"}
                            </span>
                          </div>
                          {selectedUser.processing_restriction_reason && (
                            <div>
                              <span className="text-xs text-[#8A9596] block">Restriction Reason</span>
                              <p className="text-black text-xs mt-0.5">{selectedUser.processing_restriction_reason}</p>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[#8A9596]">Marketing Consent</span>
                            <span className={`font-bold text-sm ${selectedUser.marketing_consent ? "text-emerald-600" : "text-[#8A9596]"}`}>
                              {selectedUser.marketing_consent ? "Granted" : "Not granted"}
                            </span>
                          </div>
                          {selectedUser.marketing_consent_at && (
                            <div>
                              <span className="text-xs text-[#8A9596] block">Consent granted at</span>
                              <span className="text-black text-xs">{formatDateTime(selectedUser.marketing_consent_at)}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-xs text-[#8A9596] block">Data Retention Policy</span>
                            <span className="text-black font-medium capitalize">{selectedUser.data_retention_policy || "standard"}</span>
                          </div>
                          <div>
                            <span className="text-xs text-[#8A9596] block">Objected Processing Purposes (Art. 21)</span>
                            {selectedUser.objected_processing_purposes?.length > 0 ? (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedUser.objected_processing_purposes.map(p => (
                                  <span key={p} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{p}</span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-emerald-600 text-sm font-bold">None — No objections filed</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* ── ACTIVITY TAB ─────────────────────────────────── */}
                  {inspectorTab === "activity" && (
                    <>
                      <div className="bg-white border border-[#ECE6D6] rounded-2xl p-5 space-y-3">
                        <p className="font-bon_foyage text-lg text-black border-b border-[#ECE6D6]/50 pb-2">Recent Login Events</p>
                        {!loginEvents?.results?.length && (
                          <p className="font-satoshi text-sm text-[#8A9596] italic">No login events found.</p>
                        )}
                        {loginEvents?.results?.map(ev => (
                          <div key={ev.id} className="border-b border-[#ECE6D6]/40 pb-3 last:border-0 last:pb-0 font-satoshi text-xs">
                            <div className="flex items-center justify-between">
                              <span className={`font-bold ${ev.is_successful ? "text-emerald-600" : "text-red-600"}`}>
                                {ev.is_successful ? "✓ Success" : "✗ Failed"}
                              </span>
                              <span className="text-[#8A9596]">{formatDateTime(ev.created_at)}</span>
                            </div>
                            <div className="text-[#5A6465] mt-1 space-y-0.5">
                              {ev.ip_address && <p>IP: <span className="font-mono">{ev.ip_address}</span></p>}
                              {ev.country && <p>Location: {[ev.city, ev.region, ev.country].filter(Boolean).join(", ")}</p>}
                              {ev.failure_reason && <p className="text-red-500">Reason: {ev.failure_reason}</p>}
                              {ev.risk_score > 0 && <RiskBadge score={ev.risk_score} />}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-white border border-[#ECE6D6] rounded-2xl p-5 space-y-3">
                        <p className="font-bon_foyage text-lg text-black border-b border-[#ECE6D6]/50 pb-2">Active Sessions</p>
                        {!sessions?.results?.length && (
                          <p className="font-satoshi text-sm text-[#8A9596] italic">No active sessions.</p>
                        )}
                        {sessions?.results?.map(sess => (
                          <div key={sess.id} className="border-b border-[#ECE6D6]/40 pb-3 last:border-0 last:pb-0 font-satoshi text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-black">{sess.device_name || sess.browser_family || "Unknown device"}</span>
                              <span className="text-[#8A9596]">{formatDateTime(sess.last_used_at)}</span>
                            </div>
                            <div className="text-[#5A6465] mt-1 space-y-0.5">
                              {sess.ip_address && <p>IP: <span className="font-mono">{sess.ip_address}</span></p>}
                              {sess.os_family && <p>OS: {sess.os_family}</p>}
                              {sess.revoked_at && <p className="text-red-500">Revoked: {formatDateTime(sess.revoked_at)}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* ── Admin Actions Footer ──────────────────────────── */}
                <div className="sticky bottom-0 bg-[#F8F5ED] border-t border-[#ECE6D6] px-6 py-5 space-y-3">
                  <span className="font-satoshi text-xs font-bold uppercase text-[#8A9596] tracking-wider block">
                    Administrative Overrides
                  </span>

                  {/* Suspend / Reactivate */}
                  <button
                    id="admin-toggle-active-btn"
                    onClick={handleToggleActive}
                    disabled={suspendMutation.isPending || reactivateMutation.isPending}
                    className={`w-full py-3.5 rounded-xl font-satoshi font-bold text-sm flex items-center justify-center gap-2 border shadow-sm transition-all duration-200 disabled:opacity-60 ${
                      selectedUser.is_active
                        ? "bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                        : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {suspendMutation.isPending || reactivateMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : selectedUser.is_active ? (
                      <><Lock className="w-4 h-4" /> Suspend User (Block Account)</>
                    ) : (
                      <><Unlock className="w-4 h-4" /> Restore User (Unblock Account)</>
                    )}
                  </button>

                  {/* Verify */}
                  {!selectedUser.is_verified && (
                    <button
                      id="admin-verify-btn"
                      onClick={handleVerify}
                      disabled={verifyMutation.isPending}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-satoshi font-bold text-sm py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50"
                    >
                      {verifyMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <><BadgeCheck className="w-4 h-4" /> Manually Approve Verification</>
                      )}
                    </button>
                  )}

                  {/* Force Password Reset */}
                  <button
                    id="admin-force-reset-btn"
                    onClick={handleForcePasswordReset}
                    disabled={forcePasswordResetMutation.isPending}
                    className="w-full bg-white hover:bg-[#F4F3EC] border border-[#ECE6D6] text-black font-satoshi font-bold text-sm py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50"
                  >
                    {forcePasswordResetMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <><ShieldAlert className="w-4 h-4 text-[#FDA600]" /> Trigger Force Password Reset</>
                    )}
                  </button>

                  {/* Open in Django Admin */}
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}
