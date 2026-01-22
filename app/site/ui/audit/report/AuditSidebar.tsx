import { useRouteLoaderData } from "react-router"
import { useIntersectionTracker } from "~/site/shared/hooks"
import { SidebarLink } from "../../core/sidebar/sidebar_link"


const Audit_composition_menu = ({
    treeNodes,
    sectionsInView,
    showChildren = true
}: {
    treeNodes: TreeNode,
    sectionsInView: string[],
    showChildren?: boolean
}) => {
    const { locTxt } = useRouteLoaderData('site/routes/pages/audits_ecos_v1_id')
    if (!treeNodes.inNavSidebar) return null

    return (
        <li className="pl-3">
            <SidebarLink
                label={locTxt.sidebar_labels[treeNodes.sidebarLabel
                    ?? treeNodes.key]}
                sectionsInView={sectionsInView}
                transformLabelToAnchor
            />

            {showChildren && treeNodes?.children?.length ? (
                <menu>
                    {treeNodes.children.map((it) => (
                        <Audit_composition_menu
                            key={it.key}
                            treeNodes={it}
                            sectionsInView={sectionsInView}
                        />
                    ))}
                </menu>
            ) : null}
        </li>
    )
}


export default function AuditSidebar({ treeNodes }: { treeNodes: TreeNode }) {
    const trackElements = useIntersectionTracker('data-position', {})
    const { locTxt, audit } = useRouteLoaderData('site/routes/pages/audits_ecos_v1_id')
    const hasOriginCrux = audit?.audit_data_points?.lh?.crux_origin
    const hasPageCrux = audit?.audit_data_points?.lh?.crux_page

    return (
        <aside className="sidebar">
            <div className="content_header">
                <div>
                    <span>
                        {locTxt.sidebar_labels.sl_table_of_contents}
                    </span>
                </div>
            </div>
            <nav className="nav_wide"
                aria-label={locTxt.sidebar_labels.sl_table_of_contents}
            >
                <menu>
                    <Audit_composition_menu
                        treeNodes={treeNodes}
                        showChildren={false}
                        sectionsInView={trackElements}
                    />
                    <li className="pl-3">
                        <SidebarLink
                            label={locTxt.sidebar_labels.sl_scores_overview}
                            sectionsInView={trackElements}
                            transformLabelToAnchor
                        />
                        <menu>
                            <li className="pl-3">
                                <SidebarLink
                                    label={locTxt.sidebar_labels.sl_graphic}
                                    sectionsInView={trackElements}
                                    transformLabelToAnchor
                                />
                            </li>
                            <li className="pl-3">
                                <SidebarLink
                                    label={locTxt.sidebar_labels.sl_table}
                                    sectionsInView={trackElements}
                                    transformLabelToAnchor
                                />
                            </li>
                            <li className="pl-3">
                                <SidebarLink
                                    label={locTxt.sidebar_labels.sl_ad}
                                    sectionsInView={trackElements}
                                    transformLabelToAnchor
                                />
                            </li>
                        </menu>
                    </li>
                    <li className="pl-3">
                        <SidebarLink
                            label={locTxt.sidebar_labels.sl_score_categories}
                            sectionsInView={trackElements}
                            transformLabelToAnchor
                        />
                        <menu>
                            {treeNodes.children?.map((it) => (
                                <Audit_composition_menu
                                    treeNodes={it}
                                    key={it.key}
                                    sectionsInView={trackElements}
                                />
                            ))}
                        </menu>
                    </li>
                    <li className="pl-3">
                        <SidebarLink
                            label={locTxt.sidebar_labels.sl_branding}
                            sectionsInView={trackElements}
                            transformLabelToAnchor
                        />
                    </li>
                    {(hasOriginCrux || hasPageCrux) && (
                        <li className="pl-3">
                            <SidebarLink
                                label={locTxt.sidebar_labels.sl_crux_main}
                                sectionsInView={trackElements}
                                transformLabelToAnchor
                            />
                            <menu>
                                {hasPageCrux && (
                                    <li className="pl-3">
                                        <SidebarLink
                                            label={locTxt.sidebar_labels.sl_crux_page}
                                            sectionsInView={trackElements}
                                            transformLabelToAnchor
                                        />
                                    </li>
                                )}
                                {hasOriginCrux && (
                                    <li className="pl-3">
                                        <SidebarLink
                                            label={locTxt.sidebar_labels.sl_crux_origin}
                                            sectionsInView={trackElements}
                                            transformLabelToAnchor
                                        />
                                    </li>
                                )}
                            </menu>
                        </li>
                    )}
                    <li className="pl-3">
                        <SidebarLink
                            label={locTxt.sidebar_labels.sl_history}
                            sectionsInView={trackElements}
                            transformLabelToAnchor
                        />
                    </li>
                    <li className="pl-3">
                        <SidebarLink
                            label={locTxt.sidebar_labels.sl_qa}
                            sectionsInView={trackElements}
                            transformLabelToAnchor
                        />
                    </li>
                    <li className="pl-3">
                        <SidebarLink
                            label={locTxt.sidebar_labels.sl_downloads}
                            sectionsInView={trackElements}
                            transformLabelToAnchor
                        />
                    </li>
                </menu>
            </nav>
        </aside>
    )
}