/*
  Warnings:

  - You are about to drop the column `description` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `destination` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `maxCapacity` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Trip` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `Trip` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `airlineAndAirportId` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TripType" AS ENUM ('GROUP_TOUR', 'PRIVATE_TOUR');

-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "description",
DROP COLUMN "destination",
DROP COLUMN "maxCapacity",
DROP COLUMN "price",
ADD COLUMN     "airlineAndAirportId" TEXT NOT NULL,
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "extraPricePerPerson" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "foc" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "pax" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "staff" TEXT,
ADD COLUMN     "standardPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "tg" TEXT,
ADD COLUMN     "tl" TEXT,
ADD COLUMN     "type" "TripType" NOT NULL DEFAULT 'GROUP_TOUR';

-- CreateTable
CREATE TABLE "AirlineAndAirport" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AirlineAndAirport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AirlineAndAirport_code_key" ON "AirlineAndAirport"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Trip_code_key" ON "Trip"("code");

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_airlineAndAirportId_fkey" FOREIGN KEY ("airlineAndAirportId") REFERENCES "AirlineAndAirport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
