/*
  Warnings:

  - You are about to drop the column `scheduledAt` on the `appointments` table. All the data in the column will be lost.
  - Added the required column `date` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_time` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Made the column `duration` on table `services` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "appointments_barbershop_id_scheduledAt_idx";

-- DropIndex
DROP INDEX "appointments_scheduledAt_status_idx";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "scheduledAt",
ADD COLUMN     "date" DATE NOT NULL,
ADD COLUMN     "end_time" TEXT NOT NULL,
ADD COLUMN     "start_time" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "services" ALTER COLUMN "duration" SET NOT NULL;

-- CreateTable
CREATE TABLE "break_times" (
    "id" TEXT NOT NULL,
    "day_of_week" "DayOfWeek" NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "barbershop_id" TEXT NOT NULL,

    CONSTRAINT "break_times_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "appointments_barbershop_id_date_idx" ON "appointments"("barbershop_id", "date");

-- CreateIndex
CREATE INDEX "appointments_date_status_idx" ON "appointments"("date", "status");

-- AddForeignKey
ALTER TABLE "break_times" ADD CONSTRAINT "break_times_barbershop_id_fkey" FOREIGN KEY ("barbershop_id") REFERENCES "barbershops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
