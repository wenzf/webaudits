import { roundToTwoDigits } from "./utils"


export function convert_abuseipdb_obj(abipdb_response: Record<string, unknown>) {
    if (abipdb_response?.data) {
        const data: any = abipdb_response.data
        const abuseConfidenceScore = data?.abuseConfidenceScore
        const reports = data?.totalReports
        const ndu = data?.numDistinctUsers
        const country_code = data?.countryCode
        const usage_type = data?.usageType
        const abipdb_trust = roundToTwoDigits((100 - abuseConfidenceScore) / 100)

        return { abipdb_trust, reports, ndu, country_code, usage_type }
    } else {
        return null
    }
}