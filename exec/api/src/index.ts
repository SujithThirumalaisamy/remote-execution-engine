import express, { Request, Response } from "express";
import db from "../../../db/src";
import { createClient } from "redis";

const redisClient = createClient();

const app = express();
app.use(express.json());

// GET /submission/:id
app.get("/submission/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const submission = await db.submission.findFirst({ where: { id } });
    res.json(submission);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /submission
app.post("/submission", async (req: Request, res: Response) => {
  try {
    const { submission, testCases } = req.body;
    const createdSubmission = await db.submission.create({
      data: {
        ...submission,
        testCases: {
          create: testCases,
        },
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
    const { submission } = req.body;
    const updatedSubmission = await db.submission.update({
      where: { id },
      data: {
        // Assuming submission object contains fields to be updated
        ...submission,
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
  console.log(`Server is running on port ${PORT}`);
});
