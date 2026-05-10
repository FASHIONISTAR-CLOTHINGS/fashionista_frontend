/**
 * Compact conversation rail for the chat workspace.
 */

"use client";

import { MessageSquareMore } from "lucide-react";

import type { Conversation } from "../types/chat.types";

export interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
}: ConversationListProps) {
  return (
    <aside className="flex h-full min-h-[28rem] flex-col border border-black/10 bg-white">
      <div className="border-b border-black/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-[#141414]">Conversations</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-10 text-center text-sm text-black/55">
            <MessageSquareMore className="h-8 w-8 text-[#01454A]" />
            <p>No conversations yet.</p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const isActive = conversation.id === activeConversationId;

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => onSelectConversation(conversation.id)}
                className={[
                  "flex w-full items-start gap-3 border-b border-black/5 px-4 py-3 text-left transition",
                  isActive ? "bg-[#F4F3EC]" : "hover:bg-black/[0.02]",
                ].join(" ")}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#01454A] text-sm font-semibold text-white">
                  {conversation.other_party_name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-[#141414]">
                      {conversation.other_party_name}
                    </p>
                    {conversation.unread_count > 0 ? (
                      <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[#FDA600] px-2 py-0.5 text-xs font-semibold text-[#141414]">
                        {conversation.unread_count}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 truncate text-xs text-black/60">
                    {conversation.last_message_preview || conversation.product_title_snapshot || "Open thread"}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
