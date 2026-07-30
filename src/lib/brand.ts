/**
 * @file brand.ts
 * @description FASHIONISTAR Brand Token System — Single Source of Truth
 *
 * ALL measurement components must use these tokens instead of hardcoded colors.
 * BANNED colors: violet, purple, #8B5CF6, #A855F7, #7C3AED, #6D28D9
 *
 * Brand Identity:
 *   Forest Green (#2D6A4F) — trust, precision, growth
 *   Golden Yellow (#F4C430) — luxury, measurement, craft
 *   Cream (#F9FAF5)         — calm, non-anxious waiting state
 *   Black (#0A0A0A)         — premium, editorial
 */

// ─── Color Palette ────────────────────────────────────────────────────────────

export const BRAND_COLORS = {
  // Primary brand colors
  forestGreen:      "#2D6A4F",
  forestGreenDark:  "#1B4332",
  forestGreenDarker:"#0D2818",
  forestGreenLight: "#52B788",
  forestGreenMid:   "#40916C",

  // Secondary brand colors
  goldenYellow:     "#F4C430",
  goldenYellowDark: "#C9A227",
  goldenYellowLight:"#F9D84A",

  // Neutral
  cream:            "#F9FAF5",
  creamDark:        "#EDF2EC",
  black:            "#0A0A0A",
  offWhite:         "#F8F8F6",

  // Status colors for measurement states
  statusGood:       "#2D6A4F",   // Forest Green — pose perfect, 90° orientation
  statusWarning:    "#F4C430",   // Golden Yellow — adjust position, slight tilt
  statusError:      "#DC2626",   // Red — error, bad pose, severely tilted
  statusProcessing: "#52B788",   // Light Green — AI working

  // Phone orientation indicator colors (90° detection system)
  orientGreen:      "#2D6A4F",   // Phone at 90 degrees — PERFECT ✅
  orientYellow:     "#F4C430",   // Phone 5-10° off 90° — ADJUST 🟡
  orientRed:        "#DC2626",   // Phone >10° off 90° — TILTED 🔴

  // Quality bar colors (pose detection)
  qualityGood:      "#2D6A4F",   // ≥85% quality
  qualityMedium:    "#F4C430",   // 65-84% quality
  qualityBad:       "#DC2626",   // <65% quality
} as const;

export type BrandColor = keyof typeof BRAND_COLORS;

// ─── CSS Variable Names ────────────────────────────────────────────────────────

export const BRAND_CSS_VARS = {
  forestGreen:    "var(--color-forest-green)",
  goldenYellow:   "var(--color-golden-yellow)",
  cream:          "var(--color-cream)",
} as const;

// ─── Tailwind Class Helpers ───────────────────────────────────────────────────
// Use these instead of hardcoded violet/purple Tailwind classes

export const BRAND_TW = {
  // Backgrounds
  bgGreen:         "bg-[#2D6A4F]",
  bgGreenDark:     "bg-[#1B4332]",
  bgGreenLight:    "bg-[#52B788]",
  bgGreenSubtle:   "bg-[#2D6A4F]/15",
  bgGolden:        "bg-[#F4C430]",
  bgGoldenSubtle:  "bg-[#F4C430]/15",
  bgCream:         "bg-[#F9FAF5]",
  bgError:         "bg-[#DC2626]",
  bgErrorSubtle:   "bg-[#DC2626]/15",

  // Text
  textGreen:       "text-[#2D6A4F]",
  textGreenLight:  "text-[#52B788]",
  textGolden:      "text-[#F4C430]",
  textError:       "text-[#DC2626]",

  // Borders
  borderGreen:     "border-[#2D6A4F]",
  borderGreenSubtle: "border-[#2D6A4F]/20",
  borderGolden:    "border-[#F4C430]",

  // Rings / focus
  ringGreen:       "ring-[#2D6A4F]",
  ringGolden:      "ring-[#F4C430]",
  focusGolden:     "focus:border-[#F4C430] focus:ring-1 focus:ring-[#F4C430]",
  focusGreen:      "focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F]",

  // Gradients
  gradientGreen:   "bg-gradient-to-r from-[#2D6A4F] to-[#1B4332]",
  gradientGreenHover: "hover:from-[#1B4332] hover:to-[#0D2818]",
  gradientGolden:  "bg-gradient-to-r from-[#F4C430] to-[#C9A227]",

  // Shadows
  shadowGreen:     "shadow-[#2D6A4F]/25",
  shadowGolden:    "shadow-[#F4C430]/25",

  // Buttons (primary — Golden Yellow CTA)
  btnPrimary:      "bg-[#F4C430] text-[#0A0A0A] hover:bg-[#C9A227] font-semibold transition-colors",
  // Buttons (secondary — Forest Green)
  btnSecondary:    "bg-[#2D6A4F] text-white hover:bg-[#1B4332] font-semibold transition-colors",
  // Buttons (ghost)
  btnGhost:        "border border-white/20 bg-white/5 text-white/70 hover:bg-white/10 transition-colors",
} as const;

