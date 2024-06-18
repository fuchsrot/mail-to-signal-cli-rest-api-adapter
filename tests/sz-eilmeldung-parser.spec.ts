import { expect, test, describe } from "vitest";
import {extractEilmeldung} from '../src/sz-eilmeldung-parser'
import {readFileSync} from 'node:fs'

const eilmeldungMockHtml = readFileSync('./tests/eilmeldung-example.txt', 'utf-8')

 
describe("SZ Eilmeldung parser", () => {
  
  test('should extract Eilmeldung', () => {
    const meldung = extractEilmeldung(eilmeldungMockHtml)
    expect(meldung).toBeDefined()
    expect(meldung!.title).toBe("Netanjahu löst Kriegskabinett auf")
    expect(meldung!.description).toBe("Wenige Tage nach dem Rückzug von Benny Gantz beendet der israelische Premier die Arbeit des Gremiums. Israel wirft der Hisbollah-Miliz eine Verschärfung des Konflikts im Grenzgebiet zu Libanon vor.")
    //expect(meldung!.link).toBe("https://nl-link.sueddeutsche.de/u/nrd.php?p=RMqjfMYdzc_5188_3945029_1_4&ems_l=6783833&d=Mzc5MjkzOTc0%7CUk1xamZNWWR6Yw%3D%3D%7Cd3d3LnN1ZWRkZXV0c2NoZS5kZSUyRnBvbGl0aWslMkZpc3JhZWwta3JpZWctbmV3cy1saXZldGlja2VyLWdhemEtaGlzYm9sbGFoLWxpYmFub24tbHV4LktlckN2UkZYMkdzelp1Uzc2NEpSdHQ%3D%7CJTJCJTJCJTJCX0VpbG1lbGR1bmdfJTJCJTJCJTJCX19OZXRhbmphaHVfbCVDMyVCNnN0X0tyaWVnc2thYmluZXR0X2F1Zl8xNy0wNi0yMDI0XzExJTNBMzclM0EwMQ%3D%3D%7C%7C&_esuh=_11_fd88bc2ef0367b675ed752cbfc0611d9af8983f3b2e49143a29bf809cc340aac")

  })
});