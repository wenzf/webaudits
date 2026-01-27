import clsx from "clsx";
import { useParams } from "react-router";
import { langByParam } from "~/common/shared/lang";

import { decimalToScore } from "~/site/utils/numbers";
import VisxViolinPlot from "../../../charts/visx_violin_plot";
import { formatTimestamp } from "~/site/utils/time";
import { valueToRgb } from "~/site/utils/colors";
import UrlWithLinebreaks from "~/site/ui/core/other/urlWithLInebreaks";


export default function AuditStatsTransferDistribution({
    statsData,
    thisScore,
    styleOptions = { horizontalWidthRatio: '1/4' },
    pageDomain,
    locTxt
}: {
    statsData: ExtendedBoxPlotViolinStats,
    thisScore?: number,
    styleOptions?: { horizontalWidthRatio: "1/3" | '1/4' }
    pageDomain?: string
    locTxt: Record<string, any>
}) {
    const { lang } = useParams()
    const { lang_html } = langByParam(lang)

    return (
        <div className={'my-8'}>
            <figure className="flex flex-col justify-between md:flex-row gap-4 mt-8">
                <figcaption className={clsx("overflow-auto ", {
                    'md:w-2/3': styleOptions.horizontalWidthRatio === '1/3',
                    'md:w-3/4': styleOptions.horizontalWidthRatio === '1/4',
                })}>
                    <table className="table_1"                    >
                        <caption>{locTxt.elements.table_score_comparison.tsc_caption}</caption>
                        <tbody>
                            {(pageDomain && thisScore !== undefined) && (
                                <tr>
                                    <th colSpan={2} className="wrap-break-word">
                                        <UrlWithLinebreaks url={pageDomain} />
                                        <span
                                            style={{ backgroundColor: `rgba(${valueToRgb(thisScore, 0, 1)} / 0.85)` }}
                                            className="inline-flex ml-2 w-3 h-3"
                                        />
                                    </th>
                                    <td className="font-mono">{decimalToScore(thisScore)}</td>
                                </tr>
                            )}

                            <tr>
                                <th colSpan={2}>{locTxt.elements.table_score_comparison.tsc_mean}
                                    <span
                                        style={{ backgroundColor: `rgba(${valueToRgb(statsData.boxPlot?.mean, 0, 100)} / 0.85)` }}
                                        className="inline-flex ml-2 w-3 h-3 rounded-full"
                                    />
                                </th>
                                <td className="font-mono">{statsData.boxPlot?.mean}</td>
                            </tr>
                            <tr>
                                <th rowSpan={5}>{locTxt.elements.table_score_comparison.tsc_distribution}</th>
                                <th>{locTxt.elements.table_score_comparison.tsc_p90}</th>
                                <td className="font-mono">{statsData.boxPlot.p90}</td>
                            </tr>
                            <tr>
                                <th>{locTxt.elements.table_score_comparison.tsc_p75}</th>
                                <td className="font-mono">{statsData.boxPlot.thirdQuartile}</td>
                            </tr>
                            <tr>
                                <th>{locTxt.elements.table_score_comparison.tsc_p50}</th>
                                <td className="font-mono">{statsData.boxPlot.median}</td>
                            </tr>
                            <tr>
                                <th>{locTxt.elements.table_score_comparison.tsc_p25}</th>
                                <td className="font-mono">{statsData.boxPlot.firstQuartile}</td>
                            </tr>
                            <tr>
                                <th>{locTxt.elements.table_score_comparison.tsc_p10}</th>
                                <td className="font-mono">{statsData.boxPlot.p10}</td>
                            </tr>
                            <tr>
                                <th rowSpan={2}>{locTxt.elements.table_score_comparison.tsc_data}</th>
                                <th>{locTxt.elements.table_score_comparison.tsc_last_update}</th>
                                <td>
                                    {formatTimestamp(statsData.created_at, lang_html, {
                                        year: "2-digit", month: "numeric", day: "numeric",
                                        hour: "numeric", minute: "numeric"
                                    }, "Europe/London")?.readable}
                                </td>
                            </tr>
                            <tr>
                                <th>{locTxt.elements.table_score_comparison.tsc_n}</th>
                                <td className="font-mono">{statsData.boxPlot?.n}</td>
                            </tr>
                        </tbody>
                    </table>
                </figcaption>
                <div className={clsx({
                    'md:w-1/3': styleOptions.horizontalWidthRatio === '1/3',
                    'md:w-1/4': styleOptions.horizontalWidthRatio === '1/4',
                })}>
                    <VisxViolinPlot
                        aria_label={locTxt?.elements?.aria_labels_and_titles?.statistical_violin_boxplot?.aria_label}
                        title={locTxt?.elements?.aria_labels_and_titles?.statistical_violin_boxplot?.title}
                        data={statsData}
                        width={400}
                        height={550}
                        markerValue={thisScore !== undefined ? decimalToScore(thisScore) : undefined}
                    />
                </div>
            </figure>
        </div>
    )
}