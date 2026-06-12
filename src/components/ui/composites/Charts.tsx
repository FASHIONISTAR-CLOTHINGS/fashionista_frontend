/**
 * @file Charts.tsx
 * @version 3.0.0 - Production Optimized (React 19 / Next.js 16 / Tailwind CSS v4)
 * @description Consolidated visual chart engine built natively for high-concurrency dashboards.
 * @description Consolidated visual chart engine built natively using modern Recharts SVG elements.

 * ALL Legacy Chart.js structures and backward-compatibility wrappers have been removed.
 * Includes complete integration with shared CSS-only custom tooltip primitives.
 * 
 * DESIGN SPECIFICATIONS:
 * - High Performance: CSS-only layout tooltips to preserve SSR compatibility.
 * - Resilient Layouts: Automated boundary card fallbacks for blank or delayed API loads.
 * - Tailwind v4 Ready: Explicit theme variable rendering using modern CSS variables.
 */

"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Shared UI Custom Tooltip Primitive Imports ──────────────────────────────
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

// ─── Recharts SVG Engine ───────────────────────────────────────────────────
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
  ComposedChart as ReComposedChart,
  RadarChart as ReRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
} from "recharts";


// ─────────────────────────────────────────────────────────────────────────────
// PART 1: COMPANION DESIGN-SYSTEM CARD COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-3xl border border-border/50 bg-background text-foreground shadow-xs transition-all duration-300 hover:shadow-md",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("font-satoshi font-black text-lg leading-none tracking-tight text-foreground", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";


// ─────────────────────────────────────────────────────────────────────────────
// PART 2: CORE SHADCN/UI CUSTOM ENGINE PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

const THEMES = { light: "", dark: ".dark" } as const;
const INITIAL_DIMENSION = { width: 320, height: 200 } as const;


export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
>;

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

export interface ChartContainerProps extends React.ComponentProps<"div"> {
  id?: string;
  config: ChartConfig;
  children: React.ComponentProps<typeof ResponsiveContainer>["children"];
  initialDimension?: {
    width: number;
    height: number;
  };
}

export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ id, className, children, config, initialDimension = INITIAL_DIMENSION, ...props }, ref) => {
    const uniqueId = React.useId();
    const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;

    return (
      <ChartContext.Provider value={{ config }}>
        <div
          ref={ref}
          data-slot="chart"
          data-chart={chartId}
          className={cn(
            "flex aspect-video justify-center text-xs",
            "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground",
            "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/30",
            "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border",
            "[&_.recharts-dot[stroke='#fff']]:stroke-transparent",
            "[&_.recharts-layer]:outline-hidden",
            "[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border/30",
            "[&_.recharts-radial-bar-background-sector]:fill-muted",
            "[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted/20",
            "[&_.recharts-reference-line_[stroke='#ccc']]:stroke-border",
            "[&_.recharts-sector]:outline-hidden",
            "[&_.recharts-sector[stroke='#fff']]:stroke-transparent",
            "[&_.recharts-surface]:outline-hidden",
            className
          )}
          {...props}
        >
          <ChartStyle id={chartId} config={config} />
          <ResponsiveContainer initialDimension={initialDimension}>
            {children}
          </ResponsiveContainer>
        </div>
      </ChartContext.Provider>
    );
  }
);
ChartContainer.displayName = "ChartContainer";

