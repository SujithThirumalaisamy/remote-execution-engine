import { createClient } from "redis";
import { KubeConfig, AppsV1Api, CoreV1Api } from "@kubernetes/client-node";
const redisClient = createClient();
redisClient.connect();

const k8s = new KubeConfig();
k8s.loadFromDefault();

const coreK8sApi = k8s.makeApiClient(CoreV1Api);
const appsK8sApi = k8s.makeApiClient(AppsV1Api);

async function main() {
  try {
    const submission_id = await redisClient.RPOP("submission_ids");
    if (submission_id === null) {
      throw Error("No Submissions in Queue currently");
    }
  } catch (error) {
    setTimeout(() => {
      console.log("No Submissions in Queue currently");
    }, 1000);
  }
}
setInterval(main, 1000);
