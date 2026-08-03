/**
 * @file brand.ts
 * @description FASHIONISTAR Brand Token System — Single Source of Truth
 *
 * ALL measurement components must use these tokens instead of hardcoded colors.
 * BANNED colors: violet, purple, #8B5CF6, #A855F7, #7C3AED, #6D28D9
 *
 * Brand Identity (aligned with `src/app/globals.css` --BV-* tokens):
 *   Forest Green / Teal (#01454A) — trust, precision, growth
 *   Golden Yellow (#FDA600)       — luxury, measurement, craft
 *   Cream (#F4F3EC)               — calm, non-anxious waiting state
 *   Ink / Charcoal (#111111)      — premium, editorial text
 *   Surface (#F8F5ED)             — light backgrounds
 */

// ─── Color Palette ────────────────────────────────────────────────────────────

export const BRAND_COLORS = {
  // Secondary brand colors (golden yellow)
  goldenYellow:     "#FDA600",
  goldenYellowDark: "#C88500",
  goldenYellowLight: "#F0A000",

  // Neutral
  cream:            "#F4F3EC",
  creamDark:        "#ECE6D6",
  black:            "#111111",
  ink:              "#111111",
  offWhite:         "#F8F5ED",
  surface:          "#F8F5ED",
  slate:            "#5A6465",
  muted:            "#7A6B44",

  // Primary brand colors (teal/forest green)
  forestGreen:      "#01454A",
  forestGreenDark:  "#00373B",
  forestGreenDarker: "#00373B",
  forestGreenLight: "#1A6B72",
  forestGreenMid:   "#01454A",

  // Status colors for measurement states
  statusGood:       "#01454A",   // Forest Green — pose perfect, 90° orientation
  statusWarning:    "#FDA600",   // Golden Yellow — adjust position, slight tilt
  statusError:      "#DC2626",   // Red — error, bad pose, severely tilted
  statusProcessing: "#1A6B72",   // Light Green — AI working

  // Phone orientation indicator colors (90° detection system)
  orientGreen:      "#01454A",   // Phone at 90 degrees — PERFECT ✅
  orientYellow:     "#FDA600",   // Phone 5-10° off 90° — ADJUST 🟡
  orientRed:        "#DC2626",   // Phone >10° off 90° — TILTED 🔴

  // Quality bar colors (pose detection)
  qualityGood:      "#01454A",   // ≥85% quality
  qualityMedium:    "#FDA600",   // 65-84% quality
  qualityBad:       "#DC2626",   // <65% quality
} as const;

export type BrandColor = keyof typeof BRAND_COLORS;

// ─── CSS Variable Names ────────────────────────────────────────────────────────

export const BRAND_CSS_VARS = {
  forestGreen:    "var(--BV-green)",
  goldenYellow:   "var(--BV-gold)",
  cream:          "var(--BV-cream)",
  ink:            "var(--BV-ink)",
  surface:        "var(--BV-surface)",
} as const;

// ─── Tailwind Class Helpers ───────────────────────────────────────────────────
// Use these instead of hardcoded violet/purple Tailwind classes

