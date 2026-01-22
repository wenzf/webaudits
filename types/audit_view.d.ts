
// tree diagram
interface TreeNode {
    treeDiagramLabel?: string
    sidebarLabel?: string
    score?: number
    weightRelative?: number
    weightAbsolute?: number
    isExpanded?: boolean
    description?: string
    anchorLink?: string
    children?: TreeNode[]
    key: string
    sectionTitle?: string
    sectionDescription?: sring
    hierarchyLevel: number
    tableInfo?: string
    tableCaption?: string
    inAuditReport: boolean
    inNavSidebar: boolean
    inTreeDiagram: boolean
    hasDetailedDataBreakdown?: {
        markerLabel: string
        boxPlotStats: BoxPlot9010Stats
        stats?: {
            client: "mobile" | "desktop"
            data: { p: number, v: number }[]
            is_root_page: boolean
            date: string
            source: { link: string, title: string }[]
            type: "page_weight" | "total_requests"
        }
    },
    hasTransferDataBreakdown?: {
        data_raw: PageAuditResult["audit_data_points"]["lh"]["resources"],
        type: "sizes" | "requests"
    },
    hasHttpObservatoryDataBreakdown?: ObservatoryResult
}

interface ExtendedBoxPlotViolingProps {
    min: number
    max: number
    p10: number
    p90: number
    thirdQuartile: number
    firstQuartile: number
    mean: number
    median: number
    outliers: number[]
    n: number
    x: string
}

interface ExtendedBoxPlotViolinStats {
    binData: Stats["binData"],
    boxPlot: ExtendedBoxPlotViolingProps,
    created_at: number
}

type BoxPlotViolinProps = {
    width: number;
    height: number;
    data: ExtendedBoxPlotViolinStats
    markerValue?: number
};

interface BoxPlot9010Props {
    p10: number
    p25: number
    p50: number
    p75: number
    p90: number
}

interface BoxPlot9010Stats {
    width: number
    height: number
    data: BoxPlot9010Props
    markerValue: number
}

type VisxDonutProps = {
    donutThickness?: number
    width: number,
    height: number,
    margin?: { top: number, right: number, bottom: number, left: number }
    dataDonut: { key: string, label: string, relative: number, absolute: number }[]
    dataPie: { key: string, label: string, relative: number, absolute: number }[]
    dataTotal: { key: string, label: string, relative: number, absolute: number }[]
}


type ViewConfig = {
    key: string,
    section_title: string,
    has_stats?: boolean,
    anchor: string,
    children?: ViewConfig[]
    sidebar_labels: string,
    renderComponent?: React.ReactNode
    child_level: number
    render_only_sidebar?: boolean
    render_body?: boolean
    render_section_title?: boolean
}



interface ReducedAuditData extends Pick<PageAuditResult, "score" | "score_c" | "score_e" | "score_o"
    | "score_s" | "pk" | "sk" | "created_at" | "final_url"> {
    final_url_truncated?: string
    audit_time_readable?: string
    audit_report_url?: string
    domain?: string,
    audit_time_iso?: string
    score_style?: Record<string, string>
}

