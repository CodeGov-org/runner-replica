#!/usr/bin/env node

import { Runner } from "./runner.js";

// TODO: add DSCVR POST env
// Required Env Var
const proposal = process.env.PROPOSAL;
if (!proposal) {
  console.log("Missing required envs: PROPOSAL");
  process.exit(1);
}

// Main script
const runner = new Runner(proposal);
await runner.call();
