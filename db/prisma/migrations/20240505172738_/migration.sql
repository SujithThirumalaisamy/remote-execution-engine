/*
  Warnings:

  - Made the column `stdin` on table `Submission` required. This step will fail if there are existing NULL values in that column.
  - Made the column `stdout` on table `Submission` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Submission" ALTER COLUMN "stdin" SET NOT NULL,
ALTER COLUMN "stdin" SET DEFAULT '',
ALTER COLUMN "stdout" SET NOT NULL,
ALTER COLUMN "stdout" SET DEFAULT '';
