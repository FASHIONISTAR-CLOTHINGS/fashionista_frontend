/**
 * Scrollable message timeline for the active conversation.
 */

"use client";

import { formatDistanceToNowStrict } from "date-fns";

import { OfferCard } from "./OfferCard";
import type { Message } from "../types/chat.types";

export interface MessageThreadProps {
  messages: Message[];
  currentUserId?: string | null;
}

export function MessageThread({
  messages,
  currentUserId,
}: MessageThreadProps) {
  return (
    <div className="flex min-h-[28rem] flex-1 flex-col gap-4 overflow-y-auto bg-[#F4F3EC] p-4">
      {messages.length === 0 ? (
        <div className="m-auto text-center text-sm text-black/55">
          No messages yet. Start the conversation.
        </div>
      ) : (
        messages.map((message) => {
          const isOwn =
            message.is_own ?? Boolean(currentUserId && message.author_id === currentUserId);

          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={[
                  "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm",
                  isOwn ? "bg-[#01454A] text-white" : "bg-white text-[#141414]",
                ].join(" ")}
              >
                <div className="mb-1 flex items-center gap-2 text-xs opacity-75">
                  <span className="font-medium">{message.author_name}</span>
                  <span>
                    {formatDistanceToNowStrict(new Date(message.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                {message.offer ? <OfferCard offer={message.offer} /> : null}
                {message.body ? <p className="text-sm leading-6">{message.body}</p> : null}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
