import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "5", 10);
    const skip = (page - 1) * pageSize;

    if (!customerId) {
      return new NextResponse("Customer ID is required", { status: 400 });
    }

    // Get total count for pagination
    const total = await prisma.interaction.count({
      where: { customerId },
    });

    // Fetch paginated interactions
    const interactions = await prisma.interaction.findMany({
      where: { customerId },
      skip,
      take: pageSize,
      orderBy: { date: "desc" },
      include: {
        agent: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: interactions.map((i) => ({
        ...i,
        date: i.date.toISOString(),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("[INTERACTIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!session.user?.id) {
    console.error("[INTERACTIONS_POST] Session user ID missing:", { session });
    return new NextResponse("User ID not found in session", { status: 401 });
  }

  try {
    const body = await req.json();
    const { customerId, type, content } = body;

    if (!customerId || !type || !content) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify that the user exists in the database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (!user) {
      console.error("[INTERACTIONS_POST] User not found in database:", { userId: session.user.id });
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify that the customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true },
    });

    if (!customer) {
      console.error("[INTERACTIONS_POST] Customer not found:", { customerId });
      return new NextResponse("Customer not found", { status: 404 });
    }

    const interaction = await prisma.interaction.create({
      data: {
        customerId,
        agentId: session.user.id,
        type,
        content,
      },
      include: {
        agent: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...interaction,
      date: interaction.date.toISOString(),
    });
  } catch (error: unknown) {
    console.error("[INTERACTIONS_POST]", error);
    
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2003") {
        console.error("[INTERACTIONS_POST] Foreign key constraint error:", {
          userId: session.user?.id,
        });
        return new NextResponse("Invalid user or customer ID", { status: 400 });
      }
    }
    
    return new NextResponse("Internal Error", { status: 500 });
  }
}
