
 function roundToTwoDigits(numb: number): number {
    const multiplied = numb * 100;
    const rounded = Math.round(multiplied);
    return rounded / 100;
}


export const convertDataArrTo1090BoxPlotProp = (
    arr: { v: number, p: number }[]
): BoxPlot9010Props => {
    const p10 = arr.find((it) => it.p === 10)?.v!
    const p25 = arr.find((it) => it.p === 25)?.v!
    const p50 = arr.find((it) => it.p === 50)?.v!
    const p75 = arr.find((it) => it.p === 75)?.v!
    const p90 = arr.find((it) => it.p === 90)?.v!

    return { p10, p25, p50, p75, p90 }
}


export const createDataForHistogram = (
    arr: { max?: number, min: number, proportion: number }[]
) => {
    const sorted = arr.sort((a, b) => a.min - b.min)
    let scaleEnd = 0
    let scaleStart = Infinity
    let yMax = 0
    let bars: {
        width: number,
        density: number,
        min: number,
        max: number,
        proportion: number
    }[] = []

    let totalDensity = 0

    for (let i = 0; i < sorted.length; i += 1) {
        const entry = sorted[i]
        const { min, proportion } = entry
        if (entry?.min < scaleStart) scaleStart = entry.min
        let max = entry?.max ?? min + Math.round(scaleEnd / (sorted.length - 1));
        if (scaleEnd < max) scaleEnd = max
        const width = max - entry.min

        const density = proportion / width
        totalDensity += density
        if (yMax < density) yMax = density

        bars = [...bars, { max, min, proportion, width, density }]
    }

    const rescale = 1 / totalDensity

    for (let i = 0; i < bars.length; i += 1) {
        bars[i].density *= rescale
    }

    yMax *= rescale
    return { xMax: scaleEnd, bars, xMin: scaleStart, yMax }
}





export const createBinData = (arr: number[]) => {
    const le = arr.length
    let outp: { value: number, count: number }[] = []
    for (let i = 0; i < le; i += 1) {
        outp = [...outp, { value: i, count: arr[i] }]
    }
    return outp
}

export const createBoxBlotData = (arr: number[], label: string) => {

    const [min, max, median, p10, firstQuartile, thirdQuartile, p90, lowerFence, upperFence, mean, n] = arr
    return {
        x: label,
        min, max, median, p10, firstQuartile, thirdQuartile, p90, outliers: [lowerFence, upperFence], mean, n
    }
}



export const createAllStatsData = (pageStats: PageStats) => {
    if (!pageStats?.pk) return null
    const {
        created_at,
        score_main,
        score_e,
        score_c,
        score_s,
        score_o,
        stats_score_main,
        stats_score_e,
        stats_score_c,
        stats_score_s,
        stats_score_o
    } = pageStats
    return {
        stats_main: {
            created_at,
            boxPlot: createBoxBlotData(stats_score_main, 'Main'),
            binData: createBinData(score_main)
        },
        stats_e: {
            created_at,
            boxPlot: createBoxBlotData(stats_score_e, 'Efficiency'),
            binData: createBinData(score_e)
        },
        stats_c: {
            created_at,
            boxPlot: createBoxBlotData(stats_score_c, 'Clean'),
            binData: createBinData(score_c)
        },
        stats_s: {
            created_at,
            boxPlot: createBoxBlotData(stats_score_s, 'Safe'),
            binData: createBinData(score_s)
        },
        stats_o: {
            created_at,
            boxPlot: createBoxBlotData(stats_score_o, 'Open'),
            binData: createBinData(score_o)
        }
    }

}


export const createTransferResourceData = (
    data_raw: PageAuditResult["audit_data_points"]["lh"]["resources"],
    exportType: "requests" | "sizes",
    locs: Record<string, string>
): {
    total: VisxDonutProps["dataTotal"],
    resources: VisxDonutProps["dataDonut"],
    origin: VisxDonutProps["dataPie"]
} => {



    let dataKey: keyof typeof data_raw[0]

    if (exportType === "requests") {
        dataKey = "requestCount"
    } else if (exportType === "sizes") {
        dataKey = "transferSize"
    } else {
        dataKey = "transferSize"
    }
    let sum = data_raw.find((it) => it.resourceType === "total")![dataKey]

    if (exportType === "sizes") sum = Math.round(sum / 1024)
    // for (let i = 0; i < data_raw.length; i += 1) {
    //     totals += data_raw[i][dataKey]
    // }

    let total: VisxDonutProps["dataTotal"] = []
    let resources: VisxDonutProps["dataDonut"] = []
    let origin: VisxDonutProps["dataPie"] = []

    for (let i = 0; i < data_raw.length; i += 1) {


        const item = data_raw[i]
        let val = item[dataKey]

        if (exportType === "sizes") val = Math.round(val / 1024)

        if (item.resourceType === "total") {
            total = [
                ...total,
                {
                    key: item.resourceType,
                    relative: roundToTwoDigits(100 / sum * val),
                    absolute: val,
                    label: locs?.[item.resourceType] ?? item.label
                }
            ]
        } else if (item.resourceType === "third-party") {
            const tpa = val
            const tpr = roundToTwoDigits(100 / sum * tpa)
            const sr = roundToTwoDigits(100 - tpr)
            const sa = sum - tpa
            origin = [
                ...origin,
                {
                    key: item.resourceType,
                    relative: tpr,
                    absolute: val,
                    label: locs?.[item.resourceType] ?? item.label
                },
                {
                    key: item.resourceType,
                    relative: sr,
                    absolute: sa,
                    label: locs?.self ?? item.label
                },
            ]
        } else {
            resources = [
                ...resources,
                {
                    key: item.resourceType,
                    relative: roundToTwoDigits(100 / sum * val),
                    absolute: val,
                    label: locs?.[item.resourceType] ?? item.label
                }
            ]
        }
    }


    return {
        total, resources, origin
    }

}