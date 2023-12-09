#!/usr/bin/env node

import { ReplicaRunner } from "./runners/replicaRunner.js";
import { CleanerRunner } from "./runners/cleanerRunner.js";
import { NOTIFY_EMAILS, SANDBOX_MODE } from "./config.js";
import { getSharedData, putParameterCommand } from "./wrappers/awsWrapper.js";
import { EmailNotifier } from "./notifiers/emailNotifier.js";
import { DscvrNotifier } from "./notifiers/dscvrNotifier.js";

const main = async () => {
  const sharedData = await getSharedData();
  const proposal = getNextProposal(sharedData);
  if (!proposal) {
    console.log("No new proposals found.");
    process.exit(1);
  }

  // avoid duplication with setting started_at
  updateStartedAt(proposal, sharedData);

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

  // clean caches to avoid running out of storage space
  if (wasLastProposal(sharedData)) {
    const cleaner = new CleanerRunner();
    await cleaner.call();
  }

  return result;
};

const getNextProposal = (sharedData) => {
  let nextProposal = "";
  for (let entry of sharedData) {
    if (!SANDBOX_MODE && entry.started_at != "") continue;

    nextProposal = entry.proposal;
    break;
  }

  return nextProposal;
};

const updateStartedAt = (proposal, sharedData) => {
  for (let entry of sharedData) {
    if (entry.proposal != proposal) continue;

    entry.started_at = JSON.stringify(new Date().getTime());
    break;
  }

  putParameterCommand(sharedData);
};

const wasLastProposal = (sharedData) => {
  for (let entry of sharedData) {
    if (entry.started_at == "") return false;
  }

  return true;
};

// Script is called here
await main();
