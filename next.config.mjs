import { withSentryConfig } from "@sentry/nextjs";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const FALLBACK_BACKEND_URL = "https://fashionistar-ai-fashionistar-api-v1.hf.space";
const backendUrl = (() => {
  const raw =
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    FALLBACK_BACKEND_URL;
  if (!raw || (!raw.startsWith("http://") && !raw.startsWith("https://"))) {
    console.warn(`[next.config] backendUrl is not a valid URL, using fallback: ${FALLBACK_BACKEND_URL}`);
    return FALLBACK_BACKEND_URL;
  }
  return raw;
})();
const distDir = process.env.NEXT_DIST_DIR || ".next";

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeDevOrigin(value) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).host;
  } catch {
    return value.replace(/^https?:\/\//, "").split("/")[0] || null;
  }
}

function toRemotePattern(url, pathname = "/**") {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);

    return {
      protocol: parsed.protocol.replace(":", ""),
      hostname: parsed.hostname,
      ...(parsed.port ? { port: parsed.port } : {}),
      pathname,
    };
  } catch {
    return null;
  }
}

const allowedDevOrigins = unique([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "*.loca.lt",
  "*.ngrok-free.app",
  "*.ngrok-free.dev",
  "*.trycloudflare.com",
  "fashionistar-ai-fashionistar-frontend.hf.space",
  normalizeDevOrigin(process.env.NEXT_PUBLIC_APP_URL),
  normalizeDevOrigin(process.env.NEXT_PUBLIC_FRONTEND_TUNNEL_URL),
  normalizeDevOrigin(backendUrl),
]);

const imageRemotePatterns = unique([
  {
    protocol: "https",
    hostname: "res.cloudinary.com",
    pathname: "/dgpdlknc1/**",
  },
  {
    protocol: "https",
    hostname: "res.cloudinary",
  },
  {
    protocol: "https",
    hostname: "**.cloudinary.com",
  },
  {
    protocol: "https",
    hostname: "**.trycloudflare.com",
  },
  {
    protocol: "https",
    hostname: "**.ngrok-free.app",
  },
  {
    protocol: "https",
    hostname: "**.ngrok-free.dev",
  },
  {
    protocol: "http",
    hostname: "127.0.0.1",
    port: "8001",
    pathname: "/media/**",
  },
  {
    protocol: "http",
    hostname: "localhost",
    port: "8001",
    pathname: "/media/**",
  },
  {
    protocol: "https",
    hostname: "picsum.photos",
  },
  {
    protocol: "https",
    hostname: "images.unsplash.com",
  },
  toRemotePattern(backendUrl, "/media/**"),
]);

/** @type {import('next').NextConfig} */
// Force Turbopack environment variable reload!
const nextConfig = {
  output: "standalone",
  distDir,
  allowedDevOrigins,
  skipTrailingSlashRedirect: true,
  experimental: {
    // cpus: 1,   // Uncomment for debugging: force single-threaded builds to avoid worker spawning issues in Windows/OneDrive setups.
    //   // cpus: 1 intentionally REMOVED — caused 404s on first route request and 
    // 3+ minute compilation times in Turbopack. workerThreads alone is stable.
    workerThreads: true,
  },
  typescript: {
    // CI and local verification run `make type-check` explicitly, which avoids
    // duplicate Next.js worker spawning issues in this Windows/OneDrive setup.
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: imageRemotePatterns,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 604800,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
  },
  headers: async () => [
    {
      // ── MediaPipe SW: always revalidate so updates deploy immediately ──
      source: "/sw-mediapipe.js",
      headers: [
        { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        { key: "Service-Worker-Allowed", value: "/" },
      ],
    },
    {
      // ── WASM cross-origin isolation (required for SharedArrayBuffer + SIMD) ──
      // Applied only to the scan page to avoid breaking other routes
      source: "/client/dashboard/measurements/scan/:path*",
      headers: [
        { key: "Cross-Origin-Opener-Policy",   value: "same-origin" },
        { key: "Cross-Origin-Embedder-Policy",  value: "require-corp" },
      ],
    },
    {
      // ── MediaPipe WASM binaries — immutable, versioned by npm version ──
      source: "/_next/static/:path*.wasm",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
      ],
    },
    {
      // Static preloader CSS — cache 1 year, immutable (no personalization)
      source: "/preloader.css",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      // Static first-paint logo animation — versioned by filename in releases.
      source: "/preloader/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(self), microphone=(), geolocation=(self)",
        },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ],
    },
  ],
  redirects: async () => [
    { source: "/auth", destination: "/auth/sign-in", permanent: true },
    { source: "/login", destination: "/auth/sign-in", permanent: true },
    { source: "/register", destination: "/auth/choose-role", permanent: true },
    { source: "/signup", destination: "/auth/choose-role", permanent: true },
    { source: "/sign-up", destination: "/auth/choose-role", permanent: true },
    { source: "/verify", destination: "/auth/verify-otp", permanent: true },
    { source: "/verify-otp", destination: "/auth/verify-otp", permanent: true },
    {
      source: "/forgot-password",
      destination: "/auth/forgot-password",
      permanent: true,
    },
    {
      source: "/forgot-password/confirm-phone",
      destination: "/auth/forgot-password/confirm-phone",
      permanent: true,
    },
    {
      source: "/reset-password",
      destination: "/auth/forgot-password",
      permanent: true,
    },
    {
      source: "/password-recovery",
      destination: "/auth/forgot-password",
      permanent: true,
    },
    {
      source: "/password-recovery/:uidb64/:token",
      destination: "/auth/forgot-password/confirm-email/:uidb64/:token",
      permanent: true,
    },
    {
      source: "/auth/forgot-password/c=onfirm-email/:uidb64/:token",
      destination: "/auth/forgot-password/confirm-email/:uidb64/:token",
      permanent: true,
    },
    { source: "/shop", destination: "/shops", permanent: true },
    { source: "/latest", destination: "/collections", permanent: true },
    { source: "/location", destination: "/contact-us", permanent: true },
    { source: "/pages", destination: "/blog", permanent: true },
    { source: "/client", destination: "/client/dashboard", permanent: true },
    { source: "/wallet", destination: "/client/dashboard/wallet", permanent: true },
    { source: "/orders", destination: "/client/dashboard/orders", permanent: true },
    { source: "/vendor-dashboard/product/create", destination: "/vendor/products", permanent: true },
  ],
  rewrites: async () => ({
    beforeFiles: [
      {
        source: "/api/v1/:path*/",
        destination: `${backendUrl}/api/v1/:path*/`,
      },
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*/`,
      },
      {
        source: "/media/:path*",
        destination: `${backendUrl}/media/:path*`,
      },
    ],
  }),
  serverExternalPackages: [
    "sharp",
    "@opentelemetry/sdk-trace-web",
    "@opentelemetry/instrumentation",
    "@sentry/node",
    "require-in-the-middle",
    "import-in-the-middle",
  ],

  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
};

export default withSentryConfig(withBundleAnalyzer(nextConfig), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "fashionistar",

  project: "fashionistar-sentry",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: false,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
