/**
 * @file loading.tsx (Client Messages)
 * @description Messages inbox skeleton: conversation list + empty chat panel.
 */
export default function ClientMessagesLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] gap-0 overflow-hidden rounded-2xl border border-border"
      aria-label="Loading messages" aria-busy="true">
      {/* Conversation list */}
      <aside className="w-80 flex-shrink-0 border-r border-border space-y-0 overflow-y-auto">
        <div className="p-4 border-b border-border">
          <div className="h-9 w-full rounded-xl bg-muted shimmer" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-3 p-4 border-b border-border/50">
            <div className="h-10 w-10 rounded-full bg-muted shimmer flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-32 rounded bg-muted shimmer" />
                <div className="h-3 w-12 rounded bg-muted shimmer" />
              </div>
              <div className="h-3 w-full rounded bg-muted shimmer" />
            </div>
          </div>
        ))}
      </aside>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-border flex items-center gap-3 px-4">
          <div className="h-9 w-9 rounded-full bg-muted shimmer" />
          <div className="space-y-1">
            <div className="h-4 w-32 rounded bg-muted shimmer" />
            <div className="h-3 w-20 rounded bg-muted shimmer" />
          </div>
        </div>
        {/* Messages */}
        <div className="flex-1 p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
              <div className={`h-12 rounded-2xl bg-muted shimmer ${i % 2 === 0 ? "w-48" : "w-64"}`} />
            </div>
          ))}
        </div>
        {/* Input */}
        <div className="h-16 border-t border-border flex items-center gap-3 px-4">
          <div className="flex-1 h-10 rounded-xl bg-muted shimmer" />
          <div className="h-10 w-10 rounded-xl bg-muted shimmer" />
        </div>
      </div>
    </div>
  );
}
