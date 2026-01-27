import { Link, useParams, useRouteLoaderData } from "react-router"

import { decimalToScore } from "~/site/utils/numbers"
import VisxPieScoreMeter from "../../../charts/visx_pie_score_meter"
import AuditStatsTransferDistribution from "./AuditStatsTransferDistribution"
import { truncateString } from "~/site/utils/strings"
import { formatTimestamp } from "~/site/utils/time"
import { langByParam } from "~/common/shared/lang"
import { getDomainFromURL, titleToAnchor } from "~/site/utils/urls"
import { LvlHeader } from "~/site/ui/core/other/text_elements"
import UrlWithLinebreaks from "~/site/ui/core/other/urlWithLInebreaks"
import { MIN_SCORE_S_TO_DISPLAY_URL_AS_LINK } from "../report_configuration_for_view"


export default function AuditSummary({ auditResult, treeNodes, allStatsData }: {
    auditResult: PageAuditResult,
    treeNodes: TreeNode,
    allStatsData: any
}) {
    const { locTxt } = useRouteLoaderData('site/routes/pages/audits_ecos_v1_id')
    const pageDomain = getDomainFromURL(auditResult.final_url)
    const { lang } = useParams()
    const { lang_html } = langByParam(lang)

    const auditTimeObject = formatTimestamp(auditResult.created_at, lang_html)

    return (
        <>
            <article
                itemProp="mainEntity" itemScope itemType="https://schema.org/Report"
                data-position={titleToAnchor(locTxt.sidebar_labels.sl_audit_summary_v1)}
                id={titleToAnchor(locTxt.sidebar_labels.sl_audit_summary_v1)}
                className="my-12"
            >


                <LvlHeader
                    itemProp="name"
                    content={locTxt?.audit_section_titles[treeNodes.sectionTitle!]}
                    lvl={0}
                    anchorLink={titleToAnchor(locTxt.sidebar_labels.sl_audit_summary_v1)}
                />

                <div className="flex flex-col md:flex-row gap-4 mt-12">
                    <div className="w-full md:w-2/3 overflow-auto">
                        <table className="w-full table_1">
                            <caption>
                                {locTxt.table_labels.tl_t_at_a_glance}
                            </caption>
                            <tbody>
                                <tr>
                                    <th className="w-40">
                                        {locTxt.table_labels.tl_url}
                                    </th>
                                    <td colSpan={2} className="md_1"
                                        itemProp="about" itemScope itemType="https://schema.org/WebSite"
                                    >
                                        {auditResult.score_s > MIN_SCORE_S_TO_DISPLAY_URL_AS_LINK ? (
                                            <Link
                                                itemProp="url"
                                                to={auditResult?.final_url}
                                                rel="noreferrer noopener"
                                                target="_blank"
                                            >
                                                <span className="wrap-break-word max-w-full">
                                                    <UrlWithLinebreaks
                                                        url={truncateString(auditResult?.final_url)} />
                                                </span>
                                            </Link>
                                        ) : (
                                            <span className="wrap-break-word max-w-full">
                                                {truncateString(auditResult?.final_url).replaceAll('.', '[.]')}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <th>{locTxt.table_labels.tl_time}</th>
                                    <td className="font-mono" colSpan={2}>
                                        <time
                                            itemProp="datePublished"
                                            dateTime={auditTimeObject?.ISO}>
                                            {auditTimeObject?.readable}
                                        </time>
                                        <meta itemProp="dateCreated" content={auditTimeObject?.ISO} />
                                        <meta itemProp="dateModified" content={auditTimeObject?.ISO} />
                                    </td>
                                </tr>
                                <tr itemProp="additionalProperty"
                                    itemScope itemType="https://schema.org/PropertyValue">
                                    <th rowSpan={5}>{locTxt.table_labels.tl_wsga_score_v1}</th>
                                    <th itemProp="name">{locTxt.table_labels.tl_main_score}</th>
                                    <td colSpan={1}>
                                        <span itemProp="value" className="font-mono">
                                            {decimalToScore(auditResult.score)}
                                        </span>
                                        <meta itemProp="maxValue" content="100" />
                                        <meta itemProp="unitText" content={locTxt.page.schema_unit_text} />
                                    </td>
                                </tr>
                                <tr itemProp="additionalProperty"
                                    itemScope itemType="https://schema.org/PropertyValue">
                                    <th>{locTxt.table_labels.tl_efficient}</th>
                                    <td className="font-mono">

                                        <span itemProp="value" className="font-mono">
                                            {decimalToScore(auditResult.score_e)}
                                        </span>
                                        <meta itemProp="maxValue" content="100" />
                                        <meta itemProp="unitText" content={locTxt.page.schema_unit_text} />
                                    </td>
                                </tr>
                                <tr itemProp="additionalProperty"
                                    itemScope itemType="https://schema.org/PropertyValue">
                                    <th>{locTxt.table_labels.tl_clean}</th>
                                    <td className="font-mono">

                                        <span itemProp="value" className="font-mono">
                                            {decimalToScore(auditResult.score_c)}
                                        </span>
                                        <meta itemProp="maxValue" content="100" />
                                        <meta itemProp="unitText" content={locTxt.page.schema_unit_text} />
                                    </td>
                                </tr>
                                <tr itemProp="additionalProperty"
                                    itemScope itemType="https://schema.org/PropertyValue">
                                    <th>{locTxt.table_labels.tl_open}</th>
                                    <td className="font-mono">
                                        <span itemProp="value" className="font-mono">
                                            {decimalToScore(auditResult.score_o)}
                                        </span>
                                        <meta itemProp="maxValue" content="100" />
                                        <meta itemProp="unitText" content={locTxt.page.schema_unit_text} />
                                    </td>
                                </tr>
                                <tr itemProp="additionalProperty"
                                    itemScope itemType="https://schema.org/PropertyValue">
                                    <th>{locTxt.table_labels.tl_safe}</th>
                                    <td className="font-mono">
                                        <span itemProp="value" className="font-mono">
                                            {decimalToScore(auditResult.score_s)}
                                        </span>
                                        <meta itemProp="maxValue" content="100" />
                                        <meta itemProp="unitText" content={locTxt.page.schema_unit_text} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                    </div>

                    <div className="w-full md:w-1/3">
                        <VisxPieScoreMeter
                            aria_label={locTxt?.aria_labels_and_titles?.score_half_donut?.aria_label}
                            title={locTxt?.aria_labels_and_titles?.score_half_donut?.title}
                            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                            svgProps={{
                                className:
                                    "w-full h-auto ring ring-neutral-200 dark:ring-neutral-800"
                            }}
                            figCaption="ECOS Score"
                            width={400}
                            score={{ value: decimalToScore(auditResult.score), min: 0, max: 100 }}
                        />
                    </div>
                </div>

                <div className="vls">
                    <AuditStatsTransferDistribution
                        statsData={allStatsData.stats_main}
                        thisScore={auditResult.score}
                        styleOptions={{ horizontalWidthRatio: "1/3" }}
                        pageDomain={pageDomain}
                        locTxt={locTxt}
                    />
                </div>

                <span itemProp="author" itemScope
                    itemID="https://webaudits.org/about#contact">
                    <link itemProp="name" href="https://webaudits.org" />
                </span>
                <meta itemProp="identifier" content={auditResult.sk} />
                <meta itemProp="inLanguage" content={lang_html} />
                <meta itemProp="isAccessibleForFree" content="true" />
                <link itemProp="isBasedOn" href="https://webaudits.org/#ecos-analyzer" />

            </article>
        </>
    )
}