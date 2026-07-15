/* ------------------------------------------------------------------ */
/*  Admin TanStack Query Hooks — all CRUD operations                  */
/* ------------------------------------------------------------------ */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";

/* ─── Types ─── */

export type Pagination = { page: number; limit: number; total: number; totalPages: number };

export type DashboardStats = {
  users: number;
  products: number;
  categories: number;
  projects: number;
  blogs: number;
  videos: number;
  downloads: number;
  testimonials: number;
  contacts: { total: number; unread: number };
  rfqs: { total: number; pending: number };
  subscribers: number;
};

export type DashboardData = {
  stats: DashboardStats;
  recent: {
    rfqs: any[];
    contacts: any[];
    pendingOrders: any[];
  };
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  featured: boolean;
  order: number;
  createdAt: string;
  _count?: { products: number };
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  categoryId: string;
  category: { id: string; name: string; slug: string };
  subCategory?: string;
  productCode?: string;
  mainImage?: string;
  thumbnailImage?: string;
  textureImage?: string;
  applicationImages?: string[];
  price?: number;
  finish?: string;
  size?: string;
  thickness?: string;
  origin?: string;
  images: string[];
  pdf?: string;
  featured: boolean;
  stock: string;
  tags: string[];
  createdAt: string;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  location?: string;
  description: string;
  gallery: string[];
  scope: string[];
  architect?: string;
  stoneUsed?: string;
  year?: string;
  status: string;
  featured: boolean;
  createdAt: string;
};

export type Blog = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover?: string;
  authorId?: string;
  author?: { id: string; name: string };
  category?: string;
  tags: string[];
  published: boolean;
  createdAt: string;
};

export type Video = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  videoUrl?: string;
  youtubeUrl?: string;
  category?: string;
  duration?: string;
  featured: boolean;
  createdAt: string;
};

export type Download = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  pdf: string;
  fileSize?: string;
  category?: string;
  featured: boolean;
  createdAt: string;
};

export type Testimonial = {
  id: string;
  client: string;
  designation?: string;
  company?: string;
  review: string;
  rating: number;
  photo?: string;
  authorId?: string;
  featured: boolean;
  createdAt: string;
};

export type ContactMessage = {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  status: string; // "Unread" | "Read" | "Archived"
  createdAt: string;
};

export type RFQ = {
  id: string;
  userId?: string;
  user?: { id: string; name: string; email: string };
  company?: string;
  phone?: string;
  email: string;
  country?: string;
  message: string;
  products: string[];
  attachments: string[];
  status: string; // "Pending" | "Quoted" | "Negotiation" | "Completed" | "Cancelled"
  adminReply?: string;
  repliedAt?: string;
  createdAt: string;
};

export type Subscriber = {
  id: string;
  email: string;
  active: boolean;
  createdAt: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  avatar?: string;
  address?: string;
  company?: string;
  designation?: string;
  createdAt: string;
};

export type AdminSettings = Record<string, string>;

/* ─── Helpers ─── */

export function buildQueryString(params: Record<string, string | number | undefined>): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  return qs ? `?${qs}` : "";
}

/* ─── Dashboard ─── */

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ["admin", "dashboard"],
    queryFn: () => api.get("/api/admin/dashboard"),
  });
}

/* ─── Products ─── */

export function useProducts(params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: string;
}) {
  return useQuery<{ data: Product[]; pagination: Pagination }>({
    queryKey: ["admin", "products", params],
    queryFn: () => api.get(`/api/products${buildQueryString(params)}`),
  });
}

