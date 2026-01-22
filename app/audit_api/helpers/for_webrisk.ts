import { roundToTwoDigits } from "./utils";


export function create_webrisk_confidence_score(
    response: WebRiskApiResponse
): Score {
    if (response?.threat) {
        const le = response.threat.threatTypes?.length ?? 0
        const raw = le * 25
        return roundToTwoDigits((100 - raw) / 100)
    } else {
        return 1
    }
}


export function extract_webrisk_threat_types(
    response: WebRiskApiResponse
) {
    return response?.threat?.threatTypes ?? []
}