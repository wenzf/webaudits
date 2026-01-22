import { useRouteLoaderData } from "react-router";
import clsx from 'clsx';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useId } from "react";

import VisxPieScoreMeter from "../../../charts/visx_pie_score_meter";
import { decimalToScore } from "~/site/utils/numbers";
import AuditStatsTransferDistribution from './AuditStatsTransferDistribution';
import AuditStatsHttpArchive from './AuditStatsHttpArchive';
import MarkdownWithCustomElements from '~/site/shared/markdown';
import { titleToAnchor } from "~/site/utils/urls";
import AuditStatsTransferByType from "./AuditStatsTransferByType";
import { LvlHeader } from "~/site/ui/core/other/text_elements";
import { RecursiveTable } from "~/site/ui/generics/recursive_table";
import AuditHttpObservatory from "./AuditHttpObservatory";


export default function RecursiveSectionBase({
    auditResult,
    treeNodes,
    sectionKey,
    children,
    selectNode = true,
    statsData
}: {
    auditResult: PageAuditResult,
    treeNodes: TreeNode,
    sectionKey: string,
    children?: React.ReactNode,
    selectNode?: boolean,
    statsData?: ExtendedBoxPlotViolinStats
}) {
    const { locTxt } = useRouteLoaderData('site/routes/pages/audits_ecos_v1_id')
    const thisNode = selectNode
        ? treeNodes.children?.find((it) => it.key === sectionKey)
        : treeNodes
    const uid = useId()
    if (!thisNode) return null
    if (!thisNode.inAuditReport) return null

    const pageDomain = auditResult.domain
    return (
        <section
            className={clsx("pt-6 border-l border-l-neutral-300 dark:border-l-neutral-700", {
                "pl-2  md:pl-6 lg:pl-12": thisNode.hierarchyLevel! > 0,
                "border-t border-t-neutral-300 dark:border-t-neutral-700 mb-36 md:mb-48":
                    thisNode.hierarchyLevel === 1
            })}
            data-position={titleToAnchor(locTxt.sidebar_labels[thisNode.sidebarLabel ?? thisNode.key])}
            id={titleToAnchor(locTxt.sidebar_labels[thisNode.sidebarLabel ?? thisNode.key])}
        >
            <LvlHeader
                lvl={thisNode.hierarchyLevel!}
                content={locTxt.audit_section_titles[thisNode.sectionTitle!]}
                anchorLink={titleToAnchor(locTxt.sidebar_labels[thisNode.sidebarLabel ?? thisNode.key])}
            />
            <div className='flex flex-col sm:flex-row gap-4 mt-12'>
                <div className='pt-4 w-full md_1'>
                    <MarkdownWithCustomElements
                        markup={locTxt?.audit_section_descriptions[thisNode.sectionDescription]}
                    />
                </div>

                <VisxPieScoreMeter
                    aria_label={locTxt.aria_labels_and_titles?.score_half_donut?.aria_label}
                    title={locTxt.aria_labels_and_titles?.score_half_donut?.title}
                    margin={{ top: 15, right: 15, bottom: 15, left: 15 }}
                    svgProps={{
                        className: clsx("h-auto ring ring-neutral-200 dark:ring-neutral-800 max-w-full bg-white dark:bg-black",
                            {
                                "w-full md:w-1/3": thisNode.hierarchyLevel <= 1,
                                "sm:max-w-32": thisNode.hierarchyLevel > 1
                            })
                    }}
                    figCaption={locTxt.tree_diagram_labels[thisNode.treeDiagramLabel!]}
                    width={400}
                    score={{ value: decimalToScore(thisNode.score!), min: 0, max: 100 }}
                />

            </div>

            {(statsData && thisNode?.hierarchyLevel < 2) ? (
                <AuditStatsTransferDistribution
                    thisScore={thisNode.score}
                    statsData={statsData}
                    pageDomain={pageDomain}
                    locTxt={locTxt}
                />
            ) : null}

            <div className="mt-8 mb-12">
                <Accordion.Root
                    className=""
                    type="single"
                    collapsible
                    
                >
                    <Accordion.Item value={uid}>
                        <Accordion.Header className="flex">
                            <Accordion.Trigger
                                className={"group flex min-h-[45px] flex-1 cursor-pointer items-center justify-between px-2 bg-neutral-50 dark:bg-neutral-950 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded inset-ring inset-ring-neutral-300 dark:inset-ring-neutral-700"}
                            >
                                {locTxt.accordions.used_data}
                                <ChevronDownIcon
                                    width={20} height={20}
                                    className="text-neutral-900 dark:text-neutral-100 transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
                                    aria-hidden
                                />
                            </Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Content>
                            <div className="overflow-x-auto">
                                <div className={clsx('border-l border-l-neutral-300 dark:border-l-neutral-700 ml-[1px]', {
                                    "min-w-7xl": thisNode.hierarchyLevel === 1,
                                    "min-w-5xl": thisNode.hierarchyLevel === 2,
                                    "min-w-2xl": thisNode.hierarchyLevel > 2,
                                })}>
                                    <RecursiveTable
                                        treeNodes={thisNode}
                                        locs={locTxt}
                                    />
                                </div>
                            </div>
                        </Accordion.Content>
                    </Accordion.Item>
                </Accordion.Root>

                {thisNode?.hasDetailedDataBreakdown ? (
                    <AuditStatsHttpArchive
                        pageDomain={pageDomain}
                        boxPlotStats={thisNode.hasDetailedDataBreakdown.boxPlotStats}
                        markerLabel={thisNode.hasDetailedDataBreakdown.markerLabel}
                        stats={thisNode.hasDetailedDataBreakdown.stats}
                    />
                ) : null}

                {thisNode?.hasTransferDataBreakdown ? (
                    <AuditStatsTransferByType
                        type={thisNode.hasTransferDataBreakdown.type}
                        data_raw={thisNode.hasTransferDataBreakdown.data_raw}
                    />
                ) : null}

                {thisNode?.hasHttpObservatoryDataBreakdown ? (
                    <AuditHttpObservatory 
                    locTxt={locTxt}
                    httpObservatoryResult={thisNode?.hasHttpObservatoryDataBreakdown} />
                ) : null}

            </div>

            {thisNode.children?.length ? thisNode.children.map((it) => (
                <RecursiveSectionBase
                    auditResult={auditResult}
                    selectNode={false}
                    key={it.key}
                    treeNodes={it}
                    sectionKey={it.key}
                    statsData={statsData}
                />
            )) : null}

            {children}
        </section>
    )
}