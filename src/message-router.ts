import { Email, SendRequest } from "./model";

const releaseChannel = process.env.SIGNAL_RELEASE_CHANNEL!;

export function routeEmail(email: Email): SendRequest {
  return {
    recipients: [releaseChannel],
    message: `👋  From\n${email.from}\n\n📩 Message:\n${email.text}`,
  };
}
