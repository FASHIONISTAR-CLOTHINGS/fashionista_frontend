export type GuidanceKey =
  | "POSITION_PHONE"
  | "STAND_BACK"
  | "ARMS_OPEN"
  | "HOLD_STILL"
  | "CAPTURED_FRONT"
  | "TURN_SIDEWAYS"
  | "HOLD_STILL_SIDE"
  | "CAPTURED_SIDE"
  | "PROCESSING"
  | "DONE";

export const GUIDANCE_SCRIPT: Record<GuidanceKey, string> = {
  POSITION_PHONE:    "Position your phone 1.5 metres away so your full body is visible.",
  STAND_BACK:        "Stand back slightly and face the camera directly.",
  ARMS_OPEN:         "Keep your arms slightly away from your body.",
  HOLD_STILL:        "Hold still — capturing your front pose.",
  CAPTURED_FRONT:    "Front pose captured! Now turn sideways.",
  TURN_SIDEWAYS:     "Turn 90 degrees to your right so we can capture your side profile.",
  HOLD_STILL_SIDE:   "Hold still — capturing your side pose.",
  CAPTURED_SIDE:     "Side pose captured! Processing your measurements.",
  PROCESSING:        "AI is processing your body measurements. This takes a few seconds.",
  DONE:              "All done! Your measurements have been saved to your profile.",
};
