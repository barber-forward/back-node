/*
  Warnings:

  - Made the column `description` on table `barbershops` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `barbershops` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "barbershops" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "state" DROP NOT NULL;
