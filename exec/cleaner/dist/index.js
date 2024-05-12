"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_node_1 = require("@kubernetes/client-node");
const redis_1 = require("redis");
const kc = new client_node_1.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(client_node_1.CoreV1Api);
const redis = (0, redis_1.createClient)();
const namespace = "isolated-execution-env";
var timeout = setTimeout(main, 1000);
function delete_pod(podName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield k8sApi.deleteNamespacedPod(podName, namespace);
        }
        catch (error) {
            console.log("Internal Error! Unable to find Deployment.");
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const podName = (yield redis.RPOP("deployments_to_be_deleted")) || "";
            if (podName === "")
                return;
            delete_pod(podName);
        }
        catch (error) {
            console.log("Internal Error! Unable to delete the Deployment.");
        }
        finally {
            clearTimeout(timeout);
            timeout = setTimeout(main, 1000);
        }
    });
}
redis.connect();
