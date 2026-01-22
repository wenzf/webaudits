import { Link } from "react-router";
import clsx from "clsx";

import VisxTree, { composeTreeNodes } from "../../../charts/visx_tree";
import MarkdownWithCustomElements from "~/site/shared/markdown";
import { titleToAnchor } from "~/site/utils/urls";
import { LvlHeader } from "~/site/ui/core/other/text_elements";
import { RecursiveTable } from "~/site/ui/generics/recursive_table";


export default function AuditScoreComposition({
    auditResult,
    treeNodes,
    locTxt
}: {
    auditResult?: PageAuditResult,
    treeNodes: TreeNode
    locTxt: Record<string, Record<string, any>>
}) {
    return (
        <section
            data-position={titleToAnchor(locTxt.sidebar_labels.sl_scores_overview)}
            id={titleToAnchor(locTxt.sidebar_labels.sl_scores_overview)}
            className={clsx("pt-12 vls")}
        >
            <LvlHeader
                content={locTxt.audit_section_titles.ast_composition}
                lvl={0}
                anchorLink={titleToAnchor(locTxt.sidebar_labels.sl_scores_overview)}
            />

            <section data-position={titleToAnchor(locTxt.sidebar_labels.sl_graphic)}
                id={titleToAnchor(locTxt.sidebar_labels.sl_graphic)}
                className={clsx("py-12", {
                    "border-l border-l-neutral-400 dark:border-l-neutral-600": true,
                    "pl-2  md:pl-6 lg:pl-12": true
                })}>
                <LvlHeader
                    content={locTxt.audit_section_titles.ast_composition_graphic}
                    lvl={1}
                    anchorLink={titleToAnchor(locTxt.sidebar_labels.sl_graphic)} />
                <div className="mt-4">
                    <VisxTree
                        locTxt={locTxt}
                        width={900}
                        height={700}
                        treeNodes={
                            composeTreeNodes(treeNodes, locTxt)!
                        } />
                </div>
            </section>

            <section
                data-position={titleToAnchor(locTxt.sidebar_labels.sl_table)}
                id={titleToAnchor(locTxt.sidebar_labels.sl_table)}
                className={clsx("py-12", {
                    "border-l border-l-neutral-400 dark:border-l-neutral-600": true,
                    "pl-2  md:pl-6 lg:pl-12": true
                })}
            >
                <LvlHeader
                    content={locTxt.audit_section_titles.ast_composition_table}
                    lvl={1}
                    anchorLink={titleToAnchor(locTxt.sidebar_labels.sl_table)}
                />
                <div className="overflow-auto mt-4">
                    <div style={{ minWidth: '120rem' }}>
                        <RecursiveTable
                            treeNodes={treeNodes}
                            locs={locTxt}
                            withAnchorLinks
                        />
                    </div>
                </div>
            </section>

            {auditResult ? (
                <section
                    data-position={titleToAnchor(locTxt.sidebar_labels.sl_ad)}
                    id={titleToAnchor(locTxt.sidebar_labels.sl_ad)}
                    className={clsx("pt-12", {
                        "border-l border-l-neutral-400 dark:border-l-neutral-600": true,
                        "pl-2  md:pl-6 lg:pl-12": true
                    })}>

                    <LvlHeader
                        content={locTxt.audit_section_titles.ast_ad}
                        lvl={1}
                        anchorLink={titleToAnchor(locTxt.sidebar_labels.sl_ad)}
                    />
                    <div className="mt-4 md_1">
                        <MarkdownWithCustomElements
                            markup={locTxt.apis_direct.pd_txt_1}
                        />
                        <ul>
                            <li>
                                <Link
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    to="https://pagespeed.web.dev"
                                >
                                    {locTxt.apis_direct.link_label_lh}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    to={`https://pagespeed.web.dev/analysis?url=${encodeURI(auditResult.final_url)}`}
                                >
                                    {locTxt.apis_direct.link_label_lh} ({auditResult?.domain})
                                </Link>
                            </li>
                            <li>
                                <Link
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    to={`https://developer.mozilla.org/en-US/observatory`}
                                >
                                    {locTxt.apis_direct.link_label_obs}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    to={`https://developer.mozilla.org/en-US/observatory/analyze?host=${encodeURI(auditResult.final_url)}`}
                                >
                                    {locTxt.apis_direct.link_label_obs} ({auditResult?.domain})
                                </Link>
                            </li>

                            <li>
                                <Link
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    to={`https://www.abuseipdb.com/`}
                                >
                                    {locTxt.apis_direct.link_label_abipdb}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    to={`https://www.thegreenwebfoundation.org/`}
                                >
                                    {locTxt.apis_direct.link_label_gh}
                                </Link>
                            </li>


                        </ul>
                    </div>
                </section>) : null}


        </section>
    )
}