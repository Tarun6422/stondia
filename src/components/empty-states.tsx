import { Link } from "@tanstack/react-router";
import { Package, Search, Image, Download, ArrowUpRight, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; to: string };
};

/**
 * Reusable empty state for pages with no content.
 *
 * Usage:
 *   <EmptyState
 *     icon={<Package className="h-12 w-12" />}
 *     title="No products found"
 *     description="Try adjusting your filters."
 *     action={{ label: "View all products", to: "/products" }}
 *   />
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground/40">
        {icon ?? <FileQuestion className="h-8 w-8" />}
      </div>
      <div>
        <h3 className="font-serif text-xl text-foreground">{title}</h3>
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {action && (
        <Button asChild variant="gold" size="sm" className="mt-1">
          <Link to={action.to}>
            {action.label} <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      )}
    </div>
  );
}

/**
 * Pre-configured empty states for specific pages
 */
export function EmptyProducts({ category, onClear }: { category?: string; onClear?: () => void }) {
  return (
    <EmptyState
      icon={<Package className="h-8 w-8" />}
      title={category ? `No products in "${category}"` : "No products found"}
      description={
        category
          ? "This category doesn't have any products yet — contact us for custom solutions."
          : "Try adjusting your search or filters."
      }
      action={onClear ? { label: "Clear filters", to: "/products" } : undefined}
    />
  );
}

export function EmptySearch({ query, onClear }: { query?: string; onClear?: () => void }) {
  return (
    <EmptyState
      icon={<Search className="h-8 w-8" />}
      title="No results found"
      description={
        query
          ? `Nothing matches "${query}". Try a different search term.`
          : "Enter a search term to find products."
      }
      action={onClear ? { label: "Clear search", to: "/products" } : undefined}
    />
  );
}

export function EmptyGallery() {
  return (
    <EmptyState
      icon={<Image className="h-8 w-8" />}
      title="No images yet"
      description="The gallery is being updated with new project photography. Check back soon."
      action={{ label: "Explore products", to: "/products" }}
    />
  );
}

export function EmptyDownloads() {
  return (
    <EmptyState
      icon={<Download className="h-8 w-8" />}
      title="No downloads available"
      description="Downloadable resources are being prepared. Please check back later."
      action={{ label: "Request quote", to: "/quote" }}
    />
  );
}
