import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons"
import { Link, useRouteLoaderData } from "react-router"

import VisxBoxPlot9010 from "~/site/ui/charts/visx_box_plot"
import { getDomainFromURL } from "~/site/utils/urls"


export default function AuditStatsHttpArchive(
    hasDetailedDataBreakdown: TreeNode["hasDetailedDataBreakdown"] & {
        pageDomain: string
    }) {
    const { locTxt } = useRouteLoaderData('site/routes/pages/audits_ecos_v1_id')
    if (!hasDetailedDataBreakdown) return null

    const { boxPlotStats: { data, width, height, markerValue } } = hasDetailedDataBreakdown
    const stats = hasDetailedDataBreakdown.stats!

    return (
        <div className="mt-12 flex gap-4 items-start flex-wrap lg:flex-nowrap">
            <div className="overflow-auto">
                <table className="table_1 md:w-2/3">
                    <caption>
                        {locTxt.audit_comparison_http_archive[hasDetailedDataBreakdown?.markerLabel]}
                    </caption>
                    <tbody>
                        <tr>
                            <th className="flex gap-2 items-center">
                                {hasDetailedDataBreakdown.pageDomain}
                                <div className="w-3 h-3 bg-neutral-500" />
                            </th>
                            <td colSpan={2}>{markerValue}</td>
                        </tr>
                        <tr>
                            <th rowSpan={5}>{locTxt.elements.table_score_comparison.tsc_distribution}</th>
                            <th>{locTxt.elements.table_score_comparison.tsc_p90}</th><td>{data.p90}</td>
                        </tr>
                        <tr><th>{locTxt.elements.table_score_comparison.tsc_p75}</th><td>{data.p75}</td></tr>
                        <tr><th>{locTxt.elements.table_score_comparison.tsc_p50}</th><td>{data.p50}</td></tr>
                        <tr><th>{locTxt.elements.table_score_comparison.tsc_p25}</th><td>{data.p25}</td></tr>
                        <tr>
                            <th>{locTxt.elements.table_score_comparison.tsc_p10}</th><td>{data.p10}</td>
                        </tr>
                        {stats && (
                            <>
                                <tr>
                                    <th rowSpan={4}>
                                        {locTxt.audit_comparison_http_archive.cha_data}
                                    </th>
                                    <th>{locTxt.audit_comparison_http_archive.cha_time}</th>
                                    <td>{stats.date}</td>
                                </tr>
                                <tr>
                                    <th>{locTxt.audit_comparison_http_archive.cha_client}</th>
                                    <td>{locTxt.audit_comparison_http_archive[stats.client]}</td>
                                </tr>
                                <tr>
                                    <th>{locTxt.audit_comparison_http_archive.cha_is_root}</th>
                                    <td>{stats.is_root_page
                                        ? <CheckIcon aria-label={locTxt?.aria_labels_and_titles?.true?.aria_label} />
                                        : <Cross2Icon aria-label={locTxt?.aria_labels_and_titles?.false?.aria_label} />}
                                    </td>
                                </tr>
                                <tr>
                                    <th>{locTxt.audit_comparison_http_archive.cha_sources}</th>
                                    <td className="md_1">{stats.source.length ? (
                                        <ul>
                                            {stats.source.map((it, ind) => (
                                                <li key={ind}>
                                                    <Link target="_blank"
                                                        rel="noopener noreferrer"
                                                        to={it.link}>
                                                        {getDomainFromURL(it.link)}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null}
                                    </td></tr>
                            </>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="p-1 md:w-1/3">
                <VisxBoxPlot9010
                    width={width}
                    height={height}
                    data={hasDetailedDataBreakdown.boxPlotStats.data}
                    markerValue={markerValue}
                    locTxt={locTxt}
                />
            </div>
        </div>
    )
}