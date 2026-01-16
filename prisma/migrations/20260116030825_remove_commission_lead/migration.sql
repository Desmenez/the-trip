/*
  Warnings:

  - You are about to drop the column `leadId` on the `Commission` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Commission" DROP CONSTRAINT "Commission_leadId_fkey";

-- AlterTable
ALTER TABLE "Commission" DROP COLUMN "leadId";
