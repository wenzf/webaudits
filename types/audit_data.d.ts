// process

type AuditResponseStruc = {
    get: string | null
    set: string
    method: "func" | "get_set" | "delete"
    func?: (props?: any) => void
    iteration_step: number
}

type APIErrorResponse = {
    err: "FETCH_429" | "FETCH_CATCH" | "LIMIT" | "NOT_ALLOWED" | "CATCH"
    details: unknown
    origin: string
}

interface RateLimitResult {
    isAllowed: boolean;
    currentCount: number;
    limitPerDuration: number;
}

// API data


interface APIResponse {
    status: 200 | 404 | 500
    dataType: "page-audit" | "stats" | "page-archive"
    retrieved: number
    data?: PageAuditResult | PageAuditResultCompact
}


// webrisk
type WebRiskThreatType = 'MALWARE'
    | 'SOCIAL_ENGINEERING'
    | 'UNWANTED_SOFTWARE'
    | 'SOCIAL_ENGINEERING_EXTENDED_COVERAGE'

interface WebRiskThreat {
    threatTypes: WebRiskThreatType[]
    expireTime: string
}

interface WebRiskApiResponse {
    threat?: WebRiskThreat
}

// CrUX

type CrUXMetricTypes = "CUMULATIVE_LAYOUT_SHIFT_SCORE"
    | "EXPERIMENTAL_TIME_TO_FIRST_BYTE"
    | "FIRST_CONTENTFUL_PAINT_MS"
    | "INTERACTION_TO_NEXT_PAINT"
    | "LARGEST_CONTENTFUL_PAINT_MS"

type CrUXCategory = 'FAST' | 'AVERAGE' | 'SLOW'

type CrUXDistribution = { min: number, max?: number, proportion: number }

type CrUXMetricItem = {
    category: CrUXCategory
    distributions: CrUXDistribution[]
    percentile: number
}

type CrUXResponse = {
    id?: string
    initial_url: string
    origin_fallback?: boolean
    overall_category?: CrUXCategory
    metrics?: {
        CUMULATIVE_LAYOUT_SHIFT_SCORE: CrUXMericItem
        FIRST_CONTENTFUL_PAINT_MS: CrUXMericItem
        LARGEST_CONTENTFUL_PAINT_MS: CrUXMericItem
    }
} | null

type AuditCrUXMetric = {
    type: CrUXMetricTypes
    score_category: CrUXCategory
    distribution: CrUXDistribution[]
    score_linear: Score
    percentile: number
}

type AuditCrUXInternal = {
    overall_linear: Score
    overall: CrUXCategory
    crux_metrics: AuditCrUXMetric[]
}

// csp

interface CSPAnalysis {
    score: 0 | 0.2 | 0.5 | 0.8 | 1
    rating: "Strict" | "Moderate" | "Weak" | "Critical: No CSP Found" | "Very Weak"
    violations: string[]
}

// gobal rank stats

interface GlobalRankStats {
    score: Score,
    stats: {
        client: "mobile" | "desktop"
        data: { p: number, v: number }[]
        is_root_page: boolean
        date: string
        source: { link: string, title: string }[]
        type: "page_weight" | "total_requests"
    }
}


// observatory 

interface Cookie {
    name: string
    value: string
    secure?: boolean
    httpOnly?: boolean
    sameSite?: 'Strict' | 'Lax' | 'None'
    domain?: string
    path?: string
}

interface ObservatoryPartialResult {
    name: string
    pass: boolean
    scoreModifier: number
    result: string
//    description: string;
}

interface ObservatoryResult {
    score: number;
    http_observatory_score: number
    grade: string
    tests: ObservatoryPartialResult[]
    testsPassed: number
    testsFailed: number
}

interface HTTPInfoResult {
    url: string;
    ipv4: string | null
    meta: {
        meta_title: string | null
        meta_description: string | null
    };
    http_observatory: ObservatoryResult
}

// results

type Score = number // between 0-1

interface PageAuditResultCompact {
    pk: "page"
    sk: string
    created_at: number
    score: Score
    score_e: Score
    score_c: Score
    score_o: Score
    score_s: Score
}

interface PageAuditResult extends PageAuditResultCompact {
    audit_about: {
        audit_version: string
        lighthouse_version: string
        lh_run_warnings: string[]
        lh_data_warnings: string[]
    }
    final_url: string
    domain: string
    audit_data_points: {
        abipdb: {
            abipdb_trust: Score
            country_code: string
            usage_type: string
            ndu: number
            reports: number
        },
        http_observatory: ObservatoryResult,
        lh: {
            performance: Score
            best_practices: Score
            seo: Score
            accessibility: Score
            resource_size: number
            request_count: number
            long_cache_ttl: number
            crux_page: AuditCrUXInternal | null
            crux_origin: AuditCrUXInternal | null
            resources: {
                transferSize: number,
                requestCount: number,
                label: "Total" | "Script" | "Document" | "Font" | "Other" | "Stylesheet" | "Image"
                | "Media" | "Third-party"
                resourceType: "total" | "script" | "document" | "font" | "other" | "stylesheet"
                | "image" | "media" | "third-party"
            }[],
            cumulative_layout_shift_score: number
            experimental_time_to_first_byte: number
            first_contentful_paint_ms: number
            largest_contentful_paint_ms: number
        },
        webrisk: {
            trust: Score
            threat_types: WebRiskThreatType[]
        },
        co2: {
            co2_gi_dc: number
            co2_per_visit: number
            co2_rating: string
            co2_score: Score
        },
        gh: {
            is_green: boolean
            docs?: { id: number, link: string, title: string }[]
        },
        global_rank: {
            weight: GlobalRankStats
            requests: GlobalRankStats
        }
        page_content: {
            meta_title?: string
            meta_description?: string
        } | null,
        is_root_page: boolean
        has_ssl: 0 | 1
        csp: CSPAnalysis
        ipv4: string | null
    }
    temp?: {
        modified_greenhosting: unknown
        res_web_risk_v1: WebRiskApiResponse
    }
}

type PageAuditArchiveEntry = [
    number,  //  AUDIT_TIME,
    Score,  //  SCORE,
    Score,  //  SCORE_C,
    Score,  //  SCORE_E,
    Score,  //  SCORE_O,
    Score   //  score_s
]

type StatsEntry = [
    number, // min
    number, // max
    number, // median
    number, // p10
    number, // p25
    number, // p75
    number, // p90
    number, // lowerFence
    number, // upperFence
    number, // mean
    number  // n
]

interface PageAuditArchive {
    created_at: number
    pk: "page-archive"
    sk: string
    score: Score
    count: number
    archive: PageAuditArchiveEntry[]
}

type PageStats = {
    pk: string
    sk: string
    created_at: number
    total_count: number
    score_main: number[] // distribution of scores 0 - 100
    score_e: number[]
    score_c: number[]
    score_s: number[]
    score_o: number[]
    stats_score_main: StatsEntry
    stats_score_c: StatsEntry
    stats_score_e: StatsEntry
    stats_score_o: StatsEntry
    stats_score_s: StatsEntry
}

