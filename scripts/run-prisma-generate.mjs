import { execSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.resolve(__dirname, "..", "backend");

try {
  const result = execSync(`npx prisma generate`, {
    cwd: backendDir,
    stdio: "inherit",
    shell: process.platform === "win32" ? "cmd.exe" : true,
  });
  console.log("Prisma client generated successfully!");
} catch (err) {
  console.error("Failed to generate Prisma client:", err.message);
  process.exit(1);
}