export function useProduct(slug: string) {
  return useQuery<Product>({
    queryKey: ["admin", "product", slug],
    queryFn: () => api.get(`/api/products/${slug}`),
    enabled: !!slug,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/api/products", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown>) => api.put(`/api/products/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/products/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ─── Categories ─── */

export function useCategories() {
  return useQuery<{ data: Category[] }>({
    queryKey: ["admin", "categories"],
    queryFn: () => api.get("/api/categories"),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/api/categories", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success("Category created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown>) =>
      api.put(`/api/categories/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success("Category updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success("Category deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ─── Projects ─── */

export function useProjects(params: { page?: number; limit?: number; search?: string }) {
  return useQuery<{ data: Project[]; pagination: Pagination }>({
    queryKey: ["admin", "projects", params],
    queryFn: () => api.get(`/api/projects${buildQueryString(params)}`),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/api/projects", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "projects"] });
      toast.success("Project created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown>) => api.put(`/api/projects/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "projects"] });
      toast.success("Project updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/projects/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "projects"] });
      toast.success("Project deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ─── Blogs ─── */

export function useBlogs(params: {
  page?: number;
  limit?: number;
  search?: string;
  published?: string;
}) {
  return useQuery<{ data: Blog[]; pagination: Pagination }>({
    queryKey: ["admin", "blogs", params],
    queryFn: () => api.get(`/api/blogs${buildQueryString(params)}`),
  });
}

export function useCreateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/api/blogs", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "blogs"] });
      toast.success("Blog created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown>) => api.put(`/api/blogs/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "blogs"] });
      toast.success("Blog updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/blogs/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "blogs"] });
      toast.success("Blog deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ─── Videos ─── */

export function useVideos() {
  return useQuery<{ data: Video[] }>({
    queryKey: ["admin", "videos"],
    queryFn: () => api.get("/api/videos"),
  });
}

export function useCreateVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/api/videos", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "videos"] });
      toast.success("Video created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown>) => api.put(`/api/videos/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "videos"] });
      toast.success("Video updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/videos/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "videos"] });
      toast.success("Video deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ─── Downloads / Catalog (Admin) ─── */

export type CatalogAnalytics = {
  totalCatalogs: number;
  totalDownloads: number;
  todayDownloads: number;
  monthlyDownloads: number;
  featuredCatalogs: number;
  mostDownloaded: { id: string; title: string; downloadCount: number } | null;
  latestUpload: { id: string; title: string; createdAt: string } | null;
  lastDownloadTime: string | null;
  totalStorageBytes: number;
  totalStorageFormatted: string;
  recentDownloads: Array<{
    id: string;
    download: { title: string; slug: string };
    createdAt: string;
    ip?: string;
    userAgent?: string;
  }>;
};

export type CatalogItem = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category?: string;
  coverImage?: string;
  pdf: string;
  fileSize?: string;
  downloadCount: number;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { logs: number };
};

export function useDownloads() {
  return useQuery<{ data: Download[] }>({
    queryKey: ["admin", "downloads"],
    queryFn: () => api.get("/api/downloads"),
  });
}

export function useCreateDownload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/api/downloads", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "downloads"] });
      toast.success("Download created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateDownload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown>) => api.put(`/api/downloads/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "downloads"] });
      toast.success("Download updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteDownload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/downloads/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "downloads"] });
      toast.success("Download deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ─── Admin Catalog (with publish, feature toggles) ─── */

export function useAdminCatalog(params: { page?: number; limit?: number; search?: string }) {
  return useQuery<{ data: CatalogItem[]; pagination: Pagination }>({
    queryKey: ["admin", "catalog", params],
    queryFn: () => api.get(`/api/admin/catalog${buildQueryString(params)}`),
  });
}

export function useCreateCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/api/admin/catalog", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "catalog"] });
      toast.success("Catalog created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown>) =>
      api.put(`/api/admin/catalog/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "catalog"] });
      toast.success("Catalog updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/catalog/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "catalog"] });
      toast.success("Catalog deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useTogglePublishCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/api/admin/catalog/${id}/publish`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "catalog"] });
      qc.invalidateQueries({ queryKey: ["admin", "downloads"] });
      toast.success("Published status toggled");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useToggleFeatureCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/api/admin/catalog/${id}/feature`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "catalog"] });
      qc.invalidateQueries({ queryKey: ["admin", "downloads"] });
      toast.success("Featured status toggled");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCatalogAnalytics() {
  return useQuery<CatalogAnalytics>({
    queryKey: ["admin", "catalog", "analytics"],
    queryFn: () => api.get("/api/admin/catalog/analytics"),
  });
}

/* ─── Enhanced Catalog Analytics ─── */

export type EnhancedCatalogAnalytics = {
  summary: {
    totalCatalogs: number;
    publishedCatalogs: number;
    totalDownloads: number;
    totalViews: number;
    todayViews: number;
    monthlyViews: number;
    todayDownloads: number;
    monthlyDownloads: number;
    featuredCatalogs: number;
    mostDownloaded: {
      id: string;
      title: string;
      downloadCount: number;
      type: string;
    } | null;
  };
  downloadTrend: Array<{ month: string; downloads: number }>;
  viewTrend: Array<{ month: string; views: number }>;
  topProducts: Array<{
    id: string;
    title: string;
    productId: string | null;
    productName: string | null;
    downloadCount: number;
    type: string;
  }>;
  topCategories: Array<{
    categoryId: string;
    categoryName: string;
    downloadCount: number;
  }>;
  popularPDFs: Array<{
    id: string;
    title: string;
    slug: string;
    downloadCount: number;
    fileSize: string | null;
    type: string;
  }>;
  recentDownloads: Array<{
    id: string;
    createdAt: string;
    ip: string | null;
    country: string | null;
    browser: string | null;
    device: string | null;
    referrer: string | null;
    download: { title: string; slug: string };
  }>;
  deviceBreakdown: Array<{ name: string; value: number }>;
  browserBreakdown: Array<{ name: string; value: number }>;
  countryBreakdown: Array<{ name: string; value: number }>;
};

export function useEnhancedCatalogAnalytics() {
  return useQuery<EnhancedCatalogAnalytics>({
    queryKey: ["admin", "catalog", "analytics", "enhanced"],
    queryFn: () => api.get("/api/admin/catalog/analytics/enhanced"),
  });
}

/* ─── Testimonials ─── */

export function useTestimonials() {
  return useQuery<{ data: Testimonial[] }>({
    queryKey: ["admin", "testimonials"],
    queryFn: () => api.get("/api/testimonials"),
  });
}

export function useCreateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/api/testimonials", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "testimonials"] });
      toast.success("Testimonial created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown>) =>
      api.put(`/api/testimonials/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "testimonials"] });
      toast.success("Testimonial updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/testimonials/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "testimonials"] });
      toast.success("Testimonial deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ─── Contact Messages ─── */

export function useContacts(status?: string, page = 1) {
  return useQuery<{
    data: ContactMessage[];
    pagination: Pagination;
    meta: { total: number; unread: number; archived: number };
  }>({
    queryKey: ["admin", "contacts", status, page],
    queryFn: () => api.get(`/api/contact${buildQueryString({ status, page, limit: 20 })}`),
  });
}

export function useUpdateContactStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/api/contact/${id}`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "contacts"] });
      toast.success("Status updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/contact/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "contacts"] });
      toast.success("Message deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ─── RFQs ─── */

export function useRFQs(status?: string, page = 1) {
  return useQuery<{
    data: RFQ[];
    pagination: Pagination;
    meta: { total: number; pending: number };
  }>({
    queryKey: ["admin", "rfqs", status, page],
    queryFn: () => api.get(`/api/rfq${buildQueryString({ status, page, limit: 20 })}`),
  });
}

export function useUpdateRFQStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/api/rfq/${id}`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "rfqs"] });
      toast.success("RFQ status updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useReplyRFQ() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminReply, status }: { id: string; adminReply: string; status?: string }) =>
      api.put(`/api/rfq/${id}`, { adminReply, ...(status ? { status } : {}) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "rfqs"] });
      toast.success("Reply sent to customer");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteRFQ() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/rfq/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "rfqs"] });
      toast.success("RFQ deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ─── Subscribers ─── */

export function useSubscribers() {
  return useQuery<{ data: Subscriber[]; total: number }>({
    queryKey: ["admin", "subscribers"],
    queryFn: () => api.get("/api/subscribers"),
  });
}

export function useDeleteSubscriber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/subscribers/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "subscribers"] });
      toast.success("Subscriber removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ─── Users (Admin) ─── */

export function useAdminUsers(params: { page?: number; limit?: number }) {
  return useQuery<{ data: AdminUser[]; pagination: Pagination }>({
    queryKey: ["admin", "users", params],
    queryFn: () => api.get(`/api/admin/users${buildQueryString(params)}`),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      api.put(`/api/admin/users/${id}`, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User role updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ─── Media Library ─── */

export type MediaItem = {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  folder: string;
  alt?: string;
  caption?: string;
  tags: string[];
  width?: number;
  height?: number;
  duration?: number;
  createdAt: string;
  updatedAt: string;
};

export type MediaUsageLocation = {
  model: string;
  field: string;
  id: string;
  title: string;
};

export type MediaStats = {
  totalFiles: number;
  totalSize: number;
  totalSizeFormatted: string;
  images: number;
  videos: number;
  pdfs: number;
  storageBytes: number;
  storageFormatted: string;
};

export function useMediaLibrary(params: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  folder?: string;
  sort?: string;
}) {
  return useQuery<{ data: MediaItem[]; pagination: Pagination }>({
    queryKey: ["admin", "media", params],
    queryFn: () => api.get(`/api/media${buildQueryString(params)}`),
  });
}

export function useCreateMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/api/media", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "media"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown>) => api.put(`/api/media/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "media"] });
      toast.success("Media updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useReplaceMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown>) =>
      api.put(`/api/media/${id}/replace`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "media"] });
      toast.success("Media replaced");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/media/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "media"] });
      toast.success("Media deleted");
    },
    onError: (e: Error) => {
      if (e.message?.includes("in use")) {
        toast.error("This file is in use. Check usage before deleting.");
      } else {
        toast.error(e.message);
      }
    },
  });
}

