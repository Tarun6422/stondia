import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const NEW_PASSWORD = "Admin@StoneIndia123";

async function main() {
  const hashed = await bcrypt.hash(NEW_PASSWORD, 12);

  const user = await prisma.user.update({
    where: { email: "admin@stondia.com" },
    data: { password: hashed },
  });

  console.log("✅ Admin password reset successfully!");
  console.log("");
  console.log("   Email:    admin@stondia.com");
  console.log(`   Password: ${NEW_PASSWORD}`);
  console.log("");
  console.log("⚠️  This password is shown only once. Copy it now.");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
