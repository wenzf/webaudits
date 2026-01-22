export function frequencyStats(frequencies: Uint8ClampedArray) {
    let totalCount = 0
    let totalScore = 0
    let minScore = 0 // Initialize high
    let maxScore = 100   // Initialize low

    let didSetMinScore = false

    for (let _score = 0; _score <= 100; _score += 1) {
        const count = frequencies[_score];
        if (count > 0) {
            totalScore += (_score * count)
            totalCount += count;
            if (!didSetMinScore) {
                minScore = _score
                didSetMinScore = true
            }
            if (_score > maxScore) maxScore = _score
        }
    }

    if (totalCount === 0) {
        return [NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN]
    }

    const N = totalCount;
    const p25Position = Math.ceil(N / 4) // 25th percentile index
    const medianPosition = Math.ceil(N / 2) // 50th percentile index
    const p75Position = Math.ceil(3 * N / 4) // 75th percentile index
    const p90Position = Math.ceil(0.90 * N) // 90th percentile index
    const p10Position = Math.ceil(0.10 * N) // 10th percentile index

    let currentPosition = 0
    let median = NaN
    let p25 = NaN
    let p75 = NaN
    let p90 = NaN
    let p10 = NaN

    for (let score = 0; score <= 100; score += 1) {
        const count = frequencies[score]

        if (count === 0) continue;

        // P90 (90th Percentile)
        if (isNaN(p90) && (currentPosition + count) >= p90Position) {
            p90 = score
        }

        // p75 (Third Quartile)
        if (isNaN(p75) && (currentPosition + count) >= p75Position) {
            p75 = score
        }

        // Median (Second Quartile)
        if (isNaN(median) && (currentPosition + count) >= medianPosition) {
            median = score
        }

        // p25 (First Quartile)
        if (isNaN(p25) && (currentPosition + count) >= p25Position) {
            p25 = score
        }

        // P10 (10th Percentile)
        if (isNaN(p10) && (currentPosition + count) >= p10Position) {
            p10 = score
        }
        // Check if all values have been found to stop early
        if (!isNaN(p10) && !isNaN(p25) && !isNaN(median) && !isNaN(p75) && !isNaN(p90)) {
            break
        }

        // Update the running total position
        currentPosition += count
    }

    const iqr = p75 - p25

    // Lower Fence: p25 - 1.5 * IQR
    const lowerFence = p25 - 1.5 * iqr

    // Upper Fence: p75 + 1.5 * IQR
    const upperFence = p75 + 1.5 * iqr

    const mean = Math.round(totalScore / N)

    return [minScore, maxScore, median, p10, p25, p75, p90, lowerFence, upperFence, mean, N]
}


export function scoreFrequencies(
    store: {
        score_uint8: Uint8ClampedArray
        score_e_uint8: Uint8ClampedArray
        score_c_uint8: Uint8ClampedArray
        score_o_uint8: Uint8ClampedArray
        score_s_uint8: Uint8ClampedArray
    },
    scoreObjects: {
        score: number
        score_e: number
        score_c: number
        score_o: number
        score_s: number,
        created_at: number
        sk: string
    }[]) {

    for (let i = 0; i < scoreObjects.length; i += 1) {
        const so = scoreObjects[i]
        const s = so.score * 100
        const s_e = so.score_e * 100
        const s_c = so.score_c * 100
        const s_h = so.score_s * 100
        const s_o = so.score_o * 100

        store.score_uint8[s] += 1
        store.score_e_uint8[s_e] += 1
        store.score_c_uint8[s_c] += 1
        store.score_s_uint8[s_h] += 1
        store.score_o_uint8[s_o] += 1
    }

    return { store };
}

