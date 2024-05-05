import express, { Request, Response } from "express";
import { createClient } from "redis";
import db from "../../db/src";

const redisClient = createClient();
redisClient.connect();

const app = express();
app.use(express.json());

app.post("/submission", async (req: Request, res: Response) => {
  try {
    const { code, languageId, testCases, stdIn } = req.body;
    const newSubmission = await db.executionCode.create({
      data: {
        code,
        languageId,
        stdIn,
        executionTestCase: { create: testCases },
      },
    });
    redisClient.LPUSH("submission_ids", newSubmission.id);
    res.status(200).json({
      message: "Submission created succesfully!",
      SubmissionID: newSubmission.id,
    });
  } catch (error) {
    console.error("Error creating submission:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/submission/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const submission = await db.executionCode.findFirst({
      where: { id },
      include: {
        executionTestCase: {
          select: {
            expectedOutput: true,
            inputs: true,
          },
        },
      },
    });
    res.status(200).json(submission);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.patch("/submission/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { executionStatus, stdOut, testCasesPassed } = req.body;
    const submission = await db.executionCode.update({
      where: { id },
      data: { executionStatus, stdOut, testCasesPassed },
    });
    res.status(200).json(submission);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
