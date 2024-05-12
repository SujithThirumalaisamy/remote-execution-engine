import main_func from "./main_func.js";
import fs from "fs";

function runTestCases() {
  const test_cases = JSON.parse(fs.readFileSync("./test_cases.json"));
  const result = [];
  try {
    test_cases.forEach((test_case) => {
      const output = main_func(...test_case.inputs);
      if (output === test_case.expectedOutput) {
        result.push(test_case.id);
      }
    });
  } catch (error) {
    return { status: "Error", stdOut: error };
  }
  return { status: "Successful", testCasesPassed: result };
}
async function updateSubmission(result) {
  const respose = await fetch(
    `${process.env.CALLBACK_URL}/submission/${process.env.SUBMISSION_ID}`,
    {
      method: "PATCH",
      body: JSON.stringify(result),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
const result = runTestCases();
updateSubmission(result);
