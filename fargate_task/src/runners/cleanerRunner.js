import { Client } from "ssh2";
import { SERVER_IP, SANDBOX_MODE } from "../config.js";
import { getHetznerSSH } from "../wrappers/awsWrapper.js";

export class CleanerRunner {
  constructor() {
    this.hetzner_ssh_key = "";
  }

  async call() {
    if (SANDBOX_MODE) return true;

    // get ssh key secret
    this.hetzner_ssh_key = await getHetznerSSH();

    // await for a resolve() that is placed at the end of the call
    console.log("Cleaner script :: started");
    await new Promise((resolve) => {
      this.runCleaner(resolve);
    });
    console.log("Cleaner script :: finished");

    return true;
  }

  runCleaner(resolve) {
    const conn = new Client();
    conn
      .on("ready", () => {
        conn.exec("rm -rf ~/tmp/* && rm -rf ~/.cache/*", (err, stream) => {
          if (err) throw err;
          stream
            .on("close", (code, signal) => {
              console.log(
                "Console :: run :: end :: code: " +
                  code +
                  ", signal: " +
                  signal,
              );
              conn.end();
              resolve();
            })
            .on("data", (data) => {
              console.log(data);
            })
            .stderr.on("data", (data) => {
              console.log(data);
            });
        });
        conn.exec(
          "podman container stop --all && podman container cleanup --all --rm --rmi",
          (err, stream) => {
            if (err) throw err;
            stream
              .on("close", (code, signal) => {
                console.log(
                  "Console :: run :: end :: code: " +
                    code +
                    ", signal: " +
                    signal,
                );
                conn.end();
                resolve();
              })
              .on("data", (data) => {
                console.log(data);
              })
              .stderr.on("data", (data) => {
                console.log(data);
              });
          },
        );
      })
      .connect({
        host: SERVER_IP,
        port: 22,
        username: "root",
        privateKey: this.hetzner_ssh_key,
      });
  }
}
