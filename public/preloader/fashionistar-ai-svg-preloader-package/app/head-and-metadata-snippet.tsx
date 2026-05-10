/* eslint-disable @next/next/no-css-tags */

/**
 * Example head preload snippet for the SVG-first Fashionistar preloader.
 *
 * Copy this logic into `src/app/layout.tsx`; this file stays valid TypeScript
 * so repository-wide type-check and lint commands do not fail on examples.
 */
export function HeadAndMetadataSnippet() {
  return (
    <>
      <link rel="stylesheet" href="/preloader.css" fetchPriority="high" />
      <link
        rel="preload"
        href="/preloader/fashionistar-ai-preloader.svg"
        as="image"
        type="image/svg+xml"
      />
    </>
  );
}

export const recommendedIconMetadata = {
  icon: [
    { url: "/preloader/fashionistar-ai-favicon-white-transparent.svg", sizes: "any" },
    { url: "/preloader/fashionistar-ai-favicon-white-transparent.svg", type: "image/svg+xml" },
  ],
  apple: "/preloader/fashionistar-ai-favicon-white-transparent.svg",
} as const;
