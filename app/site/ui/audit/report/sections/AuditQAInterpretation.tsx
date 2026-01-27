import { LvlHeader } from "~/site/ui/core/other/text_elements";
import { titleToAnchor } from "~/site/utils/urls";
import { generateAuditSummary } from "../create_report_text";
import { decimalToScore } from "~/site/utils/numbers";
import { formatTimestamp } from "~/site/utils/time";
import { useParams } from "react-router";
import { langByParam } from "~/common/shared/lang";


export default function AuditQAInterpretation({
    locTxt, auditResult,
    allStatsData
}: {
    locTxt: Record<string, any>,
    allStatsData: any,
    auditResult: PageAuditResult,
}) {
    const { lang } = useParams()
    const { lang_html } = langByParam(lang)

    const summaries = generateAuditSummary({
        score_main: decimalToScore(auditResult.score),
        score_e: decimalToScore(auditResult.score_e),
        score_s: decimalToScore(auditResult.score_s),
        score_o: decimalToScore(auditResult.score_o),
        score_c: decimalToScore(auditResult.score_c)
    },
        {
            main: allStatsData!.stats_main.boxPlot,
            e: allStatsData!.stats_e.boxPlot,
            c: allStatsData!.stats_c.boxPlot,
            o: allStatsData!.stats_o.boxPlot,
            s: allStatsData!.stats_s.boxPlot,
        },
        locTxt.report_text
    )

    const meta_title = locTxt.page.meta_title.replace('{{domain}}', auditResult.domain)
    const meta_description = locTxt.page.meta_description
        .replace('{{domain}}', auditResult.domain)
        .replace('{{date}}', formatTimestamp(auditResult.created_at, lang_html)?.readable)
        + summaries.find((it) => it.key === "main")?.a

    const faqItemsOfOtherSections: { q: string, a: string, key: string }[] = [
        {
            q: locTxt.table_clean.tcl_co2_per_visit.replace('{{domain}}',
                auditResult?.domain ?? ''),
            a: locTxt.table_clean.tcl_co2_per_visit_val?.replace('{{number}}',
                Math.round(auditResult.audit_data_points.co2.co2_per_visit
                    * 1000_000) / 1_000),
            key: 'co2pervisit'
        },
        {
            q: locTxt.table_clean.tcl_co2_rating.replace('{{domain}}',
                auditResult.domain),
            a: auditResult.audit_data_points.co2.co2_rating,
            key: 'rating'
        },
        {
            q: locTxt.table_clean.tcl_is_green.replace('{{domain}}',
                auditResult.domain),
            a: auditResult.audit_data_points.gh.is_green
                ? locTxt?.aria_labels_and_titles?.true?.aria_label
                : locTxt?.aria_labels_and_titles?.false?.aria_label,
            key: 'greenenergy'
        }
    ]


    return (
        <>
            <title>{meta_title}</title>
            <meta name="description" content={meta_description} />
            <section
                itemProp="mainEntity" itemScope itemType="https://schema.org/FAQPage"
                data-position={titleToAnchor(locTxt.sidebar_labels.sl_qa)}
                id={titleToAnchor(locTxt.sidebar_labels.sl_qa)}
                className="my-12 pt-12"
            >
                <LvlHeader
                    itemProp="name"
                    content={locTxt?.audit_section_titles.ast_qa}
                    lvl={0}
                    anchorLink={titleToAnchor(locTxt.sidebar_labels.sl_qa)}
                />

                <div className="pt-12 flex flex-col gap-4">
                    {summaries.map(({ q, a, key }) => (
                        <details className="b_1 reg ri items-center wrap-break-word" key={key} itemProp="mainEntity"
                            itemScope itemType="https://schema.org/Question">
                            <summary className="p-2 cursor-pointer" itemProp="name">
                                {q.replace('{{domain}}', auditResult.domain)}</summary>
                            <div className="p-2" itemProp="acceptedAnswer"
                                itemScope itemType="https://schema.org/Answer">
                                <div className="font-medium" itemProp="text">
                                    {a}
                                </div>
                            </div>
                        </details>
                    ))}
                </div>

                {faqItemsOfOtherSections.map(({ q, a, key }) => (
                    <span key={key} itemProp="mainEntity" itemScope itemType="https://schema.org/Question">
                        <meta itemProp="name" content={q.replace('{{domain}}', auditResult.domain)} />
                        <span itemProp="acceptedAnswer" itemScope itemType="https://schema.org/Answer">
                            <meta itemProp="text" content={a} />
                        </span>
                    </span>
                ))}

            </section>
        </>
    )
}