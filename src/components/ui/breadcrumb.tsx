/**
 * @file breadcrumb.tsx
 * @description Reusable Breadcrumb navigation component.
 * Renders a standard breadcrumb trail with Home → ... → Current Page.
 * Generates schema.org BreadcrumbList JSON-LD automatically.
 *
 * Usage:
 *   <Breadcrumb items={[{ label: "Categories", href: "/categories" }, { label: "Agbada" }]} />
 */

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  /** If true, renders JSON-LD BreadcrumbList in a <script> tag */
  withSchema?: boolean;
  /** Light variant — white text (for dark hero backgrounds) */
  variant?: "default" | "light";
}

const SITE_URL = "https://fashionistar.net";

export function Breadcrumb({
  items,
  className,
  withSchema = false,
  variant = "default",
}: BreadcrumbProps) {
  const isLight = variant === "light";

  const allCrumbs = [{ label: "Home", href: "/" }, ...items];

  const schema = withSchema
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: allCrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.label,
          item: crumb.href ? `${SITE_URL}${crumb.href}` : undefined,
        })),
      }
    : null;

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      <nav
        aria-label="Breadcrumb"
        className={cn("flex items-center flex-wrap gap-1 text-xs", className)}
      >
        <ol className="flex items-center flex-wrap gap-1" role="list">
          {allCrumbs.map((crumb, index) => {
            const isLast = index === allCrumbs.length - 1;
            return (
              <li key={index} className="flex items-center gap-1" role="listitem">
                {index === 0 && (
                  <Home
                    size={11}
                    className={cn(
                      "shrink-0",
                      isLight ? "text-white/60" : "text-muted-foreground",
                    )}
                    aria-hidden="true"
                  />
                )}
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className={cn(
                      "font-medium transition-colors hover:underline underline-offset-2",
                      isLight
                        ? "text-white/60 hover:text-[#FDA600]"
                        : "text-muted-foreground hover:text-[#01454A]",
                    )}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      "font-semibold",
                      isLight ? "text-white" : "text-foreground",
                    )}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {crumb.label}
                  </span>
                )}
                {!isLast && (
                  <ChevronRight
                    size={11}
                    className={cn(
                      "shrink-0",
                      isLight ? "text-white/40" : "text-muted-foreground/50",
                    )}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
