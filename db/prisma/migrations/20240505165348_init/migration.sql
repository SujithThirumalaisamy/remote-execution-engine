-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('Queued', 'Successful', 'Error');

-- CreateTable
CREATE TABLE "CodeLanguage" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CodeLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "mainFuncName" TEXT NOT NULL DEFAULT 'main',
    "stdin" TEXT,
    "stdout" TEXT,
    "codeLanguageId" INTEGER NOT NULL,
    "executionContainerId" TEXT NOT NULL DEFAULT '',
    "status" "SubmissionStatus" NOT NULL,
    "runtime" INTEGER NOT NULL,
    "memoryUsage" INTEGER NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestCase" (
    "id" TEXT NOT NULL,
    "expectedOutput" TEXT NOT NULL,
    "inputs" TEXT[],
    "submissionId" TEXT,

    CONSTRAINT "TestCase_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_codeLanguageId_fkey" FOREIGN KEY ("codeLanguageId") REFERENCES "CodeLanguage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
