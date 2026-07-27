export interface GuidanceCue {
  caption: string;
  speech: string;
  priority: "low" | "normal" | "high";
}

export type GuidancePhase =
  | "idle"
  | "loading_model"
  | "awaiting_height"
  | "capturing"
  | "capturing_side"
  | "validating"
  | "submitting"
  | "processing"
  | "completed"
  | "failed";

const SCRIPT: Record<GuidancePhase, GuidanceCue> = {
  idle: {
    caption: "Enter your height and tap Start Body Scan to begin.",
    speech:
      "Welcome to the AI body scanner. Please enter your height and press start when you are ready.",
    priority: "normal",
  },
  loading_model: {
    caption: "Loading AI pose detection model…",
    speech: "Loading the AI model. This will only take a few seconds.",
    priority: "low",
  },
  awaiting_height: {
    caption: "Step back 1.5–2 metres and face the camera fully.",
    speech:
      "Please stand about two metres from the camera. Make sure your whole body is visible from head to toe.",
    priority: "high",
  },
  capturing: {
    caption: "Stand still — keep your arms slightly away from your body.",
    speech:
      "Hold still. Keep your arms slightly away from your sides and look straight ahead.",
    priority: "high",
  },
  capturing_side: {
    caption: "Now turn 90° to your right and hold still.",
    speech:
      "Great. Now please turn ninety degrees to your right and hold still for the side scan.",
    priority: "high",
  },
  validating: {
    caption: "Checking pose quality…",
    speech: "Checking your pose quality.",
    priority: "low",
  },
  submitting: {
    caption: "Uploading scan data to the server…",
    speech: "Uploading your scan data.",
    priority: "low",
  },
  processing: {
    caption: "AI is extracting your measurements. Usually 5–10 seconds.",
    speech:
      "The AI is now extracting your body measurements. This usually takes five to ten seconds.",
    priority: "normal",
  },
  completed: {
    caption: "Scan complete! Your measurements are ready.",
    speech: "Scan complete. Your measurements are now ready to view.",
    priority: "normal",
  },
  failed: {
    caption: "Scan failed. Please try again with better lighting and posture.",
    speech:
      "The scan was not successful. Please check your lighting and posture, then try again.",
    priority: "high",
  },
};

export function getGuidanceCue(phase: GuidancePhase): GuidanceCue {
  return SCRIPT[phase] ?? SCRIPT.idle;
}
