#!/usr/bin/env node

import { Runner } from "./runner.js";
import { getSharedData } from "./config.js";

const main = async () => {
  const proposal = await getNextProposal();
  if (!proposal) {
    console.log("No new proposals found.");
    process.exit(1);
  }

  const runner = new Runner(proposal);
  const result = await runner.call();

  return result;
};

const getNextProposal = async () => {
  const sharedData = await getSharedData();
  let nextProposal = "";
  for (let entry of sharedData) {
    if (entry.finished_at != "") continue;

    nextProposal = entry.proposal;
    break;
  }

  return nextProposal;
};

// Script is called here
await main();
