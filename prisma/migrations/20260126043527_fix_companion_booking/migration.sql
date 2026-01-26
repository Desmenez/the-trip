/*
  Warnings:

  - You are about to drop the `_CompanionCustomers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CompanionCustomers" DROP CONSTRAINT "_CompanionCustomers_A_fkey";

-- DropForeignKey
ALTER TABLE "_CompanionCustomers" DROP CONSTRAINT "_CompanionCustomers_B_fkey";

-- DropTable
DROP TABLE "_CompanionCustomers";

-- CreateTable
CREATE TABLE "BookingCompanion" (
    "bookingId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingCompanion_pkey" PRIMARY KEY ("bookingId","customerId")
);

-- CreateIndex
CREATE INDEX "BookingCompanion_customerId_idx" ON "BookingCompanion"("customerId");

-- AddForeignKey
ALTER TABLE "BookingCompanion" ADD CONSTRAINT "BookingCompanion_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingCompanion" ADD CONSTRAINT "BookingCompanion_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
