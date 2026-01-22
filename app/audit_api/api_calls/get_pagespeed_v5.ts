import { Resource } from "sst"
import { CONFIG_API_TIMEOUT_IN_MS, CONFIG_URL_API_PAGESPEED } from "../v1/audit.config"


export default async function get_pagespeed_v5(url: string) {
    const api_url = new URL(CONFIG_URL_API_PAGESPEED)
    const params = new URLSearchParams()
    params.set('url', url)
    params.set('key', Resource.api_key_google_1.value)
    params.append('category', 'BEST_PRACTICES')
    params.append('category', 'PERFORMANCE')
    params.append('category', 'ACCESSIBILITY')
    params.append('category', 'SEO')
    params.set('strategy', 'MOBILE')
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
                    details: res,
                    origin: 'page_speed'
                }
            } else {
                delete res.lighthouseResult.fullPageScreenshot.screenshot
                return res
            }
        }).catch((e) => {
            return {
                err: "FETCH_CATCH",
                details: e,
                origin: 'page_speed'
            }
        })

}