export function useBulkDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => api.delete("/api/media", { ids }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "media"] });
      toast.success("Media deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMediaUsage(id: string) {
  return useQuery<{ usage: MediaUsageLocation[] }>({
    queryKey: ["admin", "media", id, "usage"],
    queryFn: () => api.get(`/api/media/${id}/usage`),
    enabled: !!id,
  });
}

export function useMediaStats() {
  return useQuery<MediaStats>({
    queryKey: ["admin", "media", "stats"],
    queryFn: () => api.get("/api/media/stats/summary"),
  });
}

/* ─── Settings ─── */

export function useSettings() {
  return useQuery<AdminSettings>({
    queryKey: ["admin", "settings"],
    queryFn: () => api.get("/api/settings"),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, string>) => api.put("/api/settings", data),
    onSuccess: (data) => {
      qc.setQueryData(["admin", "settings"], data);
      toast.success("Settings saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ─── Catalog Generator ─── */

export type GeneratedCatalog = {
  id: string;
  type: "master" | "category" | "product";
  title: string;
  slug: string;
  description?: string;
  pdfUrl?: string;
  coverImage?: string;
  categoryId?: string;
  productId?: string;
  status: "draft" | "published";
  version: number;
  downloadCount: number;
  fileSize?: string;
  createdAt: string;
  updatedAt: string;
  versions?: CatalogVersion[];
};

export type CatalogVersion = {
  id: string;
  catalogId: string;
  version: number;
  pdfUrl?: string;
  fileSize?: string;
  createdAt: string;
};

export type CatalogAnalyticsSummary = {
  totalCatalogs: number;
  publishedCatalogs: number;
  featuredCatalogs: number;
  archivedCatalogs: number;
  totalDownloads: number;
  masterCount: number;
  categoryCount: number;
  productCount: number;
  mostDownloaded: { id: string; title: string; downloadCount: number; type: string } | null;
};

export function useGeneratedCatalogs(params: {
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
  status?: string;
}) {
  return useQuery<{ data: GeneratedCatalog[]; pagination: Pagination }>({
    queryKey: ["admin", "catalog-generator", params],
    queryFn: () => api.get(`/api/catalog-generator${buildQueryString(params)}`),
  });
}

export function useGeneratedCatalog(id: string) {
  return useQuery<GeneratedCatalog & { versions: CatalogVersion[] }>({
    queryKey: ["admin", "catalog-generator", id],
    queryFn: () => api.get(`/api/catalog-generator/${id}`),
    enabled: !!id,
  });
}

export function useGenerateMasterCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (options?: { theme?: string; language?: string; templateId?: string }) =>
      api.post("/api/catalog-generator/generate/master", options || {}),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["admin", "catalog-generator"] });
      toast.success(data.message || "Master catalog generated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useGenerateCategoryCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opts: { categoryId: string; theme?: string; language?: string; templateId?: string }) =>
      api.post(`/api/catalog-generator/generate/category/${opts.categoryId}`, opts),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["admin", "catalog-generator"] });
      toast.success(data.message || "Category catalog generated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useGenerateProductCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opts: { productId: string; theme?: string; language?: string; templateId?: string }) =>
      api.post(`/api/catalog-generator/generate/product/${opts.productId}`, opts),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["admin", "catalog-generator"] });
      toast.success(data.message || "Product catalog generated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRegenerateCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opts: string | { id: string; theme?: string; language?: string; templateId?: string }) => {
      if (typeof opts === "string") {
        return api.post(`/api/catalog-generator/regenerate/${opts}`);
      }
      return api.post(`/api/catalog-generator/regenerate/${opts.id}`, opts);
    },
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["admin", "catalog-generator"] });
      toast.success(data.message || "Catalog regenerated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateGeneratedCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown>) =>
      api.put(`/api/catalog-generator/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "catalog-generator"] });
      toast.success("Catalog updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteGeneratedCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/catalog-generator/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "catalog-generator"] });
      toast.success("Catalog deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function usePublishGeneratedCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/api/catalog-generator/${id}/publish`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "catalog-generator"] });
      toast.success("Published status toggled");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCatalogGeneratorAnalytics() {
  return useQuery<CatalogAnalyticsSummary>({
    queryKey: ["admin", "catalog-generator", "analytics"],
    queryFn: () => api.get("/api/catalog-generator/analytics/summary"),
  });
}

