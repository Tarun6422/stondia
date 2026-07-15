/**
 * ════════════════════════════════════════════════════════════════════
 *  PRODUCT IMAGE MANAGEMENT SYSTEM
 *  
 *  All product images are loaded from folder paths instead of JS
 *  imports. This allows adding thousands of products without
 *  modifying any import statements.
 *  
 *  ── Folder Structure ──
 *  
 *  public/
 *  └── products/
 *      └── {category}/
 *          └── {productCode}/
 *              ├── main.webp          # Primary product image (required)
 *              ├── thumb.webp         # Card thumbnail (optional)
 *              ├── 01.webp            # Gallery image 1 (optional)
 *              ├── 02.webp            # Gallery image 2 (optional)
 *              ├── 03.webp            # Gallery image 3 (optional)
 *              └── variants/          # Variant finish images (optional)
 *                  ├── natural.webp
 *                  ├── honed.webp
 *                  └── ...
 *  
 *  ── Example ──
 *  
 *  public/products/jali/JAL-001/
 *  ├── main.webp
 *  ├── thumb.webp
 *  ├── 01.webp
 *  ├── 02.webp
 *  └── variants/
 *      ├── natural.webp
 *      ├── honed.webp
 *      └── hand-carved.webp
 *  
 *  ── How to Add Images for a New Product ──
 *  
 *  1. Create folder: public/products/{category}/{productCode}/
 *  2. Place main.webp as the primary product image
 *  3. (Optional) Place thumb.webp for card thumbnails
 *  4. (Optional) Place 01.webp, 02.webp, etc. for gallery images
 *  5. (Optional) Create variants/ folder with variant finish images
 *  6. In the product data, set:
 *       image: getProductMainImage(category, productCode)
 *       gallery: getProductGallery(category, productCode, count)
 *     OR use the string path directly:
 *       image: "/products/{category-slug}/{productCode}/main.webp"
 *  
 *  ── Rules ──
 *  - NEVER share images between products
 *  - Each product has its own folder
 *  - productCode is the primary folder identifier
 *  - If gallery images are missing, only main image is shown
 * ════════════════════════════════════════════════════════════════════
 */

/**
 * Convert a category name to a URL-safe folder slug.
 *
 * Examples:
 *   "Jali"          → "jali"
 *   "Wall Cladding" → "wall-cladding"
 *   "Carvings"      → "carving"
 */
export function categoryToSlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-").replace(/s$/, "");
}

/**
 * Get the base directory path for a product's images.
 * e.g., "/products/jali/JAL-001"
 */
export function getProductBasePath(category: string, productCode: string): string {
  return `/products/${categoryToSlug(category)}/${productCode}`;
}

/**
 * Get the main product image path.
 * e.g., "/products/jali/JAL-001/main.webp"
 *
 * This is the primary image used on product cards, OG tags, and as
 * the first image in the gallery.
 */
export function getProductMainImage(category: string, productCode: string): string {
  return `${getProductBasePath(category, productCode)}/main.webp`;
}

/**
 * Get the product thumbnail image path.
 * e.g., "/products/jali/JAL-001/thumb.webp"
 *
 * Used for smaller card displays. Falls back to main image if missing.
 */
export function getProductThumbImage(category: string, productCode: string): string {
  return `${getProductBasePath(category, productCode)}/thumb.webp`;
}

/**
 * Generate gallery image paths for a product.
 * Gallery images are numbered: 01.webp, 02.webp, 03.webp, etc.
 *
 * The array always starts with main.webp as the first (hero) image,
 * followed by numbered gallery images. If count is 0, returns
 * only [mainImage] so the gallery still shows the hero image.
 *
 * Products with no gallery images will show only the main image
 * (handled by the gallery component's fallback logic).
 *
 * @param category  - Product category (e.g., "Jali")
 * @param productCode - Product code (e.g., "JAL-001")
 * @param count     - Number of additional gallery images (default: 3)
 * @returns Array of image paths
 */
export function getProductGallery(
  category: string,
  productCode: string,
  count: number = 3,
): string[] {
  const base = getProductBasePath(category, productCode);
  const gallery: string[] = [getProductMainImage(category, productCode)];

  for (let i = 1; i <= count; i++) {
    gallery.push(`${base}/${String(i).padStart(2, "0")}.webp`);
  }

  return gallery;
}

/**
 * Get a variant finish image path.
 * Variant images are stored in a variants/ subfolder named by variant.
 * e.g., "/products/jali/JAL-001/variants/natural.webp"
 *
 * @param category    - Product category
 * @param productCode - Product code
 * @param variantName - Variant finish name (e.g., "Natural", "Hand-Carved")
 * @returns Path to the variant image
 */
export function getProductVariantImage(
  category: string,
  productCode: string,
  variantName: string,
): string {
  const slug = variantName.toLowerCase().replace(/\s+/g, "-");
  return `${getProductBasePath(category, productCode)}/variants/${slug}.webp`;
}

/**
 * Generate all image paths for a product at once.
 * Convenience function for creating product data.
 *
 * @example
 * const images = generateProductImages("Jali", "JAL-001", 2);
 * // {
 * //   mainImage: "/products/jali/JAL-001/main.webp",
 * //   thumbImage: "/products/jali/JAL-001/thumb.webp",
 * //   gallery: ["/products/jali/JAL-001/main.webp", "/products/jali/JAL-001/01.webp", "/products/jali/JAL-001/02.webp"],
 * //   getVariantImage: (name) => "/products/jali/JAL-001/variants/{name}.webp"
 * // }
 */
export function generateProductImages(
  category: string,
  productCode: string,
  galleryCount?: number,
) {
  const basePath = getProductBasePath(category, productCode);
  return {
    mainImage: getProductMainImage(category, productCode),
    thumbImage: getProductThumbImage(category, productCode),
    gallery: getProductGallery(category, productCode, galleryCount),
    basePath,
    /** Get a variant image path for this product */
    getVariantImage: (variantName: string) =>
      getProductVariantImage(category, productCode, variantName),
  };
}