// ─── Pose Quality Thresholds ──────────────────────────────────────────────────

export const POSE_THRESHOLDS = {
  /** Minimum quality for front pose auto-capture trigger */
  frontGood:        0.85,
  /** Minimum quality for front pose (medium — show golden indicator) */
  frontMedium:      0.65,
  /** Minimum quality for side pose (lower — some landmarks naturally hidden) */
  sideGood:         0.75,
  /** Minimum quality for side pose medium indicator */
  sideMedium:       0.55,
  /** Frames of stability required before countdown starts (~1s at 30fps) */
  stabilityFrames:  30,
  /** Legacy threshold used in existing manual capture */
  legacyGoodPose:   0.72,
} as const;

// ─── Auto-Capture Configuration ──────────────────────────────────────────────

export const CAPTURE_CONFIG = {
  /** Countdown seconds before auto-capture */
  countdownSeconds:   3,
  /** Number of frames to keep in landmark buffer (30fps × ~1s) */
  landmarkBufferSize: 30,
  /** Delay in ms before advancing from front_captured → side_transition */
  sideAdvanceDelay:   1500,
  /** How long (ms) to show the capture flash overlay */
  flashDuration:      300,
  /** Minimum ms between voice coaching messages (same message) */
  voiceDebounceMs:    4000,
  /** Adaptive polling: first N polls at fast interval */
  pollFastCount:      3,
  /** Adaptive polling: fast interval (ms) */
  pollFastMs:         1000,
  /** Adaptive polling: slow interval (ms) */
  pollSlowMs:         2000,
} as const;

// ─── Phone Orientation Thresholds (90° Detection System) ────────────────────

export const ORIENTATION_CONFIG = {
  /** Maximum gamma deviation (degrees) from 0 for GREEN status */
  greenThreshold:   5,
  /** Maximum gamma deviation for YELLOW (between green and red) */
  yellowThreshold:  12,
  /** Expected beta angle for perfectly upright phone */
  betaTarget:       90,
  /** Maximum beta deviation from 90° to still count as upright */
  betaTolerance:    15,
} as const;

// ─── Measurement Field Definitions ───────────────────────────────────────────

export const MEASUREMENT_FIELDS = [
  { key: "bust",            label: "Bust",            icon: "👕", zone: "upper" },
  { key: "waist",           label: "Waist",           icon: "⬡",  zone: "core"  },
  { key: "hips",            label: "Hips",            icon: "⬡",  zone: "lower" },
  { key: "shoulder_width",  label: "Shoulder Width",  icon: "📏", zone: "upper" },
  { key: "arm_length",      label: "Arm Length",      icon: "💪", zone: "upper" },
  { key: "inseam",          label: "Inseam",          icon: "👖", zone: "lower" },
  { key: "thigh",           label: "Thigh",           icon: "⬡",  zone: "lower" },
  { key: "height",          label: "Height",          icon: "📏", zone: "full"  },
  { key: "neck",            label: "Neck",            icon: "⬡",  zone: "upper" },
  { key: "wrist",           label: "Wrist",           icon: "⌚", zone: "upper" },
  { key: "knee",            label: "Knee",            icon: "⬡",  zone: "lower" },
  { key: "ankle",           label: "Ankle",           icon: "⬡",  zone: "lower" },
  { key: "chest",           label: "Chest",           icon: "⬡",  zone: "upper" },
  { key: "upper_arm",       label: "Upper Arm",       icon: "💪", zone: "upper" },
] as const;

export type MeasurementKey = (typeof MEASUREMENT_FIELDS)[number]["key"];

// ─── Voice Coach Scripts ──────────────────────────────────────────────────────

