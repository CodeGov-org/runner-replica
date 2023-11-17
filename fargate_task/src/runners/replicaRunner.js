import { Client } from "ssh2";
import { SERVER_IP, getHetznerSSH } from "../config.js";

export class ReplicaRunner {
  constructor(proposal) {
    this.proposal = proposal;
    this.logStream = [];
    this.hetzner_ssh_key = "";
    this.sandbox = false;
  }

  // connects to external console
  // runs repro-check script
  // prints logs to the local console
  // returns logs as an array of strings
  async call() {
    if (this.sandbox) return this.sandboxedResult();

    // get ssh key secret
    this.hetzner_ssh_key = await getHetznerSSH();

    // await for a resolve() that is placed at the end of the call
    await new Promise((resolve) => {
      this.runReproCheck(resolve);
    });

    return this.logStream;
  }

  sandboxedResult() {
    return [
      "Console :: run repro check",
      "2023/10/01 | 15:38:26 | 1696174706 [+] Check the environment",
      "2023/10/01 | 15:38:26 | 1696174706 [+] x86_64 architecture detected",
      "...",
      "2023/10/01 | 15:55:20 | 1696085118 [+] The shasum from the artifact built locally and the one fetched from the proposal/CDN match.",
      "Local = 27ca7ea495b0863088130f2ea56fd2eb27355da986b040f6f5e90d1a9b501df9",
      "CDN   = 27ca7ea495b0863088130f2ea56fd2eb27355da986b040f6f5e90d1a9b501df9",
      "2023/10/01 | 15:55:21 | 1696085121 [+] Verification successful - total time: 0h 17m 56s",
      "Console :: run :: end :: code: 0, signal: undefined",
    ];
  }

  runReproCheck(resolve) {
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
              resolve();
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
