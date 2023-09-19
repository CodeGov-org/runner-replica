#!/usr/bin/env node

import { Runner } from "./runner.js";

// Required Env Vars
const proposal = process.env.PROPOSAL;
const apiToken = process.env.API_TOKEN;
if (!proposal || !apiToken) {
  console.log("Missing required envs: PROPOSAL or API_TOKEN");
  process.exit(1);
}

// Main script
const runner = new Runner(proposal, apiToken);
await runner.call();
