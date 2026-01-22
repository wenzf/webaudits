import { Resource } from "sst";
import { CONFIG_API_TIMEOUT_IN_MS, CONFIG_URL_API_ABUSEIPDB } from "../v1/audit.config";


export default async function get_abuseipdb_v2(ipAddress: string) {
    const api_url = new URL(CONFIG_URL_API_ABUSEIPDB)
    const params = new URLSearchParams()
    params.set('ipAddress', ipAddress)
    params.set('key', Resource.api_key_abuse_ipdb.value)
    api_url.search = params.toString()
    const signal = AbortSignal.timeout(CONFIG_API_TIMEOUT_IN_MS)
    return fetch(api_url, { signal })
        .then((it) => it.json())
        .then((res) => {
            if (res?.data) {
                return res
            } else if (res?.errors?.[0].status === 429) {
                return {
                    err: "FETCH_429",
                    details: res,
                    origin: 'abuse_ipdb'
                }
            } else {
                return {
                    err: "FETCH_CATCH",
                    details: res,
                    origin: 'abuse_ipdb'
                }
            }
        }).catch((e) => {
            return {
                err: "FETCH_CATCH",
                details: e,
                origin: 'abuse_ipdb'
            }
        })
}


/**
 * {
  "errors": [
      {
          "detail": "Daily rate limit of 1000 requests exceeded for this endpoint. See headers for additional details.",
          "status": 429
      }
  ]
}
 */