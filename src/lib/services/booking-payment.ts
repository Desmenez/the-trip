import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * Calculate and update paidAmount for a booking
 * This should be called whenever payments are created, updated, or deleted
 */
export async function updateBookingPaidAmount(
  bookingId: string,
  tx?: Prisma.TransactionClient
): Promise<number> {
  const prismaClient = tx || prisma;

  // Get all payments for this booking
  const payments = await prismaClient.payment.findMany({
    where: { bookingId },
    select: { amount: true },
  });

  // Calculate total paid amount
  const paidAmount = payments.reduce((sum, payment) => {
    return sum + Number(payment.amount);
  }, 0);

  // Update booking with calculated paidAmount
  await prismaClient.booking.update({
    where: { id: bookingId },
    data: { paidAmount },
  });

  return paidAmount;
}

/**
 * Recalculate paidAmount for all bookings (for migration/backfill)
 */
export async function recalculateAllBookingPaidAmounts() {
  const bookings = await prisma.booking.findMany({
    select: { id: true },
  });

  let updated = 0;
  for (const booking of bookings) {
    await updateBookingPaidAmount(booking.id);
    updated++;
  }

  return { updated, total: bookings.length };
}
