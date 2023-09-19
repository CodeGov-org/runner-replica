import { Client } from "ssh2";
import { SERVER_IP, getHetznerSSH } from "config.js";

export class Runner {
  constructor(proposal) {
    this.proposal = proposal;
    this.logStream = [];
    this.hetzner_ssh_key = "";
  }

  // connects to external console
  // runs repro-check script
  // prints logs to the local console
  // returns logs as an array of strings
  async call() {
    // get ssh key secret
    this.hetzner_ssh_key = getHetznerSSH();

    this.runReproCheck();

    return this.logStream;
  }

  runReproCheck() {
    const conn = new Client();
    conn
      .on("ready", () => {
        // run repro check
        this.handleStream("Console :: run repro check");
        conn.exec("./repro-check.sh -p " + this.proposal, (err, stream) => {
          if (err) throw err;
          stream
            .on("close", (code, signal) => {
              this.handleStream(
                "Console :: run :: end :: code: " + code + ", signal: " + signal
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
        ssh_key: this.hetzner_ssh_key,
      });
  }

  handleStream(dataStream) {
    // .toString is important to avoid Buffer byte data
    if (Buffer.isBuffer(dataStream)) dataStream = dataStream.toString();

    // .stringify is important to avoid [object Object]
    let parsed = JSON.stringify(dataStream).trim();

    // for local console
    console.log(parsed);

    // trim() will remove the excessive break line at end of a string
    this.logStream.push(parsed);
  }
}
