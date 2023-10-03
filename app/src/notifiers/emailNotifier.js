import nodemailer from "nodemailer";
import { getRunnerSecrets } from "../config.js";

export class EmailNotifier {
  constructor(emails, proposal, logs) {
    this.emails = emails;
    this.proposal = proposal;
    this.logs = logs;
  }

  async call() {
    const secrets = await getRunnerSecrets();

    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: secrets.gmailUsername,
        pass: secrets.gmailAppPassword,
      },
    });

    const message = {
      from: secrets.gmailUsername,
      to: this.emails.join(","),
      subject: `Proposal ${this.proposal} results`,
      text: this.getBody(),
    };

    transport.sendMail(message, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log(info);
      }
    });

    // don't wait / expect for output
    return null;
  }

  getBody() {
    return (
      `${this.randomGreeting()}\n\n` +
      `Proposal ${this.proposal} finished it's automated verification.\n\n` +
      "The last lines were:\n" +
      "========\n" +
      `${this.logs.slice(-5).join("\n")}\n` +
      "========\n\n" +
      `${this.randomFarewell()}\n\n\n` +
      "-------- Full Logs --------\n" +
      `${this.logs.join("\n")}\n` +
      "-------- Full Logs --------\n"
    );
  }

  randomGreeting() {
    const greetings = [
      "* BipBop *",
      "Greetings Human,",
      "Hi Boss,",
      "Hi Gov(ernor),",
    ];
    const randomPick = Math.floor(Math.random() * greetings.length);
    return greetings[randomPick];
  }

  randomFarewell() {
    const farewells = [
      "* BopBip *",
      "Peace.",
      "Sayonara.",
      "Your humble servant.",
      "I will be back.",
    ];
    const randomPick = Math.floor(Math.random() * farewells.length);
    return farewells[randomPick];
  }
}
