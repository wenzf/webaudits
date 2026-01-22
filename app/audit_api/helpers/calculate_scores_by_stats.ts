import { getProperty } from 'dot-prop';
import { web_almanac } from '../data'
import { roundToTwoDigits } from './utils';
import * as score_composition_v1 from '../v1/score_composition_v1.json'


export function score_by_percentiles(
    inputValue: number,
    percentileData: { p: number, v: number }[],
    useQuantiles: boolean // percentile or linear interpolation
): Score {
    const data = percentileData.sort((it) => it.p)
    const minValue = data[0].v
    const maxValue = data[data.length - 1].v

    if (inputValue <= minValue) {
        return 1.0;
    }

    if (inputValue >= maxValue) {
        return 0.0;
    }

    if (!useQuantiles) {
        const normalizedValue = (inputValue - minValue) / (maxValue - minValue);

        return 1.0 - normalizedValue;

    } else {
        for (let i = 0; i < data.length - 1; i++) {
            const p1 = data[i]
            const p2 = data[i + 1]

            if (inputValue >= p1.v && inputValue < p2.v) {
                const Q1 = p1.p / 100
                const Q2 = p2.p / 100
                const fraction = (inputValue - p1.v) / (p2.v - p1.v)
                const Q_result = Q1 + fraction * (Q2 - Q1)
                return roundToTwoDigits(1.0 - Q_result)
            }
        }
    }

    // fallback
    return 0.0;
}



export function score_by_crux_distribution(cruxResult: CrUXMetricItem): Score {
    // score from CrUX result
    const distributions = cruxResult.distributions
    const percentileValue = cruxResult.percentile

    let totalWeightedTime = 0

    // min/max vala of the first and last bins for scaling
    const fastMax = distributions[0]?.max ?? 10
    const slowMin = distributions[distributions.length - 1]?.min ?? 25
    const slowMax = 4 * slowMin

    for (let i = 0; i < distributions.length; i+=1) {
        const dist = distributions[i];

        let min = dist.min
        let max = dist.max

        if (i === distributions.length - 1 && max === undefined) {
            max = slowMax
        }

        // mid of the bin
        const midpoint = max !== undefined ? (min + max) / 2 : min
        totalWeightedTime += midpoint * dist.proportion
    }

    const pFast = distributions[0]?.proportion ?? 0
    const pAverage = distributions[1]?.proportion ?? 0

    const dScore = (1.0 * pFast) + (0.5 * pAverage) // slow is weighted 0


    const fastBoundary = fastMax // i.e. 10
    const slowBoundary = slowMin // i.e. 25
    const range = slowBoundary - fastBoundary // i.e. 15

    let pScore: number

    if (percentileValue <= fastBoundary) {
        //  <= 10
        pScore = 1.0
    } else if (percentileValue >= slowBoundary) {
        //  >= 25
        pScore = 0.0
    } else {
        //  between the boundaries (10 < V < 25)
        // linear scaling: 1 - ((V - 10) / 15)
        pScore = 1.0 - ((percentileValue - fastBoundary) / range)
    }

    const compositeIndex = (0.5 * dScore) + (0.5 * pScore)
    return Math.max(0, Math.min(1, compositeIndex))
}


export function create_subscore_weight(second_iteration_data: Record<string, unknown>) {
    const is_root_page = getProperty(second_iteration_data, 'audit_data_points.is_root_page')
    const transferSize = getProperty(second_iteration_data, 'audit_data_points.lh.resource_size')
    const stats = web_almanac.data.find((it) => it.type === "page_weight"
        && it.is_root_page === is_root_page)
    if (!stats) return null
    const score = score_by_percentiles(Math.round((transferSize ?? 0) / 1024), stats.data, true)
    return {
        score, stats
    }
}


export function create_subscore_requests(second_iteration_data: Record<string, unknown>) {
    const is_root_page = getProperty(second_iteration_data, 'audit_data_points.is_root_page')
    const transferSize = getProperty(second_iteration_data, 'audit_data_points.lh.request_count')
    const stats = web_almanac.data.find((it) => it.type === "total_requests"
        && it.is_root_page === is_root_page)
    if (!stats) return null
    const score = score_by_percentiles(Math.round(transferSize ?? 0), stats.data, true)
    return {
        score, stats
    }
}

// final scores
export const create_composite_score = (key: string) => (
    second_iteration_data: Record<string, unknown>) => {
    const score_config = score_composition_v1.data.find((it) => it.key === key)
    const score_namespace = score_config?.key
    const score_parts = score_config?.parts

    if (
        typeof score_namespace === "string"
        && Array.isArray(score_parts)
        && score_parts?.length
    ) {
        let scorePointsTotal = 0
        let flag = false

        for (let i = 0; i < score_parts.length; i += 1) {
            const { path, weight } = score_parts[i]

            const part_value = getProperty(second_iteration_data, path)

            if (part_value === null || part_value === undefined) {
                flag = true
                break
            } else {
                const w_value = part_value * (weight / 100)
                scorePointsTotal += w_value
            }
        }

        if (flag) return null

        const score = roundToTwoDigits(scorePointsTotal)
        return score
    } else {
        return null
    }
}
