import { KubeConfig, CoreV1Api } from "@kubernetes/client-node";
import { createClient } from "redis";

const kc = new KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(CoreV1Api);
const redis = createClient({ url: process.env.REDIS_URL });
const namespace = "isolated-execution-env";
var timeout = setTimeout(main, 1000);

async function delete_pod(podName: string) {
  try {
    await k8sApi.deleteNamespacedPod(podName, namespace);
  } catch (error) {
    console.log("Internal Error! Unable to find Deployment.");
  }
}

async function main() {
  try {
    const podName: string =
      (await redis.RPOP("deployments_to_be_deleted")) || "";
    if (podName === "") return;
    delete_pod(podName);
  } catch (error) {
    console.log("Internal Error! Unable to delete the Deployment.");
  } finally {
    clearTimeout(timeout);
    timeout = setTimeout(main, 1000);
  }
}

redis.connect();
