import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    name: "fashionistar/ignores",
  },
  {
    ignores: [
      ".pnpm-store/**",
      ".next/**",
      "out/**",
      "build/**",
      "coverage/**",
      "playwright-report/**",
      "tests/playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
      "fix_*.js",
      "fix_*.mjs",
      "suppress_*.js",
      "tmp-*.cjs",
      "tmp-*.js",
      "tmp_v3.cjs",
      "tests/e2e/**/*.ts",
      "tests/unit/**/*.tsx",
      "tests/load/**",
      "scratch/**",
      "GLOBAL_MAIN_BRANCH_ORIGINAL_CSS_STYLES_FONTS_AND_GUIDELINES/**",
      "run-e2e.cjs",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default eslintConfig;
