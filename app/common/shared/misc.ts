
import { createLangPathByParam, langByLangCode } from "./lang";
import COMMON_CONFIG from "../common.config";
import type { DBBase, PKMainKey, SiteLangs } from "types/site";


// CMS

export function parseJSON(jsonString: string | unknown): object | null {
    if (typeof jsonString !== "string") {
        return null
    }
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        return null
    }
}

export const createPathByPKAndSK = (pk: DBBase["pk"], sk: DBBase["sk"]) => {
    const splitPK = pk.split('#')

    if (splitPK?.length === 2) {
        const lang = splitPK[1] as SiteLangs["lang_code"]
        const docType = splitPK[0] as PKMainKey

        const langParam = langByLangCode(lang).lang_param

        let slug = ''

        const { PAGE_TYPES } = COMMON_CONFIG

        for (let i = 0; i < PAGE_TYPES.length; i += 1) {
            const [, pkMainkey, _sk, urlFragment] = PAGE_TYPES[i]

            if (docType === pkMainkey) {
                if (typeof urlFragment === "string" && _sk === "main" ) {
                    slug = `/${urlFragment}`
                } else if (typeof urlFragment === "string" && _sk === null && sk) {
                    slug = `/${urlFragment}/${sk}`
                } else if (urlFragment === null) {
                    slug = '/'
                }
                break
            }
        }

        return createLangPathByParam(langParam, slug)
    }

    return ''
}