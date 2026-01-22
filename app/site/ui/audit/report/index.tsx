import { useRouteLoaderData } from "react-router";
import { useMemo } from "react";
import clsx from "clsx";

import AuditSummary from "./sections/AuditSummary";
import AuditSidebar from "./AuditSidebar";
import { compose_report_configuration_for_view } from "./report_configuration_for_view";
import AuditScoreComposition from "./sections/AuditScoreComposition";
import RecursiveSectionBase from "./sections/RecursiveSectionBase";
import AuditCleanSubSection from "./sections/AuditCleanSubSection";
import AuditHistory from "./sections/AuditHistory";
import AuditBranding from "./sections/AuditBranding";
import AuditCrUX from "./sections/AuditCrUX";
import { createAllStatsData } from "~/site/utils/data";
import { titleToAnchor } from "~/site/utils/urls";
import { LvlHeader } from "../../core/other/text_elements";
import RequestNewAudit from "./sections/RequestNewAudit";
import AuditQAInterpretation from "./sections/AuditQAInterpretation";
import AuditDataDownload from "./sections/AuditDataDownloads";
import AuditResultWarnings from "./sections/AuditResultWarnings";


export default function AuditReport({
    auditResult,
    pageStats,
    archive
}: {
    auditResult: PageAuditResult,
    pageStats: PageStats
    archive: PageAuditArchive
}) {
    const allStatsData = useMemo(() => createAllStatsData(pageStats), [pageStats])
    const { locTxt } = useRouteLoaderData('site/routes/pages/audits_ecos_v1_id')
    if (auditResult?.score === undefined) return <div>no audit data</div>

    const treeNodes = compose_report_configuration_for_view(auditResult)

    return (
        <div className="pb-12 pt-24 px-1">
            <h1 itemProp="name" className="text-3xl">
                {locTxt.page.h1_fragment.replace('{{domain}}', auditResult.domain)}
            </h1>

            <RequestNewAudit auditResult={auditResult} />

            <AuditResultWarnings auditResult={auditResult} />

            <AuditSummary
                auditResult={auditResult}
                treeNodes={treeNodes}
                allStatsData={allStatsData!}
            />

            <AuditSidebar treeNodes={treeNodes} />


            <AuditScoreComposition
                auditResult={auditResult}
                treeNodes={treeNodes}
                locTxt={locTxt}
            />

            <section
                data-position={titleToAnchor(locTxt.sidebar_labels.sl_score_categories)}
                id={titleToAnchor(locTxt.sidebar_labels.sl_score_categories)}
                className={clsx("py-12")}
            >
                <LvlHeader
                    content={locTxt.audit_section_titles.ast_score_categories}
                    lvl={0}
                    anchorLink={titleToAnchor(locTxt.sidebar_labels.sl_score_categories)}
                />
                <RecursiveSectionBase
                    auditResult={auditResult}
                    treeNodes={treeNodes}
                    statsData={allStatsData?.stats_e}
                    sectionKey="efficiency"
                >
                </RecursiveSectionBase>

                <RecursiveSectionBase
                    auditResult={auditResult}
                    treeNodes={treeNodes}
                    sectionKey="clean"
                    statsData={allStatsData?.stats_c}
                >
                    <AuditCleanSubSection
                        auditResult={auditResult}
                    />
                </RecursiveSectionBase>

                <RecursiveSectionBase
                    auditResult={auditResult}
                    treeNodes={treeNodes}
                    sectionKey="open"
                    statsData={allStatsData?.stats_o}
                >
                </RecursiveSectionBase>

                <RecursiveSectionBase
                    auditResult={auditResult}
                    treeNodes={treeNodes}
                    sectionKey="safe"
                    statsData={allStatsData?.stats_s}
                >
                </RecursiveSectionBase>
            </section>

            <AuditBranding auditResult={auditResult} />

            <AuditCrUX auditResult={auditResult} />

            <AuditHistory archive={archive} />

            <AuditQAInterpretation
                locTxt={locTxt}
                auditResult={auditResult}
                allStatsData={allStatsData}
            />

            <AuditDataDownload auditResult={auditResult} />

        </div>
    )
}