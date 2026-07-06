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
  youtubeUrl: string;
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
  status: string;  // "Unread" | "Read" | "Archived"
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
  status: string;  // "Pending" | "Quoted" | "Negotiation" | "Completed" | "Cancelled"
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
  page?: number; limit?: number; search?: string; category?: string; sort?: string;
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "products"] }); toast.success("Product created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown>) => api.put(`/api/products/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "products"] }); toast.success("Product updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/products/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "products"] }); toast.success("Product deleted"); },
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "categories"] }); toast.success("Category created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown>) => api.put(`/api/categories/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "categories"] }); toast.success("Category updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/categories/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "categories"] }); toast.success("Category deleted"); },
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "projects"] }); toast.success("Project created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown>) => api.put(`/api/projects/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "projects"] }); toast.success("Project updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/projects/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "projects"] }); toast.success("Project deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ─── Blogs ─── */

export function useBlogs(params: { page?: number; limit?: number; search?: string; published?: string }) {
  return useQuery<{ data: Blog[]; pagination: Pagination }>({
    queryKey: ["admin", "blogs", params],
    queryFn: () => api.get(`/api/blogs${buildQueryString(params)}`),
  });
}

export function useCreateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/api/blogs", data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "blogs"] }); toast.success("Blog created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown>) => api.put(`/api/blogs/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "blogs"] }); toast.success("Blog updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/blogs/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "blogs"] }); toast.success("Blog deleted"); },
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "videos"] }); toast.success("Video created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown>) => api.put(`/api/videos/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "videos"] }); toast.success("Video updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/videos/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "videos"] }); toast.success("Video deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ─── Downloads ─── */

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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "downloads"] }); toast.success("Download created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateDownload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown>) => api.put(`/api/downloads/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "downloads"] }); toast.success("Download updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteDownload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/downloads/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "downloads"] }); toast.success("Download deleted"); },
    onError: (e: Error) => toast.error(e.message),
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "testimonials"] }); toast.success("Testimonial created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown>) => api.put(`/api/testimonials/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "testimonials"] }); toast.success("Testimonial updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/testimonials/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "testimonials"] }); toast.success("Testimonial deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ─── Contact Messages ─── */

export function useContacts(status?: string, page = 1) {
  return useQuery<{ data: ContactMessage[]; pagination: Pagination; meta: { total: number; unread: number; archived: number } }>({
    queryKey: ["admin", "contacts", status, page],
    queryFn: () => api.get(`/api/contact${buildQueryString({ status, page, limit: 20 })}`),
  });
}

export function useUpdateContactStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.put(`/api/contact/${id}`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "contacts"] }); toast.success("Status updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/contact/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "contacts"] }); toast.success("Message deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ─── RFQs ─── */

export function useRFQs(status?: string, page = 1) {
  return useQuery<{ data: RFQ[]; pagination: Pagination; meta: { total: number; pending: number } }>({
    queryKey: ["admin", "rfqs", status, page],
    queryFn: () => api.get(`/api/rfq${buildQueryString({ status, page, limit: 20 })}`),
  });
}

export function useUpdateRFQStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.put(`/api/rfq/${id}`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "rfqs"] }); toast.success("RFQ status updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useReplyRFQ() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminReply, status }: { id: string; adminReply: string; status?: string }) =>
      api.put(`/api/rfq/${id}`, { adminReply, ...(status ? { status } : {}) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "rfqs"] }); toast.success("Reply sent to customer"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteRFQ() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/rfq/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "rfqs"] }); toast.success("RFQ deleted"); },
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "subscribers"] }); toast.success("Subscriber removed"); },
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
    mutationFn: ({ id, role }: { id: string; role: string }) => api.put(`/api/admin/users/${id}`, { role }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "users"] }); toast.success("User role updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/users/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "users"] }); toast.success("User deleted"); },
    onError: (e: Error) => toast.error(e.message),
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
    onSuccess: (data) => { qc.setQueryData(["admin", "settings"], data); toast.success("Settings saved"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
