#!/usr/bin/env node

import { ReplicaRunner } from "./runners/replicaRunner.js";
import { getSharedData, NOTIFY_EMAILS } from "./config.js";
import { EmailNotifier } from "./notifiers/emailNotifier.js";
import { DscvrNotifier } from "./notifiers/dscvrNotifier.js";

const main = async () => {
  const proposal = await getNextProposal();
  if (!proposal) {
    console.log("No new proposals found.");
    process.exit(1);
  }

  const runner = new ReplicaRunner(proposal);
  const result = await runner.call();

  const dscvrPostId = "123";

  const notifiers = [
    new EmailNotifier(NOTIFY_EMAILS, proposal, result),
    new DscvrNotifier(dscvrPostId, result),
  ];
  for (let notifier of notifiers) {
    notifier.call();
  }

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