/* ─── Catalog Generator: Feature / Archive / Duplicate / Restore / Bulk ─── */

export function useFeatureGeneratedCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/api/catalog-generator/${id}/feature`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "catalog-generator"] });
      toast.success("Featured status toggled");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useArchiveGeneratedCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/api/catalog-generator/${id}/archive`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "catalog-generator"] });
      toast.success("Archive status toggled");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDuplicateGeneratedCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/api/catalog-generator/${id}/duplicate`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "catalog-generator"] });
      toast.success("Catalog duplicated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRestoreCatalogVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ catalogId, versionId }: { catalogId: string; versionId: string }) =>
      api.post(`/api/catalog-generator/${catalogId}/restore/${versionId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "catalog-generator"] });
      toast.success("Version restored");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useBulkDeleteCatalogs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => api.post("/api/catalog-generator/bulk-delete", { ids }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "catalog-generator"] });
      toast.success("Selected catalogs deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useBulkUpdateCatalogs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, data }: { ids: string[]; data: Record<string, unknown> }) =>
      api.post("/api/catalog-generator/bulk-update", { ids, data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "catalog-generator"] });
      toast.success("Catalogs updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUploadCatalogPdf() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/api/catalog-generator/upload", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "catalog-generator"] });
      toast.success("Catalog uploaded");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCatalogAssignments(catalog: any) {
  const categoryId = catalog?.categoryId;
  const productId = catalog?.productId;

  const query = useQuery<{
    categoryName: string | null;
    productName: string | null;
    productCode: string | null;
  }>({
    queryKey: ["admin", "catalog-assignments", categoryId, productId],
    queryFn: () =>
      api.post("/api/catalog-generator/resolve-assignments", {
        categoryId,
        productId,
      }),
    enabled: !!(categoryId || productId),
  });

  return {
    categoryName: query.data?.categoryName || null,
    productName: query.data?.productName || null,
    productCode: query.data?.productCode || null,
    isLoading: query.isLoading,
  };
}

