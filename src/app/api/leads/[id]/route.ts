import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id } = await params;
    if (!id) {
      return new NextResponse("Lead ID is required", { status: 400 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        customer: true,
        agent: {
          select: {
            name: true,
            email: true,
          },
        },
        bookings: {
          include: {
            trip: {
              select: {
                name: true,
                destination: true,
                startDate: true,
                endDate: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!lead) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error("[LEAD_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id } = await params;
    if (!id) {
      return new NextResponse("Lead ID is required", { status: 400 });
    }

    const body = await request.json();
    const {
      customerId,
      source,
      status,
      potentialValue,
      destinationInterest,
      travelDateEstimate,
      notes,
    } = body;

    // Check if lead has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        leadId: id,
        status: {
          in: ["PENDING", "CONFIRMED", "COMPLETED"],
        },
      },
    });

    // Prevent manual status change to CLOSED_WON/CLOSED_LOST if has active bookings
    if (activeBookings > 0 && status && ["CLOSED_WON", "CLOSED_LOST"].includes(status)) {
      return new NextResponse(
        "Cannot manually change status to CLOSED_WON or CLOSED_LOST when there are active bookings. Status is managed automatically.",
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      customerId: customerId || undefined,
      source: source || undefined,
      potentialValue:
        typeof potentialValue === "number"
          ? potentialValue
          : potentialValue
          ? parseFloat(potentialValue)
          : undefined,
      destinationInterest:
        destinationInterest !== undefined ? destinationInterest : undefined,
      travelDateEstimate: travelDateEstimate
        ? new Date(travelDateEstimate)
        : undefined,
      notes: notes !== undefined ? notes : undefined,
      lastActivityAt: new Date(), // Always update activity timestamp
    };

    // Add status if provided
    if (status) {
      updateData.status = status;
      
      // Set closedAt when status changes to CLOSED_WON or CLOSED_LOST
      if (["CLOSED_WON", "CLOSED_LOST", "ABANDONED"].includes(status)) {
        updateData.closedAt = new Date();
      }
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error("[LEAD_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

