import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

export type Crumb = { label: string; to?: string; params?: Record<string, string> };

/**
 * Premium breadcrumb trail. Renders JSON-LD BreadcrumbList automatically
 * via the schema() helper if you want to add it to a route head().
 */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const all: Crumb[] = [{ label: "Home", to: "/" }, ...items];
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {all.map((c, i) => {
          const last = i === all.length - 1;
          return (
            <li key={i} className="inline-flex items-center gap-1.5">
              {last || !c.to ? (
                <span aria-current={last ? "page" : undefined} className={last ? "text-foreground" : ""}>
                  {i === 0 ? <Home className="h-3.5 w-3.5" aria-label="Home" /> : c.label}
                </span>
              ) : (
                <Link
                  to={c.to}
                  params={c.params as never}
                  className="transition-colors hover:text-foreground"
                >
                  {i === 0 ? <Home className="h-3.5 w-3.5" aria-label="Home" /> : c.label}
                </Link>
              )}
              {!last && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function breadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.item,
    })),
  };
}
