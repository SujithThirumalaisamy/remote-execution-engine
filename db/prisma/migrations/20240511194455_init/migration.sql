-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('Queued', 'Successful', 'Error');

-- CreateTable
CREATE TABLE "CodeLanguage" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "compileCommand" TEXT NOT NULL DEFAULT '',
    "executionCommand" TEXT NOT NULL DEFAULT '',
    "testCommand" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "CodeLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "mainFuncName" TEXT NOT NULL DEFAULT 'main',
    "stdin" TEXT[] DEFAULT ARRAY['']::TEXT[],
    "stdout" TEXT NOT NULL DEFAULT '',
    "codeLanguageId" INTEGER NOT NULL,
    "executionContainerId" TEXT NOT NULL DEFAULT '',
    "status" "SubmissionStatus" NOT NULL DEFAULT 'Queued',
    "runtime" DOUBLE PRECISION,
    "memoryUsage" DOUBLE PRECISION,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_codeLanguageId_fkey" FOREIGN KEY ("codeLanguageId") REFERENCES "CodeLanguage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;