import { KubeConfig, AppsV1Api } from "@kubernetes/client-node";
import { createClient } from "redis";
const kc = new KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(AppsV1Api);
const redis = createClient();

function delete_deployment(deploymentName: string) {
  k8sApi.deleteNamespacedDeployment(deploymentName, "isolated-execution-env");
}
var timeout = setTimeout(main, 1000);
async function main() {
  try {
    const deploymentName: string =
      (await redis.RPOP("deployments_to_be_deleted")) || "";
    if (deploymentName === "") throw new Error("No Deployment");
    delete_deployment(deploymentName);
  } catch (error) {
    // clearTimeout(timeout);
    // timeout = setTimeout(main, 1000);
  } finally {
    clearTimeout(timeout);
    timeout = setTimeout(main, 1000);
  }
}
redis.connect();
main();
