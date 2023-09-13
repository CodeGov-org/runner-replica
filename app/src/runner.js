import { readFileSync } from "fs";
import { Client } from "ssh2";
import { SERVER_IP, SSH_KEY_PATH } from "./config.js";

export class Runner {
  constructor(proposal) {
    this.proposal = proposal;
    this.logStream = [];
  }

  // connects to external console
  // runs repro-check script
  // prints logs to the local console
  // returns logs as an array of strings
  call() {
    // connect
    const conn = new Client();
    conn
      .on("ready", () => {
        this.handleStream("Console :: start");
        this.handleStream("Console :: run repro check");
        conn.exec("./repro-check.sh -p " + this.proposal, (err, stream) => {
          if (err) throw err;
          stream
            .on("close", (code, signal) => {
              this.handleStream(
                "Console :: end :: code: " + code + ", signal: " + signal
              );
              conn.end();
            })
            .on("data", (data) => {
              this.handleStream(data);
            })
            .stderr.on("data", (data) => {
              this.handleStream(data);
            });
        });
      })
      .connect({
        host: SERVER_IP,
        port: 22,
        username: "root",
        privateKey: readFileSync(SSH_KEY_PATH),
      });

    return this.logStream;
  }

  handleStream(dataStream) {
    let parsed = dataStream.toString().trim();

    // for local console
    console.log(parsed);

    // trim() will remove the excessive break line at end of a string
    this.logStream.push(parsed);
  }
}
