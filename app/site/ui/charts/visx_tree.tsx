import { Group } from '@visx/group';
import { hierarchy, Tree } from '@visx/hierarchy';
import { LinkVerticalStep } from '@visx/shape';
import VisxPieScoreMeter from './visx_pie_score_meter';
import { useNavigate } from 'react-router';
import { decimalToScore } from '~/site/utils/numbers';
import { titleToAnchor } from '~/site/utils/urls';
import clsx from 'clsx';


export const composeTreeNodes = (tree: TreeNode, locs: Record<string, Record<string, string>>) => {
    let outp: any = {
        treeDiagramLabel: locs.tree_diagram_labels[tree.treeDiagramLabel!],
        score: decimalToScore(tree.score!),
        weightRelative: tree.weightRelative,
        anchorLink: titleToAnchor(locs.sidebar_labels[tree.sidebarLabel!]),
        key: tree.key,
        sectionTitle: tree.sectionTitle,
        inTreeDiagram: tree.inTreeDiagram,
        inAuditReport: tree.inAuditReport
    }
    if (tree?.weightAbsolute !== undefined) outp = {
        ...outp, weightAbsolute: tree.weightAbsolute
    }
    if (tree?.children?.length) {
        outp = {
            ...outp,
            children: tree.children.map((it) => composeTreeNodes(it, locs))
        }
    }
    return outp as TreeNode
}


const defaultMargin = { top: 70, left: 30, right: 30, bottom: 70 };


export type LinkTypesProps = {
    width: number;
    height: number;
    margin?: { top: number; right: number; bottom: number; left: number };
    treeNodes: TreeNode
};


export default function VisxTree({
    width: totalWidth,
    height: totalHeight,
    margin = defaultMargin,
    treeNodes,
    locTxt,
    with_anchor_links = true
}: LinkTypesProps & { locTxt: Record<string, Record<string, any>>, with_anchor_links?: boolean }) {
    const navigate = useNavigate()

    const innerWidth = totalWidth - margin.left - margin.right;
    const innerHeight = totalHeight - margin.top - margin.bottom;

    let origin: { x: number; y: number };
    let sizeWidth: number;
    let sizeHeight: number;

    origin = { x: 0, y: 0 };
    sizeWidth = innerWidth;
    sizeHeight = innerHeight;

    const data = treeNodes

    return totalWidth < 10 ? null : (
        <div className='overflow-x-auto w-full bg-white/50 dark:bg-black/50 ring ring-neutral-300/50 dark:ring-neutral-700/50'>

            <svg
                className='max-w-full min-w-3xl w-full h-auto'
                width={totalWidth}
                height={totalHeight}
                viewBox={`0 0 ${totalWidth} ${totalHeight}`}
                aria-label={locTxt.aria_labels_and_titles.score_tree_diagram.aria_label}
            >
                <title>{locTxt.aria_labels_and_titles.score_tree_diagram.title}</title>
                <rect width={totalWidth} height={totalHeight}
                    className='fill-white dark:fill-black'
                />

                <Group top={margin.top} left={margin.left}>
                    <Tree
                        root={hierarchy(data, (d) => d.children)}
                        size={[sizeWidth, sizeHeight]}
                        separation={(a, b) => (a.parent === b.parent ? 1 : 0.5) / a.depth}
                    >
                        {(tree) => (
                            <Group top={origin.y} left={origin.x}>
                                {tree.links()
                                    .filter((it) => it.target.data.inTreeDiagram === true)
                                    .map((link, i) => (
                                        <LinkVerticalStep
                                            percent={0.4}
                                            key={i}
                                            data={link}
                                            className='stroke-neutral-300 dark:stroke-neutral-700'
                                            strokeWidth="2"
                                            fill="none"
                                        />
                                    ))}

                                {tree.descendants().map((node, key) => {
                                    let top: number;
                                    let left: number;
                                    top = node.y;
                                    left = node.x;

                                    if (!node.data.inTreeDiagram) return null

                                    return (
                                        <Group
                                            top={node.depth === 0 ? top - 20 : top - 45}
                                            left={left - 35}
                                            key={key}>

                                            {(node.data?.weightRelative || node.data?.weightAbsolute) ? (
                                                <>
                                                    <rect
                                                        className="fill-white/50 dark:fill-black/50"
                                                        y={node.data.weightAbsolute ? -45 : -30}
                                                        height={node.data.weightAbsolute ? 40 : 25}
                                                        width={70}
                                                    />

                                                    <text
                                                        fontFamily="'Ubuntu Sans Mono Variable', monospace"
                                                        y={node.data.weightAbsolute ? -30 : -15}
                                                        x={35}
                                                        textAnchor='middle'
                                                        className='fill-neutral-800 dark:fill-neutral-200 text-base md:text-xs lg:text-[10px]'
                                                    >
                                                        {node.depth !== 0 && (
                                                            <>
                                                                <tspan x={35}>
                                                                    {node.data.weightRelative}%
                                                                </tspan>
                                                                <tspan x={35} dy={15}>
                                                                    {node.data.weightAbsolute
                                                                        ? ` (${node.data.weightAbsolute}%)`
                                                                        : null}
                                                                </tspan>
                                                            </>
                                                        )}
                                                    </text>
                                                </>
                                            ) : null}

                                            <VisxPieScoreMeter
                                                aria_label={locTxt.aria_labels_and_titles?.score_half_donut?.aria_label}
                                                title={locTxt.aria_labels_and_titles?.score_half_donut?.title}
                                                svgProps={{
                                                    className: "rounded overflow-visible",
                                                }}
                                                width={70}
                                                figCaption={node.data.treeDiagramLabel}
                                                score={{ min: 0, max: 100, value: node.data.score! }}
                                            />

                                            <rect
                                                tabIndex={0}
                                                role='link'
                                                aria-label={locTxt.aria_labels_and_titles?.score_half_donut?.aria_label}
                                                onClick={() => with_anchor_links
                                                    ? navigate(`#${node.data.anchorLink}`)
                                                    : {}}
                                                focusable
                                                width={70}
                                                height={70}
                                                className={clsx('fill-transparent stroke-neutral-300 dark:stroke-neutral-700 outline-0', {
                                                    "cursor-pointer hover:fill-neutral-500/30 dark:hover:fill-neutral-500/30 focus:stroke-1 focus:stroke-neutral-900 focus:dark:stroke-neutral-100": with_anchor_links
                                                })}
                                                rx={5}
                                            />
                                        </Group>
                                    );
                                })}
                            </Group>
                        )}
                    </Tree>
                </Group>
            </svg>
        </div>
    );
}