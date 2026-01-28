import { PrismaClient } from "@prisma/client";
import { seedUsers } from "./users";
import { seedTags } from "./tags";
import { seedCustomers } from "./customers";
import { seedFamilies } from "./families";
import { seedAirlineAndAirports } from "./airline-and-airports";
import { seedTrips } from "./trips";

export async function runSeeds(prisma: PrismaClient) {
  console.log("🌱 Starting database seeding...\n");

  try {
    // Seed users first (may be referenced by other tables)
    await seedUsers(prisma);

    // Seed tags (needed for customer tags)
    await seedTags(prisma);

    // Seed airline and airports (needed for trips)
    await seedAirlineAndAirports(prisma);

    // Seed trips (depends on airline and airports)
    await seedTrips(prisma);

    // Seed customers (depends on tags)
    await seedCustomers(prisma);

    // Seed families (depends on customers)
    await seedFamilies(prisma);

    console.log("\n✨ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}