export const VOICE_SCRIPTS = {
  // Device setup phase
  welcome:         "Welcome to FASHIONISTAR body scan. I'll guide you through every step.",
  placePhone:      "First, place your phone against a wall at chest height, standing at 90 degrees. Watch the indicator. When it turns green, you're ready.",
  phoneNotLevel:   "Your phone isn't level yet. Lean it against a wall or stable surface facing you.",
  phoneTiltLeft:   "Your phone is tilted slightly to the right — rotate it a bit to the left.",
  phoneTiltRight:  "Your phone is tilted slightly to the left — rotate it a bit to the right.",
  phoneReady:      "Perfect! Your phone is level and ready. Now step into position.",

  // Positioning phase
  stepIntoFrame:   "Now step into the camera frame. I need to see your full body from head to toe.",
  tooClose:        "You're too close. Please step back until your full body is visible.",
  tooFar:          "You're too far away. Step a little closer so I can see you clearly.",
  centerYourself:  "Please center yourself in the frame.",
  centerRight:     "Move slightly to your right.",
  centerLeft:      "Move slightly to your left.",

  // Aligning phase
  standStraight:   "Stand up straight with your arms slightly apart from your body.",
  spreadArms:      "Great! Now spread your arms slightly — about 15 degrees, like a relaxed letter T.",
  holdStill:       "Perfect pose! Hold that position.",

  // Countdown
  countdown3:      "3",
  countdown2:      "2",
  countdown1:      "1",

  // Capture confirmations
  frontCaptured:   "Front pose captured! Excellent. Now please turn to face your right side.",
  turnSide:        "Turn so your right shoulder faces the camera and stand straight.",
  sideHoldStill:   "Perfect! Hold still for your side pose.",
  sideCaptured:    "Both poses captured! I'm now sending your measurements to the AI.",

  // Processing
  processing:      "Our AI is calculating your 14 body measurements. This takes about 10 seconds.",
  complete:        "Your measurements are ready! 14 precise measurements have been saved to your profile.",

  // Errors and guidance
  errorLighting:   "The lighting is too dark. Try facing a window or turning on more lights.",
  errorFit:        "I can't see your full body. Please step back and ensure nothing is blocking the camera.",
  errorTryAgain:   "Something went wrong. Please try again.",
  poseGood:        "Excellent pose!",
  poseWarning:     "Almost there — adjust your position slightly.",
  poseBad:         "I can't detect your full body. Stand straight and face the camera.",
  heightPredicted: "Based on your age, I've estimated your height. You can update this if needed.",
} as const;

export type VoiceScriptKey = keyof typeof VOICE_SCRIPTS;

// ─── WHO Height Reference Tables (for age-to-height prediction) ───────────────

export const WHO_HEIGHT_BY_AGE: Record<string, { male: number; female: number; neutral: number }> = {
  "10": { male: 140, female: 142, neutral: 141 },
  "11": { male: 145, female: 148, neutral: 147 },
  "12": { male: 150, female: 153, neutral: 152 },
  "13": { male: 156, female: 157, neutral: 157 },
  "14": { male: 162, female: 160, neutral: 161 },
  "15": { male: 167, female: 162, neutral: 164 },
  "16": { male: 171, female: 163, neutral: 167 },
  "17": { male: 174, female: 163, neutral: 168 },
  "18": { male: 176, female: 164, neutral: 170 },
  "19": { male: 177, female: 164, neutral: 170 },
  "20": { male: 177, female: 164, neutral: 170 },
  "25": { male: 177, female: 164, neutral: 170 },
  "30": { male: 177, female: 163, neutral: 170 },
  "35": { male: 176, female: 163, neutral: 169 },
  "40": { male: 176, female: 162, neutral: 169 },
  "45": { male: 175, female: 162, neutral: 168 },
  "50": { male: 175, female: 161, neutral: 168 },
  "55": { male: 174, female: 161, neutral: 167 },
  "60": { male: 173, female: 160, neutral: 166 },
  "65": { male: 172, female: 159, neutral: 165 },
  "70": { male: 171, female: 158, neutral: 164 },
  "75": { male: 170, female: 157, neutral: 163 },
  "80": { male: 169, female: 156, neutral: 162 },
} as const;

/**
 * Predict height from age using WHO reference tables.
 * @param age User's age (10-100)
 * @param sex User's sex for more accurate prediction
 */
export function predictHeightFromAge(
  age: number,
  sex: "male" | "female" | "neutral" = "neutral"
): { predictedCm: number; rangeLow: number; rangeHigh: number; predictedInch: string } {
  const clampedAge = Math.min(80, Math.max(10, age));
  // Find closest age key
  const keys = Object.keys(WHO_HEIGHT_BY_AGE).map(Number).sort((a, b) => a - b);
  const closest = keys.reduce((prev, curr) =>
    Math.abs(curr - clampedAge) < Math.abs(prev - clampedAge) ? curr : prev
  );
  const data = WHO_HEIGHT_BY_AGE[String(closest)];
  const predictedCm = data[sex];
  const rangeLow = Math.round(predictedCm - 10);
  const rangeHigh = Math.round(predictedCm + 10);

  // Convert to feet and inches
  const totalInches = predictedCm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  const predictedInch = `${feet}'${inches}"`;

  return { predictedCm, rangeLow, rangeHigh, predictedInch };
}
