import { Client } from "ssh2";
import { SERVER_IP } from "./config.mjs";

export class Runner {
  constructor(proposal, sshKey) {
    this.proposal = proposal;
    this.sshKey = sshKey;
    this.logStream = [];
  }

  // connects to external console
  // runs repro-check script
  // prints logs to the local console
  // returns logs as an array of strings
  async call() {
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
        privateKey: this.sshKey,
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