/* ─── Catalog Templates ─── */

export type CatalogTemplate = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: string;
  icon?: string;
  defaultFields?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  _count?: { catalogs: number };
};

export function useCatalogTemplates() {
  return useQuery<{ data: CatalogTemplate[] }>({
    queryKey: ["admin", "catalog-templates"],
    queryFn: () => api.get("/api/catalog-templates"),
  });
}

export function useCreateCatalogTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/api/catalog-templates", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "catalog-templates"] });
      toast.success("Template created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateCatalogTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown>) =>
      api.put(`/api/catalog-templates/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "catalog-templates"] });
      toast.success("Template updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteCatalogTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/catalog-templates/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "catalog-templates"] });
      toast.success("Template deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ─── Media Folders ─── */

export type MediaFolder = {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { media: number; children: number };
  children?: MediaFolder[];
};

export function useMediaFolders(parent?: string) {
  return useQuery<{ data: MediaFolder[] }>({
    queryKey: ["admin", "media-folders", parent],
    queryFn: () => api.get(`/api/media/folders${parent ? `?parent=${parent}` : ""}`),
  });
}

export function useCreateMediaFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; parentId?: string }) => api.post("/api/media/folders", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "media-folders"] });
      toast.success("Folder created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRenameMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, originalName }: { id: string; originalName: string }) =>
      api.put(`/api/media/${id}/rename`, { originalName }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "media"] });
      toast.success("Media renamed");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCheckDuplicateMedia() {
  return useMutation({
    mutationFn: (hash: string) => api.post("/api/media/check-duplicate", { hash }),
  });
}

export function useDeleteMediaFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/media/folders/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "media-folders"] });
      toast.success("Folder deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ─── Structured Images ─── */

export type StructuredImage = {
  id: string;
  fileName: string;
  displayName?: string;
  url: string;
  imageType: string; // cover | banner | thumbnail | gallery | texture | project | application | catalogue_cover | seo
  productCode?: string;
  categoryId?: string;
  productId?: string;
  projectId?: string;
  altText?: string;
  sortOrder: number;
  width?: number;
  height?: number;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string; slug: string };
  product?: { id: string; name: string; slug: string; productCode?: string };
};

export function useStructuredImages(params: {
  page?: number;
  limit?: number;
  imageType?: string;
  categoryId?: string;
  productId?: string;
  productCode?: string;
  search?: string;
  sort?: string;
}) {
  return useQuery<{ data: StructuredImage[]; pagination: Pagination }>({
    queryKey: ["admin", "structured-images", params],
    queryFn: () => api.get(`/api/structured-images${buildQueryString(params)}`),
  });
}

export function useStructuredImagesByCategory(categoryId: string) {
  return useQuery<{
    category: { id: string; name: string; slug: string };
    images: StructuredImage[];
    grouped: Record<string, StructuredImage[]>;
  }>({
    queryKey: ["admin", "structured-images", "by-category", categoryId],
    queryFn: () => api.get(`/api/structured-images/by-category/${categoryId}`),
    enabled: !!categoryId,
  });
}

export function useStructuredImagesByProduct(productId: string) {
  return useQuery<{
    product: { id: string; name: string; slug: string; productCode?: string };
    images: StructuredImage[];
    grouped: Record<string, StructuredImage[]>;
  }>({
    queryKey: ["admin", "structured-images", "by-product", productId],
    queryFn: () => api.get(`/api/structured-images/by-product/${productId}`),
    enabled: !!productId,
  });
}

export function useStructuredImagesByProductCode(productCode: string) {
  return useQuery<{
    productCode: string;
    images: StructuredImage[];
    grouped: Record<string, StructuredImage[]>;
  }>({
    queryKey: ["admin", "structured-images", "by-productCode", productCode],
    queryFn: () => api.get(`/api/structured-images/by-productCode/${productCode}`),
    enabled: !!productCode,
  });
}

export function useCreateStructuredImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/api/structured-images", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "structured-images"] });
      toast.success("Image registered");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateStructuredImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown>) =>
      api.put(`/api/structured-images/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "structured-images"] });
      toast.success("Image updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteStructuredImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/structured-images/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "structured-images"] });
      toast.success("Image deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ─── Product Media ─── */

export type ProductImage = {
  id: string;
  fileName: string;
  displayName?: string;
  url: string;
  imageType: string;
  productCode?: string;
  productId?: string;
  altText?: string;
  sortOrder: number;
  width?: number;
  height?: number;
  createdAt: string;
};

export type ProductMediaData = {
  productId: string;
  productCode: string | null;
  productName: string;
  mainImage: string | null;
  images: string[];
  structured: Record<string, ProductImage[]>;
  all: ProductImage[];
};

export function useProductMedia(productId: string) {
  return useQuery<ProductMediaData>({
    queryKey: ["admin", "product-media", productId],
    queryFn: () => api.get(`/api/products/${productId}/media`),
    enabled: !!productId,
  });
}

export function useAddProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      url,
      imageType,
      altText,
      sortOrder,
      width,
      height,
    }: {
      productId: string;
      url: string;
      imageType: string;
      altText?: string;
      sortOrder?: number;
      width?: number;
      height?: number;
    }) => api.post(`/api/products/${productId}/media`, { url, imageType, altText, sortOrder, width, height }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["admin", "product-media", variables.productId] });
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Image added");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      mediaId,
      altText,
      sortOrder,
      imageType,
      displayName,
    }: {
      productId: string;
      mediaId: string;
      altText?: string;
      sortOrder?: number;
      imageType?: string;
      displayName?: string;
    }) => api.put(`/api/products/${productId}/media/${mediaId}`, { altText, sortOrder, imageType, displayName }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["admin", "product-media", variables.productId] });
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Image updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, mediaId }: { productId: string; mediaId: string }) =>
      api.delete(`/api/products/${productId}/media/${mediaId}`),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["admin", "product-media", variables.productId] });
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Image deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useReorderProductImages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      imageType,
      order,
    }: {
      productId: string;
      imageType: string;
      order: string[];
    }) => api.put(`/api/products/${productId}/media/reorder`, { imageType, order }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["admin", "product-media", variables.productId] });
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Gallery reordered");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSetMainProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, mediaId }: { productId: string; mediaId: string }) =>
      api.put(`/api/products/${productId}/media/set-main/${mediaId}`),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["admin", "product-media", variables.productId] });
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Main image updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ─── QR Codes ─── */

export type QRCode = {
  id: string;
  catalogId: string;
  url: string;
  imageUrl?: string;
  label?: string;
  scanCount: number;
  lastScannedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export function useCatalogQRCodes(catalogId: string) {
  return useQuery<{ data: QRCode[] }>({
    queryKey: ["admin", "qr-codes", catalogId],
    queryFn: () => api.get(`/api/qr-codes/catalog/${catalogId}`),
    enabled: !!catalogId,
  });
}

export function useGenerateQRCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ catalogId, label, customUrl }: { catalogId: string; label?: string; customUrl?: string }) =>
      api.post(`/api/qr-codes/generate/${catalogId}`, { label, customUrl }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "qr-codes"] });
      toast.success("QR Code generated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteQRCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/qr-codes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "qr-codes"] });
      toast.success("QR Code deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
