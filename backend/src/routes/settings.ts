import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

// GET /api/settings — get all settings (public for site config, admin for all)
router.get("/", async (_req: Request, res: Response) => {
  const settings = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;
  res.json(map);
});

// PUT /api/settings — admin update settings
router.put("/", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  const entries = req.body;
  if (typeof entries !== "object") return res.status(400).json({ message: "Expected object of key/value pairs" });

  for (const [key, value] of Object.entries(entries)) {
    if (typeof value === "string") {
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
  }

  const settings = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;
  res.json(map);
});

export default router;
