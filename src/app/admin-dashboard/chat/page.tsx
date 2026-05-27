"use client";

import { useState } from "react";
import {
  Search,
  MessageSquare,
  Send,
  User,
  Shield,
  Loader2,
  XCircle,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";

interface SupportChannel {
  id: string;
  clientName: string;
  designerName: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  status: "open" | "closed";
}

const MOCK_CHANNELS: SupportChannel[] = [
  {
    id: "CH-1002",
    clientName: "Amara Kalu",
    designerName: "Deji Luxury",
    lastMessage: "Thank you for the update. The golden thread embroidery looks perfect.",
    timestamp: "10:45 AM",
    unreadCount: 2,
    status: "open",
  },
  {
    id: "CH-1003",
    clientName: "Tobi Adebayo",
    designerName: "Vanguard Tailors",
    lastMessage: "I need to modify the sleeve length by 1.5 inches before cutting the fabric.",
    timestamp: "Yesterday",
    unreadCount: 0,
    status: "open",
  },
  {
    id: "CH-1004",
    clientName: "Ngozi Echem",
    designerName: "Eze Couture",
    lastMessage: "Your Ankara dress has been packaged and handed over to DHL.",
    timestamp: "2 days ago",
    unreadCount: 0,
    status: "closed",
  },
];

export default function AdminChatPage() {
  const [search, setSearch] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<SupportChannel | null>(MOCK_CHANNELS[0]);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: "client", text: "Hello! Is it possible to see the golden thread accent design?", time: "10:40 AM" },
    { sender: "designer", text: "Of course! I have uploaded the close-up sample to the order file.", time: "10:42 AM" },
    { sender: "client", text: "Thank you for the update. The golden thread embroidery looks perfect.", time: "10:45 AM" },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      { sender: "admin", text: messageInput, time: "Just now" },
    ]);
    setMessageInput("");
  };

  return (
    <div className="space-y-10 bg-inherit min-h-screen pb-12 font-satoshi">
      {/* Header Banner */}
      <div>
        <h3 className="font-bon_foyage text-4xl text-black md:text-5xl">
          Chat Support Console
        </h3>
        <p className="text-sm text-[#5A6465] mt-1">
          Monitor platform communication threads, arbitrate designer tailoring disputes, and assist premium clients.
        </p>
      </div>

      {/* Main console layout */}
      <div className="w-full h-[600px] bg-white border border-[#ECE6D6] rounded-[32px] overflow-hidden flex shadow-sm">
        
        {/* Left: Channels directory */}
        <div className="w-[35%] border-r border-[#ECE6D6] flex flex-col justify-between bg-[#F8F5ED]/20">
          {/* Search bar */}
          <div className="p-4 border-b border-[#ECE6D6]/80 relative shrink-0">
            <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A9596]" />
            <input
              type="text"
              placeholder="Search chat logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-white border border-[#ECE6D6] focus:border-[#01454A] rounded-xl outline-none text-xs text-black transition"
            />
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {MOCK_CHANNELS.map((channel) => (
              <div
                key={channel.id}
                onClick={() => setSelectedChannel(channel)}
                className={`p-4 rounded-2xl cursor-pointer transition select-none flex flex-col gap-2 ${
                  selectedChannel?.id === channel.id
                    ? "bg-[#01454A] text-white shadow-sm"
                    : "bg-white hover:bg-[#F8F5ED]/40 border border-[#ECE6D6] text-black"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold opacity-60">{channel.id}</span>
                  <span className="text-[9px] font-medium opacity-80">{channel.timestamp}</span>
                </div>
                <div>
                  <h4 className="font-bon_foyage text-base truncate">{channel.clientName} ↔ {channel.designerName}</h4>
                  <p className={`text-xs mt-1 line-clamp-1 opacity-70`}>
                    {channel.lastMessage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Messages and input form */}
        <div className="flex-1 flex flex-col justify-between bg-white">
          {selectedChannel ? (
            <>
              {/* Active channel header */}
              <div className="px-6 py-4 border-b border-[#ECE6D6]/80 flex items-center justify-between shrink-0">
                <div>
                  <h4 className="font-bon_foyage text-lg text-black">
                    {selectedChannel.clientName} &amp; {selectedChannel.designerName}
                  </h4>
                  <p className="text-xs text-[#8A9596] mt-0.5">Monitoring Active Bespoke Thread</p>
                </div>
                <span className="inline-flex items-center gap-1 bg-[#01454A]/10 text-[#01454A] text-[10px] font-bold px-2.5 py-1 rounded-full">
                  <Shield className="w-3.5 h-3.5 text-[#FDA600]" /> MONITORING MODE
                </span>
              </div>

              {/* Message Log */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex justify-center">
                  <span className="text-[10px] font-bold tracking-wider text-[#8A9596] uppercase bg-[#F8F5ED] border border-[#ECE6D6]/80 px-3 py-1 rounded-lg">
                    Immutable Thread Monitored
                  </span>
                </div>

                {messages.map((msg, i) => {
                  const isAdmin = msg.sender === "admin";
                  const isDesigner = msg.sender === "designer";
                  return (
                    <div
                      key={i}
                      className={`flex flex-col max-w-[70%] ${
                        isAdmin
                          ? "ml-auto items-end"
                          : "mr-auto items-start"
                      }`}
                    >
                      <span className="text-[9px] font-bold text-[#8A9596] uppercase mb-1">
                        {msg.sender === "client"
                          ? selectedChannel.clientName
                          : msg.sender === "designer"
                            ? selectedChannel.designerName
                            : "Platform Administrator"}
                      </span>
                      <div
                        className={`p-4 rounded-2xl text-xs leading-relaxed ${
                          isAdmin
                            ? "bg-[#FDA600] text-white rounded-tr-none"
                            : isDesigner
                              ? "bg-[#01454A] text-white rounded-tl-none"
                              : "bg-[#F8F5ED] text-black border border-[#ECE6D6] rounded-tl-none"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-gray-400 mt-1">{msg.time}</span>
                    </div>
                  );
                })}
              </div>

              {/* Message Form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-[#ECE6D6]/80 flex gap-3 shrink-0">
                <input
                  type="text"
                  placeholder="Inject administrative assistant message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 h-12 px-4 bg-[#F8F5ED]/40 border border-[#ECE6D6] focus:border-[#01454A] rounded-xl outline-none text-xs text-black"
                />
                <button
                  type="submit"
                  className="w-12 h-12 bg-[#01454A] hover:bg-[#01454A]/90 text-white hover:text-[#FDA600] rounded-xl flex items-center justify-center transition"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <MessageSquare className="w-12 h-12 text-gray-300" />
              <h4 className="font-bon_foyage text-xl text-black">Select Conversation</h4>
              <p className="text-xs text-[#8A9596] max-w-xs">
                Pick an active tailor-client conversation thread from the left pane to monitor and inject assistance.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
