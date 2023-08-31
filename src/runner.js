import { readFileSync } from "fs";
import { Client } from "ssh2";
import { SERVER_IP, SSH_KEY_PATH } from "./config.js";

export class Runner {
  constructor(proposal) {
    this.proposal = proposal;
  }

  call() {
    // connect
    const conn = new Client();
    conn
      .on("ready", () => {
        console.log("Client :: ready");
        conn.exec("./repro-check.sh -p " + this.proposal, (err, stream) => {
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
  }
}