export const BRAND_TW = {
  // Backgrounds
  bgGreen:         "bg-[var(--BV-green)]",
  bgGreenDark:     "bg-[var(--BV-green-light)]",
  bgGreenLight:    "bg-[var(--BV-green-light)]",
  bgGreenSubtle:   "bg-[var(--BV-green)]/15",
  bgGolden:        "bg-[var(--BV-gold)]",
  bgGoldenSubtle:  "bg-[var(--BV-gold)]/15",
  bgCream:         "bg-[var(--BV-cream)]",
  bgError:         "bg-[var(--BV-red-alert)]",
  bgErrorSubtle:   "bg-[var(--BV-red-alert)]/15",

  // Text
  textGreen:       "text-[var(--BV-green)]",
  textGreenLight:  "text-[var(--BV-green-light)]",
  textGolden:      "text-[var(--BV-gold)]",
  textError:       "text-[var(--BV-red-alert)]",
  textInk:         "text-[var(--BV-ink)]",

  // Borders
  borderGreen:     "border-[var(--BV-green)]",
  borderGreenSubtle: "border-[var(--BV-green)]/20",
  borderGolden:    "border-[var(--BV-gold)]",

  // Rings / focus
  ringGreen:       "ring-[var(--BV-green)]",
  ringGolden:      "ring-[var(--BV-gold)]",
  focusGolden:     "focus:border-[var(--BV-gold)] focus:ring-1 focus:ring-[var(--BV-gold)]",
  focusGreen:      "focus:border-[var(--BV-green)] focus:ring-1 focus:ring-[var(--BV-green)]",

  // Gradients
  gradientGreen:   "bg-gradient-to-r from-[var(--BV-green)] to-[var(--BV-green-light)]",
  gradientGreenHover: "hover:from-[var(--BV-green-light)] hover:to-[var(--BV-green)]",
  gradientGolden:  "bg-gradient-to-r from-[var(--BV-gold)] to-[var(--BV-gold-dark)]",

  // Shadows
  shadowGreen:     "shadow-[var(--BV-green)]/25",
  shadowGolden:    "shadow-[var(--BV-gold)]/25",

  // Buttons (primary — Golden Yellow CTA)
  btnPrimary:      "bg-[var(--BV-gold)] text-[var(--BV-ink)] hover:bg-[var(--BV-gold-dark)] font-semibold transition-colors",
  // Buttons (secondary — Forest Green)
  btnSecondary:    "bg-[var(--BV-green)] text-[var(--BV-cream)] hover:bg-[var(--BV-green-light)] font-semibold transition-colors",
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
  welcome:          "Welcome to FASHIONISTAR body scan. I'll guide you through every step.",
  placePhone:       "First, place your phone against a wall at chest height, standing at 90 degrees. Watch the indicator. When it turns green, you're ready.",
  phoneNotLevel:    "Your phone isn't level yet. Lean it against a wall or stable surface facing you.",
  phoneTiltLeft:    "Your phone is tilted slightly to the right — rotate it a bit to the left.",
  phoneTiltRight:   "Your phone is tilted slightly to the left — rotate it a bit to the right.",
  phoneReady:       "Perfect! Your phone is level and ready. Now step into position.",

  // Positioning phase
  stepIntoFrame:    "Now step into the camera frame. I need to see your full body from head to toe.",
  tooClose:         "You're too close. Please step back until your full body is visible.",
  tooFar:           "You're too far away. Step a little closer so I can see you clearly.",
  stepBack:         "Take two steps back from the camera.",
  stepForward:      "Step a little closer to the camera.",
  centerYourself:   "Please center yourself in the frame.",
  centerRight:      "Move slightly to your right.",
  centerLeft:       "Move slightly to your left.",
  moveLeft:         "Shift slightly to your left.",
  moveRight:        "Shift slightly to your right.",

  // Arms guidance
  armsOpen:         "Open your arms to 45 degrees from your body — like a relaxed letter T.",
  spreadArms:       "Great! Now spread your arms slightly — about 15 degrees, like a relaxed letter T.",

  // Aligning phase
  standStraight:    "Stand up straight with your arms slightly apart from your body.",
  holdStill:        "Perfect pose! Hold that position.",

  // Readiness
  perfectPosition:  "Perfect position! Capturing in 3 seconds. Don't move.",
  capturingNow:     "Capturing now. Please don't move.",

  // Countdown
  countdown3:       "3",
  countdown2:       "2",
  countdown1:       "1",

  // Capture confirmations
  frontCaptured:    "Front pose captured! Excellent. Now please turn to face your right side.",
  turnSide:         "Turn so your right shoulder faces the camera and stand straight.",
  sideHoldStill:    "Perfect! Hold still for your side pose.",
  sideCaptured:     "Both poses captured! I'm now sending your measurements to the AI.",

  // Processing
  processing:       "Our AI is calculating your 14 body measurements. This takes about 60 seconds.",
  complete:         "Your measurements are ready! 14 precise measurements have been saved to your profile.",

  // Errors and guidance
  errorLighting:    "The lighting is too dark. Try facing a window or turning on more lights.",
  errorFit:         "I can't see your full body. Please step back and ensure nothing is blocking the camera.",
  errorTryAgain:    "Something went wrong. Please try again.",
  poseGood:         "Excellent pose!",
  poseWarning:      "Almost there — adjust your position slightly.",

  // Added: specific distance guidance
  stepBackOneFoot:  "Step back one foot.",
  stepBackTwoFeet:  "Step back two feet.",
  stepCloserOneFoot: "Step closer one foot.",
  stepCloserTwoFeet: "Step closer two feet.",
  moveLittleLeft:   "Move a little to your left.",
  moveLittleRight:  "Move a little to your right.",
} as const;

export type VoiceScriptKey = keyof typeof VOICE_SCRIPTS;

