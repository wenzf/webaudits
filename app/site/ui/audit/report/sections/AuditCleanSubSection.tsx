import { Link, useRouteLoaderData } from "react-router";

import { titleToAnchor } from "~/site/utils/urls";
import { LvlHeader } from "~/site/ui/core/other/text_elements";


export default function AuditCleanSubSection({ auditResult }: { auditResult: PageAuditResult }) {
    const { locTxt } = useRouteLoaderData('site/routes/pages/audits_ecos_v1_id')
    return (
        <section
            id={titleToAnchor(locTxt.sidebar_labels.sl_clean_co2)}
            data-position={titleToAnchor(locTxt.sidebar_labels.sl_clean_co2)}
            className={"border-l border-l-neutral-400 dark:border-l-neutral-600 pl-2  md:pl-6 lg:pl-12 my-12"}

        >
            <LvlHeader
            itemProp="name"
                content={locTxt.audit_section_titles.ast_clean_emissions}
                lvl={2}
                anchorLink={titleToAnchor(locTxt.sidebar_labels.sl_clean_co2)}
            />
            <div className="overflow-x-auto">
                <table className="table_1 w-full min-w-3xl">
                    <caption>{locTxt.table_clean.tcl_caption}</caption>
                    <thead>
                        <tr>
                            <th>{locTxt.table_clean.tcl_partial}</th>
                            <th>{locTxt.recursive_table.rt_index}</th>
                            <th>{locTxt.recursive_table.rt_value}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td rowSpan={2}>CO₂</td>
                            <td>{locTxt.table_clean.tcl_co2_per_visit.replace('{{domain}}',
                                auditResult?.domain ?? '')}</td>
                            <td>
                                {locTxt.table_clean.tcl_co2_per_visit_val?.replace('{{number}}',
                                    Math.round(auditResult.audit_data_points.co2.co2_per_visit
                                        * 1000_000) / 1_000)}
                            </td>
                        </tr>
                        <tr>
                            <td>{locTxt.table_clean.tcl_co2_rating.replace('{{domain}}',
                                auditResult.domain)}</td>
                            <td>{auditResult.audit_data_points.co2.co2_rating}</td>
                        </tr>
                        <tr>
                            <th rowSpan={2}>
                                {locTxt.table_clean.tcl_energy_source}
                            </th>
                            <th>{locTxt.table_clean.tcl_is_green.replace('{{domain}}',
                                auditResult.domain)}</th>
                            <td colSpan={1}>
                                {auditResult.audit_data_points.gh.is_green
                                    ? locTxt?.aria_labels_and_titles?.true?.aria_label
                                    : locTxt?.aria_labels_and_titles?.false?.aria_label}
                            </td>
                        </tr>

                        <tr>
                            <th>{locTxt.table_clean.tcl_docs}</th>
                            <td className="md_1">
                                {auditResult.audit_data_points.gh.docs?.length ? (
                                    <ul>
                                        {auditResult.audit_data_points.gh.docs.map((it) => (
                                            <li key={it.id}>
                                                <Link to={it.link}>{it.title}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                ) : null}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    )
}