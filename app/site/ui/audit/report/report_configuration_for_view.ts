import { convertDataArrTo1090BoxPlotProp } from "~/site/utils/data";


export const MIN_SCORE_S_TO_DISPLAY_URL_AS_LINK = 0.5

/*
    - Returns the object that contains audit results and the configuration
    of how the view is rendered.

    - The nested structure is digested by recursive render functions.
    
    - The configuration in single object is supposed to make changes relatively
    easy if the structure of composition of the audit changes.

    - Data structure is nested and digested by recursive render components
 */


export const compose_report_configuration_for_view = (auditResult: PageAuditResult): TreeNode => ({
    treeDiagramLabel: 'tdl_audit_summary_v1',
    sectionTitle: "ast_audit_summary_v1",
    sectionDescription: "asd_audit_summary_v1",
    sidebarLabel: "sl_audit_summary_v1",
    score: auditResult?.score,
    weightRelative: 100,
    key: 'summary',
    hierarchyLevel: 0,
    inAuditReport: true,
    inNavSidebar: true,
    inTreeDiagram: true,
    children: [
        {
            tableCaption: "tc_efficiency",
            treeDiagramLabel: 'tdl_efficiency',
            sectionTitle: "ast_efficiency",
            sectionDescription: "asd_efficiency",
            sidebarLabel: "sl_efficiency",
            score: auditResult?.score_e,
            weightRelative: 25,
            key: 'efficiency',
            hierarchyLevel: 1,
            inAuditReport: true,
            inNavSidebar: true,
            inTreeDiagram: true,
            children: [
                {
                    tableCaption: "tc_performance",
                    tableInfo: "ti_performance",
                    treeDiagramLabel: 'tdl_performance',
                    sectionTitle: "ast_performance",
                    sectionDescription: "asd_performance",
                    sidebarLabel: "sl_performance",
                    score: auditResult?.audit_data_points.lh.performance,
                    weightRelative: 40,
                    weightAbsolute: 10,
                    key: "performance",
                    hierarchyLevel: 2,
                    inAuditReport: true,
                    inNavSidebar: true,
                    inTreeDiagram: true,

                },
                {
                    tableCaption: "tc_best_practices",
                    tableInfo: "ti_best_practices",
                    treeDiagramLabel: 'tdl_best_practices',
                    sectionTitle: "ast_best_practices",
                    sectionDescription: "asd_best_practices",
                    sidebarLabel: "sl_best_practices",
                    score: auditResult?.audit_data_points?.lh?.best_practices,
                    weightRelative: 30,
                    weightAbsolute: 7.5,
                    key: "best-practices",
                    hierarchyLevel: 2,
                    inAuditReport: true,
                    inNavSidebar: true,
                    inTreeDiagram: true,

                },
                {
                    tableCaption: "tc_network",
                    treeDiagramLabel: 'tdl_network',
                    sectionTitle: "ast_network",
                    sectionDescription: "asd_network",
                    sidebarLabel: "sl_network",
                    score: (
                        auditResult?.audit_data_points?.global_rank?.requests?.score
                        + auditResult?.audit_data_points?.global_rank?.weight?.score) * 0.5,
                    weightRelative: 30,
                    weightAbsolute: 7.5,
                    key: "network",
                    hierarchyLevel: 2,
                    inAuditReport: true,
                    inNavSidebar: true,
                    inTreeDiagram: true,
                    children: [
                        {
                            tableCaption: "tc_requests",
                            tableInfo: "ti_network_requests",
                            treeDiagramLabel: 'tdl_requests',
                            sectionTitle: "ast_requests",
                            sectionDescription: "asd_requests",
                            sidebarLabel: "sl_requests",
                            score:
                                auditResult?.audit_data_points?.global_rank?.requests?.score,
                            weightRelative: 50,
                            weightAbsolute: 3.75,
                            key: "requests",
                            hierarchyLevel: 3,
                            inAuditReport: true,
                            inNavSidebar: true,
                            inTreeDiagram: true,
                            hasDetailedDataBreakdown: {
                                markerLabel: 'ml_network_requests',
                                boxPlotStats: {
                                    markerValue: auditResult?.audit_data_points?.lh?.request_count,
                                    width: 256,
                                    height: 380,
                                    data: convertDataArrTo1090BoxPlotProp(
                                        auditResult?.audit_data_points?.global_rank?.requests?.stats?.data as any
                                    )
                                },
                                stats: auditResult?.audit_data_points?.global_rank?.requests?.stats
                            },
                            hasTransferDataBreakdown: {
                                data_raw: auditResult.audit_data_points.lh.resources,
                                type: "requests"
                            }
                        },
                        {
                            tableCaption: "tc_weight",
                            tableInfo: "ti_network_weight",
                            treeDiagramLabel: 'tdl_weight',
                            sectionTitle: "ast_weight",
                            sectionDescription: "asd_weight",
                            sidebarLabel: "sl_weight",
                            score:
                                auditResult?.audit_data_points?.global_rank?.weight?.score,
                            weightRelative: 50,
                            weightAbsolute: 3.75,
                            key: "weight",
                            hierarchyLevel: 3,
                            inAuditReport: true,
                            inNavSidebar: true,
                            inTreeDiagram: true,

                            hasDetailedDataBreakdown: {
                                markerLabel: 'ml_network_weight',
                                boxPlotStats: {
                                    markerValue: Math.round(auditResult?.audit_data_points.lh.resource_size / 1024),
                                    width: 256,
                                    height: 380,
                                    data: convertDataArrTo1090BoxPlotProp(
                                        (auditResult?.audit_data_points?.global_rank?.weight?.stats?.data) as any
                                    ),
                                },
                                stats: auditResult?.audit_data_points?.global_rank?.weight?.stats
                            },
                            hasTransferDataBreakdown: {
                                data_raw: auditResult.audit_data_points.lh.resources,
                                type: "sizes"
                            }
                        },
                    ]
                },
            ]
        },
        {
            tableCaption: "tc_clean",
            tableInfo: "ti_clean",
            treeDiagramLabel: 'tdl_clean',
            sectionTitle: "ast_clean",
            sectionDescription: "asd_clean",
            sidebarLabel: "sl_clean",
            score: auditResult?.score_c,
            weightRelative: 25,
            key: "clean",
            hierarchyLevel: 1,
            inAuditReport: true,
            inNavSidebar: true,
            inTreeDiagram: true,
            children: [
                {
                    tableCaption: "tc_clean_co2",
                    tableInfo: "ti_clean_co2",
                    sidebarLabel: "sl_clean_co2",
                    key: "co2",
                    inAuditReport: false,
                    inNavSidebar: true,
                    inTreeDiagram: false,
                    hierarchyLevel: 2,

                }
            ]
        },
        {
            tableCaption: "tc_open",
            treeDiagramLabel: 'tdl_open',
            sectionTitle: "ast_open",
            sectionDescription: "asd_open",
            sidebarLabel: "sl_open",
            score: auditResult?.score_o,
            weightRelative: 25,
            key: "open",
            hierarchyLevel: 1,
            inAuditReport: true,
            inNavSidebar: true,
            inTreeDiagram: true,
            children: [
                {
                    tableCaption: "tc_accessibility",
                    tableInfo: "ti_accessibility",
                    treeDiagramLabel: 'tdl_accessibility',
                    sectionTitle: "ast_accessibility",
                    sectionDescription: "asd_accessibility",
                    sidebarLabel: "sl_accessibility",
                    score: auditResult?.audit_data_points?.lh?.accessibility,
                    weightRelative: 50,
                    weightAbsolute: 12.5,
                    key: "accessibility",
                    hierarchyLevel: 2,
                    inAuditReport: true,
                    inNavSidebar: true,
                    inTreeDiagram: true,

                },
                {
                    tableCaption: "tc_seo",
                    tableInfo: "ti_seo",
                    treeDiagramLabel: 'tdl_seo',
                    sectionTitle: "ast_seo",
                    sectionDescription: "asd_seo",
                    sidebarLabel: "sl_seo",
                    score: auditResult?.audit_data_points?.lh?.seo,
                    weightRelative: 50,
                    weightAbsolute: 12.5,
                    key: "seo",
                    hierarchyLevel: 2,
                    inAuditReport: true,
                    inNavSidebar: true,
                    inTreeDiagram: true,

                },
            ]
        },
        {
            tableCaption: "tc_safe",
            treeDiagramLabel: 'tdl_safe',
            sectionTitle: "ast_safe",
            sectionDescription: "asd_safe",
            sidebarLabel: "sl_safe",
            score: auditResult?.score_s,
            weightRelative: 25,
            key: "safe",
            hierarchyLevel: 1,
            inAuditReport: true,
            inNavSidebar: true,
            inTreeDiagram: true,
            children: [
                {
                    tableCaption: "tc_trustworthy",
                    treeDiagramLabel: 'tdl_trustworthy',
                    sectionTitle: "ast_trustworthy",
                    sectionDescription: "asd_trustworthy",
                    sidebarLabel: "sl_trustworthy",
                    score: (auditResult?.audit_data_points?.webrisk?.trust + auditResult?.audit_data_points?.abipdb?.abipdb_trust) / 2,
                    weightRelative: 50,
                    weightAbsolute: 12.5,
                    key: "trustworthy",
                    hierarchyLevel: 2,
                    inAuditReport: true,
                    inNavSidebar: true,
                    inTreeDiagram: true,
                    children: [
                        {
                            tableCaption: "tc_webrisk",
                            tableInfo: "ti_webrisk",
                            treeDiagramLabel: 'tdl_webrisk',
                            sectionTitle: "ast_webrisk",
                            sectionDescription: "asd_webrisk",
                            sidebarLabel: "sl_webrisk",
                            score: auditResult?.audit_data_points?.webrisk?.trust,
                            weightRelative: 50,
                            weightAbsolute: 6.25,
                            key: "webrisk",
                            hierarchyLevel: 3,
                            inAuditReport: true,
                            inNavSidebar: true,
                            inTreeDiagram: true,
                        },
                        {
                            tableCaption: "tc_abipdb",
                            tableInfo: "ti_abipdb",
                            treeDiagramLabel: 'tdl_abipdb',
                            sectionTitle: "ast_abipdb",
                            sectionDescription: "asd_abipdb",
                            sidebarLabel: "sl_abipdb",
                            score: auditResult?.audit_data_points?.abipdb?.abipdb_trust,
                            weightRelative: 50,
                            weightAbsolute: 6.25,
                            key: "abuse-ip-db",
                            hierarchyLevel: 3,
                            inAuditReport: true,
                            inNavSidebar: true,
                            inTreeDiagram: true,
                        }
                    ]
                },
                {
                    tableCaption: "tc_secure",
                    tableInfo: "ti_secure",
                    treeDiagramLabel: 'tdl_secure',
                    sectionTitle: "ast_secure",
                    sectionDescription: "asd_secure",
                    sidebarLabel: "sl_secure",
                    score: auditResult?.audit_data_points.http_observatory.score,
                    // score: ((auditResult?.audit_data_points?.has_ssl
                    //     + auditResult?.audit_data_points.http_observatory.score) * 0.5),
                    weightRelative: 50,
                    weightAbsolute: 12.5,
                    key: "secure",
                    hierarchyLevel: 2,
                    inAuditReport: true,
                    inNavSidebar: true,
                    inTreeDiagram: true,
                    hasHttpObservatoryDataBreakdown: auditResult?.audit_data_points.http_observatory,
                    // children: [
                    //     {
                    //         treeDiagramLabel: 'tdl_ssl',
                    //         tableCaption: "tc_ssl",
                    //         tableInfo: "ti_ssl",
                    //         sectionTitle: "ast_ssl",
                    //         sectionDescription: "asd_ssl",
                    //         sidebarLabel: "sl_ssl",
                    //         score: auditResult?.audit_data_points?.has_ssl,
                    //         weightRelative: 50,
                    //         weightAbsolute: 6.25,
                    //         key: "ssl",
                    //         hierarchyLevel: 3,
                    //         inAuditReport: true,
                    //         inNavSidebar: true,
                    //         inTreeDiagram: false,
                    //     },
                    //     {
                    //         treeDiagramLabel: 'tdl_http_obs',
                    //         tableCaption: "tc_http_obs",
                    //         tableInfo: "ti_http_obs",
                    //         sectionTitle: "ast_http_obs",
                    //         sectionDescription: "asd_http_obs",
                    //         sidebarLabel: "sl_http_obs",
                    //         score: auditResult?.audit_data_points.http_observatory.score,
                    //         weightRelative: 50,
                    //         weightAbsolute: 6.25,
                    //         key: "http_obs",
                    //         hierarchyLevel: 3,
                    //         inAuditReport: true,
                    //         inNavSidebar: true,
                    //         inTreeDiagram: false,
                    //         hasHttpObservatoryDataBreakdown: auditResult?.audit_data_points.http_observatory
                    //     }
                    // ]
                }
            ],
        },
    ],
})