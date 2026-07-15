/* ------------------------------------------------------------------ */
/*  Products API — frontend product data helpers                      */
/*  Single source of truth: backend API (Prisma database)             */
/*  All product data flows from here — no static PRODUCTS imports    */
/* ------------------------------------------------------------------ */

import { api } from "./api";

/* ── Types matching backend API response ── */

export type ApiCategory = {
  id: string;
  name: string;
  slug: string;
};

export type ApiStructuredImage = {
  id: string;
  fileName: string;
  displayName: string | null;
  url: string;
  imageType: string;
  productCode: string | null;
  categoryId: string | null;
  productId: string | null;
  projectId: string | null;
  altText: string | null;
  sortOrder: number;
  width: number | null;
  height: number | null;
};

/** The shape of a product as returned by the backend API */
export type ApiProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription?: string | null;
  tagline?: string | null;
  categoryId: string;
  category: ApiCategory;
  productCode: string | null;
  material: string | null;
  stoneType: string | null;
  qualityGrade: string | null;
  priceLabel: string | null;
  origin: string | null;
  color: string | null;
  availability: string | null;
  stock: string;
  finishes: string[];
  dimensions: string | null;
  size: string | null;
  thickness: string | null;
  images: string[];
  mainImage: string | null;
  thumbnailImage: string | null;
  textureImage: string | null;
  applicationImages: string[];
  featured: boolean;
  tags: string[];
  pdf: string | null;
  applications: string | null;
  specs: Record<string, unknown> | null;
  /** Rich product metadata stored as JSON in the database */
  metadata: ProductMetadata | null;
  createdAt: string;
  updatedAt: string;
  /** Structured images linked to this product */
  structuredImages: ApiStructuredImage[];
};

/** Shape of the rich product metadata JSON field */
export type ProductMetadata = {
  tagline?: string;
  finishes?: string[];
  dimensions?: string;
  thickness?: string;
  weight?: string;
  applications?: string[];
  stoneType?: string;
  qualityGrade?: string;
  priceLabel?: string;
  color?: string;
  availability?: string;
  stockStatus?: string;
  badges?: string[];
  gallery?: string[];
  specs?: { label: string; value: string }[];
  variants?: { name: string; label: string; description: string; image: string }[];
  sizes?: { label: string; thickness: string[] }[];
  technicalSpecs?: { label: string; value: string; note?: string }[];
  features?: { title: string; description: string; icon: string }[];
  projectSlugs?: string[];
  comparison?: { stone: string; values: Record<string, string> }[];
  downloads?: { name: string; type: string; size: string; description: string }[];
};

/* ── API Response Types ── */

type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

/* ── Helpers ── */

/** Merge metadata fields into the product for backwards compatibility */
export function expandProduct(product: ApiProduct): ApiProduct & { metadata: ProductMetadata } {
  const meta: ProductMetadata = (product.metadata || {}) as ProductMetadata;
  return {
    ...product,
    metadata: meta,
  };
}

/** Get the display image for a product: mainImage → first image → fallback */
export function getProductImage(product: ApiProduct): string {
  // Try: mainImage → first structured image of type "main" → first images[] → first gallery from metadata
  const meta = product.metadata || {};
  return (
    product.mainImage ||
    product.structuredImages?.find((i) => i.imageType === "main")?.url ||
    product.images?.[0] ||
    meta.gallery?.[0] ||
    meta.gallery?.[0] ||
    "/products/placeholder.svg"
  );
}

/** Get all gallery images for a product */
export function getProductGallery(product: ApiProduct): string[] {
  const meta = product.metadata || {};
  // Structured gallery images → product.images → metadata gallery
  const structuredGallery = product.structuredImages
    ?.filter((i) => i.imageType === "gallery" || i.imageType === "main")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((i) => i.url) || [];
  
  if (structuredGallery.length > 0) return structuredGallery;
  if (product.images?.length > 0) return product.images;
  if (meta.gallery?.length > 0) return meta.gallery;
  
  const main = getProductImage(product);
  return [main];
}

