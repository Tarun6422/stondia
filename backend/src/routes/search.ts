import { Router, Request, Response } from "express";
import { prisma } from "../db.js";

const router = Router();

// GET /api/search?q=search+term
router.get("/", async (req: Request, res: Response) => {
  const q = (req.query.q as string || "").trim();
  if (!q) {
    // Return empty result set when no query
    return res.json({ results: [], total: 0, query: "" });
  }

  try {
    // Use PostgreSQL full-text search via raw query for best ranking
    const searchQuery = q;

    // ── Products ──
    const products = await prisma.$queryRaw<Array<{
      id: string; title: string; slug: string; image: string | null;
      subtitle: string | null; rank: number;
    }>>`
      SELECT
        id,
        name AS title,
        slug,
        images[1] AS image,
        (SELECT name FROM categories WHERE id = "categoryId") AS subtitle,
        ts_rank(
          to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(array_to_string(tags, ' '), '')),
          websearch_to_tsquery('english', ${searchQuery})
        ) AS rank
      FROM products
      WHERE
        to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(array_to_string(tags, ' '), ''))
        @@ websearch_to_tsquery('english', ${searchQuery})
      ORDER BY rank DESC
      LIMIT 5
    `;

    // ── Categories ──
    const categories = await prisma.$queryRaw<Array<{
      id: string; title: string; slug: string; image: string | null;
      subtitle: string | null; rank: number;
    }>>`
      SELECT
        id,
        name AS title,
        slug,
        image,
        CAST(NULL AS VARCHAR) AS subtitle,
        ts_rank(
          to_tsvector('english', coalesce(name, '')),
          websearch_to_tsquery('english', ${searchQuery})
        ) AS rank
      FROM categories
      WHERE
        to_tsvector('english', coalesce(name, ''))
        @@ websearch_to_tsquery('english', ${searchQuery})
      ORDER BY rank DESC
      LIMIT 3
    `;

    // ── Projects ──
    const projects = await prisma.$queryRaw<Array<{
      id: string; title: string; slug: string; image: string | null;
      subtitle: string | null; rank: number;
    }>>`
      SELECT
        id,
        title,
        slug,
        gallery[1] AS image,
        location AS subtitle,
        ts_rank(
          to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(location, '')),
          websearch_to_tsquery('english', ${searchQuery})
        ) AS rank
      FROM projects
      WHERE
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(location, ''))
        @@ websearch_to_tsquery('english', ${searchQuery})
      ORDER BY rank DESC
      LIMIT 3
    `;

    // ── Blogs (published only) ──
    const blogs = await prisma.$queryRaw<Array<{
      id: string; title: string; slug: string; image: string | null;
      subtitle: string | null; rank: number;
    }>>`
      SELECT
        id,
        title,
        slug,
        cover AS image,
        category AS subtitle,
        ts_rank(
          to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(array_to_string(tags, ' '), '')),
          websearch_to_tsquery('english', ${searchQuery})
        ) AS rank
      FROM blogs
      WHERE
        published = true
        AND to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(array_to_string(tags, ' '), ''))
        @@ websearch_to_tsquery('english', ${searchQuery})
      ORDER BY rank DESC
      LIMIT 3
    `;

    // ── Videos ──
    const videos = await prisma.$queryRaw<Array<{
      id: string; title: string; slug: string; image: string | null;
      subtitle: string | null; rank: number;
    }>>`
      SELECT
        id,
        title,
        slug,
        thumbnail AS image,
        category AS subtitle,
        ts_rank(
          to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')),
          websearch_to_tsquery('english', ${searchQuery})
        ) AS rank
      FROM videos
      WHERE
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
        @@ websearch_to_tsquery('english', ${searchQuery})
      ORDER BY rank DESC
      LIMIT 3
    `;

    // ── Downloads ──
    const downloads = await prisma.$queryRaw<Array<{
      id: string; title: string; slug: string; image: string | null;
      subtitle: string | null; rank: number;
    }>>`
      SELECT
        id,
        title,
        slug,
        NULL AS image,
        category AS subtitle,
        ts_rank(
          to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')),
          websearch_to_tsquery('english', ${searchQuery})
        ) AS rank
      FROM downloads
      WHERE
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
        @@ websearch_to_tsquery('english', ${searchQuery})
      ORDER BY rank DESC
      LIMIT 3
    `;

    // ── Combine results with type markers ──
    const results: Array<{
      type: string; id: string; title: string; slug: string;
      image: string | null; subtitle: string | null; rank: number;
    }> = [
      ...products.map((p) => ({ ...p, type: "product" })),
      ...categories.map((c) => ({ ...c, type: "category" })),
      ...projects.map((p) => ({ ...p, type: "project" })),
      ...blogs.map((b) => ({ ...b, type: "blog" })),
      ...videos.map((v) => ({ ...v, type: "video" })),
      ...downloads.map((d) => ({ ...d, type: "download" })),
    ];

    // Sort by rank descending
    results.sort((a, b) => b.rank - a.rank);

    res.json({ results, total: results.length, query: q });
  } catch (error) {
    console.error("Search error:", error);
    res.json({ results: [], total: 0, query: q, error: "Search failed" });
  }
});

export default router;
