import { PrismaClient } from "@prisma/client";

export async function seedTags(prisma: PrismaClient) {
  const tags = await prisma.tag.createMany({
    data: [
      {
        name: "VIP",
        order: 0,
      },
      {
        name: "Regular",
        order: 1,
      },
      {
        name: "New Customer",
        order: 2,
      },
      {
        name: "Repeat Customer",
        order: 3,
      },
      {
        name: "Group Leader",
        order: 4,
      },
      {
        name: "Family",
        order: 5,
      },
      {
        name: "Corporate",
        order: 6,
      },
      {
        name: "Special Needs",
        order: 7,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seeded tags:", tags);
  return tags;
}
