/*
  Warnings:

  - You are about to drop the column `status` on the `Appointment` table. All the data in the column will be lost.
  - Added the required column `statusId` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "status",
ADD COLUMN     "statusId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "AppointmentStatus";

-- CreateTable
CREATE TABLE "AppointmentStatus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "AppointmentStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppointmentStatus_name_key" ON "AppointmentStatus"("name");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "AppointmentStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
