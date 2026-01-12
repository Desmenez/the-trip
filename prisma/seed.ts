import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import Decimal from "decimal.js";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const superAdminEmail = "superadmin@gmail.com";
  const adminEmail = "admin@gmail.com";
  const staffEmail = "staff@gmail.com";
  const salesEmail = "sales@gmail.com";
  const password = await bcrypt.hash("Example1", 10);

  const admin = await prisma.user.createMany({
    data: [
      {
        email: superAdminEmail,
        password: password,
        firstName: "Super",
        lastName: "Admin",
        role: Role.SUPER_ADMIN,
        isActive: true,
      },
      {
        email: adminEmail,
        password: password,
        firstName: "Admin",
        lastName: "Admin",
        role: Role.ADMIN,
        isActive: true,
      },
      {
        email: staffEmail,
        password: password,
        firstName: "Staff",
        lastName: "Staff",
        role: Role.STAFF,
        isActive: true,
      },
      {
        email: salesEmail,
        password: password,
        firstName: "Sales",
        lastName: "Sales",
        role: Role.SALES,
        commissionPerHead: new Decimal(500),
        isActive: true,
      },
    ],
  });

  console.log({ admin });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
