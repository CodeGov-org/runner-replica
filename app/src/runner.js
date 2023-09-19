import { Client } from "ssh2";
import { SERVER_IP, getHetznerSSH } from "./config.js";

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
    this.hetzner_ssh_key = await getHetznerSSH();

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
        privateKey: this.hetzner_ssh_key,
      });
  }

  handleStream(dataStream) {
    let parsed = dataStream;

    // .toString is important to avoid Buffer byte data
    if (Buffer.isBuffer(dataStream)) parsed = parsed.toString();

    // trim() will remove the excessive break line at end of a string
    parsed = parsed.trim();

    // for local console
    console.log(parsed);

    // for result log
    this.logStream.push(parsed);
  }
}
