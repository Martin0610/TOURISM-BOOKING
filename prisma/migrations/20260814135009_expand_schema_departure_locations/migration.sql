/*
  Warnings:

  - You are about to drop the column `duration` on the `Package` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Package` table. All the data in the column will be lost.
  - Added the required column `packageAmount` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accommodation` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bestTimeToVisit` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cancellationPolicy` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `durationDays` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `durationNights` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exclusions` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hotelCategory` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inclusions` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mealsIncluded` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricePerPerson` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shortDescription` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Package` required. This step will fail if there are existing NULL values in that column.
  - Made the column `itinerary` on table `Package` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TransportMode" AS ENUM ('FLIGHT', 'TRAIN', 'BUS');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "departureLocationId" TEXT,
ADD COLUMN     "packageAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "transportAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Package" DROP COLUMN "duration",
DROP COLUMN "price",
ADD COLUMN     "accommodation" TEXT NOT NULL,
ADD COLUMN     "bestTimeToVisit" TEXT NOT NULL,
ADD COLUMN     "cancellationPolicy" TEXT NOT NULL,
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "durationDays" INTEGER NOT NULL,
ADD COLUMN     "durationNights" INTEGER NOT NULL,
ADD COLUMN     "exclusions" TEXT NOT NULL,
ADD COLUMN     "hotelCategory" TEXT NOT NULL,
ADD COLUMN     "inclusions" TEXT NOT NULL,
ADD COLUMN     "mealsIncluded" TEXT NOT NULL,
ADD COLUMN     "pricePerPerson" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "shortDescription" TEXT NOT NULL,
ADD COLUMN     "sightseeingIncluded" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "transportIncluded" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "itinerary" SET NOT NULL;

-- CreateTable
CREATE TABLE "DepartureLocation" (
    "id" TEXT NOT NULL,
    "departureCity" TEXT NOT NULL,
    "departureState" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "transportMode" "TransportMode" NOT NULL,
    "transportPrice" DOUBLE PRECISION NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DepartureLocation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_departureLocationId_fkey" FOREIGN KEY ("departureLocationId") REFERENCES "DepartureLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
