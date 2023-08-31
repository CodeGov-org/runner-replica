#!/usr/bin/env node

import { Runner } from "./runner.js";

// Required Env Var
const proposal = process.env.PROPOSAL;
if (!proposal) {
  console.log("Missing required env: PROPOSAL");
  process.exit(1);
}

// Main script
const runner = new Runner(proposal);
runner.call();
