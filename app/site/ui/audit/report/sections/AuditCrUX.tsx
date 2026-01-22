import { useRouteLoaderData } from "react-router";

import { HistogramWithVariableBins } from "~/site/ui/charts/visx_histogram";
import { LvlHeader } from "~/site/ui/core/other/text_elements";
import MarkdownWithCustomElements from "~/site/shared/markdown";
import { titleToAnchor } from "~/site/utils/urls";


function CrUXItem({ cruxReport, type }: {
    cruxReport: AuditCrUXInternal,
    type: "page" | "origin"
}) {
    const { locTxt } = useRouteLoaderData('site/routes/pages/audits_ecos_v1_id')
    const anchor = titleToAnchor(locTxt?.sidebar_labels[`sl_crux_${type}`])

    return (
        <section
            data-position={anchor}
            id={anchor}
            className="pt-12 border-l border-l-neutral-300 dark:border-l-neutral-700 pl-2  md:pl-6 lg:pl-12"
        >
            <LvlHeader
                content={locTxt?.audit_section_titles[`ast_crux_${type}`]}
                lvl={1}
                anchorLink={anchor}
            />
            <div className='mt-12'>
                <div className='pt-4 w-full md_1 mb-12'>
                    <MarkdownWithCustomElements
                        markup={locTxt?.audit_section_descriptions[`asd_crux_${type}`]}
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="table_1 min-w-5xl">
                        <caption>{locTxt.crux.cr_caption}</caption>

                        <thead>
                            <tr>
                                <th className="w-44">{locTxt.crux.cr_indicator}</th>
                                <th className="">{locTxt.crux.cr_score_crux}</th>
                                <th className="">{locTxt.crux.cr_score_linear}</th>
                                <th className="">{locTxt.crux.cr_value}</th>
                                <th className="w-xl lg:w-2xl">{locTxt.crux.cr_distribution}</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td>{locTxt.crux.cr_overall}</td>
                                <td className="font-mono">{cruxReport.overall}</td>
                                <td className="font-mono">{cruxReport.overall_linear * 100}</td>
                                <td></td>
                                <td></td>
                            </tr>

                            {cruxReport.crux_metrics.map((it, ind) => (
                                <tr key={ind}>
                                    <td className="w-44">
                                        {locTxt.lighthouse_namespaces[it.type]}
                                    </td>
                                    <td className="break-all">
                                        {locTxt.lighthouse_namespaces[it.score_category]}
                                    </td>
                                    <td className="font-mono">
                                        {Math.round(it.score_linear * 100)}
                                    </td>
                                    <td className="font-mono">{it.percentile}</td>
                                    <td className="w-xl lg:w-2xl inline-table">
                                        <HistogramWithVariableBins
                                            indicatorValueEnum={it.score_category}
                                            width={768}
                                            height={432}
                                            barData={it}
                                            locTxt={locTxt}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    )
}


export default function AuditCrUX({
    auditResult
}: { auditResult: PageAuditResult }) {

    const { locTxt } = useRouteLoaderData('site/routes/pages/audits_ecos_v1_id')
    const hasOriginCrux = auditResult?.audit_data_points?.lh?.crux_origin
    const hasPageCrux = auditResult?.audit_data_points?.lh?.crux_page

    if (!hasOriginCrux && !hasPageCrux) return null

    return (
        <section
            data-position={titleToAnchor(locTxt.sidebar_labels.sl_crux_main)}
            id={titleToAnchor(locTxt.sidebar_labels.sl_crux_main)}
            className="my-12 pt-12 mb-36 md:mb-48">

            <LvlHeader content={locTxt.audit_section_titles.ast_crux_main}
                lvl={0}
                anchorLink={titleToAnchor(locTxt.sidebar_labels.sl_crux_main)} />


            <div className='my-12'>

                <div className='pt-4 w-full md_1'>
                    <MarkdownWithCustomElements
                        markup={locTxt?.audit_section_descriptions.asd_crux_main}
                    />
                </div>
            </div>
            {hasPageCrux && <CrUXItem cruxReport={hasPageCrux} type="page" />}
            {hasOriginCrux && <CrUXItem cruxReport={hasOriginCrux} type="origin" />}
        </section>
    )
}