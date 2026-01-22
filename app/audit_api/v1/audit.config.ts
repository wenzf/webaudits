import { convert_co2, update_green_hosting } from "~/audit_api/helpers/for_co2"
import {
    create_webrisk_confidence_score,
    extract_webrisk_threat_types
} from "~/audit_api/helpers/for_webrisk"
import { get_item_with_fallback, getDomainFromURL, sum_of_arr_of_obj_numbs } from "~/audit_api/helpers/utils"
import {
    create_composite_score, create_subscore_requests,
    create_subscore_weight
} from "~/audit_api/helpers/calculate_scores_by_stats"
import is_root_page, { convert_crux } from "~/audit_api/helpers/for_crux"
import { convert_abuseipdb_obj } from "~/audit_api/helpers/for_abuseipdb"
// import calculate_ssl_score from "../helpers/for_ssl"
import { check_after_data_gathering } from "../helpers/check_after_data_gathering"


// update audit after 1 month
export const CONFIG_AUDIT_RENEWAL_INTERVAL_IN_MS = 24 * 60 * 60 * 1000 * 30
// export const CONFIG_AUDIT_RENEWAL_INTERVAL_IN_MS = 24 * 60 * 60 ; // <-- dev

export const CONFIG_API_TIMEOUT_IN_MS = 110_000;

export const CONFIG_URL_API_WEBRISK = "https://webrisk.googleapis.com/v1/uris:search"
export const CONFIG_URL_API_ABUSEIPDB = "https://api.abuseipdb.com/api/v2/check"
export const CONFIG_URL_API_GREENCHECK = "https://api.thegreenwebfoundation.org/api/v3/greencheck/"
export const CONFIG_URL_API_PAGESPEED = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"


// 3000 requests / 24h
export const CONFIG_API_LIMIT_DURATION = 24 * 60 * 60 * 1000
export const CONFIG_API_LIMIT_NUMBER = 3_000

/**
 * PAGE AUDIT
 * for db entries primary key `page`
 * configuration of extracting and converting data from APIs or own calls
 */
