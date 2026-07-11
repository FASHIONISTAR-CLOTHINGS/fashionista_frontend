/**
 * features/analytics/components/DateRangePicker.tsx
 *
 * Date range selector using Nuqs for URL state (bookmarkable).
 */

"use client";

import { useQueryState, parseAsInteger } from "nuqs";
import { Button } from "@/components/ui/button";

const PRESETS = [
  { label: "7 Days", days: 7 },
  { label: "14 Days", days: 14 },
  { label: "30 Days", days: 30 },
  { label: "90 Days", days: 90 },
];

export function DateRangePicker() {
  const [days, setDays] = useQueryState(
    "days",
    parseAsInteger.withDefault(7),
  );

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[#858585] font-medium">Period:</span>
      <div className="flex items-center gap-1.5">
        {PRESETS.map((preset) => (
          <Button
            key={preset.days}
            size="sm"
            variant={days === preset.days ? "default" : "outline"}
            className="text-xs font-medium"
            onClick={() => setDays(preset.days)}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
