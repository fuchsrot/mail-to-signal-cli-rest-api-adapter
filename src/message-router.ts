import { Email, SendRequest } from "./model";
import {extractEilmeldung, Eilmeldung} from "./sz-eilmeldung-parser"

const releaseChannel = process.env.SIGNAL_RELEASE_CHANNEL!;
const szNewsChannel = process.env.SIGNAL_SZ_NEWS_CHANNEL!;

export function routeEmail(email: Email): SendRequest {
  if (email.from === "eilmeldung@newsletter.sueddeutsche.de") {
    const eilmeldung:Eilmeldung | undefined = extractEilmeldung(email.html!)

    if(!eilmeldung) {
      throw new Error("Couldn't parse SZ News Eilmeldung")
    }

    console.log(eilmeldung)

    return {
      recipients: [szNewsChannel],
      message: `${eilmeldung.title}\n\n${eilmeldung.description}`
    }

  } else {
    return {
      recipients: [releaseChannel],
      message: `👋  From\n${email.from}\n\n📩 Message:\n${email.text}`,
    };
  }
}
