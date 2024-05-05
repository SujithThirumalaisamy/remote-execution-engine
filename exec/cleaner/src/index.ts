import { KubeConfig, AppsV1Api } from "@kubernetes/client-node";
import { createClient } from "redis";
const kc = new KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(AppsV1Api);
const redis = createClient();

function delete_deployment(deploymentName: string) {
  k8sApi
    .deleteNamespacedDeployment(deploymentName, "default")
    .then(() => {
      console.log(`Deployment ${deploymentName} deleted successfully`);
    })
    .catch((err: Error) => {
      console.error(`Error deleting deployment ${deploymentName}: ${err}`);
    });
}
async function main() {
  await redis.connect();
  setInterval(async () => {
    const deploymentName: string =
      (await redis.RPOP("deployments_to_be_deleted")) || "";
    console.log(deploymentName.length);
    if (deploymentName.length === 0) {
      //How to make this wait for few seconds if there is no Deployments
    } else {
      delete_deployment(deploymentName);
    }
  }, 1000);
}
main();
