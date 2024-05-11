"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, "__esModule", { value: true });
const client_node_1 = require("@kubernetes/client-node");
const redis_1 = require("redis");
const kc = new client_node_1.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(client_node_1.AppsV1Api);
const redis = (0, redis_1.createClient)();
function delete_deployment(deploymentName) {
  k8sApi.deleteNamespacedDeployment(deploymentName, "isolated-execution-env");
}
var timeout = setTimeout(main, 1000);
function main() {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      const deploymentName =
        (yield redis.RPOP("deployments_to_be_deleted")) || "";
      delete_deployment(deploymentName);
    } catch (error) {
      clearTimeout(timeout);
      timeout = setTimeout(main, 1000);
    }
  });
}
redis.connect();
main();
