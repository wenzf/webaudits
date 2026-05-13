import { useLoaderData } from "react-router";
import { LvlHeader } from "~/site/ui/core/other/text_elements";

import { titleToAnchor } from "~/site/utils/urls";


export default function AuditBranding({
    auditResult }: { auditResult: PageAuditResult }) {
    const { locTxt } = useLoaderData()

    if (!auditResult.audit_data_points.page_content?.meta_description
        || !auditResult.audit_data_points.page_content?.meta_title) return null
    return (
        <>
            {auditResult.audit_data_points.page_content && (
                <section
                    data-position={titleToAnchor(locTxt.sidebar_labels.sl_branding)}
                    id={titleToAnchor(locTxt.sidebar_labels.sl_branding)}
                    className="my-12 pt-12 mb-36 md:mb-48"
                >
                    <LvlHeader content={locTxt.branding.br_title}
                        lvl={0}
                        anchorLink={titleToAnchor(locTxt.sidebar_labels.sl_branding)}
                    />
                    <div className="overflow-x-auto">
                        <table className="table_1 mt-8 min-w-xl">
                            <caption>{locTxt.branding.br_caption}</caption>
                            <tbody>
                                {auditResult.audit_data_points.page_content && (
                                    <>
                                        <tr>
                                            <th className="w-40">{locTxt.branding.br_meta_title}</th>
                                            <td>{auditResult.audit_data_points.page_content.meta_title}</td>
                                        </tr>
                                        {auditResult.audit_data_points.page_content && (
                                            <tr>
                                                <th>{locTxt.branding.br_meta_description}</th>
                                                <td>{auditResult.audit_data_points.page_content.meta_description}</td>
                                            </tr>
                                        )}



                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}</>
    )
}