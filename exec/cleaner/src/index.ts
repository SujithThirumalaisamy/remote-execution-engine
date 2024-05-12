import { KubeConfig, AppsV1Api } from "@kubernetes/client-node";
import { createClient } from "redis";

const kc = new KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(AppsV1Api);
const redis = createClient();
const namespace = "isolated-execution-env";
var timeout = setTimeout(main, 1000);

function delete_deployment(deploymentName: string) {
  try {
    k8sApi.deleteNamespacedDeployment(deploymentName, namespace);
  } catch (error) {
    console.log("Internal Error! Unable to find Deployment.");
  }
}

async function main() {
  try {
    const deploymentName: string =
      (await redis.RPOP("deployments_to_be_deleted")) || "";
    if (deploymentName === "") return;
    delete_deployment(deploymentName);
  } catch (error) {
    console.log("Internal Error! Unable to delete the Deployment.");
  } finally {
    clearTimeout(timeout);
    timeout = setTimeout(main, 1000);
  }
}

redis.connect();