/** Get application images for a product */
export function getProductApplicationImages(product: ApiProduct): string[] {
  const meta = product.metadata || {};
  const structuredApps = product.structuredImages
    ?.filter((i) => i.imageType === "application")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((i) => i.url) || [];
  
  if (structuredApps.length > 0) return structuredApps;
  if (product.applicationImages?.length > 0) return product.applicationImages;
  return meta.gallery?.slice(1) || [];
}

/* ── Helper to flatten structured images into image-type groups ── */
export type ImageGroup = {
  main: string[];
  gallery: string[];
  thumbnail: string[];
  texture: string[];
  application: string[];
  project: string[];
  video: string[];
  [key: string]: string[];
};

export function groupStructuredImages(
  structuredImages: ApiStructuredImage[],
): ImageGroup {
  const grouped: ImageGroup = {
    main: [],
    gallery: [],
    thumbnail: [],
    texture: [],
    application: [],
    project: [],
    video: [],
  };
  for (const img of structuredImages || []) {
    if (!grouped[img.imageType]) grouped[img.imageType] = [];
    grouped[img.imageType].push(img.url);
  }
  return grouped;
}

/* ── API Functions ── */

/** Fetch all products with optional filters */
export async function fetchProducts(options?: {
  search?: string;
  category?: string;
  featured?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
  signal?: AbortSignal;
}): Promise<{ products: ApiProduct[]; total: number; totalPages: number }> {
  const params = new URLSearchParams();
  if (options?.search) params.set("search", options.search);
  if (options?.category) params.set("category", options.category);
  if (options?.featured) params.set("featured", "true");
  if (options?.sort) params.set("sort", options.sort);
  if (options?.page) params.set("page", String(options.page));
  if (options?.limit) params.set("limit", String(options.limit));

  const res = await api.get<PaginatedResponse<ApiProduct>>(
    `/api/products?${params.toString()}`,
    { signal: options?.signal },
  );
  return {
    products: res.data.map(expandProduct),
    total: res.pagination.total,
    totalPages: res.pagination.totalPages,
  };
}

/** Fetch featured products */
export async function fetchFeaturedProducts(
  signal?: AbortSignal,
): Promise<ApiProduct[]> {
  const res = await api.get<{ data: ApiProduct[] }>("/api/products/featured", { signal });
  return (res.data || []).map(expandProduct);
}

/** Fetch a single product by slug */
export async function fetchProductBySlug(
  slug: string,
  signal?: AbortSignal,
): Promise<ApiProduct | null> {
  try {
    const res = await api.get<ApiProduct>(`/api/products/${slug}`, { signal });
    return expandProduct(res);
  } catch {
    return null;
  }
}

/** Fetch related products */
export async function fetchRelatedProducts(
  productId: string,
  signal?: AbortSignal,
): Promise<ApiProduct[]> {
  try {
    const res = await api.get<{ data: ApiProduct[] }>(
      `/api/products/related/${productId}`,
      { signal },
    );
    return (res.data || []).map(expandProduct);
  } catch {
    return [];
  }
}

/** Fetch all categories */
export async function fetchCategories(
  signal?: AbortSignal,
): Promise<{ id: string; name: string; slug: string; image?: string; _count: { products: number } }[]> {
  try {
    const res = await api.get<{ data: any[] }>("/api/categories", { signal });
    return res.data || [];
  } catch {
    return [];
  }
}

/** Fetch a single category by slug */
export async function fetchCategoryBySlug(
  slug: string,
  signal?: AbortSignal,
): Promise<any | null> {
  try {
    return await api.get<any>(`/api/categories/${slug}`, { signal });
  } catch {
    return null;
  }
}

/** Fetch products by category slug */
export async function fetchProductsByCategory(
  categoryId: string,
  options?: { page?: number; limit?: number; signal?: AbortSignal },
): Promise<{ products: ApiProduct[]; total: number }> {
  return fetchProducts({
    ...options,
    category: categoryId,
  });
}
