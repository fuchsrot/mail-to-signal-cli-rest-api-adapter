export interface Email {
  from: string;
  subject: string;
  text: string;
}

export interface SendRequest {
  recipients: string[];
  message: string;
}
