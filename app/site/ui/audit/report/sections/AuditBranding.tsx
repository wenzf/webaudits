import { useLoaderData } from "react-router";
import { LvlHeader } from "~/site/ui/core/other/text_elements";

import { safeUrl, titleToAnchor } from "~/site/utils/urls";


export default function AuditBranding({
    auditResult }: { auditResult: PageAuditResult }) {
    const { locTxt } = useLoaderData()
    if (!auditResult.audit_data_points.page_content) return null
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
                                        {auditResult.audit_data_points.page_content.favicon_url && (
                                            <tr><th>Favicon</th>
                                                <td>
                                                    <img
                                                        alt={`Favicon ${locTxt.branding.br_meta_title}`}
                                                        className="w-6 h-auto"
                                                        loading="lazy"
                                                        src={safeUrl(
                                                            auditResult.final_url,
                                                            auditResult.audit_data_points.page_content.favicon_url
                                                        )} />
                                                </td>
                                            </tr>
                                        )}
                                        {auditResult.audit_data_points.page_content.og_image_url && (
                                            <tr><th>{locTxt.branding.br_og_image}</th>
                                                <td>
                                                    <img
                                                        alt={`og:image ${locTxt.branding.br_meta_title}`}
                                                        loading="lazy"
                                                        className="max-w-3xl w-auto  max-h-52"
                                                        src={safeUrl(
                                                            auditResult.final_url,
                                                            auditResult.audit_data_points.page_content.og_image_url
                                                        )} />
                                                </td>
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