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
    mutationFn: () => api.post("/api/catalog-generator/generate/master"),
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
    mutationFn: (categoryId: string) =>
      api.post(`/api/catalog-generator/generate/category/${categoryId}`),
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
    mutationFn: (productId: string) =>
      api.post(`/api/catalog-generator/generate/product/${productId}`),
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
    mutationFn: (id: string) => api.post(`/api/catalog-generator/regenerate/${id}`),
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
