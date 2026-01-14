import { prisma } from "@/lib/prisma";
import { LeadStatus, PaymentStatus } from "@prisma/client";
import { MANUAL_LEAD_STATUSES, SYSTEM_LEAD_STATUSES } from "@/lib/constants/lead";

/**
 * Sync Lead status based on associated Bookings (through customer)
 * @param leadId - Lead ID to sync
 */
export async function syncLeadStatusFromBooking(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: {
      id: true,
      customerId: true,
      status: true,
    },
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  // If lead doesn't have a customer, can't sync from bookings
  if (!lead.customerId) {
    return lead.status;
  }

  // Find bookings for this customer
  const bookings = await prisma.booking.findMany({
    where: {
      customerId: lead.customerId,
    },
    select: {
      paymentStatus: true,
    },
  });

  if (bookings.length === 0) {
    return lead.status;
  }

  // Check if all bookings are fully paid (equivalent to completed)
  const allFullyPaid = bookings.every((booking) => booking.paymentStatus === "FULLY_PAID");

  // If all bookings are fully paid → COMPLETED
  if (allFullyPaid && lead.status !== "COMPLETED") {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: "COMPLETED",
      },
    });
    return "COMPLETED";
  }

  // If has active booking (deposit paid or fully paid) → BOOKED
  const hasActiveBooking = bookings.some((booking) =>
    ["DEPOSIT_PAID", "FULLY_PAID"].includes(booking.paymentStatus)
  );

  if (hasActiveBooking && lead.status !== "BOOKED") {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: "BOOKED",
      },
    });
    return "BOOKED";
  }

  // If all bookings are cancelled → CANCELLED
  const allCancelled = bookings.every((booking) => booking.paymentStatus === "CANCELLED");

  if (allCancelled && lead.status !== "CANCELLED") {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: "CANCELLED",
      },
    });
    return "CANCELLED";
  }

  return lead.status;
}

/**
 * Auto-update Lead to BOOKED when booking is created
 * @param leadId - Lead ID to update
 */
export async function autoUpdateLeadToClosedWon(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  // Only update if not already booked
  if (lead.status !== "BOOKED") {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: "BOOKED",
      },
    });
  }
}

/**
 * Auto-update Lead to CANCELLED if no active bookings
 * @param leadId - Lead ID to check and update
 */
export async function autoUpdateLeadToClosedLost(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: {
      id: true,
      customerId: true,
      status: true,
    },
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  // If lead doesn't have a customer, can't check bookings
  if (!lead.customerId) {
    return;
  }

  // Find bookings for this customer
  const bookings = await prisma.booking.findMany({
    where: {
      customerId: lead.customerId,
    },
    select: {
      paymentStatus: true,
    },
  });

  // Check if there are any active bookings
  const hasActiveBooking = bookings.some((booking) =>
    ["DEPOSIT_PAID", "FULLY_PAID"].includes(booking.paymentStatus)
  );

  // Only update to CANCELLED if no active bookings
  if (!hasActiveBooking && lead.status !== "CANCELLED") {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: "CANCELLED",
      },
    });
  }
}

/**
 * Check and update abandoned leads (no activity > 30 days)
 * This should be run as a cron job
 * Note: With new schema, we use updatedAt instead of lastActivityAt
 */
export async function checkAbandonedLeads() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Find leads that haven't been updated in 30 days and are not closed
  const abandonedLeads = await prisma.lead.findMany({
    where: {
      updatedAt: {
        lt: thirtyDaysAgo,
      },
      status: {
        notIn: ["BOOKED", "COMPLETED", "CANCELLED"],
      },
    },
  });

  // Update them to CANCELLED (no abandoned status in new schema)
  const updatePromises = abandonedLeads.map((lead) =>
    prisma.lead.update({
      where: { id: lead.id },
      data: {
        status: "CANCELLED",
      },
    })
  );

  await Promise.all(updatePromises);

  return abandonedLeads.length;
}

/**
 * Check if Lead can be manually updated (not locked by bookings)
 * @param leadId - Lead ID to check
 * @returns true if can be updated, false otherwise
 */
export async function canUpdateLeadStatus(leadId: string): Promise<boolean> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: {
      id: true,
      customerId: true,
    },
  });

  if (!lead || !lead.customerId) {
    return true; // Can update if no customer
  }

  // Find active bookings for this customer
  const activeBookings = await prisma.booking.findMany({
    where: {
      customerId: lead.customerId,
      paymentStatus: {
        in: ["DEPOSIT_PAID", "FULLY_PAID"] as PaymentStatus[],
      },
    },
  });

  // Cannot update if there are active bookings
  return activeBookings.length === 0;
}

/**
 * Get manual lead statuses (that agents can set)
 */
export function getManualLeadStatuses(): LeadStatus[] {
  return MANUAL_LEAD_STATUSES;
}

/**
 * Get system lead statuses (that system manages)
 */
export function getSystemLeadStatuses(): LeadStatus[] {
  return SYSTEM_LEAD_STATUSES;
}

/**
 * Check if a status is a manual status
 */
export function isManualLeadStatus(status: LeadStatus): boolean {
  return getManualLeadStatuses().includes(status);
}

/**
 * Check if a status is a system status
 */
export function isSystemLeadStatus(status: LeadStatus): boolean {
  return getSystemLeadStatuses().includes(status);
}
