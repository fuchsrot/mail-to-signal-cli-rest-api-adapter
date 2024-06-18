export interface Eilmeldung {
    title: string,
    description: string,
}

const regex = /.*EMS: TITEL -->([^<]+).*EMS: ARTIKEL DESCRIPTION -->([^<]+)/ms


export const extractEilmeldung = (html: string): Eilmeldung | undefined => {
    const groups = html.match(regex)
    if (groups) {
        return {
            title: groups[1].trim(),
            description: groups[2].trim(),
        }
    }
    return undefined
}