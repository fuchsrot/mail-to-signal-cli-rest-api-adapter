import "dotenv/config";
import { ParsedMail } from "mailparser";
import { MailListener } from "./mail-server";
import { sendMessage } from "./signal-cli-rest-api-client";
import { routeEmail } from "./message-router";
import { Email } from "./model";
import logger from "./logger";

logger.info("startup application");

var mailListener = new MailListener({
  mailbox: "INBOX",
  markSeen: false,
  fetchUnreadOnStart: true,
  imapConfig: {
    user: process.env.IMAP_USER!,
    password: process.env.IMAP_PASSWORD!,
    host: process.env.IMAP_HOST!,
    port: 993,
    tls: true,
    //debug: console.log
  },
});

mailListener.start();

mailListener.on("server:connected", function () {
  logger.info("imap server is connected");
});

mailListener.on("mail", function (parsedMail: ParsedMail) {
  logger.info("received mail event");
  try {
    const email: Email = {
      from: parsedMail.from!.value[0].address!,
      text: parsedMail.text!,
      subject: parsedMail.subject || "",
      html: parsedMail.html ? parsedMail.html : undefined,
    };
    logger.info(
      `mail data - from: ${email.from}, subject: ${email.subject}, text-length: ${email.text.length}, html: ${!!email.html}`,
    );
    const sendRequest = routeEmail(email);
    sendMessage(sendRequest);
  } catch (e) {
    logger.error("error while received email was processed", e);
  }
});

mailListener.on("server:disconnected", function () {
  logger.info("imap server is disconnected");
});

mailListener.on("error", function (err) {
  logger.error(err);
});
