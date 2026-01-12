/*
  Warnings:

  - The values [AGENT] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `commissionRate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phoneNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'SALES', 'STAFF');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'STAFF';
COMMIT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "commissionRate",
DROP COLUMN "name",
ADD COLUMN     "commissionPerHead" DECIMAL(10,2),
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "phoneNumber" TEXT,
ALTER COLUMN "role" SET DEFAULT 'STAFF';

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");
