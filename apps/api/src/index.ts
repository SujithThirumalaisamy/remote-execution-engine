import express, { Request, Response } from "express";
import db from "@repo/db";
import { createClient } from "redis";
import { SubmissionStatus } from "@prisma/client";

require("dotenv").config();
let redisPort;
if (process.env.REDIS_PORT) {
  redisPort = parseInt(process.env.REDIS_PORT);
} else {
  redisPort = 6379;
}
const redisClient = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: redisPort,
  },
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

app.post("/testcase/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { testcase } = req.body;
    const { Octokit } = await import("octokit");
    const octokit = new Octokit({
      auth: process.env.TOKEN,
    });
    const stringifiedTestCase = JSON.stringify(testcase);
    const base64Encoded = Buffer.from(stringifiedTestCase).toString("base64");
    await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
      owner: process.env.REPO_OWNER || "",
      repo: process.env.REPO || "",
      path: `testcases/${id}.json`,
      message: `Auto Commit: Added ${id}.json`,
      committer: {
        name: "Auto Commiter",
        email: "hello@isujith.dev",
      },
      content: base64Encoded,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    return res
      .status(200)
      .json({ message: "Auto Deployment for testcase Triggered!" });
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
});
