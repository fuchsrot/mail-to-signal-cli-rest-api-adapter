import { EventEmitter } from "node:events";
import Imap from "imap";
import async from "async";
import { simpleParser } from "mailparser";
import { Stream } from "node:stream";

export interface Options {
  mailbox: string;
  fetchUnreadOnStart: boolean;
  markSeen: boolean;
  imapConfig: Imap.Config;
}

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
    console.log("connected");
  }

  public stop(): void {
    this.imap.end();
  }

  private imapReady(): void {
    console.log("imap ready");
    this.imap.openBox(this.mailbox, false, (error, mailbox) => {
      if (error) {
        this.emit("error", error);
      } else {
        this.emit("server:connected");
        this.emit("mailbox", mailbox);
        if (this.fetchUnreadOnStart) {
          this.parseUnread.call(this);
        }
        const listener = this.imapMail.bind(this);
        this.imap.on("mail", listener);
        this.imap.on("update", listener);
      }
    });
  }

  private imapMail() {
    this.parseUnread.call(this);
  }

  private parseUnread() {
    const self = this;
    self.imap.search(["UNSEEN"], (error: Error, results: number[]) => {
      if (error) {
        self.emit("error", error);
      } else if (results.length > 0) {
        async.each(
          results,
          (result: number) => {
            let f: Imap.ImapFetch = self.imap.fetch(result, {
              bodies: "",
              markSeen: self.markSeen,
            });
            f.on("message", (msg: Imap.ImapMessage, seqno: number) => {
              let attrs: Imap.ImapMessageAttributes;
              msg.on("attributes", (a) => {
                attrs = a;
              });
              msg.on(
                "body",
                async (
                  stream: NodeJS.ReadableStream,
                  info: Imap.ImapMessageBodyInfo,
                ) => {
                  let parsed = await simpleParser(stream as unknown as Stream); //TODO
                  self.emit("mail", parsed, seqno, attrs);
                  self.emit("headers", parsed.headers, seqno, attrs);
                  self.emit(
                    "body",
                    {
                      html: parsed.html,
                      text: parsed.text,
                      textAsHtml: parsed.textAsHtml,
                    },
                    seqno,
                    attrs,
                  );
                  if (parsed.attachments.length > 0) {
                    //TODO attachements
                  }
                },
              );
            });
            f.once("error", (error: Error | undefined | null) => {
              if (error) {
                self.emit("error", error);
              }
            });
          },
          (error: Error | undefined | null) => {
            if (error) {
              self.emit("error", error);
            }
          },
        );
      }
    });
  }

  private imapClose(): void {
    this.emit("server:disconnected");
  }

  private imapError(error: Error): void {
    if (error) {
      this.emit("error", error);
    }
  }
}
