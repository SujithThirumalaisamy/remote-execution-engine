-- AlterTable
ALTER TABLE "CodeLanguage" ADD COLUMN     "compileCommand" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "executionCommand" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "testCommand" TEXT NOT NULL DEFAULT '';
