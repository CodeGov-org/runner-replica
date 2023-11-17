import { Client } from "ssh2";
import { SERVER_IP, getHetznerSSH } from "../config.js";

export class ReplicaRunner {
  ANSI_ESCAPE_CODES_REGEX = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

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
    if (this.sandbox) {
      this.logStream = this.sandboxedResult();
      this.cleanLogStream();
      return this.logStream;
    }

    // get ssh key secret
    this.hetzner_ssh_key = await getHetznerSSH();

    // await for a resolve() that is placed at the end of the call
    await new Promise((resolve) => {
      this.runReproCheck(resolve);
    });

    this.cleanLogStream();

    return this.logStream;
  }

  sandboxedResult() {
    return [
      "...",
      "718a0696fe7ce8c79b280a76eed1bdf137028987fb1750439af80ede2b112e0b *disk-img.tar.zst",
      "/tmp/tmp.ToufslWSdm/ic",
      "\x1B[0;32mBuild complete for revision d73659a2baf78302b88e29e5c2bc891cde1e3e0b\x1B[0m",
      "\x1B[0;32m2023/11/17 | 20:09:18 | 1700251758 [+] Built IC-OS successfully\x1B[0m",
      "\x1B[0;34m2023/11/17 | 20:09:34 | 1700251774 [+] Check hash of locally built artifact matches the one fetched from the proposal/CDN\x1B[0m",
      "\x1B[0;32m2023/11/17 | 20:09:34 | 1700251774 [+] Verification successful for GuestOS!\x1B[0m",
      "\x1B[0;32m2023/11/17 | 20:09:34 | 1700251774 [+] The shasum for GuestOS from the artifact built locally and the one fetched from the proposal/CDN match:\n" +
      "\t\t\t\t\t\tLocal = 9cf5678e17e2503cce8ba4252caac2d0d08dbe60b21e3d9278e851f27c394936\n" +
      "\t\t\t\t\t\tCDN   = 9cf5678e17e2503cce8ba4252caac2d0d08dbe60b21e3d9278e851f27c394936",
      "\x1B[0m",
      "\x1B[0;32m2023/11/17 | 20:09:34 | 1700251774 [+] Verification successful for HostOS!\x1B[0m",
      "\x1B[0;32m2023/11/17 | 20:09:34 | 1700251774 [+] The shasum for HostOS from the artifact built locally and the one fetched from the proposal/CDN match:\n" +
      "\t\t\t\t\t\tLocal = d8cd9ff5eb8bb8de6020e7a640b6c2b5c8d7365e79a8e66a6fb06f4c0bfe0b3f\n" +
      "\t\t\t\t\t\tCDN   = d8cd9ff5eb8bb8de6020e7a640b6c2b5c8d7365e79a8e66a6fb06f4c0bfe0b3f\n" +
      "\n" +
      "\x1B[0m",
      "\x1B[0;32m2023/11/17 | 20:09:34 | 1700251774 [+] Verification successful for SetupOS!\x1B[0m",
      "\x1B[0;32m2023/11/17 | 20:09:34 | 1700251774 [+] The shasum for SetupOS from the artifact built locally and the one fetched from the proposal/CDN match:\n" +
      "\t\t\t\t\t\tLocal = fa5e4c43802a30160382fdb55d3964c3b7b1a55ef7ad0410e7c136553a474b7f\n" +
      "\t\t\t\t\t\tCDN   = fa5e4c43802a30160382fdb55d3964c3b7b1a55ef7ad0410e7c136553a474b7f\n" +
      "\n" +
      "\x1B[0m",
      "\x1B[0;32m2023/11/17 | 20:09:34 | 1700251774 [+] All images are validated successfully\x1B[0m",
      "\x1B[0;34m2023/11/17 | 20:09:34 | 1700251774 [+] Total time: 0h 36m 21s\x1B[0m",
      "Console :: run :: end :: code: 0, signal: undefined"
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

  cleanLogStream() {
    this.logStream = this.logStream.map((line) => line.replace(this.ANSI_ESCAPE_CODES_REGEX, ''));
  }
}
