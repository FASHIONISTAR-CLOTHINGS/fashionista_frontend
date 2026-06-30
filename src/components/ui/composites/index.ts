/**
 * @file index.ts — composites barrel
 * @description Single entry-point for all composite UI components.
 *
 * Usage examples:
 *   import { Card, CardHeader, ProductCard }   from "@/components/ui/composites";
 *   import { Hero }                            from "@/components/ui/composites";  // ← homepage HeroSection
 *   import { HeroSection }                     from "@/components/ui/composites";  // ← alias
 *   import BarChart                            from "@/components/ui/composites/Charts"; // Chart.js legacy
 *   import { RechartsBarChart, LineChart, AreaChart, PieChartDisplay } from "@/components/ui/composites";
 *   import TimedCard, { CountdownCard }        from "@/components/ui/composites/TimedCard";
 *   import Cads                                from "@/components/ui/composites/Cads";
 *
 * @version 2027-enterprise
 */

// ── Card system ───────────────────────────────────────────────────────────────
export {
  default as Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
  CardLink,
  CardLinkOutline,
  ProductCard,
} from "./Card";

// ── Flash-sale / countdown product card ──────────────────────────────────────
export { default as Cads } from "./Cads";

// ── Charts (Shadcn/ui + Recharts) ─────────────────────────────────────────────
// Default export = Chart.js legacy BarChart (admin-dashboard compat)
// Named exports  = Shadcn/ui ChartContainer-based components
export {
  default as BarChart,
  RechartsBarChart,
  LineChart,
  AreaChart,
  PieChartDisplay,
} from "./Charts";

// ── Hero ──────────────────────────────────────────────────────────────────────
// `Hero`        = the full homepage HeroSection (used by (home)/page.tsx as <Hero />)
// `HeroSection` = same component, explicit alias for clarity in new code
// `HeroWrapper` = the generic branded layout wrapper (accepts children)
export {
  default as Hero,
  default as HeroSection,
  Hero as HeroWrapper,
} from "./Hero";

// ── TimedCard ─────────────────────────────────────────────────────────────────
export { default as TimedCard, CountdownCard, CountdownTimer } from "./TimedCard";
