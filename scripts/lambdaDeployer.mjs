#!/usr/bin/env node

import { Runner } from "../src/runner.mjs";

// Required Env Var
const proposal = process.env.PROPOSAL;
if (!proposal) {
  console.log("Missing required env: PROPOSAL");
  process.exit(1);
}

// Main script
const runner = new Runner(proposal);
runner.call();


