#!/usr/bin/env node

import { readFileSync } from "fs";
import { Client } from "ssh2";
import { homedir } from "os";

// CONST
const SERVER_IP = "37.27.9.86";
const SSH_KEY_PATH = homedir() + "/.ssh/id_rsa"; // or '/.ssh/id_ed25519'

// Required Env Var
const proposal = process.env.PROPOSAL;
if (!proposal) {
  console.log("Missing required env: PROPOSAL");
  process.exit(1);
}

// Main script

// connect
const conn = new Client();
conn
  .on("ready", () => {
    console.log("Client :: ready");
    conn.exec("./repro-check.sh -p " + proposal, (err, stream) => {
      if (err) throw err;
      stream
        .on("close", (code, signal) => {
          console.log(
            "Stream :: close :: code: " + code + ", signal: " + signal
          );
          conn.end();
        })
        .on("data", (data) => {
          console.log("STDOUT: " + data);
        })
        .stderr.on("data", (data) => {
          console.log("STDERR: " + data);
        });
    });
  })
  .connect({
    host: SERVER_IP,
    port: 22,
    username: "root",
    privateKey: readFileSync(SSH_KEY_PATH),
  });
