import https from "https";
import { SendRequest } from "./model";

const host = process.env.SIGNAL_CLI_REST_API_HOST!
const number = process.env.SIGNAL_CLI_REST_API_NUMBER!
const user = process.env.SIGNAL_CLI_REST_API_USER!
const userPass = process.env.SIGNAL_CLI_REST_API_PASS!

const pass = Buffer.from(
  user + ":" + userPass,
).toString("base64");

console.log(pass);

export interface Payload {
  base64_attachments?: string[];
  edit_timestamp?: number;
  mentions?: string;
  message: string;
  number: string;
  quote_author?: string;
  quote_mentions?: string;
  quote_message?: string;
  quote_timestamp?: number;
  recipients?: string[];
  sticker?: string;
  text_mode: "normal";
}

export const sendMessage = (sendRequest: SendRequest) => {
  const payload: Payload = {
    message: sendRequest.message,
    number,
    recipients: sendRequest.recipients,
    text_mode: "normal",
  };

  const body = JSON.stringify(payload);

  const reqOptions: https.RequestOptions = {
    host,
    port: "443",
    path: "/api/v2/send",
    method: "POST",
    headers: {
      Authorization: `Basic ${pass}`,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
    },
  };
  const request = https
    .request(reqOptions, (res) => {
      console.log("statusCode:", res.statusCode);

      res.on("data", (d) => {
        process.stdout.write(d);
      });
    })
    .on("error", (err) => {
      console.log("Error: " + err.message);
    });
  request.write(body);
  request.end();
};
