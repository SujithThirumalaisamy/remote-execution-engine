import express, { Request, Response } from "express";
import db from "../../../db/src";
import { createClient } from "redis";
require("dotenv").config();
const redisClient = createClient();

const app = express();
app.use(express.json());

// GET /submission/:id
app.get("/submission/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const submission = await db.submission.findFirst({
      where: { id },
      include: { testCases: true },
    });
    if (submission?.testCases.length === 0) {
      const { testCases, ...rest } = submission;
      return res.json(rest);
    }
    if (submission?.stdin[0] == "") {
      const { stdin, ...rest } = submission;
      return res.json(rest);
    }
    res.json(submission);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /submission
app.post("/submission", async (req: Request, res: Response) => {
  try {
    const { submission } = req.body;
    const createdSubmission = await db.submission.create({
      data: {
        ...submission,
        testCases: {
          create: submission.testCases,
        },
      },
      include: {
        testCases: true,
      },
    });
    redisClient.LPUSH("submission_ids", createdSubmission.id.toString());
    res.json(createdSubmission);
  } catch (error) {
    console.error("Error creating submission:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PATCH /submission/:id
app.patch("/submission/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { testCasesPassed, stdOut, status } = req.body;
    if (status) {
      redisClient.LPUSH("deployments_to_be_deleted", id);
    }
    const updatedSubmission = await db.submission.update({
      where: { id },
      data: {
        // Assuming submission object contains fields to be updated
        stdout: stdOut,
        status,
      },
    });
    res.json(updatedSubmission);
  } catch (error) {
    console.error("Error updating submission:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await redisClient.connect();
  redisClient.set("API_URL", process.env.API_URL || "");
  console.log(`Server is running on port ${PORT}`);
});
