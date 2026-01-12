import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import Decimal from "decimal.js";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        commissionPerHead: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Query COMPLETED bookings where the user is the assigned agent
    // Commission is only calculated for COMPLETED bookings
    const bookings = await prisma.booking.findMany({
      where: {
        agentId: session.user.id,
        status: "COMPLETED" as BookingStatus,
      },
      select: {
        id: true,
        totalAmount: true,
        paidAmount: true,
        createdAt: true,
        customer: {
          select: {
            firstNameTh: true,
            lastNameTh: true,
            firstNameEn: true,
            lastNameEn: true,
          },
        },
        trip: {
          select: {
            name: true,
            destination: true,
          },
        },
      },
    });

    console.log("bookings", bookings);

    // Calculate commission: fixed amount per completed booking
    // commissionPerHead is a fixed amount, not a percentage
    const commissionPerHead = user.commissionPerHead ? new Decimal(user.commissionPerHead.toString()) : new Decimal(0);
    const completedBookingsCount = bookings.length;
    const totalCommission = commissionPerHead.mul(completedBookingsCount);

    // Calculate total sales for display
    const totalSales = bookings.reduce((sum, booking) => {
      return sum.plus(new Decimal(booking.totalAmount.toString()));
    }, new Decimal(0));

    // Get bookings with details
    const bookingDetails = bookings.map((booking) => {
      const paidAmount = new Decimal(booking.paidAmount.toString());
      const totalAmount = new Decimal(booking.totalAmount.toString());
      const isFullyPaid = paidAmount.gte(totalAmount);
      
      // Commission per booking is fixed amount (commissionPerHead)
      const commission = commissionPerHead.toNumber();
      
      return {
        id: booking.id,
        customerName: `${booking.customer.firstNameTh} ${booking.customer.lastNameTh}`,
        tripName: booking.trip.name,
        destination: booking.trip.destination,
        totalAmount: totalAmount.toNumber(),
        paidAmount: paidAmount.toNumber(),
        commission: commission, // Fixed amount per completed booking
        isEligible: true, // All COMPLETED bookings are eligible
        createdAt: booking.createdAt,
      };
    });

    // Sort by date (newest first)
    bookingDetails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      commissionRate: commissionPerHead.toNumber(), // This is now the fixed amount, not a rate
      totalSales: totalSales.toNumber(),
      totalCommission: totalCommission.toNumber(),
      totalBookings: bookingDetails.length,
      bookings: bookingDetails,
    });
  } catch (error) {
    console.error("[MY_COMMISSION]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

