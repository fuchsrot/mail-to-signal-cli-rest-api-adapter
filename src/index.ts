import "dotenv/config";
import { ParsedMail } from "mailparser";
import { MailListener } from "./mail-server";
import { sendMessage } from "./signal-cli-rest-api-client";
import { routeEmail } from "./message-router";
import { Email } from "./model";

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
  console.log("imapConnected");
});

mailListener.on("mail", function (parsedMail: ParsedMail) {
  const email: Email = {
    from: parsedMail.from!.value[0].address!,
    text: parsedMail.text!,
    subject: parsedMail.subject || "",
    html: parsedMail.html ? parsedMail.html : undefined
  };
  const sendRequest = routeEmail(email);
  sendMessage(sendRequest);
});

mailListener.on("mailbox", function (mailbox) {
  console.log("Total number of mails: ", mailbox.messages.total); // this field in mailbox gives the total number of emails
});

mailListener.on("server:disconnected", function () {
  console.log("imapDisconnected");
});

mailListener.on("error", function (err) {
  console.log(err);
});

mailListener.on("headers", function (headers, seqno) {
  // do something with mail headers
});

mailListener.on("body", function (body, seqno) {
  // do something with mail body
});

mailListener.on("attachment", function (attachment, path, seqno) {
  // do something with attachment
});

mailListener.on("mail", function (mail, seqno) {
  // do something with the whole email as a single object
});
