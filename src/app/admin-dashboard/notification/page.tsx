"use client";

import { useState } from "react";
import {
  Bell,
  Search,
  Send,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface SystemNotification {
  id: string;
  title: string;
  body: string;
  targetAudience: "all" | "vendors" | "clients";
  status: "sent" | "draft";
  created_at: string;
}

const MOCK_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "NTF-9901",
    title: "System Update: Wallet Payout Windows",
    body: "Please note that minimum payout threshold is now updated to ₦10,000 for compliance gating.",
    targetAudience: "vendors",
    status: "sent",
    created_at: "2026-05-24",
  },
  {
    id: "NTF-9902",
    title: "New Bespoke Design Feature Deployed",
    body: "Explore tailor body profile measurement guides inside your custom dashboard today.",
    targetAudience: "clients",
    status: "sent",
    created_at: "2026-05-20",
  },
];

export default function AdminNotificationPage() {
  const [search, setSearch] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [bodyInput, setBodyInput] = useState("");
  const [targetAudience, setTargetAudience] = useState<"all" | "vendors" | "clients">("all");
  const [isPending, setIsPending] = useState(false);

  const filteredNotifs = MOCK_NOTIFICATIONS.filter((notif) =>
    notif.title.toLowerCase().includes(search.toLowerCase()) ||
    notif.body.toLowerCase().includes(search.toLowerCase())
  );

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim() || !bodyInput.trim()) {
      toast.error("Please fill in notification headers and body content.");
      return;
    }

    setIsPending(true);
    setTimeout(() => {
      setIsPending(false);
      toast.success("Platform broadcast queued successfully.");
      setTitleInput("");
      setBodyInput("");
    }, 1200);
  };

  return (
    <div className="space-y-10 bg-inherit min-h-screen pb-12 font-satoshi">
      {/* Header Banner */}
      <div>
        <h3 className="font-bon_foyage text-4xl text-black md:text-5xl">
          System Broadcasts
        </h3>
        <p className="text-sm text-[#5A6465] mt-1">
          Compose platform-wide alerts, push announcements to tailored boutiques, and broadcast news to luxury clients.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Compose Form */}
        <div className="lg:col-span-1 bg-white border border-[#ECE6D6] rounded-[24px] p-6 shadow-sm flex flex-col justify-between h-fit">
          <form onSubmit={handleBroadcast} className="space-y-6">
            <div className="flex items-center gap-2 border-b border-[#ECE6D6]/60 pb-3">
              <Bell className="w-5 h-5 text-[#01454A]" />
              <h4 className="font-bon_foyage text-xl text-black">Compose Broadcast</h4>
            </div>

            <div className="space-y-1">
              <label htmlFor="notif_title" className="font-bold text-xs text-black block">Broadcast Title</label>
              <input
                id="notif_title"
                type="text"
                placeholder="e.g. System upgrade active"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className="px-4 w-full bg-[#F8F5ED]/40 outline-none rounded-xl h-12 border border-[#ECE6D6] text-xs text-black focus:border-[#01454A] transition"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="target_audience" className="font-bold text-xs text-black block">Target Audience</label>
              <select
                id="target_audience"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
                className="px-4 w-full bg-[#F8F5ED]/40 outline-none rounded-xl h-12 border border-[#ECE6D6] text-xs text-black focus:border-[#01454A] transition cursor-pointer"
              >
                <option value="all">All Registered Users</option>
                <option value="vendors">Vendors (Luxury Boutiques) Only</option>
                <option value="clients">Clients (Custom Buyers) Only</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="notif_body" className="font-bold text-xs text-black block">Alert Message Body</label>
              <textarea
                id="notif_body"
                rows={4}
                placeholder="Write system message content here..."
                value={bodyInput}
                onChange={(e) => setBodyInput(e.target.value)}
                className="p-4 w-full bg-[#F8F5ED]/40 outline-none rounded-xl border border-[#ECE6D6] text-xs text-black focus:border-[#01454A] transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 bg-[#01454A] hover:bg-[#01454A]/90 text-white hover:text-[#FDA600] font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" /> Queue &amp; Broadcast Alert
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: History logs */}
        <div className="lg:col-span-2 bg-[#F8F5ED]/40 border border-[#ECE6D6] rounded-[32px] p-6 md:p-8 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A9596]" />
            <input
              type="text"
              placeholder="Search historical alerts by keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border border-[#ECE6D6] focus:border-[#01454A] rounded-2xl outline-none text-sm text-black placeholder:text-[#8A9596] transition-all"
            />
          </div>

          <div className="space-y-4">
            {filteredNotifs.map((notif) => (
              <div
                key={notif.id}
                className="bg-white border border-[#ECE6D6] rounded-[20px] p-5 shadow-xs flex flex-col justify-between gap-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#8A9596]">{notif.id}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold uppercase bg-[#01454A]/10 text-[#01454A] px-2 py-0.5 rounded-full">
                      Audience: {notif.targetAudience}
                    </span>
                    <span className="text-[9px] font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full">
                      SENT
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bon_foyage text-lg text-black">{notif.title}</h4>
                  <p className="text-xs text-[#5A6465] leading-relaxed mt-1.5">{notif.body}</p>
                </div>

                <div className="pt-3 border-t border-[#ECE6D6]/40 text-[9px] text-[#8A9596]">
                  Queued Date: {notif.created_at}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
