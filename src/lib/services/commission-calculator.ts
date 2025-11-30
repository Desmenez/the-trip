import { prisma } from "@/lib/prisma";
import { CommissionType, CommissionStatus } from "@prisma/client";
import Decimal from "decimal.js";

interface Booking {
  id: string;
  leadId: string | null;
  agentId: string | null;
  totalAmount: number | Decimal;
  paidAmount: number | Decimal;
}

/**
 * Get the agent who should receive commission for a booking
 * Priority: Lead Agent > Booking Agent
 */
export async function getCommissionAgent(booking: Booking): Promise<{
  agentId: string;
  commissionRate: number;
  type: CommissionType;
} | null> {
  // Priority 1: Lead Agent (if booking has a lead)
  if (booking.leadId) {
    const lead = await prisma.lead.findUnique({
      where: { id: booking.leadId },
      include: {
        agent: {
          select: {
            id: true,
            commissionRate: true,
          },
        },
      },
    });

    if (lead && lead.agent) {
      return {
        agentId: lead.agent.id,
        commissionRate: lead.agent.commissionRate
          ? new Decimal(lead.agent.commissionRate.toString()).toNumber()
          : 0,
        type: "SALES",
      };
    }
  }

  // Priority 2: Booking Agent (walk-in or no lead)
  if (booking.agentId) {
    const agent = await prisma.user.findUnique({
      where: { id: booking.agentId },
      select: {
        id: true,
        commissionRate: true,
      },
    });

    if (agent) {
      return {
        agentId: agent.id,
        commissionRate: agent.commissionRate
          ? new Decimal(agent.commissionRate.toString()).toNumber()
          : 0,
        type: booking.leadId ? "SERVICE" : "WALKIN",
      };
    }
  }

  return null;
}

/**
 * Calculate and create commission for a booking
 */
export async function calculateCommission(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      leadId: true,
      agentId: true,
      totalAmount: true,
      paidAmount: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Check if commission already exists
  const existingCommission = await prisma.commission.findFirst({
    where: { bookingId },
  });

  if (existingCommission) {
    console.log(`Commission already exists for booking ${bookingId}`);
    return existingCommission;
  }

  // Get commission agent
  const commissionInfo = await getCommissionAgent(booking);

  if (!commissionInfo) {
    console.log(`No agent found for commission on booking ${bookingId}`);
    return null;
  }

  const { agentId, commissionRate, type } = commissionInfo;

  // Calculate commission amount
  const totalAmount = new Decimal(booking.totalAmount.toString());
  const rate = new Decimal(commissionRate);
  const amount = totalAmount.mul(rate).div(100);

  // Determine initial status
  const paidAmount = new Decimal(booking.paidAmount.toString());
  const isFullyPaid = paidAmount.gte(totalAmount);
  const status: CommissionStatus = isFullyPaid ? "APPROVED" : "PENDING";

  // Create commission
  const commission = await prisma.commission.create({
    data: {
      bookingId,
      agentId,
      leadId: booking.leadId,
      type,
      rate: commissionRate,
      amount: amount.toNumber(),
      status,
      note: `Auto-generated commission (${type})`,
    },
  });

  return commission;
}

/**
 * Update commission status based on booking payment
 */
export async function updateCommissionStatus(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      totalAmount: true,
      paidAmount: true,
      status: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  const commission = await prisma.commission.findFirst({
    where: { bookingId },
  });

  if (!commission) {
    console.log(`No commission found for booking ${bookingId}`);
    return null;
  }

  const totalAmount = new Decimal(booking.totalAmount.toString());
  const paidAmount = new Decimal(booking.paidAmount.toString());
  const isFullyPaid = paidAmount.gte(totalAmount);

  // Update commission status
  let newStatus: CommissionStatus = commission.status;

  if (isFullyPaid && commission.status === "PENDING") {
    newStatus = "APPROVED";
  } else if (!isFullyPaid && commission.status === "APPROVED") {
    newStatus = "PENDING";
  }

  // If booking is cancelled/refunded, keep commission as PENDING (not eligible for payment)
  if (["CANCELLED", "REFUNDED"].includes(booking.status)) {
    newStatus = "PENDING";
  }

  if (newStatus !== commission.status) {
    const updatedCommission = await prisma.commission.update({
      where: { id: commission.id },
      data: { status: newStatus },
    });
    return updatedCommission;
  }

  return commission;
}

/**
 * Mark commission as paid
 */
export async function markCommissionAsPaid(commissionId: string) {
  const commission = await prisma.commission.findUnique({
    where: { id: commissionId },
  });

  if (!commission) {
    throw new Error("Commission not found");
  }

  if (commission.status !== "APPROVED") {
    throw new Error("Commission must be APPROVED before marking as PAID");
  }

  return await prisma.commission.update({
    where: { id: commissionId },
    data: {
      status: "PAID",
      paidAt: new Date(),
    },
  });
}

/**
 * Get total commission for an agent
 */
export async function getAgentCommissionSummary(agentId: string) {
  const commissions = await prisma.commission.findMany({
    where: { agentId },
    include: {
      booking: {
        select: {
          totalAmount: true,
          paidAmount: true,
          status: true,
        },
      },
    },
  });

  const pending = commissions
    .filter((c) => c.status === "PENDING")
    .reduce((sum, c) => sum.plus(c.amount.toString()), new Decimal(0));

  const approved = commissions
    .filter((c) => c.status === "APPROVED")
    .reduce((sum, c) => sum.plus(c.amount.toString()), new Decimal(0));

  const paid = commissions
    .filter((c) => c.status === "PAID")
    .reduce((sum, c) => sum.plus(c.amount.toString()), new Decimal(0));

  const total = pending.plus(approved).plus(paid);

  return {
    total: total.toNumber(),
    pending: pending.toNumber(),
    approved: approved.toNumber(),
    paid: paid.toNumber(),
    count: commissions.length,
  };
}
