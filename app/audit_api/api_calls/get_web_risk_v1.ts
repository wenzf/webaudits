import { Resource } from "sst"
import { CONFIG_API_TIMEOUT_IN_MS, CONFIG_URL_API_WEBRISK } from "../v1/audit.config"

// // https://cloud.google.com/web-risk/docs/reference/rest/v1/uris/search

export default async function get_web_risk_v1(url: string) {
    const api_url = new URL(CONFIG_URL_API_WEBRISK)
    const params = new URLSearchParams()
    params.set('uri', url)
    params.append('threatTypes', 'MALWARE')
    params.append('threatTypes', 'SOCIAL_ENGINEERING')
    params.append('threatTypes', 'UNWANTED_SOFTWARE')
    params.append('threatTypes', 'SOCIAL_ENGINEERING_EXTENDED_COVERAGE')
    params.set('key', Resource.api_key_google_1.value)
    api_url.search = params.toString()

    const signal = AbortSignal.timeout(CONFIG_API_TIMEOUT_IN_MS)
    return fetch(api_url, { signal })
        .then((it) => it.json())
        .then((res) => {
            if (res?.error?.code === 429) {
                return {
                    err: "FETCH_429",
                    origin: 'web_risk',
                    details: res
                }
            } else if (res?.error) {
                return {
                    err: "FETCH_CATCH",
                    origin: 'web_risk',
                    details: res
                }
            } else {
                return res
            }

        }).catch((e) => {
            return {
                err: "FETCH_CATCH",
                origin: 'web_risk',
                details: e
            }
        })

}

