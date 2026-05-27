"use client";
import BarChart from "@/components/ui/composites/Charts";
import { ChartOptions, ChartData } from "chart.js";
import Image from "next/image";
import { Suspense } from "react";
import { TableRowSkeleton } from "@/shared/components/skeletons";
import { useAdminDashboardKPI } from "@/features/admin-dashboard";

import { AdminOrderList } from "@/features/admin-dashboard";

interface MembersProp {
  image: string;
  name: string;
  address: string;
}
interface ActivitiesProp {
  date: string;
  activity: string;
}
interface MarketingProp {
  platform: "facebook" | "instagram" | "twitter" | "google" | "tiktok";
  value: number;
}

const Page = () => {
  const { data: kpiData, isLoading } = useAdminDashboardKPI();

  const data: ChartData<"bar", number[], string> = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "April",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Sales",
        data: [2, 5, 8, 10, 24, 12, 18, 20, 25, 15, 26, 31],
        borderWidth: 1,
        backgroundColor: "#fda600",
        barThickness: 15,
        barPercentage: 0.8,
        categoryPercentage: 0.5,
      },
      {
        label: "Visitors",
        data: [6, 12, 8, 15, 17, 9, 13, 8, 12, 25, 16, 22],
        borderWidth: 1,
        backgroundColor: "#000",
        barThickness: 15,
        barPercentage: 0.8,
        categoryPercentage: 0.5,
      },
      {
        label: "Products",
        data: [22, 16, 23, 15, 10, 17, 19, 12, 5, 14, 10, 11],
        borderWidth: 1,
        backgroundColor: "#25784A",
        barThickness: 15,
        barPercentage: 0.8,
        categoryPercentage: 0.5,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Sales of the month",
      },
    },
    scales: {
      x: {
        stacked: false,
      },
      y: {
        stacked: false,
      },
    },
  };

  const members: MembersProp[] = [
    {
      name: "Chidera Igwe",
      image: "/woman2.svg",
      address: "Onitsha, Anambra State",
    },
    {
      name: "Chidera Igwe",
      image: "/woman3.svg",
      address: "Onitsha, Anambra State",
    },
    {
      name: "Chidera Igwe",
      image: "/woman4.svg",
      address: "Onitsha, Anambra State",
    },
    {
      name: "Chidera Igwe",
      image: "/man4_asset.svg",
      address: "Onitsha, Anambra State",
    },
  ];

  const membersList = members.map((member, index) => {
    return (
      <div key={index} className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
          <div className="w-[45px] h-[45px] rounded-full">
            <Image
              src={member.image}
              alt={member.name}
              width={100}
              height={100}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div>
            <h2 className="font-medium text-[13px] leading-[17.55px] font-satoshi text-black">
              {member.name}
            </h2>
            <p className="font-satoshi text-[10px] leading-[13.5px] text-[#858585] font-medium">
              {member.address}
            </p>
          </div>
        </div>
        <div>
          <button className="py-1.5 px-5 bg-[#fda600] font-satoshi font-medium text-[10px] leading-[14px] text-white rounded">
            Add
          </button>
        </div>
      </div>
    );
  });

  const activities: ActivitiesProp[] = [
    {
      date: "04 Apr, 2024",
      activity: "Unified Admin System online: Central URL endpoints consolidated.",
    },
    {
      date: "23 May, 2024",
      activity: "KYC verification service updated: Auto-seeds milestone tranches.",
    },
    {
      date: "12 June, 2024",
      activity: "Audit Log forensic diff model deployed: PCI-DSS compliance active.",
    },
    {
      date: "30 June, 2024",
      activity: "Zustand global admin cache active: URL parameters state reconciled.",
    },
  ];

  const activitiesList = activities.map((activity, index) => {
    return (
      <div key={index} className="flex items-center gap-4">
        <p className="font-satoshi font-normal text-sm text-black min-w-[87px]">
          {activity.date}
        </p>
        <div className="font-satoshi flex items-center gap-3">
          <span className="text-[#fda600] font-medium"> &#8594;</span>
          <span className="text-[10px] leading-[14px] text-[#282828] max-w-[160px]">
            {activity.activity}
          </span>
        </div>
      </div>
    );
  });

  const marketing: MarketingProp[] = [
    { platform: "instagram", value: 40 },
    { platform: "tiktok", value: 50 },
    { platform: "twitter", value: 10 },
    { platform: "google", value: 90 },
    { platform: "facebook", value: 80 },
  ];

  const marketingList = marketing.map((item, index) => {
    return (
      <div key={index} className="flex flex-col gap-1">
        <label
          htmlFor={`progress-bar-${index}`}
          className="font-satoshi font-medium text-xs text-[#282828] capitalize"
        >
          {item.platform}
        </label>
        <progress id={`progress-bar-${index}`} value={item.value} max={100} className="w-full h-2 rounded bg-gray-200 accent-[#fda600]" />
      </div>
    );
  });

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-satoshi font-medium text-3xl text-black">
            Dashboard
          </h2>
          <p className="font-satoshi text-xl text-[#666]">
            Platform overall activity and metrics summary.
          </p>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <span className="animate-spin h-4 w-4 border-2 border-[#fda600] border-t-transparent rounded-full"></span>
            Syncing live metrics...
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users KPI Card */}
        <div className="bg-[#fff] rounded-[10px] shadow p-5 flex flex-col justify-between h-[150px]">
          <div className="flex justify-between items-center">
            <span className="font-satoshi text-lg text-gray-500">Total Users</span>
            <div className="flex justify-center items-center w-9 h-9 bg-[#C5FECB] rounded-full">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#20AB2C" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div>
            <span className="font-bold text-3xl text-black">
              {isLoading ? "..." : (kpiData?.total_users ?? 0).toLocaleString()}
            </span>
            <p className="text-xs text-[#858585] mt-1">
              {kpiData?.new_users_today ?? 0} joined today
            </p>
          </div>
        </div>

        {/* Sellers & KYC KPI Card */}
        <div className="bg-[#fff] rounded-[10px] shadow p-5 flex flex-col justify-between h-[150px]">
          <div className="flex justify-between items-center">
            <span className="font-satoshi text-lg text-gray-500">Active Vendors</span>
            <div className="flex justify-center items-center w-9 h-9 bg-[#FEF3D3] rounded-full">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ECB219" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>
          <div>
            <span className="font-bold text-3xl text-black">
              {isLoading ? "..." : (kpiData?.active_vendors ?? 0).toLocaleString()}
            </span>
            <p className="text-xs text-[#858585] mt-1">
              {kpiData?.pending_kyc_submissions ?? 0} pending KYC
            </p>
          </div>
        </div>

        {/* Live Orders KPI Card */}
        <div className="bg-[#fff] rounded-[10px] shadow p-5 flex flex-col justify-between h-[150px]">
          <div className="flex justify-between items-center">
            <span className="font-satoshi text-lg text-gray-500">Total Orders</span>
            <div className="flex justify-center items-center w-9 h-9 bg-[#C5FECB] rounded-full">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#20AB2C" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
          </div>
          <div>
            <span className="font-bold text-3xl text-black">
              {isLoading ? "..." : (kpiData?.total_orders ?? 0).toLocaleString()}
            </span>
            <p className="text-xs text-[#858585] mt-1">
              {kpiData?.orders_pending ?? 0} pending processing
            </p>
          </div>
        </div>

        {/* Catalog & Tickets KPI Card */}
        <div className="bg-[#fff] rounded-[10px] shadow p-5 flex flex-col justify-between h-[150px]">
          <div className="flex justify-between items-center">
            <span className="font-satoshi text-lg text-gray-500">Live Catalog</span>
            <div className="flex justify-center items-center w-9 h-9 bg-[#FEF3D3] rounded-full">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ECB219" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>
          <div>
            <span className="font-bold text-3xl text-black">
              {isLoading ? "..." : (kpiData?.total_products ?? 0).toLocaleString()}
            </span>
            <p className="text-xs text-[#858585] mt-1">
              {kpiData?.products_pending_review ?? 0} reviews | {kpiData?.open_support_tickets ?? 0} open tickets
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white p-5 rounded-[10px] shadow">
        <div className="h-[350px]">
          <BarChart options={options} data={data} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex flex-col justify-between px-5 py-4 bg-white rounded-[10px] shadow h-[383px]">
          <h3 className="text-xl font-medium font-satoshi text-black border-b pb-2 mb-2">
            New Members
          </h3>
          <div className="flex-1 flex flex-col justify-evenly">
            {membersList}
          </div>
        </div>
        <div className="flex flex-col justify-between px-5 py-4 bg-white rounded-[10px] shadow h-[383px]">
          <h3 className="text-xl font-medium font-satoshi text-black border-b pb-2 mb-2">
            Recent Activities
          </h3>
          <div className="flex-1 flex flex-col justify-evenly">
            {activitiesList}
          </div>
        </div>
        <div className="flex flex-col justify-between px-5 py-4 bg-white rounded-[10px] shadow h-[383px]">
          <h3 className="text-xl font-medium font-satoshi text-black border-b pb-2 mb-2">
            Marketing Channel
          </h3>
          <div className="flex-1 flex flex-col justify-evenly">
            {marketingList}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="font-satoshi font-medium text-2xl text-black">
          Latest Orders
        </h2>
        <Suspense
          fallback={
            <div className="rounded-2xl border border-border bg-card p-4">
              <TableRowSkeleton columns={5} rows={6} />
            </div>
          }
        >
          <AdminOrderList />
        </Suspense>
      </div>
    </div>
  );
};

export default Page;
