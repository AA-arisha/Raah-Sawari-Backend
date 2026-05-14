/*
  Warnings:

  - A unique constraint covering the columns `[currentRideId]` on the table `Driver` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "currentRideId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Driver_currentRideId_key" ON "Driver"("currentRideId");

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_currentRideId_fkey" FOREIGN KEY ("currentRideId") REFERENCES "Ride"("id") ON DELETE SET NULL ON UPDATE CASCADE;
