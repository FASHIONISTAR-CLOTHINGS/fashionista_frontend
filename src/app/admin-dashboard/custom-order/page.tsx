"use client";

import { useState } from "react";
import {
  Search,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Settings,
  Mail,
  User,
  Scissors,
  HelpCircle,
} from "lucide-react";

interface CustomOrder {
  id: string;
  clientName: string;
  clientEmail: string;
  designerName: string;
  garmentType: string;
  status: "pending_review" | "in_production" | "shipped" | "completed" | "cancelled";
  price: number;
  dueDate: string;
  created_at: string;
  notes: string;
}

const MOCK_CUSTOM_ORDERS: CustomOrder[] = [
  {
    id: "CST-0091",
    clientName: "Amara Kalu",
    clientEmail: "amara@fashionistar.com",
    designerName: "Deji Luxury",
    garmentType: "Bridal Aso-Oke Ensemble",
    status: "in_production",
    price: 350000,
    dueDate: "2026-06-15",
    created_at: "2026-05-10",
    notes: "Requires hand-woven gold filigree accents along the shoulder train.",
  },
  {
    id: "CST-0092",
    clientName: "Tobi Adebayo",
    clientEmail: "tobi.adebayo@gmail.com",
    designerName: "Vanguard Tailors",
    garmentType: "Classic Cashmere Agbada Set",
    status: "pending_review",
    price: 280000,
    dueDate: "2026-06-20",
    created_at: "2026-05-25",
    notes: "Requesting custom initials embroidery on the left sleeve hem.",
  },
  {
    id: "CST-0093",
    clientName: "Ngozi Echem",
    clientEmail: "ngozi@echem.co",
    designerName: "Eze Couture",
    garmentType: "Modern Ankara Ballgown",
    status: "completed",
    price: 195000,
    dueDate: "2026-05-24",
    created_at: "2026-05-01",
    notes: "High-low structural hemline with micro-pleated sleeve caps.",
  },
];

export default function AdminCustomOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);

  const filteredOrders = MOCK_CUSTOM_ORDERS.filter((order) => {
    const matchesSearch =
      order.clientName.toLowerCase().includes(search.toLowerCase()) ||
      order.designerName.toLowerCase().includes(search.toLowerCase()) ||
      order.garmentType.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: CustomOrder["status"]) => {
    switch (status) {
      case "pending_review":
        return (
          <span className="flex items-center gap-1 bg-amber-50 text-[#FDA600] border border-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            <Clock className="w-3 h-3" /> PENDING REVIEW
          </span>
        );
      case "in_production":
        return (
          <span className="flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            <Scissors className="w-3 h-3" /> IN PRODUCTION
          </span>
        );
      case "completed":
        return (
          <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3" /> COMPLETED
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 bg-gray-50 text-gray-500 border border-gray-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            <HelpCircle className="w-3 h-3" /> {status.replace("_", " ")}
          </span>
        );
    }
  };

  return (
    <div className="space-y-10 bg-inherit min-h-screen pb-12 font-satoshi">
      {/* Header Banner */}
      <div>
        <h3 className="font-bon_foyage text-4xl text-black md:text-5xl">
          Custom & Bespoke Orders
        </h3>
        <p className="text-sm text-[#5A6465] mt-1">
          Monitor customized tailoring commissions, manage production stages, and moderate client designer milestones.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#fff] rounded-[20px] shadow-sm p-6 border border-[#ECE6D6] flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Active Custom Escrows</span>
            <span className="font-bon_foyage text-3xl text-black">₦825,000</span>
          </div>
          <div className="p-3 bg-[#C5FECB] text-emerald-700 rounded-full">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#fff] rounded-[20px] shadow-sm p-6 border border-[#ECE6D6] flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Bespoke in Production</span>
            <span className="font-bon_foyage text-3xl text-black">12 Garments</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <Scissors className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#fff] rounded-[20px] shadow-sm p-6 border border-[#ECE6D6] flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Approvals Waiting</span>
            <span className="font-bon_foyage text-3xl text-[#FDA600]">4 Requests</span>
          </div>
          <div className="p-3 bg-amber-50 text-[#FDA600] rounded-full">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Operations Card */}
      <div className="w-full bg-[#F8F5ED]/40 border border-[#ECE6D6] rounded-[32px] p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A9596]" />
            <input
              type="text"
              placeholder="Search custom orders by designer, client, garment type or order ID..."
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
              <option value="all">All Bespoke Statuses</option>
              <option value="pending_review">Pending Review</option>
              <option value="in_production">In Production</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-[#ECE6D6] hover:border-[#01454A] rounded-[24px] p-6 shadow-xs hover:shadow transition duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#8A9596]">{order.id}</span>
                  {getStatusBadge(order.status)}
                </div>

                <div>
                  <h4 className="font-bon_foyage text-xl text-black">{order.garmentType}</h4>
                  <p className="text-xs text-[#FDA600] font-bold mt-1">₦{order.price.toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#ECE6D6]/40 text-xs">
                  <div>
                    <span className="text-[#8A9596] block">Client</span>
                    <span className="font-semibold text-black flex items-center gap-1 mt-0.5">
                      <User className="w-3 h-3" /> {order.clientName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8A9596] block">Design House</span>
                    <span className="font-semibold text-[#01454A] flex items-center gap-1 mt-0.5">
                      <Sparkles className="w-3 h-3" /> {order.designerName}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#5A6465] leading-relaxed bg-[#F8F5ED]/40 border border-[#ECE6D6]/50 rounded-xl p-3">
                  {order.notes}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#ECE6D6]/50 text-[10px] text-[#8A9596]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Due Date: {formatDate(order.dueDate)}
                </span>
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="flex items-center gap-1 font-bold text-xs text-[#01454A] hover:text-[#FDA600] transition"
                >
                  <Eye className="w-4 h-4" /> Inspect Milestones
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md h-full bg-[#F8F5ED] p-6 md:p-8 overflow-y-auto shadow-2xl flex flex-col justify-between border-l border-[#ECE6D6] animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#5A6465]">
                  Bespoke Order Inspector
                </span>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 rounded-full border border-[#ECE6D6] bg-white hover:bg-black hover:text-white transition"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 border-b border-[#ECE6D6]/80">
                <span className="font-mono text-xs text-[#8A9596] block">{selectedOrder.id}</span>
                <h4 className="font-bon_foyage text-2xl text-black mt-1">
                  {selectedOrder.garmentType}
                </h4>
                <div className="mt-2">{getStatusBadge(selectedOrder.status)}</div>
              </div>

              <div className="space-y-4 bg-white border border-[#ECE6D6] rounded-2xl p-5 text-sm">
                <p className="font-bon_foyage text-lg text-black border-b border-[#ECE6D6]/50 pb-2">
                  Transaction Metadata
                </p>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-[#8A9596] block">Bespoke Contract Price</span>
                    <span className="text-[#FDA600] font-bold text-lg">₦{selectedOrder.price.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#8A9596] block">Client Contact</span>
                    <span className="text-black font-semibold flex items-center gap-1 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-[#8A9596]" /> {selectedOrder.clientEmail}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#ECE6D6]/80 bg-inherit space-y-3">
              <Link
                href={`${process.env.NEXT_PUBLIC_API_V1_URL || "http://127.0.0.1:8001"}/admin/custom_order/customorder/${selectedOrder.id}/change/`}
                target="_blank"
                className="w-full bg-[#01454A] hover:bg-[#01454A]/90 text-white font-bold text-sm py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition"
              >
                <Settings className="w-4 h-4" />
                Open In Django Super-Admin
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
