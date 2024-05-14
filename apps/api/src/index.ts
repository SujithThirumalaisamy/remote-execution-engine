import express, { Request, Response } from "express";
import db from "@repo/db";
import { createClient } from "redis";
import { SubmissionStatus } from "@prisma/client";
require("dotenv").config();
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

const app = express();

app.use(express.json());

// GET /submission/:id
app.get("/submission/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const submission = await db.submission.findFirst({
      where: { id },
    });
    //Return if stdin does not exist
    if (submission?.stdin[0] == "") {
      const { stdin, ...rest } = submission;
      return res.json(rest);
    }
    //Return including the stdin if present
    res.json(submission);
  } catch (error) {
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
    if (!id) return;
    if (status === SubmissionStatus.Successful) {
      redisClient.LPUSH("deployments_to_be_deleted", id);
      const updatedSubmission = await db.submission.update({
        where: { id },
        data: {
          status,
          testCasesPassed,
        },
      });
      return res.json(updatedSubmission);
    }
    const updatedSubmission = await db.submission.update({
      where: { id },
      data: {
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
  // redisClient.set("API_URL", process.env.API_URL || "");
});
