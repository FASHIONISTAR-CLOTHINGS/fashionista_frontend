/**
 * @file Charts.tsx
 * @description Production-grade chart components — 100% Shadcn/ui compatible.
 *
 * ALL Recharts-based charts use the official Shadcn/ui chart primitives:
 *   ChartContainer, ChartTooltip, ChartTooltipContent,
 *   ChartLegend, ChartLegendContent, ChartConfig
 *
 * This means themes, colours, dark-mode, tooltips and legends all follow
 * the project's design system automatically.
 *
 * Exports:
 *  ── Named (Shadcn/ui + Recharts) ─────────────────────────────────────────
 *   - `RechartsBarChart`    – responsive bar chart
 *   - `LineChart`           – responsive line chart
 *   - `AreaChart`           – responsive area chart (gradient fill)
 *   - `PieChartDisplay`     – responsive pie / donut chart
 *
 *  ── Default (Chart.js legacy) ────────────────────────────────────────────
 *   - `BarChart` (default) – Chart.js <Bar> wrapper for admin-dashboard
 *     backward-compat: `import BarChart from "@/components/ui/composites/Charts"`
 *
 * @version 2027-enterprise
 */

"use client";

import * as React from "react";

// ─── Recharts primitives ──────────────────────────────────────────────────────
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart as ReLineChart,
  Line,
  AreaChart as ReAreaChart,
  Area,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";

// ─── Shadcn/ui chart primitives ───────────────────────────────────────────────
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

// ─── Chart.js (legacy admin dashboard) ───────────────────────────────────────
import { Bar as CjsBar } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend as CjsLegend,
  LinearScale,
  Title,
  Tooltip as CjsTooltip,
} from "chart.js";
import type { ChartOptions, ChartData } from "chart.js";

// ─── Design-system Card ───────────────────────────────────────────────────────
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./Card";

// Register Chart.js modules once
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, CjsTooltip, CjsLegend);

// ─────────────────────────────────────────────────────────────────────────────
// SHARED TYPES
// ─────────────────────────────────────────────────────────────────────────────

type RechartsMargin = {
  top?: number;
  right?: number;
  left?: number;
  bottom?: number;
};

