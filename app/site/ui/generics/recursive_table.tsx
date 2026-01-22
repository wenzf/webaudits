import clsx from "clsx";
import { NavLink } from "react-router";

import { decimalToScore } from "~/site/utils/numbers";
import MarkdownWithCustomElements from '~/site/shared/markdown';
import { titleToAnchor } from "~/site/utils/urls";


export function RecursiveTable({
    treeNodes,
    locs,
    withAnchorLinks = false,
    isChild = false,
    childPosition = 0,
    withValueCol = true
}: {
    treeNodes: TreeNode,
    locs: Record<string, Record<string, string>>,
    withAnchorLinks?: boolean
    isChild?: boolean
    childPosition?: number
    withValueCol?: boolean

}) {
    if (!treeNodes.inAuditReport) return null

    return (
        <table className="table_1 [&_ul]:mb-1">

            {treeNodes?.tableCaption && !isChild && (
                <caption>
                    {locs.table_captions[treeNodes.tableCaption]}
                </caption>
            )}

            {childPosition === 0 ? (
                <thead>
                    <tr>
                        <th className="w-30">{locs.recursive_table.rt_index}</th>
                        {withValueCol && <th className="w-24">{locs.recursive_table.rt_value}</th>}
                        <th className="w-24">{locs.recursive_table.rt_weight}</th>
                        <th className="">
                            {treeNodes.children?.filter((it) => it.inAuditReport)?.length
                                ? locs.recursive_table.rt_sub_index
                                : locs.recursive_table.rt_info}
                        </th>
                    </tr>
                </thead>
            ) : null}

            <tbody>
                <tr>
                    <td className={clsx("font-semibold w-30", {
                        "anchor_link_frame": withAnchorLinks
                    })}>
                        {withAnchorLinks ? (
                            <div className="md_1">
                                <NavLink
                                    className="font-normal"
                                    to={`#${titleToAnchor(locs.sidebar_labels[treeNodes.sidebarLabel!])}`}
                                >
                                    {locs.tree_diagram_labels[treeNodes.treeDiagramLabel!]}
                                </NavLink>
                            </div>
                        ) : locs.tree_diagram_labels[treeNodes.treeDiagramLabel!]}
                    </td>

                    {withValueCol && (<td className={clsx('font-mono text-sm w-24')}>
                        {decimalToScore(treeNodes.score!)}
                    </td>)}


                    <td className={clsx('font-mono text-sm w-24')}>
                        {`${treeNodes.weightRelative}%`}
                        {treeNodes?.weightAbsolute
                            ? ` (${treeNodes?.weightAbsolute}%)`
                            : null}
                    </td>
                    <td className={clsx({ 'inline-table w-full': treeNodes.children?.length })}>
                        {treeNodes?.tableInfo && (
                            <div className='md_1'>
                                <MarkdownWithCustomElements
                                    markup={locs.table_info[treeNodes?.tableInfo] ?? ''}
                                />
                            </div>
                        )}

                        {treeNodes.children?.length ? treeNodes.children.map((it, idx) => (
                            <RecursiveTable
                                childPosition={idx}
                                isChild={true}
                                key={it.key}
                                treeNodes={it}
                                locs={locs}
                                withAnchorLinks={withAnchorLinks}
                                withValueCol={withValueCol}
                            />
                        )
                        ) : null}
                    </td>
                </tr>
            </tbody>
        </table>
    )
}




