/*
  Warnings:

  - You are about to drop the column `subjectId` on the `classes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "classes" DROP CONSTRAINT "classes_subjectId_fkey";

-- AlterTable
ALTER TABLE "classes" DROP COLUMN "subjectId";
