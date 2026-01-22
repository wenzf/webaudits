
import { useMemo } from "react"
import { data, useLoaderData } from "react-router"
import clsx from "clsx"

import { langByParam } from "~/common/shared/lang"
import { getDynamoDB } from "~/common/utils/server/dynamodb.server"
import { getStaticData } from "~/common/utils/server/get_static_data.server"
import { createAllStatsData } from "~/site/utils/data"
import type { Route } from "./+types/audits_ecos_v1_stats"
import AuditStatsTransferDistribution from "~/site/ui/audit/report/sections/AuditStatsTransferDistribution"
import MarkdownWithCustomElements from "~/site/shared/markdown"
import { useIntersectionTracker } from "~/site/shared/hooks"
import { titleToAnchor } from "~/site/utils/urls"
import { SidebarElement } from "~/site/ui/core/sidebar/sidebar_link"
import { LvlHeader } from "~/site/ui/core/other/text_elements"
import type { RouteHandle } from "types/site";
import SITE_CONFIG from "~/site/site.config"



export const handle: RouteHandle = {
    bc: true,
    page_key: "NS_STATS"
};

export const headers = () => {
    return SITE_CONFIG.HEADERS_DEFAULTS.CACHE_CONTROL_HEADER_MID
}


export const loader = async ({ params }: Route.LoaderArgs) => {
    const { lang } = params
    const { lang_code } = langByParam(lang)

    const [stats_res, locTxt] = await Promise.all([
        getDynamoDB('page-stats', 'main', '_table_audit_v1'),
        getStaticData(['loc_audits_v1_stats'], lang_code)
    ])

    return data({
        stats: stats_res?.Item,
        locTxt: locTxt as Record<string, Record<string, string>>
    })
}


export default function Route() {
    const { stats, locTxt } = useLoaderData()
    const allStatsData = useMemo(() => createAllStatsData(stats), [stats])
    const trackElements = useIntersectionTracker('data-position', {})

    if (!allStatsData) return null

    const viewConfig: ViewConfig[] = [
        {
            key: "stats_data",
            anchor: titleToAnchor(locTxt.elements.sidebar_labels.stats_data),
            section_title: locTxt.elements.section_headers.stats_data,
            sidebar_labels: locTxt.elements.sidebar_labels.stats_data,
            has_stats: false,
            child_level: 0,
            renderComponent: (
                <div className="pt-12">
                    <div className="md_1">
                        <MarkdownWithCustomElements
                            markup={locTxt?.body?.md_1 ?? ''}
                        />
                    </div>
                    <div className="mb-12">
                        <div className="md_1">
                            <MarkdownWithCustomElements
                                markup={locTxt?.body.md_2 ?? ''}
                            />
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: "stats_main",
            anchor: titleToAnchor(locTxt.elements.sidebar_labels.stats_main),
            section_title: locTxt.elements.section_headers.stats_main,
            sidebar_labels: locTxt.elements.sidebar_labels.stats_main,
            has_stats: true,
            child_level: 0
        },
        {
            anchor: titleToAnchor(locTxt.elements.sidebar_labels.stats_parts),
            key: "stats_parts",
            has_stats: true,
            section_title: locTxt.elements.section_headers.stats_parts,
            sidebar_labels: locTxt.elements.sidebar_labels.stats_parts,
            child_level: 0,
            children: [
                {
                    key: "stats_e",
                    anchor: titleToAnchor(locTxt.elements.sidebar_labels.stats_e),
                    section_title: locTxt.elements.section_headers.stats_e,
                    sidebar_labels: locTxt.elements.sidebar_labels.stats_e,
                    has_stats: true, child_level: 1
                },
                {
                    key: "stats_c",
                    anchor: titleToAnchor(locTxt.elements.sidebar_labels.stats_c),
                    section_title: locTxt.elements.section_headers.stats_c,
                    sidebar_labels: locTxt.elements.sidebar_labels.stats_c,
                    has_stats: true, child_level: 1
                },
                {
                    key: "stats_o",
                    anchor: titleToAnchor(locTxt.elements.sidebar_labels.stats_o),
                    section_title: locTxt.elements.section_headers.stats_o,
                    sidebar_labels: locTxt.elements.sidebar_labels.stats_o,
                    has_stats: true, child_level: 1
                },
                {
                    key: "stats_s",
                    anchor: titleToAnchor(locTxt.elements.sidebar_labels.stats_s),
                    section_title: locTxt.elements.section_headers.stats_s,
                    sidebar_labels: locTxt.elements.sidebar_labels.stats_s,
                    has_stats: true, child_level: 1
                }
            ]
        }
    ]


    const SectionElements = ({ vc }: { vc: ViewConfig[] }) => vc.map((it, ind) => (
        <section
            className={clsx("pt-6 mb-36 md:mb-48", {
                "pl-2  md:pl-6 lg:pl-12 border-l border-l-neutral-300 dark:border-l-neutral-700":
                    it.child_level > 0,
                "border-t border-t-neutral-300 dark:border-t-neutral-700":
                    it.child_level === 1
            })}
            key={it.key ?? ind}
            data-position={it.anchor}
            id={it.anchor}
        >
            <LvlHeader
                content={it.section_title}
                lvl={it.child_level}
                anchorLink={it.anchor}
            />

            {it.renderComponent ?? null}

            {(it.has_stats && it.key in allStatsData) && (
                <AuditStatsTransferDistribution
                    locTxt={locTxt}
                    statsData={allStatsData[it.key as keyof typeof allStatsData]}
                />
            )}

            {it.children && <SectionElements vc={it.children} />}
        </section>
    ))


    return (
        <>
            <title>{locTxt?.metas?.title}</title>
            <meta name="description" content={locTxt?.metas?.description} />
            <section className="pt-24 pb-12 px-1">
                <h1 className="text-3xl">{locTxt.body.h1}</h1>

                <aside className="sidebar mt-12 2xl:mt-0">
                    <div className="content_header">
                        <div>
                            <span>
                                {locTxt.elements.sidebar.table_of_content}
                            </span>
                        </div>
                    </div>
                    <nav className="nav_narrow">
                        <SidebarElement vc={viewConfig} trackElements={trackElements} />
                    </nav>
                </aside>

                <div className="mb-12" />
                <SectionElements vc={viewConfig} />
            </section>
        </>
    )
}