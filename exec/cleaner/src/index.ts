const k8s = require("@kubernetes/client-node");
import { createClient } from "redis";
const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.AppsV1Api);
const redis = createClient();
setInterval(async () => {
  const deploymentName: string =
    (await redis.RPOP("deployments_to_be_deleted")) || "";
  delete_deployment(deploymentName);
}, 1000);

function delete_deployment(deploymentName: string) {
  const deleteOptions = new k8s.V1DeleteOptions();
  k8sApi
    .deleteNamespacedDeployment(deploymentName, "default", deleteOptions)
    .then(() => {
      console.log(`Deployment ${deploymentName} deleted successfully`);
    })
    .catch((err: Error) => {
      console.error(`Error deleting deployment ${deploymentName}: ${err}`);
    });
}
