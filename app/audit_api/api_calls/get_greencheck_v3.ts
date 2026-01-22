import { CONFIG_API_TIMEOUT_IN_MS, CONFIG_URL_API_GREENCHECK } from "../v1/audit.config";

export default async function get_greencheck_v3(urlString: string) {
    const url = `${CONFIG_URL_API_GREENCHECK}${new URL(urlString).hostname}`
    const signal = AbortSignal.timeout(CONFIG_API_TIMEOUT_IN_MS)

    return fetch(url, { signal })
        .then((it) => it.json())
        .catch((it) => {
            return {
                err: "FETCH_CATCH",
                details: it,
                origin: 'greencheck'
            }
        })
}
