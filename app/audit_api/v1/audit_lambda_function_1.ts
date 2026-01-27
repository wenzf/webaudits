import crypto from 'node:crypto';
import invariant from 'tiny-invariant'
import { Resource } from "sst";

import get_abuseipdb_v2 from "../api_calls/get_abuseipdb_v2"
import get_greencheck_v3 from "../api_calls/get_greencheck_v3"
import get_pagespeed_v5 from "../api_calls/get_pagespeed_v5"
import get_web_risk_v1 from "../api_calls/get_web_risk_v1"
import { cleanUrl } from '../helpers/id_by_url';
import { checkRateLimit, getDynamoDB, putDynamoDBBulk } from '~/common/utils/server/dynamodb.server';
import {
    audit_archive_strucs_1, audit_response_strucs_1,
    CONFIG_API_LIMIT_DURATION,
    CONFIG_API_LIMIT_NUMBER,
    CONFIG_AUDIT_RENEWAL_INTERVAL_IN_MS
} from './audit.config';
import compose_data_by_config from '../helpers/compose_data_by_config';
import { roundToTwoDigits } from '../helpers/utils';
import { get_http_info_v1 } from '../api_calls/get_http_info_v1';
import { check_url_and_get_final } from '../api_calls/check_url_and_get_final';


export const handler = async (event: any) => {
    invariant(Resource.audit_api_secret_1.value)
    invariant(Resource.audit_api_secret_2.value)

    const queryStrings = event?.queryStringParameters
    const rurl = queryStrings.url

    /**
     * Check authorization / if secret is present, allow only requests from loader
     */

    const request_id = queryStrings.requestid
    if (request_id !== Resource.audit_api_secret_2.value) {
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                err: "NOT_ALLOWED",
                errorCollection: [{}]
            })
        };
    }

    const stringToHash = (str: string) => {
        const clean_url = cleanUrl(str)
        const hash = crypto.createHash('sha256');
        hash.update(clean_url, 'utf8');
        const strippedhash = hash.digest('hex').substring(0, 32);

        return strippedhash
    }

    const pageHash = stringToHash(rurl)
    const now = Date.now()

    /**
     * Check if URL has been audited before, if entry in DB exists
     */

    let [
        last_audit,
        last_archive
    ] = await Promise.all([
        getDynamoDB("page", pageHash, "_table_audit_v1"),
        getDynamoDB("page-archive", pageHash, "_table_audit_v1"),
    ])

    /**
     * If entry in DB exists, is last audit is not older than `CONFIG_AUDIT_RENEWAL_INTERVAL_IN_MS`
     */

    if (last_archive
        && last_audit
        && (last_audit?.Item.created_at
            + CONFIG_AUDIT_RENEWAL_INTERVAL_IN_MS) > now
    ) {
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"

            },
            body: JSON.stringify({
                type: 'in_store',
                id: pageHash,
                data: {
                    audit: last_audit.Item,
                    archive: last_archive.Item
                }
            })
        }
    }


    /**
     * Check if URL leads to a website (200)
     * Check final URL in case of redirects
     */

    const url_check_and_final = await check_url_and_get_final(rurl)
    const url_check_and_final_success = url_check_and_final?.success
    const url_check_and_final_status_code = url_check_and_final?.statusCode
    const url_check_and_final_error = url_check_and_final?.error

    if (url_check_and_final_error && !url_check_and_final_success) {
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                err: "FETCH_CATCH",
                errorCollection: [
                    url_check_and_final_error,
                    url_check_and_final_status_code
                ]
            })
        };
    }

    const url_check_and_final_final_url = url_check_and_final?.finalUrl ?? ''
    const pageHash3 = stringToHash(url_check_and_final_final_url)

    /**
     * If URL is 200 but redirected, check if report of redirected URL exists in DB
     * and if last audit is not older than `CONFIG_AUDIT_RENEWAL_INTERVAL_IN_MS`
     */

    if (pageHash3 !== pageHash) {
        [
            last_audit,
            last_archive
        ] = await Promise.all([
            getDynamoDB("page", pageHash3, "_table_audit_v1"),
            getDynamoDB("page-archive", pageHash3, "_table_audit_v1"),
        ])


        if (last_archive
            && last_audit
            && (last_audit?.Item.created_at
                + CONFIG_AUDIT_RENEWAL_INTERVAL_IN_MS) > now
        ) {
            return {
                statusCode: 200,
                headers: {
                    "Content-Type": "application/json"

                },
                body: JSON.stringify({
                    type: 'in_store',
                    id: pageHash3,
                    data: {
                        audit: last_audit.Item,
                        archive: last_archive.Item
                    }
                })
            }
        }

    }

    /**
     * URL is 200 but no entry exists in DB or entry is older than 
     * `CONFIG_AUDIT_RENEWAL_INTERVAL_IN_MS`
     */

    /**
     * Check rate limit
     */

    const rateLimit = await checkRateLimit(
        CONFIG_API_LIMIT_NUMBER,
        CONFIG_API_LIMIT_DURATION,
        true
    )

    if (!rateLimit?.isAllowed) {
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                err: "LIMIT",
                rateLimit,
            })
        };
    }

    /**
     * Conduct audit
     */

    // GET DATA FOR AUDIT
    // first round
    const req_greenhosting = get_greencheck_v3(url_check_and_final_final_url)
    const req_pagespeed_v5 = get_pagespeed_v5(url_check_and_final_final_url)
    const req_web_risk_v1 = get_web_risk_v1(url_check_and_final_final_url)
    const req_get_http_info_v1 = get_http_info_v1(url_check_and_final_final_url)

    const fetch_respones = await Promise.all([
        req_pagespeed_v5,
        req_greenhosting,
        req_web_risk_v1,
        req_get_http_info_v1
    ])

    // check for errors
    let errorCollection: APIErrorResponse[] = []
    for (let i = 0; i < fetch_respones.length; i += 1) {
        if (fetch_respones[i]?.err) {
            errorCollection = [...errorCollection, fetch_respones[i]]
        }
    }
    if (errorCollection?.length) {
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                err: "CATCH",
                errorCollection
            })
        };
    }

    const [
        res_pagespeed_v5,
        res_greenhosting,
        res_web_risk_v1,
        res_http_info_v1
    ] = fetch_respones

    // second round
    // @ts-expect-error checked above
    const req_abuseipdb_v2 = get_abuseipdb_v2(res_http_info_v1?.ipv4 ?? '0.0.0.0' as string)
    const [res_abuseipdb_v2] = await Promise.all([req_abuseipdb_v2])
    await res_abuseipdb_v2

    // main data object of responses
    const res = {
        res_greenhosting,
        res_pagespeed_v5,
        res_web_risk_v1,
        res_abuseipdb_v2,
        res_http_info_v1
    }

    const displayedUrl = res_pagespeed_v5.lighthouseResult.finalDisplayedUrl
    const pageHash2 = stringToHash(displayedUrl)

    /**
     * CALCULATE SCORES
     * ugly workaround: calculating in two iterations after running into issues
     * which are probably related to `dot-prop` in combination with `lambda`
     */

    // first round
    let temp_data: any = {}
    const audit_response = compose_data_by_config(
        res,
        audit_response_strucs_1,
        temp_data
    )

    // second round
    temp_data = {}
    const fresh_archive = compose_data_by_config(
        audit_response,
        audit_archive_strucs_1,
        temp_data
    ) as any

    // page archive
    let putArchive
    if (last_audit && last_archive) {
        const last = last_archive?.Item
        const pk = last?.pk
        const sk = last?.sk
        let prev_score = last?.score
        let prev_count = last?.count
        let prev_archive = last?.archive
        const score_now = fresh_archive.score as number
        let score_sum = (prev_score * prev_count) + score_now
        prev_count += 1
        const new_archive = [...fresh_archive.archive, ...prev_archive]
        const new_score = roundToTwoDigits(score_sum / prev_count)
        putArchive = {
            pk, sk, count: prev_count, archive: new_archive, score: new_score
        }
    } else {
        putArchive = fresh_archive
    }

    const _putArchive = await { ...putArchive, sk: pageHash2 }
    const _auditRes = await { ...audit_response, sk: pageHash2 }

    const putData = await putDynamoDBBulk([
        _auditRes,
        _putArchive
    ], "_table_audit_v1")

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: pageHash2,
            type: "update",
            data: {
                audit: _auditRes,
                archive: _putArchive
            }

        })
    };
}