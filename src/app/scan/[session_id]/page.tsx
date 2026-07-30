/**
 * @file /scan/[session_id]/page.tsx
 * @description TASK-059: Public entry-point for a scan session URL.
 *
 * This page is the target of QR code scans and shared links.
 * When a user opens https://fashionistar.net/scan/{session_id}:
 *
 *   - Middleware checks authentication
 *   - If not logged in → redirect to /login?redirect=/scan/{session_id}
 *   - If logged in:
 *     → Render a Server Component that immediately redirects to the
 *       authenticated dashboard scan route with the session_id preserved
 *
 * This allows QR codes to be scanned by anyone with a FASHIONISTAR account
 * and resumed even after the initial desktop session has been closed.
 */

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface ScanEntryPageProps {
  params: Promise<{ session_id: string }>;
}

export default async function ScanEntryPage({ params }: ScanEntryPageProps) {
  const { session_id } = await params;

  // Redirect to the authenticated dashboard scan page with session pre-loaded.
  // The MeasurementScanPageClient will read session_id from search params and
  // resume the existing session rather than creating a new one.
  redirect(
    `/client/dashboard/measurements/scan?session_id=${encodeURIComponent(session_id)}&from=qr`
  );
}
