import { readFileSync } from "fs";
import { Client } from "ssh2";
import { SERVER_IP, SSH_KEY_PATH } from "./config.js";

export class Runner {
  constructor(proposal) {
    this.proposal = proposal;
  }

  // connects to external console
  // runs repro-check script
  // prints logs to the local console
  // returns logs as an array of strings
  call() {
    let logStream = [];

    // connect
    const conn = new Client();
    conn
      .on("ready", () => {
        console.log("Console :: start");
        console.log("Console :: run repro check");
        conn.exec("./repro-check.sh -p " + this.proposal, (err, stream) => {
          if (err) throw err;
          stream
            .on("close", (code, signal) => {
              console.log(
                "Console :: end :: code: " + code + ", signal: " + signal
              );
              conn.end();
            })
            .on("data", (data) => {
              console.log(data);
              logStream.push(data);
            })
            .stderr.on("data", (data) => {
              console.log(data);
              logStream.push(data);
            });
        });
      })
      .connect({
        host: SERVER_IP,
        port: 22,
        username: "root",
        privateKey: readFileSync(SSH_KEY_PATH),
      });

    return logStream;
  }
}
