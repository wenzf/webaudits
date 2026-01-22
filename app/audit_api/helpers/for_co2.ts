import { co2 } from "@tgwf/co2";
import getCountryISO3 from "country-iso-2-to-3";
import { getProperty } from 'dot-prop';
import { score_by_percentiles } from "./calculate_scores_by_stats";
import { co2_percentiles } from "../data";
import { additional_green_isps } from '../data'


export  function convert_co2(
    raw_response_object: Record<string, unknown>): {
        co2_gi_dc: number,
        co2_per_visit: number,
        co2_rating: string,
        co2_score: number
    } {
    const alpha2 = getProperty(raw_response_object, 'audit_data_points.abipdb.country_code')
    const transferSize = getProperty(raw_response_object, 'audit_data_points.lh.resource_size')
    const greenHosting = getProperty(raw_response_object, 'temp.modified_greenhosting.green')
    const lhr_long_cache_ttl = getProperty(raw_response_object, 'audit_data_points.lh.long_cache_ttl')
    const co2PerVisit = new co2({ model: "swd", version: 4, rating: true })

    let res_emissions: any
    const countryIsoAlpha3 = getCountryISO3(alpha2)

    try {
        res_emissions = co2PerVisit.perVisitTrace(
            transferSize ?? 0,
            greenHosting ?? false,
            {
                dataReloadRatio: lhr_long_cache_ttl,
                firstVisitPercentage: 0.7,
                returnVisitPercentage: 0.3,
                gridIntensity: {
                    dataCenter: { country: countryIsoAlpha3 },
                }
            });
    } catch (err) {
        res_emissions = err
    }

    const co2_per_visit = res_emissions?.co2?.total
    const co2_gi_dc = res_emissions?.variables?.gridIntensity?.dataCenter?.value
    const co2_rating = res_emissions?.co2?.rating

    const co2_score = score_by_percentiles(
        res_emissions?.co2?.total,
        co2_percentiles.data,
        false
    )

    return {
        co2_gi_dc,
        co2_per_visit,
        co2_rating,
        co2_score
    }
}


export  function update_green_hosting(raw_response_object: Record<string, unknown>) {
    const res_abuseipdb_v2_domain = getProperty(raw_response_object,
        'res_abuseipdb_v2.data.domain')
    const res_greenhosting = raw_response_object?.res_greenhosting
    const green_isps = additional_green_isps.data

    if (res_abuseipdb_v2_domain
        && typeof res_greenhosting === "object") {
        for (let i = 0; i < green_isps.length; i += 1) {
            const isp = green_isps[i]
            if (isp.domain === res_abuseipdb_v2_domain) {
                return { ...res_greenhosting, ...isp }
            }
        }
    }
    return res_greenhosting
}