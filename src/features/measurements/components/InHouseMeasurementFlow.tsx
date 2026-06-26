"use client";

import { useState } from "react";
import { Camera, CheckCircle2, Loader2, Ruler, Shirt, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InHouseMeasurementFlow() {
  const [step, setStep] = useState(1); // 1: Guidance, 2: Upload Front, 3: Upload Side, 4: Processing
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [frontPhoto, setFrontPhoto] = useState<File | null>(null);
  const [sidePhoto, setSidePhoto] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNextStep = () => {
    if (step === 1) {
      if (!name || !email) {
        alert("Please enter your name and email.");
        return;
      }
      setStep(2);
    }
  };

  const handleFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFrontPhoto(e.target.files[0]);
      setStep(3);
    }
  };

  const handleSideUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSidePhoto(e.target.files[0]);
      setStep(4);
      // Simulate processing
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setStep(5); // Success
      }, 3000);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      {step === 1 && (
        <form
          onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}
          className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-card_shadow space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-[8px] bg-[#FDA600]/10 text-[#FDA600]">
              <Ruler size={20} />
            </div>
            <div>
              <p className="text-lg font-semibold text-black">Get measured with In-House AI Scan</p>
              <p className="text-sm text-[#5A6465]">Provide your name and email to start our AI-guided photo measurement session.</p>
            </div>
          </div>

          <div className="grid gap-4 mt-4">
            <Field label="Full Name" value={name} onChange={setName} placeholder="Your name" />
            <Field label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-[#FDA600] flex items-center justify-center gap-2 rounded-[8px] px-5 text-sm font-bold text-white mt-6"
          >
            Start Scanning Session
          </Button>
        </form>
      )}

      {step >= 2 && step <= 4 && (
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-card_shadow space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-black">AI Scan Progress</h3>
            <span className="text-xs font-bold uppercase tracking-widest text-[#FDA600] bg-[#FDA600]/10 px-2.5 py-1 rounded-full">
              Step {step - 1} of 2
            </span>
          </div>

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-[#5A6465]">
                Please upload or capture a **Front-view** photo standing upright with your arms slightly away from your torso.
              </p>
              <div className="border-2 border-dashed border-[#E5E7EB] rounded-[8px] p-8 text-center flex flex-col items-center justify-center hover:border-[#FDA600] transition-colors relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFrontUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Camera className="text-[#FDA600] mb-3" size={32} />
                <span className="text-sm font-semibold text-black">Click to Capture / Upload Front Photo</span>
                <span className="text-xs text-[#858585] mt-1">Supports JPEG, PNG</span>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-[#5A6465]">
                Please upload or capture a **Side-view** photo standing at a 90-degree angle to the camera.
              </p>
              <div className="border-2 border-dashed border-[#E5E7EB] rounded-[8px] p-8 text-center flex flex-col items-center justify-center hover:border-[#FDA600] transition-colors relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSideUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Camera className="text-[#FDA600] mb-3" size={32} />
                <span className="text-sm font-semibold text-black">Click to Capture / Upload Side Photo</span>
                <span className="text-xs text-[#858585] mt-1">Supports JPEG, PNG</span>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
              <Loader2 className="animate-spin text-[#FDA600]" size={42} />
              <p className="text-lg font-semibold text-black">Analyzing Sizing Photos...</p>
              <p className="text-sm text-[#5A6465] max-w-sm">
                Our in-house AI vision engine (ViTPose-B) is extracting whole-body keypoints from {frontPhoto?.name} and {sidePhoto?.name} to compute accurate tailor measurements. Status: {isSubmitting ? "Processing" : "Idle"}.
              </p>
            </div>
          )}
        </div>
      )}

      {step === 5 && (
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-card_shadow flex flex-col items-center justify-center py-12 text-center space-y-4">
          <CheckCircle2 className="text-emerald-500" size={56} />
          <p className="text-xl font-bold text-black">Measurements Extracted!</p>
          <p className="text-sm text-[#5A6465] max-w-md">
            Your body scan profile has been successfully processed and verified. These measurements will now be applied to custom orders.
          </p>
          <Button
            onClick={() => setStep(1)}
            className="bg-black text-white px-6 h-11 rounded-[8px] font-bold mt-4"
          >
            Start New Scan
          </Button>
        </div>
      )}

      {/* Pre-Scan Tooltips / Guidelines Panel */}
      <section className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-card_shadow space-y-6">
        <div>
          <p className="text-lg font-semibold text-black">Scanning Guidelines</p>
          <p className="mt-1 text-sm text-[#5A6465]">Follow these rules to ensure 100% measurement accuracy.</p>
        </div>

        <div className="grid gap-4">
          <TooltipTip
            icon={<Shirt className="text-[#FDA600]" size={18} />}
            title="Wear Activewear"
            body="Loose clothing adds up to 3 inches of error. Wear tight-fitting garments or activewear."
          />
          <TooltipTip
            icon={<Sun className="text-[#FDA600]" size={18} />}
            title="Even Lighting"
            body="Stand in bright, uniform lighting. Avoid backlighting or strong shadows."
          />
          <TooltipTip
            icon={<User className="text-[#FDA600]" size={18} />}
            title="Standing Posture"
            body="Stand upright, feet shoulder-width apart, arms slightly away from the torso."
          />
        </div>
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

function TooltipTip({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3 items-start p-3 bg-[#F8F9FC] rounded-[8px]">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-black">{title}</p>
        <p className="text-xs text-[#5A6465] mt-0.5 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
