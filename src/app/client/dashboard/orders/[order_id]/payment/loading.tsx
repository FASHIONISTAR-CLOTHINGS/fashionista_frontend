/**
 * Payment sub-route skeleton loader.
 * Matches the 4-card summary + payment-method-selector layout of OrderPaymentView.
 * Prevents zero-flash / layout shift while the client-side bundle hydrates.
 */
export default function ClientOrderPaymentLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8 animate-pulse">
      {/* Page header */}
      <div className="mb-8 space-y-2">
        <div className="h-6 w-48 rounded-lg bg-slate-800" />
        <div className="h-4 w-64 rounded-lg bg-slate-800/60" />
      </div>

      <div className="mx-auto max-w-3xl space-y-6">
        {/* Order summary card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-32 rounded bg-slate-800" />
            <div className="h-5 w-20 rounded-full bg-slate-800" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 w-16 rounded bg-slate-800/60" />
                <div className="h-5 w-20 rounded bg-slate-800" />
              </div>
            ))}
          </div>
        </div>

        {/* Payment amount selector */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="h-5 w-40 rounded bg-slate-800" />
          <div className="flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 flex-1 rounded-xl bg-slate-800" />
            ))}
          </div>
          <div className="h-16 rounded-xl bg-slate-800/50" />
        </div>

        {/* Payment method cards */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="h-5 w-44 rounded bg-slate-800" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-800/30 p-4"
              >
                <div className="h-10 w-10 rounded-full bg-slate-700 shrink-0" />
                <div className="space-y-1 flex-1">
                  <div className="h-4 w-24 rounded bg-slate-700" />
                  <div className="h-3 w-32 rounded bg-slate-800/60" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA button */}
        <div className="h-14 rounded-xl bg-slate-800" />
      </div>
    </div>
  );
}
