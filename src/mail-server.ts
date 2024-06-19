import { EventEmitter } from "node:events";
import Imap from "imap";
import { simpleParser } from "mailparser";

export interface Options {
  mailbox: string;
  fetchUnreadOnStart: boolean;
  markSeen: boolean;
  imapConfig: Imap.Config;
}

const streamToString = (stream: NodeJS.ReadableStream): Promise<string> => {
  const chunks: any[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
};

export class MailListener extends EventEmitter {
  private imap: Imap;

  private mailbox: string;
  private fetchUnreadOnStart: boolean;
  private markSeen: boolean;

  constructor(option: Options) {
    super();
    this.mailbox = option.mailbox;
    this.markSeen = option.markSeen;
    this.fetchUnreadOnStart = option.fetchUnreadOnStart;
    this.imap = new Imap(option.imapConfig);
    this.imap.once("ready", this.imapReady.bind(this));
    this.imap.once("close", this.imapClose.bind(this));
    this.imap.on("error", this.imapError.bind(this));
  }

  public start(): void {
    this.imap.connect();
  }

  public stop(): void {
    this.imap.end();
  }

  private imapReady(): void {
    this.imap.openBox(this.mailbox, false, (error, mailbox) => {
      if (error) {
        this.emit("error", error);
      } else {
        this.emit("server:connected");
        if (this.fetchUnreadOnStart) {
          this.parseUnread.call(this);
        }
        const listener = this.parseUnread.bind(this);
        this.imap.on("mail", listener);
        this.imap.on("update", listener);
      }
    });
  }

  private parseUnread() {
    const self = this;
    this.imap.search(["UNSEEN"], async (error: Error, results: number[]) => {
      if (error) {
        this.emit("error", error);
      } else if (results.length > 0) {
        for (const result in results) {
          const source = results[result];
          console.log(result);
          const fetch: Imap.ImapFetch = this.imap.fetch(source, {
            bodies: "",
            markSeen: self.markSeen,
          });
          fetch.on("message", (message: Imap.ImapMessage, seqno: number) => {
            message.on("body", async (stream: NodeJS.ReadableStream) => {
              const streamAsString = await streamToString(stream);
              const parsed = await simpleParser(streamAsString);
              this.emit("mail", parsed, seqno);
            });
          });
        }
      }
    });
  }

  private imapClose(): void {
    this.emit("server:disconnected");
  }

  private imapError(error: Error): void {
    this.emit("error", error);
  }
}
