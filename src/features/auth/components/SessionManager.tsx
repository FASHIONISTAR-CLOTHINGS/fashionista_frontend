"use client";

/**
 * features/auth/components/SessionManager.tsx
 * Displays and manages all active user sessions.
 * API: GET /api/v1/ninja/auth/sessions/ → ActiveSession[]
 *      DELETE /api/v1/ninja/auth/sessions/{session_id}/ → revoke
 *      DELETE /api/v1/ninja/auth/sessions/ → revoke all other
 * Backend: apps/authentication/services/session_service.py → SessionService
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ky from "ky";
import { Card, Badge, Button, LoadingSpinner, EmptyState } from "@/shared/ui";

interface ActiveSession {
  session_id: string;
  device_name: string;
  device_type: "mobile" | "desktop" | "tablet" | "unknown";
  browser: string;
  os: string;
  ip_address: string;
  country?: string;
  city?: string;
  last_active: string;
  created_at: string;
  is_current: boolean;
  risk_score?: number;
}

const DEVICE_ICONS: Record<string, string> = {
  mobile: "📱", desktop: "💻", tablet: "📟", unknown: "🖥️",
};

function formatLastActive(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function SessionManager() {
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const qc = useQueryClient();

  const { data: sessions, isLoading, error } = useQuery<ActiveSession[]>({
    queryKey: ["auth", "sessions"],
    queryFn: () => ky.get("/api/v1/ninja/auth/sessions/").json<ActiveSession[]>(),
    refetchInterval: 30_000, // Refresh every 30s
  });

  const { mutate: revokeSession } = useMutation({
    mutationFn: async (sessionId: string) => {
      setRevokingId(sessionId);
      await ky.delete(`/api/v1/ninja/auth/sessions/${sessionId}/`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth", "sessions"] });
      setRevokingId(null);
    },
    onError: () => setRevokingId(null),
  });

  const { mutate: revokeAll } = useMutation({
    mutationFn: async () => {
      setRevokingAll(true);
      await ky.delete("/api/v1/ninja/auth/sessions/");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth", "sessions"] });
      setRevokingAll(false);
    },
    onError: () => setRevokingAll(false),
  });

  if (isLoading) return (
    <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
  );

  if (error) return (
    <EmptyState icon="⚠️" title="Could not load sessions" description="Please refresh and try again." />
  );

  const otherSessions = sessions?.filter((s) => !s.is_current) ?? [];
  const currentSession = sessions?.find((s) => s.is_current);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Active Sessions</h3>
          <p className="text-xs text-slate-400">{sessions?.length ?? 0} devices signed in</p>
        </div>
        {otherSessions.length > 0 && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => revokeAll()}
            isLoading={revokingAll}
            id="revoke-all-sessions-btn"
          >
            Sign Out All Others
          </Button>
        )}
      </div>

      {/* Current session */}
      {currentSession && (
        <div className="space-y-2">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">Current Session</p>
          <SessionCard
            session={currentSession}
            isRevoking={false}
            onRevoke={() => {}}
            isCurrent
          />
        </div>
      )}

      {/* Other sessions */}
      {otherSessions.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">Other Devices</p>
          {otherSessions.map((session) => (
            <SessionCard
              key={session.session_id}
              session={session}
              isRevoking={revokingId === session.session_id}
              onRevoke={() => revokeSession(session.session_id)}
            />
          ))}
        </div>
      )}

      {otherSessions.length === 0 && (
        <p className="text-center text-xs text-slate-500 py-4">
          No other active sessions — you&apos;re only signed in here.
        </p>
      )}

      <p className="text-center text-[10px] text-slate-600">
        🔒 Sessions auto-expire after 24h of inactivity. Max 5 concurrent devices.
      </p>
    </div>
  );
}

// ── SessionCard sub-component ─────────────────────────────────────────────────

function SessionCard({
  session, isRevoking, onRevoke, isCurrent = false,
}: {
  session: ActiveSession;
  isRevoking: boolean;
  onRevoke: () => void;
  isCurrent?: boolean;
}) {
  const riskHigh = (session.risk_score ?? 0) >= 70;

  return (
    <Card
      glass
      className={`p-4 ${riskHigh ? "border-red-500/30" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Device info */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center text-xl flex-shrink-0">
            {DEVICE_ICONS[session.device_type]}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-white">{session.device_name || session.browser}</p>
              {isCurrent && <Badge color="success" size="xs">Current</Badge>}
              {riskHigh && <Badge color="danger" size="xs">⚠️ Suspicious</Badge>}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {session.os} · {session.browser}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {session.city ? `${session.city}, ` : ""}{session.country ?? session.ip_address}
            </p>
            <p className="text-[10px] text-slate-600 mt-1">
              Last active: {formatLastActive(session.last_active)}
            </p>
          </div>
        </div>

        {/* Revoke */}
        {!isCurrent && (
          <button
            onClick={onRevoke}
            disabled={isRevoking}
            className="text-xs text-red-400 hover:text-red-300 transition-colors flex-shrink-0 disabled:opacity-50"
            aria-label={`Sign out ${session.device_name}`}
          >
            {isRevoking ? <LoadingSpinner size="sm" /> : "Sign Out"}
          </button>
        )}
      </div>
    </Card>
  );
}
