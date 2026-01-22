

import type { SiteLangs } from "types/site"
import SITE_CONFIG from "~/site/site.config"


/**
 * 
 * @description fetch localized text fragments from `/public/locales/<lang>/<loc>` 
 * @param locs namespaces of language files
 * @param lang 
 * @returns parsed JSON ltf
 */

export const getStaticData = async (
    locs: string[],
    lang: SiteLangs["lang_code"]
): Promise<Record<string, string | Record<string, string>>> => {
    if (!locs.length) return {}

    const { SITE_DEPLOYMENT: { DISTRIBUTION_URL } } = SITE_CONFIG
    let domainRoot = `${DISTRIBUTION_URL}/`

    if (process.env.NODE_ENV === "development") {
        domainRoot = "http://localhost:3434/"
    }

    const oneCall = (file: string) => fetch(
        `${domainRoot}locales/${lang}/${file}.json`).then((it) => it.json())
    let jobs: unknown[] = []

    for (let i = 0; i < locs.length; i += 1) {
        jobs = [...jobs, oneCall(locs[i])]
    }

    const res = await Promise.all(jobs)
    const outp: Record<string, string> = Object.assign({}, ...res)

    return outp
}
