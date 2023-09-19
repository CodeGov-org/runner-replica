import { Client } from "ssh2";
import { setTimeout } from "timers/promises";
import axios from "axios";

const HETZNER_API_HOST = "https://api.hetzner.cloud/v1/";

export class Runner {
  constructor(proposal, apiToken) {
    this.proposal = proposal;
    this.apiToken = apiToken;
    this.logStream = [];
    this.consoleIp = "";
    this.consolePassword = "";
  }

  // connects to external console
  // runs repro-check script
  // prints logs to the local console
  // returns logs as an array of strings
  async call() {
    //await this.createServer();
    //await setTimeout(100000);
    this.consoleIp = "49.13.78.139";
    this.consolePassword = "bjHumHFgCwFbjWwgLKi4";

    this.setupAndRunCheck();
    // this.destroyServer();

    // return this.logStream;
  }

  async createServer() {
    const serverParams = {
      image: "ubuntu-22.04",
      location: "fsn1",
      name: "runner-replica-tmp1",
      public_net: {
        enable_ipv4: true,
        enable_ipv6: true,
      },
      server_type: "cx41",
    };

    // needed due to "this" changing inside the async function
    const self = this;

    await axios
      .post(HETZNER_API_HOST + "servers", serverParams, this.apiHeader())
      .then(function (response) {
        // handle success
        self.handleStream("Server :: created");
        self.handleStream(response.data);

        if (
          response.data.server?.public_net?.ipv4?.ip &&
          response.data.root_password
        ) {
          self.consoleIp = response.data.server.public_net.ipv4?.ip;
          self.consolePassword = response.data.root_password;
        } else {
          self.handleStream(
            "ERROR: Failed to parse information from server created."
          );
          process.exit(1);
        }
      })
      .catch(function (error) {
        // handle error
        if (error.response.data?.error?.message) {
          self.handleStream(
            "ERROR: Failed to create server. Message: " +
              JSON.stringify(error.response.data.error?.message)
          );
        } else {
          self.handleStream("ERROR: Failed to create server.");
        }

        process.exit(1);
      });
  }

  destroyServer() {}

  apiHeader() {
    return {
      headers: {
        Authorization: "Bearer " + this.apiToken,
      },
    };
  }

  setupAndRunCheck() {
    const steps = [
      "apt-get update",
      "apt-get install -y curl podman",
      "curl --proto '=https' --tlsv1.2 -sSLO https://raw.githubusercontent.com/dfinity/ic/d87954601e4b22972899e9957e800406a0a6b929/gitlab-ci/tools/repro-check.sh",
      "chmod +x repro-check.sh",
    ];
    const commands = steps.join(" && ");

    const conn = new Client();
    conn
      .on("ready", () => {
        // run setup
        this.handleStream("Console :: setup");
        conn.exec(commands, (err, stream) => {
          if (err) throw err;
          stream
            .on("close", (code, signal) => {
              this.handleStream(
                "Console :: setup :: end :: code: " +
                  code +
                  ", signal: " +
                  signal
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
        host: this.consoleIp,
        port: 22,
        username: "root",
        password: this.consolePassword,
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
