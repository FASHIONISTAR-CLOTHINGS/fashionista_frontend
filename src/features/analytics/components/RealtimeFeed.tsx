/**
 * features/analytics/components/RealtimeFeed.tsx
 *
 * Real-time analytics event feed powered by WebSocket.
 */

"use client";

import { useRealtimeAnalytics } from "../hooks/use-realtime-analytics";
import { Badge } from "@/components/ui/badge";

function formatTimestamp(ts: string | null) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function RealtimeFeed() {
  const { events, isConnected, lastEventAt } = useRealtimeAnalytics();

  return (
    <div className="flex flex-col justify-between px-5 py-4 bg-white rounded-[10px] shadow h-[383px]">
      <div className="flex items-center justify-between border-b pb-2 mb-2">
        <h3 className="text-xl font-medium font-satoshi text-black">
          Real-time Activity
        </h3>
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"
            }`}
          />
          <span className="text-xs font-medium text-[#858585]">
            {isConnected ? "Live" : "Disconnected"}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            {isConnected
              ? "Waiting for events..."
              : "Connecting to real-time stream..."}
          </div>
        ) : (
          events.map((event, index) => (
            <div
              key={`${event.type}-${index}`}
              className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 mt-0.5">
                <Badge
                  variant={event.type === "analytics_snapshot" ? "default" : "secondary"}
                  className="text-[10px] px-2 py-0.5"
                >
                  {event.type}
                </Badge>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#282828] font-medium truncate">
                  {event.type === "analytics_snapshot"
                    ? "Analytics snapshot received"
                    : event.type === "pong"
                      ? "Heartbeat pong"
                      : event.type}
                </p>
                {event.data && Object.keys(event.data).length > 0 && (
                  <p className="text-[10px] text-[#858585] truncate">
                    {JSON.stringify(event.data).slice(0, 120)}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {lastEventAt && (
        <div className="border-t pt-2 mt-2">
          <p className="text-[10px] text-[#858585]">
            Last event: {formatTimestamp(lastEventAt)}
          </p>
        </div>
      )}
    </div>
  );
}
