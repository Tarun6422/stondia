/**
 * This script regenerates the Prisma client.
 * Run from the project root: node scripts/fix-prisma.mjs
 */
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.resolve(__dirname, "..", "backend");
const prismaBin = path.resolve(backendDir, "node_modules", ".bin", "prisma.cmd");

console.log("Regenerating Prisma client...");
console.log(`Backend dir: ${backendDir}`);
console.log(`Prisma bin: ${prismaBin}`);

try {
  const result = execSync(`"${prismaBin}" generate`, {
    cwd: backendDir,
    stdio: "pipe",
    shell: "cmd.exe",
    encoding: "utf-8",
  });
  console.log("STDOUT:", result.stdout);
  console.log("STDERR:", result.stderr);
  console.log("✅ Prisma client regenerated successfully!");
} catch (err) {
  console.error("❌ Failed:", err.message);
  if (err.stdout) console.log("STDOUT:", err.stdout);
  if (err.stderr) console.log("STDERR:", err.stderr);
  process.exit(1);
}
