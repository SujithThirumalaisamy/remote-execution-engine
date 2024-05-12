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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const client_node_1 = require("@kubernetes/client-node");
const src_1 = __importDefault(require("../../../db/src"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
require("dotenv").config();
const redisClient = (0, redis_1.createClient)();
redisClient.connect();
const k8s = new client_node_1.KubeConfig();
k8s.loadFromDefault();
const coreK8sApi = k8s.makeApiClient(client_node_1.CoreV1Api);
const isolatedExecutionNamespace = {
    metadata: {
        name: "isolated-execution-env",
    },
};
function createNamespaceIfNotExists() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield coreK8sApi.createNamespace(isolatedExecutionNamespace);
        }
        catch (error) { }
    });
}
function orchestrateExecution() {
    return __awaiter(this, void 0, void 0, function* () {
        const CALLBACK_URL = process.env.CALLBACK_URL || "";
        const TESTCASES_GIT = process.env.TESTCASES_GIT || "";
        const CONTAINER_REG_BASE_URL = process.env.CONTAINER_REG_BASE_URL;
        const IMAGE_BASE_NAME = process.env.IMAGE_BASE_NAME;
        const IMAGE_TAG = process.env.IMAGE_TAG;
        const submission_id = yield redisClient.RPOP("submission_ids");
        if (submission_id === null) {
            throw Error("No Submissions in Queue currently");
        }
        //This should be added after the orchestration logic
        const submission = yield src_1.default.submission.findFirst({
            where: { id: submission_id },
            include: { language: true },
        });
        const input = fs_1.default.readFileSync(path_1.default.join(__dirname, `../runtimes/deploy_execution.yaml`), { encoding: "utf8" });
        if (!submission)
            return;
        const LANGUAGE_IMAGE_NAME = `${CONTAINER_REG_BASE_URL}/${IMAGE_BASE_NAME}-${submission === null || submission === void 0 ? void 0 : submission.language.extension}:${IMAGE_TAG}`;
        const importedYamlString = input
            .replaceAll("submission-id", submission_id)
            .replaceAll("callback-url", CALLBACK_URL)
            .replaceAll("testcases-git", TESTCASES_GIT)
            .replaceAll("problem-id", submission.problemId)
            .replaceAll("language-image", LANGUAGE_IMAGE_NAME);
        const deploymentYaml = (0, client_node_1.loadYaml)(importedYamlString);
        yield coreK8sApi
            .createNamespacedPod("isolated-execution-env", deploymentYaml)
            .catch((e) => __awaiter(this, void 0, void 0, function* () {
            yield redisClient.RPUSH("submission_ids", submission_id);
        }));
        yield src_1.default.submission.update({
            where: { id: submission_id },
            data: { executionContainerId: submission_id },
        });
    });
}
var timeout = setTimeout(() => main(), 1000);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield orchestrateExecution();
        }
        catch (error) {
        }
        finally {
            clearTimeout(timeout);
            timeout = setTimeout(() => main(), 1000);
        }
    });
}
main();
createNamespaceIfNotExists();