export const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, conf]) => conf.theme ?? conf.color
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
              ${prefix} [data-chart=${id}] {
                ${colorConfig
                  .map(([key, itemConfig]) => {
                    const color =
                      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ??
                      itemConfig.color;
                    return color ? `  --color-${key}: ${color};` : null;
                  })
                  .filter(Boolean)
                  .join("\n")}
              }
            `
          )
          .join("\n"),
      }}
    />
  );
};

export const ChartTooltip = RechartsTooltip;

export interface ChartTooltipContentProps
  extends Omit<React.ComponentProps<typeof RechartsTooltip>, "content">,
    Omit<React.ComponentProps<"div">, "content"> {
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "line" | "dot" | "dashed";
  nameKey?: string;
  labelKey?: string;
  payload?: any[];
  label?: any;
}

export const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps &
    Omit<
      React.ComponentProps<typeof RechartsTooltip>,
      "accessibilityLayer"
    >
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart();

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null;
      }

      const [item] = payload;
      const key = `${labelKey ?? item?.dataKey ?? item?.name ?? "value"}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const value =
        !labelKey && typeof label === "string"
          ? (config[label]?.label ?? label)
          : itemConfig?.label;

      if (labelFormatter) {
        return (
          <div className={cn("font-semibold leading-none text-foreground", labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        );
      }

      if (!value) {
        return null;
      }

      return <div className={cn("font-semibold leading-none text-foreground", labelClassName)}>{value}</div>;
    }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);

    if (!active || !payload?.length) {
      return null;
    }

    const nestLabel = payload.length === 1 && indicator !== "dot";

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-36 items-start gap-2 rounded-2xl border border-border/40 bg-background/95 backdrop-blur-md px-3.5 py-2.5 text-xs shadow-xl transition-all duration-150",
          className
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload
            .filter((item: any) => item.type !== "none")
            .map((item: any, index: number) => {
              const key = `${nameKey ?? item.name ?? item.dataKey ?? "value"}`;
              const itemConfig = getPayloadConfigFromPayload(config, item, key);
              const indicatorColor = color ?? item.payload?.fill ?? item.color;

              return (
                <div
                  key={index}
                  className={cn(
                    "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground",
                    indicator === "dot" && "items-center"
                  )}
                >
                  {formatter && item?.value !== undefined && item.name ? (
                    formatter(item.value, item.name, item, index, item.payload)
                  ) : (
                    <>
                      {itemConfig?.icon ? (
                        <itemConfig.icon />
                      ) : (
                        !hideIndicator && (
                          <div
                            className={cn(
                              "shrink-0 rounded-[3px] border-(--color-border) bg-(--color-bg)",
                              {
                                "h-2.5 w-2.5": indicator === "dot",
                                "w-1.5": indicator === "line",
                                "w-0 border-[1.5px] border-dashed bg-transparent":
                                  indicator === "dashed",
                                "my-0.5": nestLabel && indicator === "dashed",
                              }
                            )}
                            style={
                              {
                                "--color-bg": indicatorColor,
                                "--color-border": indicatorColor,
                              } as React.CSSProperties
                            }
                          />
                        )
                      )}
                      <div
                        className={cn(
                          "flex flex-1 justify-between leading-none gap-4",
                          nestLabel ? "items-end" : "items-center"
                        )}
                      >
                        <div className="grid gap-1">
                          {nestLabel ? tooltipLabel : null}
                          <span className="text-muted-foreground font-medium">
                            {itemConfig?.label ?? item.name}
                          </span>
                        </div>
                        {item.value != null && (
                          <span className="font-mono font-bold text-foreground tabular-nums">
                            {typeof item.value === "number"
                              ? item.value.toLocaleString()
                              : String(item.value)}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";

export const ChartLegend = RechartsLegend;

export interface ChartLegendContentProps
  extends React.ComponentProps<"div"> {
  hideIcon?: boolean;
  nameKey?: string;
  payload?: any[];
  verticalAlign?: "top" | "bottom" | "middle";
}

export const ChartLegendContent = React.forwardRef<HTMLDivElement, ChartLegendContentProps>(
  ({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
    const { config } = useChart();

    if (!payload?.length) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs font-semibold",
          verticalAlign === "top" ? "pb-4" : "pt-4",
          className
        )}
      >
        {payload
          .filter((item: any) => item.type !== "none")
          .map((item: any, index: number) => {
            const key = `${nameKey ?? item.dataKey ?? "value"}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);

            return (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-1.5 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:text-muted-foreground text-muted-foreground hover:text-foreground transition-colors duration-200"
                )}
              >
                {itemConfig?.icon && !hideIcon ? (
                  <itemConfig.icon />
                ) : (
                  <div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />
                )}
                <span>{itemConfig?.label ?? item.value}</span>
              </div>
            );
          })}
      </div>
    );
  }
);
ChartLegendContent.displayName = "ChartLegendContent";

export function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
): { label?: React.ReactNode; icon?: React.ComponentType } | undefined {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string;
  }

  return configLabelKey in config ? config[configLabelKey] : config[key];
}


// ─────────────────────────────────────────────────────────────────────────────
// PART 3: MODERN RECHARTS COMPOSITIONS
// ─────────────────────────────────────────────────────────────────────────────

type RechartsMargin = {
  top?: number;
  right?: number;
  left?: number;
  bottom?: number;
};

interface RechartsChartProps {
  data: Record<string, unknown>[];
  dataKey?: string;
  xAxisKey?: string;
  seriesLabel?: string;
  title?: string;
  description?: string;
  margin?: RechartsMargin;
  className?: string;
  seriesColor?: string;
}

/**
 * Modern Chart Card Header component.
 * Integrates your shared, CSS-only tooltip for layout description text.
 */
const ChartCardHeader = ({ 
  title, 
  description 
}: { 
  title: string; 
  description?: string 
}) => (
  <CardHeader className="relative flex flex-col space-y-1 p-6 pb-4">
    <div className="flex items-center justify-between w-full">
      <CardTitle>{title}</CardTitle>
      {description && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="p-1.5 text-muted-foreground hover:text-foreground transition-colors duration-200 focus-visible:outline-hidden cursor-pointer" aria-label="Dataset description">
              <Info size={15} />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[240px] leading-relaxed">
              {description}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  </CardHeader>
);

/**
 * Responsive bar chart powered by Recharts + Shadcn/ui ChartContainer.
 */
export function RechartsBarChart({
  data = [],
  dataKey = "value",
  xAxisKey = "name",
  seriesLabel = "Value",
  title = "Bar Chart Distribution",
  description,
  margin = { top: 12, right: 12, left: 0, bottom: 0 },
  className,
  seriesColor = "hsl(var(--primary))",
}: RechartsChartProps) {
  const chartConfig = React.useMemo<ChartConfig>(() => ({
    [dataKey]: { label: seriesLabel, color: seriesColor },
  }), [dataKey, seriesLabel, seriesColor]);

  if (!data || data.length === 0) {
    return (
      <Card className={cn("flex flex-col items-center justify-center p-8 text-center min-h-[300px]", className)}>
        <p className="text-sm font-semibold text-muted-foreground">No records found to render visual data</p>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <ChartCardHeader title={title} description={description} />
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ReBarChart data={data} margin={margin}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={10} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey={dataKey}
              fill={`var(--color-${dataKey})`}
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </ReBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Responsive line chart powered by Recharts + Shadcn/ui ChartContainer.
 */
export function LineChart({
  data = [],
  dataKey = "value",
  xAxisKey = "name",
  seriesLabel = "Value",
  title = "Line Chart Trend",
  description,
  margin = { top: 12, right: 12, left: 0, bottom: 0 },
  className,
  seriesColor = "hsl(var(--primary))",
}: RechartsChartProps) {
  const chartConfig = React.useMemo<ChartConfig>(() => ({
    [dataKey]: { label: seriesLabel, color: seriesColor },
  }), [dataKey, seriesLabel, seriesColor]);

  if (!data || data.length === 0) {
    return (
      <Card className={cn("flex flex-col items-center justify-center p-8 text-center min-h-[300px]", className)}>
        <p className="text-sm font-semibold text-muted-foreground">No trend records found to generate line metrics</p>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <ChartCardHeader title={title} description={description} />
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ReLineChart data={data} margin={margin}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={10} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={`var(--color-${dataKey})`}
              strokeWidth={3}
              dot={{ r: 5, strokeWidth: 0, fill: seriesColor }}
              activeDot={{ r: 7, strokeWidth: 2 }}
            />
          </ReLineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Responsive Area Chart with Linear Gradient Fill.
 */
export function AreaChart({
  data = [],
  dataKey = "value",
  xAxisKey = "name",
  seriesLabel = "Value",
  title = "Area Growth Metric",
  description,
  margin = { top: 12, right: 12, left: 0, bottom: 0 },
  className,
  seriesColor = "hsl(var(--primary))",
}: RechartsChartProps) {
  const gradientId = React.useId().replace(/:/g, "");
  const chartConfig = React.useMemo<ChartConfig>(() => ({
    [dataKey]: { label: seriesLabel, color: seriesColor },
  }), [dataKey, seriesLabel, seriesColor]);

  if (!data || data.length === 0) {
    return (
      <Card className={cn("flex flex-col items-center justify-center p-8 text-center min-h-[300px]", className)}>
        <p className="text-sm font-semibold text-muted-foreground">No volume datasets found</p>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <ChartCardHeader title={title} description={description} />
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
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={10} />
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
              dot={{ r: 4, strokeWidth: 0, fill: seriesColor }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          </ReAreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// ─── Pie / Donut System ──────────────────────────────────────────────────────

const EX_PIE_COLORS = [
  "hsl(var(--primary))",
  "oklch(45% 0.16 195)",
  "oklch(65% 0.20 50)",
  "oklch(55% 0.18 140)",
  "oklch(75% 0.15 85)",
  "oklch(40% 0.05 240)",
  "oklch(60% 0.22 15)",
  "oklch(62% 0.17 180)",
];

interface PieChartDisplayProps {
  data: { name: string; value: number }[];
  title?: string;
  description?: string;
  donut?: boolean;
  className?: string;
}

/**
 * Responsive radial pie / donut display.
 */
export function PieChartDisplay({
  data = [],
  title = "Market Distribution",
  description,
  donut = true,
  className,
}: PieChartDisplayProps) {
  const chartConfig = React.useMemo<ChartConfig>(() => {
    return Object.fromEntries(
      data.map((entry, i) => [
        entry.name,
        {
          label: entry.name,
          color: EX_PIE_COLORS[i % EX_PIE_COLORS.length],
        },
      ])
    );
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <Card className={cn("flex flex-col items-center justify-center p-8 text-center min-h-[300px]", className)}>
        <p className="text-sm font-semibold text-muted-foreground">Empty segment dataset provided</p>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <ChartCardHeader title={title} description={description} />
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
              innerRadius={donut ? "60%" : "0%"}
              outerRadius="80%"
              paddingAngle={donut ? 4 : 0}
              dataKey="value"
              strokeWidth={0}
              nameKey="name"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={EX_PIE_COLORS[index % EX_PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="flex-wrap gap-x-3 gap-y-1.5 justify-center mt-4"
            />
          </RePieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// ─── Composed Layout (Multi-Axis Combo Model) ────────────────────────────────

interface ComposedChartProps {
  data: Record<string, unknown>[];
  xAxisKey?: string;
  barKey?: string;
  lineKey?: string;
  areaKey?: string;
  barLabel?: string;
  lineLabel?: string;
  areaLabel?: string;
  title?: string;
  description?: string;
  className?: string;
}

/**
 * Responsive Composed visualizer combining Bar, Line, and Area indicators.
 * Perfect for sales vs customer feedback vs traffic analyses.
 */
export function ComposedChart({
  data = [],
  xAxisKey = "name",
  barKey = "sales",
  lineKey = "visitors",
  areaKey = "revenue",
  barLabel = "Total Sales",
  lineLabel = "Visitor Load",
  areaLabel = "Revenue Curve",
  title = "Enterprise Composed Index",
  description,
  className,
}: ComposedChartProps) {
  const gradientId = React.useId().replace(/:/g, "");

  const chartConfig = React.useMemo<ChartConfig>(() => ({
    [barKey]: { label: barLabel, color: "hsl(var(--primary))" },
    [lineKey]: { label: lineLabel, color: "oklch(65% 0.20 50)" },
    [areaKey]: { label: areaLabel, color: "oklch(55% 0.18 140)" },
  }), [barKey, lineKey, areaKey, barLabel, lineLabel, areaLabel]);

  if (!data || data.length === 0) {
    return (
      <Card className={cn("flex flex-col items-center justify-center p-8 text-center min-h-[300px]", className)}>
        <p className="text-sm font-semibold text-muted-foreground">Composed chart dataset is currently blank</p>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <ChartCardHeader title={title} description={description} />
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ReComposedChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={xAxisKey} tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis tickLine={false} axisLine={false} tickMargin={10} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area type="monotone" dataKey={areaKey} fill={`url(#${gradientId})`} stroke="var(--color-revenue)" strokeWidth={1.5} />
            <Bar dataKey={barKey} fill="var(--color-sales)" radius={[4, 4, 0, 0]} maxBarSize={30} />
            <Line type="monotone" dataKey={lineKey} stroke="var(--color-visitors)" strokeWidth={2.5} dot={{ r: 3 }} />
          </ReComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// ─── Radar Layout (Distribution and Attribute Analyzer) ──────────────────────

interface RadarChartProps {
  data: Record<string, unknown>[];
  dataKeys: string[];
  seriesLabels?: string[];
  indexKey?: string;
  title?: string;
  description?: string;
  className?: string;
}

/**
 * Radar dashboard layout. Ideal for designer brand parameters or client shopping maps.
 */
export function RadarChartDisplay({
  data = [],
  dataKeys = ["value"],
  seriesLabels = ["Performance"],
  indexKey = "subject",
  title = "Performance Matrix Analysis",
  description,
  className,
}: RadarChartProps) {
  const chartConfig = React.useMemo<ChartConfig>(() => {
    return Object.fromEntries(
      dataKeys.map((key, i) => [
        key,
        {
          label: seriesLabels[i] ?? key,
          color: EX_PIE_COLORS[i % EX_PIE_COLORS.length],
        },
      ])
    );
  }, [dataKeys, seriesLabels]);

  if (!data || data.length === 0) {
    return (
      <Card className={cn("flex flex-col items-center justify-center p-8 text-center min-h-[300px]", className)}>
        <p className="text-sm font-semibold text-muted-foreground">Radar parameter datasets are currently blank</p>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <ChartCardHeader title={title} description={description} />
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto max-h-[300px] aspect-square">
          <ReRadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey={indexKey} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {dataKeys.map((key, i) => (
              <Radar
                key={key}
                name={seriesLabels[i] ?? key}
                dataKey={key}
                stroke={EX_PIE_COLORS[i % EX_PIE_COLORS.length]}
                fill={EX_PIE_COLORS[i % EX_PIE_COLORS.length]}
                fillOpacity={0.2}
              />
            ))}
            <ChartLegend content={<ChartLegendContent />} />
          </ReRadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// ─── MultiBarChart component ──────────────────────────────────────────

interface MultiBarChartProps {
  data: Record<string, unknown>[];
  xAxisKey?: string;
  series: {
    key: string;
    label: string;
    color: string;
  }[];
  title?: string;
  description?: string;
  className?: string;
}

export function MultiBarChart({
  data = [],
  xAxisKey = "name",
  series = [],
  title = "Aggregate Distribution Data",
  description,
  className,
}: MultiBarChartProps) {
  const chartConfig = React.useMemo<ChartConfig>(() => {
    return Object.fromEntries(
      series.map((s) => [s.key, { label: s.label, color: s.color }])
    );
  }, [series]);

  if (!data || data.length === 0) {
    return (
      <Card className={cn("flex flex-col items-center justify-center p-8 text-center min-h-[300px]", className)}>
        <p className="text-sm font-semibold text-muted-foreground">No records found to render visual data</p>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <ChartCardHeader title={title} description={description} />
      <CardContent className="h-full w-full">
        <ChartContainer config={chartConfig} className="w-full h-full min-h-[300px]">
          <ReBarChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={10} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            {series.map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                fill={`var(--color-${s.key})`}
                radius={[4, 4, 0, 0]}
                maxBarSize={30}
              />
            ))}
          </ReBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PART 4: SYSTEM EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

// Standard Named Export Primitives
// Default export is set to the highly scalable multi-series Bar Chart component
export default RechartsBarChart;