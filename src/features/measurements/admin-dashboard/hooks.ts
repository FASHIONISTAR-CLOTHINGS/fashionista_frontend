/**
 * features/measurements/admin-dashboard/hooks.ts
 */

import { useQuery } from "@tanstack/react-query";
import { fetchAdminMeasurements } from "./api";

export const adminMeasurementKeys = {
  all: ["admin-measurements"] as const,
};

export function useAdminMeasurements() {
  return useQuery({
    queryKey: adminMeasurementKeys.all,
    queryFn: fetchAdminMeasurements,
  });
}
