import { PrismaClient } from "@prisma/client";

export async function seedFamilies(prisma: PrismaClient) {
  // Get existing customers to use for family members
  const customers = await prisma.customer.findMany({
    select: {
      id: true,
      firstNameEn: true,
      lastNameEn: true,
      firstNameTh: true,
      lastNameTh: true,
    },
  });

  if (customers.length < 2) {
    console.log("⚠️  Not enough customers to create families. Skipping family seeding.");
    return [];
  }

  const families = [
    {
      name: "Smith Family",
      phoneNumber: "0812345678",
      lineId: "smithfamily",
      email: "smith.family@example.com",
      note: "Family of 2 members, prefers group tours",
      customerIds: customers.slice(0, 2).map((c) => c.id), // John Smith and Sarah Johnson
    },
    {
      name: "Chen-Wang Family",
      phoneNumber: "0834567890",
      email: "chenwang.family@example.com",
      note: "Extended family, interested in private tours",
      customerIds: customers.slice(2, 4).map((c) => c.id), // Michael Chen and Emily Wang
    },
    {
      name: "Kim Family",
      phoneNumber: "0856789012",
      lineId: "kimfamily",
      note: "Corporate family group",
      customerIds: customers.slice(4, 5).map((c) => c.id), // David Kim
    },
  ];

  const createdFamilies = [];
  for (const familyData of families) {
    try {
      // Check if family with same name already exists
      const existingFamily = await prisma.family.findFirst({
        where: { name: familyData.name },
      });

      if (existingFamily) {
        console.warn(`⚠️  Family "${familyData.name}" already exists. Skipping.`);
        continue;
      }

      // Filter out invalid customer IDs
      const validCustomerIds = familyData.customerIds.filter((id) =>
        customers.some((c) => c.id === id)
      );

      if (validCustomerIds.length === 0) {
        console.warn(`⚠️  No valid customers for family "${familyData.name}". Skipping.`);
        continue;
      }

      const family = await prisma.family.create({
        data: {
          name: familyData.name,
          phoneNumber: familyData.phoneNumber || null,
          lineId: familyData.lineId || null,
          email: familyData.email || null,
          note: familyData.note || null,
          customers:
            validCustomerIds.length > 0
              ? {
                  create: validCustomerIds.map((customerId: string) => ({
                    customerId,
                  })),
                }
              : undefined,
        },
        include: {
          customers: {
            include: {
              customer: {
                select: {
                  id: true,
                  firstNameEn: true,
                  lastNameEn: true,
                  firstNameTh: true,
                  lastNameTh: true,
                },
              },
            },
          },
        },
      });
      createdFamilies.push(family);
    } catch (error) {
      console.warn(`⚠️  Error creating family "${familyData.name}":`, error);
    }
  }

  console.log(`✅ Seeded ${createdFamilies.length} families`);
  return createdFamilies;
}