export const audit_response_strucs_1: AuditResponseStruc[] = [
    {
        get: null, // dot-prop key
        set: "pk", // dot-prop key
        method: "func",
        func: () => "page",
        iteration_step: 0
    },
    {
        get: null,
        set: "created_at",
        method: "func",
        func: () => Date.now(),
        iteration_step: 0
    },
    {
        get: null,
        set: "audit_about.audit_version",
        method: "func",
        func: () => "0.1",
        iteration_step: 0
    },
    {
        get: "res_pagespeed_v5.lighthouseResult.runWarnings",
        set: "audit_about.lh_run_warnings",
        method: "get_set",
        iteration_step: 0
    },
    {
        get: "res_pagespeed_v5.lighthouseResult.lighthouseVersion",
        set: "audit_about.lighthouse_version",
        method: "get_set",
        iteration_step: 0
    },
    {
        get: "res_http_info_v1.meta",
        set: "audit_data_points.page_content",
        method: "get_set",
        iteration_step: 0
    },
    {
        get: "res_pagespeed_v5.lighthouseResult.finalDisplayedUrl",
        set: "audit_data_points.is_root_page",
        method: "func",
        func: is_root_page,
        iteration_step: 0
    },
    {
        get: "res_pagespeed_v5.lighthouseResult.finalDisplayedUrl",
        set: "domain",
        method: "func",
        func: getDomainFromURL,
        iteration_step: 0
    },
    //  CrUX
    {
        get: "res_pagespeed_v5.lighthouseResult.audits.cumulative-layout-shift.numericValue",
        set: "audit_data_points.lh.cumulative_layout_shift_score",
        method: "get_set",
        iteration_step: 0
    },
    {
        get: "res_pagespeed_v5.lighthouseResult.audits.server-response-time.numericValue",
        set: "audit_data_points.lh.experimental_time_to_first_byte",
        method: "get_set",
        iteration_step: 0
    },
    {
        get: "res_pagespeed_v5.lighthouseResult.audits.first-contentful-paint.numericValue",
        set: "audit_data_points.lh.first_contentful_paint_ms",
        method: "func",
        func: get_item_with_fallback(-1),
        iteration_step: 0
    },
    {
        get: "res_pagespeed_v5.lighthouseResult.audits.interaction-to-next-paint.numericValue",
        set: "audit_data_points.lh.interaction_to_next_paint",
        method: "get_set",
        iteration_step: 0
    },
    {
        get: "res_pagespeed_v5.lighthouseResult.audits.largest-contentful-paint.numericValue",
        set: "audit_data_points.lh.largest_contentful_paint_ms",
        method: "func",
        func: get_item_with_fallback(-1),
        iteration_step: 0
    },
    {
        get: "res_pagespeed_v5.lighthouseResult.categories.performance.score",
        set: "audit_data_points.lh.performance",
        method: "func",
        func: get_item_with_fallback(0),
        iteration_step: 0
    },
    // {
    //     get: "res_http_info_v1.http_observatory.score",
    //     set: "audit_data_points.csp",
    //     method: "get_set",
    //     //   func: evaluateCSP,
    //     iteration_step: 0
    // },
    {
        get: "res_pagespeed_v5.lighthouseResult.categories.accessibility.score",
        set: "audit_data_points.lh.accessibility",
        method: "get_set",
        iteration_step: 0
    },
    {
        get: "res_pagespeed_v5.lighthouseResult.categories.seo.score",
        set: "audit_data_points.lh.seo",
        method: "get_set",
        iteration_step: 0
    },
    {
        get: "res_pagespeed_v5.lighthouseResult.categories.best-practices.score",
        set: "audit_data_points.lh.best_practices",
        method: "get_set",
        iteration_step: 0
    },
    {
        get: "res_http_info_v1.ipv4",
        set: "audit_data_points.ipv4",
        method: "get_set",
        iteration_step: 0
    },
    // removed / too large base64 objects - possibly store in a S3
    // {
    //     get: "res_pagespeed_v5.lighthouseResult.fullPageScreenshot.screenshot",
    //     set: "screenshot",
    //     method: "get_set",
    //     iteration_step: 0
    // },
    {
        get: "res_pagespeed_v5.lighthouseResult.finalDisplayedUrl",
        set: "final_url",
        method: "get_set",
        iteration_step: 0
    },
    //----
    {
        get: "res_http_info_v1.http_observatory",
        set: "audit_data_points.http_observatory",
        method: "get_set",
        iteration_step: 0
    },
    {
        get: 'res_abuseipdb_v2',
        set: 'audit_data_points.abipdb',
        method: "func",
        func: convert_abuseipdb_obj,
        iteration_step: 0
    },
    {
        get: "res_pagespeed_v5.lighthouseResult.audits.network-requests.details.items",
        set: "audit_data_points.lh.resource_size",
        method: "func",
        func: sum_of_arr_of_obj_numbs('resourceSize'),
        iteration_step: 0
    },
    {
        get: "res_pagespeed_v5.lighthouseResult.audits.cache-insight.score",
        set: "audit_data_points.lh.long_cache_ttl",
        method: "get_set",
        iteration_step: 0
    },
    {
        get: "res_pagespeed_v5.lighthouseResult.audits.resource-summary.details.items.0.requestCount",
        set: "audit_data_points.lh.request_count",
        method: "get_set",
        iteration_step: 0
    },
    {
        get: "res_pagespeed_v5.lighthouseResult.audits.resource-summary.details.items",
        set: "audit_data_points.lh.resources",
        method: "get_set",
        iteration_step: 0
    },
    {
        get: "res_pagespeed_v5.loadingExperience",
        set: "audit_data_points.lh.crux_page",
        method: "func",
        func: convert_crux('page'),
        iteration_step: 0
    },
    {
        get: "res_pagespeed_v5.originLoadingExperience",
        set: "audit_data_points.lh.crux_origin",
        method: "func",
        func: convert_crux('origin'),
        iteration_step: 0
    },
    {
        get: "*",
        set: "temp.modified_greenhosting",
        method: "func",
        func: update_green_hosting,
        iteration_step: 0
    },
    {
        get: "res_web_risk_v1",
        set: "temp.res_web_risk_v1",
        method: "get_set",
        iteration_step: 0
    },

    // SECOND ROUND, CHECK FOR MISSING ITEMS, CLEAN UP

    {
        // the object isn't returns null values if iteration_step is 1
        // maybe bc garbage collection
        get: "*",
        set: "audit_about.lh_data_warnings",
        method: "func",
        func: check_after_data_gathering,
        iteration_step: 0 // <-- !
    },
    // THIRD ROUND, DIGEST DATA FROM FIRST ROUND AND CREATE TEMPORARY VALUES
    {
        get: "*",
        set: "audit_data_points.co2",
        method: "func",
        func: convert_co2,
        iteration_step: 2
    },
    {
        get: "temp.modified_greenhosting.green",
        set: "audit_data_points.gh.is_green",
        method: "get_set",
        iteration_step: 2
    },
    {
        get: "temp.modified_greenhosting.supporting_documents",
        set: "audit_data_points.gh.docs",
        method: "get_set",
        iteration_step: 2
    },
    {
        get: "temp.res_web_risk_v1",
        set: "audit_data_points.webrisk.trust",
        method: "func",
        func: create_webrisk_confidence_score,
        iteration_step: 2
    },
    {
        get: "temp.res_web_risk_v1",
        set: "audit_data_points.webrisk.threat_types",
        method: "func",
        func: extract_webrisk_threat_types,
        iteration_step: 2
    },
    {
        get: "*",
        set: "audit_data_points.global_rank.weight",
        method: "func",
        func: create_subscore_weight,
        iteration_step: 2
    },
    {
        get: "*",
        set: "audit_data_points.global_rank.requests",
        method: "func",
        func: create_subscore_requests,
        iteration_step: 2
    },
    // FOURTH ROUND, COMPOSE SUB SCORES
    {
        get: "*",
        set: "score_e",
        method: "func",
        func: create_composite_score('score_e'),
        iteration_step: 3
    },
    {
        get: "*",
        set: "score_c",
        method: "func",
        func: create_composite_score('score_c'),
        iteration_step: 3
    },
    {
        get: "*",
        set: "score_o",
        method: "func",
        func: create_composite_score('score_o'),
        iteration_step: 3
    },
    {
        get: "*",
        set: "score_s",
        method: "func",
        func: create_composite_score('score_s'),
        iteration_step: 3
    },
    // FIFTH ROUND, FINAL SCORE
    {
        get: "*",
        set: "score",
        method: "func",
        func: create_composite_score('score'),
        iteration_step: 4
    },
    // LAST ROUND, CLEAN UP OBJECT STORED TO DB
    {
        get: null,
        set: "temp",
        method: "delete",
        iteration_step: 4
    }
]


