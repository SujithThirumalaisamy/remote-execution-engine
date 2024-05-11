import { createClient } from "redis";
import {
  KubeConfig,
  AppsV1Api,
  CoreV1Api,
  loadYaml,
  V1Deployment,
} from "@kubernetes/client-node";
import db from "../../../db/src";
import fs from "fs";
import path from "path";
require("dotenv").config();
const redisClient = createClient();
redisClient.connect();

const k8s = new KubeConfig();
k8s.loadFromDefault();

const coreK8sApi = k8s.makeApiClient(CoreV1Api);
const appsK8sApi = k8s.makeApiClient(AppsV1Api);
const isolatedExecutionNamespace = {
  metadata: {
    name: "isolated-execution-env",
  },
};

async function createNamespaceIfNotExists() {
  try {
    await coreK8sApi.createNamespace(isolatedExecutionNamespace);
  } catch (error) {}
}

async function orchestrateExecution() {
  const submission_id: string | null = await redisClient.RPOP("submission_ids");
  const CALLBACK_URL: string = process.env.CALLBACK_URL || "";
  const TESTCASES_GIT: string = process.env.TESTCASES_GIT || "";
  if (submission_id === null) {
    throw Error("No Submissions in Queue currently");
  }
  //This should be added after the orchestration logic
  const submission = await db.submission.findFirst({
    where: { id: submission_id },
    include: { codeLanguage: true },
  });
  const input = fs.readFileSync(
    path.join(
      __dirname,
      `../runtimes/deploy_${submission?.codeLanguage.name}.yaml`
    ),
    { encoding: "utf8" }
  );
  if (!submission) return;
  const importedYamlString = input
    .replaceAll("submission-id", submission_id)
    .replaceAll("callback-url", CALLBACK_URL)
    .replaceAll("testcases-git", TESTCASES_GIT)
    .replaceAll("problem-id", submission.problemId);
  const deploymentYaml: V1Deployment = loadYaml(importedYamlString);
  await appsK8sApi
    .createNamespacedDeployment("isolated-execution-env", deploymentYaml)
    .catch(async (e) => {
      await redisClient.RPUSH("submission_ids", submission_id);
    });
  await db.submission.update({
    where: { id: submission_id },
    data: { executionContainerId: submission_id },
  });
}
var timeout = setTimeout(() => main(), 1000);
async function main() {
  try {
    await orchestrateExecution();
  } catch (error) {
  } finally {
    clearTimeout(timeout);
    timeout = setTimeout(() => main(), 1000);
  }
}
main();
createNamespaceIfNotExists();
