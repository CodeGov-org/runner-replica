import { readFileSync } from "fs";
import { Runner } from "./src/runner.mjs";

export const handler = async (event) => {
  // Required Env Var
  const proposal = process.env.PROPOSAL;
  if (!proposal) {
    const message = "Missing required envs: PROPOSAL";
    return { statusCode: 402, body: JSON.stringify(message) };
  }

  const sshKey = readFileSync("./secrets/ssh_key");

  // Main script
  const runner = new Runner(proposal, sshKey);
  const logStream = await runner.call();

  // HTTP Respond
  const response = {
    statusCode: 200,
    body: JSON.stringify(logStream),
  };
  return response;
};
