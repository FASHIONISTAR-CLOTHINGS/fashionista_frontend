"use client";

import { useEffect, useMemo, useState } from "react";

import { readAccessToken, readStoredAuthState } from "@/features/auth/lib/auth-session.client";
import {
  ConversationList,
  MessageInput,
  MessageThread,
  useChatWebSocket,
  useConversations,
  useMessages,
  useSendMessage,
  useMarkConversationRead,
} from "@/features/chat";

export default function ClientMessagesPage() {
  const currentUserId =
    (readStoredAuthState()?.user as { id?: string } | undefined)?.id ?? null;
  const authToken = readAccessToken();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  const conversationsQuery = useConversations(wsConnected);
  const conversations = useMemo(
    () => conversationsQuery.data ?? [],
    [conversationsQuery.data],
  );
  const selectedConversationId =
    activeConversationId ?? conversations[0]?.id ?? null;

  const activeConversation = useMemo(
    () =>
      conversations.find((conversation) => conversation.id === selectedConversationId) ??
      null,
    [selectedConversationId, conversations],
  );

  const messagesQuery = useMessages(selectedConversationId, wsConnected);
  const sendMessageMutation = useSendMessage(selectedConversationId ?? "");
  const markReadMutation = useMarkConversationRead();

  useChatWebSocket({
    conversationId: selectedConversationId,
    authToken,
    onConnectionChange: (state) => setWsConnected(state === "open"),
  });

  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }
    void markReadMutation.mutateAsync(selectedConversationId);
  }, [selectedConversationId, markReadMutation]);

  return (
    <main className="space-y-6 px-4 py-6 md:px-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#141414]">Messages</h1>
        <p className="mt-1 text-sm text-black/60">
          Live conversations with designers and clients.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[22rem,minmax(0,1fr)]">
        <ConversationList
          conversations={conversations}
          activeConversationId={selectedConversationId}
          onSelectConversation={setActiveConversationId}
        />

        <section className="flex min-h-[28rem] flex-col border border-black/10 bg-white">
          <div className="border-b border-black/10 px-5 py-4">
            <p className="text-sm font-semibold text-[#141414]">
              {activeConversation?.other_party_name ?? "Select a conversation"}
            </p>
            <p className="mt-1 text-xs text-black/55">
              {wsConnected ? "Live connection active" : "REST fallback active"}
            </p>
          </div>

          <MessageThread
            messages={messagesQuery.data?.messages ?? []}
            currentUserId={currentUserId}
          />

          <MessageInput
            disabled={!activeConversationId || sendMessageMutation.isPending}
            onSend={async (body) => {
              if (!selectedConversationId) {
                return;
              }
              await sendMessageMutation.mutateAsync({ body });
            }}
          />
        </section>
      </div>
    </main>
  );
}
