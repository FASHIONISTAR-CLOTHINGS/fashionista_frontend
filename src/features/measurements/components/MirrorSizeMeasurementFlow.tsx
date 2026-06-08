"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, CheckCircle2, Loader2, QrCode, Ruler } from "lucide-react";
import {
  useCreateMirrorSizeSession,
  useImportMirrorSizeMeasurement,
} from "../hooks/use-measurements";
import { Button } from "@/components/ui/button";
import { FashionistarImage } from "@/components/media";

export function MirrorSizeMeasurementFlow() {
  const createSession = useCreateMirrorSizeSession();
  const importMeasurement = useImportMirrorSizeMeasurement();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [accessCode, setAccessCode] = useState("");

  const session = createSession.data;
  const activeAccessCode = accessCode || session?.access_code || "";
  const qrSrc = useMemo(() => {
    if (!session?.qr_code) return "";
    return session.qr_code.startsWith("data:")
      ? session.qr_code
      : `data:image/png;base64,${session.qr_code}`;
  }, [session?.qr_code]);

  const handleStart = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createSession.mutate({ name, email, mobile_no: mobileNo });
  };

  const handleImport = () => {
    if (!activeAccessCode) return;
    importMeasurement.mutate({
      access_code: activeAccessCode,
      set_as_default: true,
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form
        onSubmit={handleStart}
        className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-card_shadow"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-[8px] bg-[#FDA600]/10 text-[#FDA600]">
            <Ruler size={20} />
          </div>
          <div>
            <p className="text-lg font-semibold text-black">Get measured with MirrorSize</p>
            <p className="text-sm text-[#5A6465]">Create a secure QR/mobile link, complete the scan, then import the verified profile.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Full Name" value={name} onChange={setName} placeholder="Your name" />
          <Field label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
          <Field label="Mobile Number" value={mobileNo} onChange={setMobileNo} placeholder="080..." />
          <Field label="Access Code" value={accessCode} onChange={setAccessCode} placeholder="Auto-filled after start" />
        </div>

        <Button
          type="submit"
          disabled={createSession.isPending}
          className="mt-6 w-full h-12 bg-[#FDA600] flex h-12 w-full items-center justify-center gap-2 rounded-[8px] px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {createSession.isPending ? <Loader2 className="animate-spin" size={17} /> : <QrCode size={17} />}
          Start MirrorSize Session
        </Button>
      </form>

      <section className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-card_shadow">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-black">Scan and import</p>
            <p className="mt-1 text-sm text-[#5A6465]">Use Chrome on Android or Safari on iOS for the MirrorSize mobile browser link.</p>
          </div>
          {session && <CheckCircle2 className="text-emerald-500" size={22} />}
        </div>

        <div className="mt-5 flex min-h-48 items-center justify-center rounded-[8px] bg-[#F8F9FC] p-4">
          {qrSrc ? (
            <FashionistarImage src={qrSrc} alt="MirrorSize measurement QR code" width={176} height={176} imgClassName="max-h-44 max-w-full" />
          ) : (
            <div className="text-center text-sm text-[#858585]">
              <QrCode className="mx-auto mb-3" size={42} />
              Start a session to generate QR code and access link.
            </div>
          )}
        </div>

        {session?.measurement_url && (
          <a
            href={session.measurement_url}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex items-center justify-center gap-2 rounded-[8px] border border-[#FDA600] px-4 py-3 text-sm font-semibold text-[#7A5200]"
          >
            Open MirrorSize mobile link
            <ArrowUpRight size={15} />
          </a>
        )}

        <Button
          type="button"
          onClick={handleImport}
          disabled={!activeAccessCode || importMeasurement.isPending}
          className="mt-3 w-full h-12 bg-black flex h-12 w-full items-center justify-center gap-2 rounded-[8px] px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {importMeasurement.isPending && <Loader2 className="animate-spin" size={17} />}
          Import Completed Measurements
        </Button>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-widest text-[#858585]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-[8px] border border-[#E5E7EB] px-3 text-sm text-black outline-none focus:border-[#FDA600]"
      />
    </label>
  );
}
