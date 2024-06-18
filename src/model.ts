export interface Email {
  from: string;
  subject: string;
  text: string;
  html?: string;
}

export interface SendRequest {
  recipients: string[];
  message: string;
}
