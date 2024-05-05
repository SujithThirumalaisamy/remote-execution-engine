-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('Queued', 'Successful', 'Error');

-- CreateTable
CREATE TABLE "CodeLanguage" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "compileCommand" TEXT NOT NULL DEFAULT '',
    "executionCommand" TEXT NOT NULL DEFAULT '',
    "testCommand" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "CodeLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "mainFuncName" TEXT NOT NULL DEFAULT 'main',
    "stdin" TEXT NOT NULL DEFAULT '',
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
