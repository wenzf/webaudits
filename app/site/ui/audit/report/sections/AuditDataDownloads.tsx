import { DownloadIcon } from "@radix-ui/react-icons";
import { Link, useRouteLoaderData } from "react-router";

import { LvlHeader } from "~/site/ui/core/other/text_elements";
import MarkdownWithCustomElements from "~/site/shared/markdown";
import { titleToAnchor } from "~/site/utils/urls";


export default function AuditDataDownload({ auditResult }: { auditResult: PageAuditResult, }) {
    const { locTxt } = useRouteLoaderData('site/routes/pages/audits_ecos_v1_id')
    const anchor = titleToAnchor(locTxt.sidebar_labels.sl_downloads)
    const id = auditResult.sk

    const downloadsArr: { locs: { name: string, description: string }, url: string }[] = [
        {
            locs: locTxt.data_downloads.page_audit_compact,
            url: `https://webaudits.org/api/ecos/v1/page-audit/${id}.json`
        },
        {
            locs: locTxt.data_downloads.page_audit_full,
            url: `https://webaudits.org/api/ecos/v1/page-audit/${id}.json?responseType=full`
        },
        {
            locs: locTxt.data_downloads.page_history,
            url: `https://webaudits.org/api/ecos/v1/page-archive/${id}.json`
        },
        {
            locs: locTxt.data_downloads.stats,
            url: `https://webaudits.org/api/ecos/v1/stats.json`
        },
    ]


    return (
        <section
            className="p-1"
            data-position={anchor}
            id={anchor}
            itemProp="mainEntity" itemScope itemType="https://schema.org/Dataset"
        >
            <LvlHeader
                itemProp="name"
                content={locTxt.audit_section_titles.ast_downloads.replace('{{domain}}',
                    auditResult.domain)}
                lvl={0}
                anchorLink={anchor}
            />
            <div className="mt-12 md_1" itemProp="description">

                <MarkdownWithCustomElements
                    markup={locTxt.audit_section_descriptions.asd_downloads}
                />
            </div>
            <div className="md_1">
                <ul>
                    {downloadsArr.map(({ locs: { name, description }, url }, ind) => (
                        <li itemProp="distribution" itemScope
                            itemType="https://schema.org/DataDownload"
                            key={ind}
                        >
                            <div>
                                <span className="font-medium" itemProp="name">{name}</span>:{" "}
                                <span itemProp="description">{description}</span>
                                <Link className="b_1 reg inline-flex justify-center items-center"
                                    itemProp="url"
                                    rel="noopener noreferrer"
                                    to={url}
                                    target="_blank"
                                >
                                    <DownloadIcon aria-label="Download link" />
                                </Link>
                            </div>
                            <link itemProp="contentUrl" href={url} />
                            <meta itemProp="encodingFormat" content="application/json" />
                        </li>
                    ))}
                </ul>
                <p className="text-sm">
                    {locTxt.data_downloads.license}: <Link
                        to="http://creativecommons.org/licenses/by-sa/4.0/"
                        itemProp="license">CC-BY-SA 4.0</Link>.
                </p>
            </div>
            <link itemProp="creator" href="https://webaudits.org/about#contact" />
            <meta itemProp="isAccessibleForFree" content="true" />
        </section>
    )
}


