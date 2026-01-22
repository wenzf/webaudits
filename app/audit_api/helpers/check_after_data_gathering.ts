import { getProperty } from 'dot-prop';


/**
 * 
 * @param raw_response_object 
 * @returns about_audit.lh_data_warnings
 */

export function check_after_data_gathering(
    raw_response_object: Record<string, any>
): string[] {
    let lh_data_warnings: any[] = []

    // error, no performance score
    // case: www.misfits.com

    const no_perf_score = "Performance score wasn't created and is set to 0. This will likely affect the result of the efficiency category and the overall score."
    const perf_score: any = getProperty(raw_response_object,
        'res_pagespeed_v5.lighthouseResult.categories.performance.score')

    if (perf_score === null || perf_score === undefined) {
        lh_data_warnings = [...lh_data_warnings, no_perf_score]
        const speedIndexObj: any = getProperty(raw_response_object,
            'res_pagespeed_v5.lighthouseResult.audits.speed-index')
        if (speedIndexObj?.errorMessage) {
            lh_data_warnings = [...lh_data_warnings, speedIndexObj.errorMessage]
        }

        return lh_data_warnings
    }



    return lh_data_warnings
}