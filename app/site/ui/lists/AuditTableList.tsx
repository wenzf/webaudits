import { Link, NavLink, useParams } from "react-router";

import { createLangPathByParam, langByParam } from "~/common/shared/lang";
import { formatTimestamp } from "~/site/utils/time";
import SITE_CONFIG from "~/site/site.config";
import { valueToRgb } from "~/site/utils/colors";
import { decimalToScore } from "~/site/utils/numbers";
import { truncateString } from "~/site/utils/strings";
import { getDomainFromURL } from "~/site/utils/urls";

export default function AuditTableList({
    listData,
    tableCaption,
    locTxt
}: {
    tableCaption: string
    listData: ReducedAuditData[],
    locTxt: Record<string, Record<string, Record<string, string>>>
}) {
    const { lang } = useParams()
    const { lang_html } = langByParam(lang)
    const { PAGE_CONFIG: { NS_AUDITS_LAYOUT, NS_ECOS_V1_LAYOUT } } = SITE_CONFIG

    return (
        <table className="table_1 min-w-5xl">
            <caption>
                {tableCaption}
            </caption>
            <thead>
                <tr>
                    <th scope="col" rowSpan={2}>{locTxt.audit_lists.table_labels.date}</th>
                    <th className="w-36" scope="col" rowSpan={2}>{locTxt.audit_lists.table_labels.domain}</th>
                    <th scope="colgroup" colSpan={5}>{locTxt.audit_lists.table_labels.scores}</th>
                    <th scope="col" rowSpan={2} className="w-64">
                        {locTxt.audit_lists.table_labels.url_page}</th>
                    <th scope="col" rowSpan={2}>{locTxt.audit_lists.table_labels.url_audit_report}</th>
                </tr>
                <tr>
                    <th scope="col">{locTxt.audit_lists.table_labels.score_main}</th>
                    <th scope="col">{locTxt.audit_lists.table_labels.score_e}</th>
                    <th scope="col">{locTxt.audit_lists.table_labels.score_c}</th>
                    <th scope="col">{locTxt.audit_lists.table_labels.score_o}</th>
                    <th scope="col">{locTxt.audit_lists.table_labels.score_s}</th>
                </tr>
            </thead>

            <tbody>
                {listData.map((it) => (
                    <tr key={it.sk + it.created_at}>
                        <td>
                            {formatTimestamp(it.created_at, lang_html, {
                                year: "2-digit", month: "numeric", day: "numeric"
                            }, "Europe/London")?.readable}
                        </td>
                        <td className="break-all min-w-44">{getDomainFromURL(it.final_url)}</td>
                        <td className="font-mono"
                            style={{
                                boxShadow: `inset 0 0 0 1px rgba(${valueToRgb(it.score, 0, 1)} / 0.35)`,
                                backgroundColor: `rgba(${valueToRgb(it.score, 0, 1)} / 0.05)`
                            }}
                        >
                            {decimalToScore(it.score)}
                        </td>
                        <td className="font-mono">{decimalToScore(it.score_e)}</td>
                        <td className="font-mono">{decimalToScore(it.score_c)}</td>
                        <td className="font-mono">{decimalToScore(it.score_o)}</td>
                        <td className="font-mono">{decimalToScore(it.score_s)}</td>
                        <td className="md_1 w-64 overflow-hidden">
                            <Link
                                className="break-all"
                                to={it.final_url}
                                target="_blank"
                                rel="noreferrer noopener nofollow"
                            >
                                {truncateString(it.final_url)}
                            </Link>
                        </td>
                        <td className="md_1">
                            <NavLink
                            className="whitespace-nowrap"
                                viewTransition
                                to={createLangPathByParam(lang,
                                    `/${NS_AUDITS_LAYOUT.path_fragment}/${NS_ECOS_V1_LAYOUT.path_fragment}/${it.sk}`)}>
                                {locTxt.audit_lists.table_labels.to_audit}
                            </NavLink>
                        </td>
                    </tr>
                ))}
            </tbody>

        </table>
    )

}