interface RechartsChartProps {
  /** Row data. Each row must have at minimum `{ [xAxisKey]: string; [dataKey]: number }`. */
  data: Record<string, unknown>[];
  /** Key used for the value axis. Default: `"value"` */
  dataKey?: string;
  /** Key used for the category axis. Default: `"name"` */
  xAxisKey?: string;
  /** Label shown in the legend / tooltip for the dataKey series. Default: `"Value"` */
  seriesLabel?: string;
  /** Card header title */
  title?: string;
  /** Card header description / sub-title */
  description?: string;
  /** Recharts margin config */
  margin?: RechartsMargin;
  /** Extra className forwarded to the wrapping Card */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// RECHARTS — BAR CHART  (Shadcn/ui ChartContainer)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Responsive bar chart powered by Recharts + Shadcn/ui `ChartContainer`.
 * Colours, tooltip and legend are fully design-system-aware.
 *
 * @example
 * <RechartsBarChart
 *   data={[{ name: "Jan", value: 420 }, { name: "Feb", value: 860 }]}
 *   title="Monthly Sales"
 *   description="Revenue in ₦"
 * />
 */
export function RechartsBarChart({
  data,
  dataKey = "value",
  xAxisKey = "name",
  seriesLabel = "Value",
  title = "Bar Chart",
  description,
  margin = { top: 20, right: 20, left: 0, bottom: 0 },
  className,
}: RechartsChartProps) {
  const chartConfig: ChartConfig = {
    [dataKey]: { label: seriesLabel, color: "hsl(var(--primary))" },
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ReBarChart data={data} margin={margin}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey={dataKey}
              fill={`var(--color-${dataKey})`}
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          </ReBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RECHARTS — LINE CHART  (Shadcn/ui ChartContainer)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Responsive line chart powered by Recharts + Shadcn/ui `ChartContainer`.
 *
 * @example
 * <LineChart data={[{ name: "Jan", value: 320 }]} title="Visitor Trend" />
 */
export function LineChart({
  data,
  dataKey = "value",
  xAxisKey = "name",
  seriesLabel = "Value",
  title = "Line Chart",
  description,
  margin = { top: 20, right: 20, left: 0, bottom: 0 },
  className,
}: RechartsChartProps) {
  const chartConfig: ChartConfig = {
    [dataKey]: { label: seriesLabel, color: "hsl(var(--primary))" },
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ReLineChart data={data} margin={margin}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={`var(--color-${dataKey})`}
              strokeWidth={2.5}
              dot={{ r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          </ReLineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RECHARTS — AREA CHART  (Shadcn/ui ChartContainer)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Responsive area chart with gradient fill.
 * Uses Shadcn/ui `ChartContainer` — perfect for cumulative revenue / growth metrics.
 *
 * @example
 * <AreaChart data={monthlyRevenue} title="Cumulative Revenue" description="₦ NGN" />
 */
export function AreaChart({
  data,
  dataKey = "value",
  xAxisKey = "name",
  seriesLabel = "Value",
  title = "Area Chart",
  description,
  margin = { top: 20, right: 20, left: 0, bottom: 0 },
  className,
}: RechartsChartProps) {
  const gradientId = React.useId().replace(/:/g, "");
  const chartConfig: ChartConfig = {
    [dataKey]: { label: seriesLabel, color: "hsl(var(--primary))" },
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ReAreaChart data={data} margin={margin}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={`var(--color-${dataKey})`}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={`var(--color-${dataKey})`}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={`var(--color-${dataKey})`}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={{ r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 2 }}
            />
          </ReAreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RECHARTS — PIE / DONUT CHART  (Shadcn/ui ChartContainer)
// ─────────────────────────────────────────────────────────────────────────────

const PIE_COLORS = [
  "hsl(var(--primary))",
  "#01454A",
  "#FDA600",
  "#25784A",
  "#ECB219",
  "#858585",
  "#FF6B6B",
  "#4ECDC4",
];

interface PieChartDisplayProps {
  data: { name: string; value: number }[];
  title?: string;
  description?: string;
  /** Render as donut (true) or filled pie (false). Default: true */
  donut?: boolean;
  className?: string;
}

/**
 * Responsive pie / donut chart using Shadcn/ui `ChartContainer`.
 *
 * @example
 * <PieChartDisplay
 *   data={[{ name: "Instagram", value: 40 }, { name: "TikTok", value: 60 }]}
 *   title="Marketing Channels"
 * />
 */
export function PieChartDisplay({
  data,
  title = "Distribution",
  description,
  donut = true,
  className,
}: PieChartDisplayProps) {
  // Build ChartConfig dynamically from data entries
  const chartConfig: ChartConfig = Object.fromEntries(
    data.map((entry, i) => [
      entry.name,
      {
        label: entry.name,
        color: PIE_COLORS[i % PIE_COLORS.length],
      },
    ])
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <RePieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={donut ? "52%" : "0%"}
              outerRadius="80%"
              paddingAngle={donut ? 3 : 1}
              dataKey="value"
              strokeWidth={0}
              nameKey="name"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </RePieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHART.JS LEGACY — Admin Dashboard BarChart (default export)
// ─────────────────────────────────────────────────────────────────────────────

interface BarChartLegacyProps {
  data: ChartData<"bar", number[], string>;
  options?: ChartOptions<"bar">;
  className?: string;
}

/**
 * Legacy Chart.js bar chart — preserved for admin-dashboard backward-compat.
 *
 * This is the **default export** so that:
 *   `import BarChart from "@/components/ui/composites/Charts";`
 * continues working in `admin-dashboard/page.tsx` with zero changes.
 *
 * For all new dashboard views use the Recharts named exports above.
 */
const BarChartLegacy: React.FC<BarChartLegacyProps> = ({
  data,
  options,
  className,
}) => (
  <div
    className={`rounded-[10px] bg-card w-full h-[366px] p-4 shadow-sm border border-border ${className ?? ""}`}
  >
    <CjsBar data={data} options={options} />
  </div>
);

BarChartLegacy.displayName = "BarChartLegacy";

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export default BarChartLegacy;

// Re-export Card parts so consumers can pull them from this file if convenient
export { Card, CardContent, CardHeader, CardTitle, CardDescription };
