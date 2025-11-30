import { prisma } from "@/lib/prisma";
import { LeadStatus, BookingStatus } from "@prisma/client";

/**
 * Sync Lead status based on associated Bookings
 * @param leadId - Lead ID to sync
 */
export async function syncLeadStatusFromBooking(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      bookings: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  // Check if there are any active bookings
  const hasActiveBooking = lead.bookings.some((booking) =>
    ["PENDING", "CONFIRMED", "COMPLETED"].includes(booking.status)
  );

  // If has active booking → CLOSED_WON
  if (hasActiveBooking && lead.status !== "CLOSED_WON") {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: "CLOSED_WON",
        closedAt: new Date(),
        lastActivityAt: new Date(),
      },
    });
    return "CLOSED_WON";
  }

  // If all bookings are cancelled/refunded → CLOSED_LOST
  const allCancelled = lead.bookings.length > 0 && 
    lead.bookings.every((booking) =>
      ["CANCELLED", "REFUNDED"].includes(booking.status)
    );

  if (allCancelled && lead.status !== "CLOSED_LOST") {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: "CLOSED_LOST",
        closedAt: new Date(),
        lastActivityAt: new Date(),
      },
    });
    return "CLOSED_LOST";
  }

  return lead.status;
}

/**
 * Auto-update Lead to CLOSED_WON when booking is created
 * @param leadId - Lead ID to update
 */
export async function autoUpdateLeadToClosedWon(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  // Only update if not already closed
  if (lead.status !== "CLOSED_WON") {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: "CLOSED_WON",
        closedAt: new Date(),
        lastActivityAt: new Date(),
      },
    });
  }
}

/**
 * Auto-update Lead to CLOSED_LOST if no active bookings
 * @param leadId - Lead ID to check and update
 */
export async function autoUpdateLeadToClosedLost(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      bookings: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  // Check if there are any active bookings
  const hasActiveBooking = lead.bookings.some((booking) =>
    ["PENDING", "CONFIRMED", "COMPLETED"].includes(booking.status)
  );

  // Only update to CLOSED_LOST if no active bookings
  if (!hasActiveBooking && lead.status !== "CLOSED_LOST") {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: "CLOSED_LOST",
        closedAt: new Date(),
        lastActivityAt: new Date(),
      },
    });
  }
}

/**
 * Check and update abandoned leads (no activity > 30 days)
 * This should be run as a cron job
 */
export async function checkAbandonedLeads() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Find leads that haven't been updated in 30 days and are not closed
  const abandonedLeads = await prisma.lead.findMany({
    where: {
      lastActivityAt: {
        lt: thirtyDaysAgo,
      },
      status: {
        notIn: ["CLOSED_WON", "CLOSED_LOST", "ABANDONED"],
      },
    },
  });

  // Update them to ABANDONED
  const updatePromises = abandonedLeads.map((lead) =>
    prisma.lead.update({
      where: { id: lead.id },
      data: {
        status: "ABANDONED",
        lastActivityAt: new Date(),
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
    include: {
      bookings: {
        where: {
          status: {
            in: ["PENDING", "CONFIRMED", "COMPLETED"] as BookingStatus[],
          },
        },
      },
    },
  });

  if (!lead) {
    return false;
  }

  // Cannot update if there are active bookings
  return lead.bookings.length === 0;
}

/**
 * Get manual lead statuses (that agents can set)
 */
export function getManualLeadStatuses(): LeadStatus[] {
  return ["NEW", "CONTACTED", "QUOTED", "NEGOTIATING"] as LeadStatus[];
}

/**
 * Get system lead statuses (that system manages)
 */
export function getSystemLeadStatuses(): LeadStatus[] {
  return ["CLOSED_WON", "CLOSED_LOST", "ABANDONED"] as LeadStatus[];
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