export const audit_archive_strucs_1: AuditResponseStruc[] = [
    /**
     * PAGE AUDIT HISTORY
     * for db entries with primary key `page-archive`
     */
    {
        get: null,
        set: "pk",
        method: "func",
        func: () => "page-archive",
        iteration_step: 0
    },
    {
        get: "sk",
        set: "sk",
        method: "get_set",
        iteration_step: 0
    },
    {
        get: "score",
        set: "score",
        method: "get_set",
        iteration_step: 0
    },
    {
        get: null,
        set: "count",
        method: "func",
        func: () => 1,
        iteration_step: 0
    },
    {
        get: "created_at",
        set: "archive.0.0",
        method: "get_set",
        iteration_step: 0
    },
    {
        get: "score",
        set: "archive.0.1",
        method: "get_set",
        iteration_step: 0
    },
    {
        get: "score_c",
        set: "archive.0.2",
        method: "get_set",
        iteration_step: 0
    },
    {
        get: "score_e",
        set: "archive.0.3",
        method: "get_set",
        iteration_step: 0
    },
    {
        get: "score_o",
        set: "archive.0.4",
        method: "get_set",
        iteration_step: 0
    },
    {
        get: "score_s",
        set: "archive.0.5",
        method: "get_set",
        iteration_step: 0
    },
]