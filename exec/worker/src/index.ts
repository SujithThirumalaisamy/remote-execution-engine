import { createClient } from "redis";
import { KubeConfig, AppsV1Api, CoreV1Api } from "@kubernetes/client-node";
import db from "../../../db/src";
const redisClient = createClient();
redisClient.connect();

const k8s = new KubeConfig();
k8s.loadFromDefault();

const coreK8sApi = k8s.makeApiClient(CoreV1Api);
const appsK8sApi = k8s.makeApiClient(AppsV1Api);

async function main() {
  try {
    const submission_id = await redisClient.RPOP("submission_ids");
    const CALLBACK_URL = await redisClient.get("API_URL");
    if (submission_id === null) {
      throw Error("No Submissions in Queue currently");
    } else {
      //This should be added after the orchestration logic
      // const submission = await db.submission.update({
      //   where: { id: submission_id },
      //   data: { executionContainerId: container_Id },
      // });
    }
  } catch (error) {
    setTimeout(() => {
      console.log("No Submissions in Queue currently");
    }, 1000);
  }
}
setInterval(main, 1000);
