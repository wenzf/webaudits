import { data, useLoaderData } from "react-router"
import clsx from "clsx"
import { Suspense, useEffect, useState, lazy } from "react";

import { langByParam } from "~/common/shared/lang"
import type { Route } from "./+types/docs"
import MarkdownWithCustomElements from "~/site/shared/markdown"
import { compose_report_configuration_for_view } from "~/site/ui/audit/report/report_configuration_for_view"
import { getStaticData } from "~/common/utils/server/get_static_data.server"
import { titleToAnchor } from "~/site/utils/urls"
import { LvlHeader } from "~/site/ui/core/other/text_elements"
import VisxTree, { composeTreeNodes } from "~/site/ui/charts/visx_tree"
import { RecursiveTable } from "~/site/ui/generics/recursive_table"
import { useIntersectionTracker } from "~/site/shared/hooks"
import { SidebarElement } from "~/site/ui/core/sidebar/sidebar_link"
import type { RouteHandle } from "types/site"
// import SITE_CONFIG from "~/site/site.config";


const LazyScalarAPIDocs = lazy(() => import("../../ui/apidocs"))

const dummydata = {
    "score": 1,
    "score_o": 1,
    "score_e": 1,
    "score_c": 1,
    "pk": "page",
    "audit_data_points": {
        "co2": {
            "co2_score": 1
        },
        "has_ssl": 1,
        "abipdb": {
            "abipdb_trust": 1
        },
        "http_observatory": {
            "score": 1
        },
        "webrisk": {
            "trust": 1,
            "threat_types": []
        },
        "lh": {
            "performance": 1,
            "best_practices": 1,
            "accessibility": 1,
            "seo": 1
        },
        "global_rank": {
            "weight": {
                "score": 1,
                "stats": {
                    "date": "2024-06-01",
                    "client": "mobile",
                    "source": [],
                    "type": "page_weight",
                    "data": [],
                    "is_root_page": true
                }
            },
            "requests": {
                "score": 1,
                "stats": {
                    "date": "2024",
                    "client": "mobile",
                    "source": [],
                    "type": "total_requests",
                    "data": [],
                    "is_root_page": true
                }
            }
        }
    },
    "score_s": 1,
    "sk": "ba9401361174813ff1599b25e52bacdd"
}

const SectionElements = ({ vc }: { vc: ViewConfig[] }) => vc.map((it, ind) => (
    <section
        className={clsx("pt-12 mb-30 md:mb-42", {
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

        {it.children && <SectionElements vc={it.children} />}
    </section>
))


export const handle: RouteHandle = {
    page_key: "NS_DOCS",
    bc: true
};


// export const headers = () => {
//     return SITE_CONFIG.HEADERS_DEFAULTS.CACHE_CONTROL_HEADER_MID
// }


export const loader = async ({ params }: Route.LoaderArgs) => {
    const { lang } = params
    const { lang_code } = langByParam(lang)

    const [
        locTxt,
    ] = await Promise.all([
        getStaticData(['loc_audits_v1_id', 'loc_docs_v1'], lang_code),
    ])

    return data({
        locTxt: locTxt as Record<string, Record<string, string>>
    })
}


export default function DocsPage() {
    const { locTxt } = useLoaderData()
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        const timeout = setTimeout(() => setIsClient(true), 3000)
        return () => clearTimeout(timeout)
    }, [])

    const treeNodes = compose_report_configuration_for_view(dummydata as any)
    const trackElements = useIntersectionTracker('data-position', {})

    const viewConfig: ViewConfig[] = [
        {
            key: 'intro',
            anchor: titleToAnchor(locTxt.elements.docs_sec_intro.sidebar_labels),
            section_title: locTxt.elements.docs_sec_intro.section_title,
            sidebar_labels: locTxt.elements.docs_sec_intro.sidebar_labels,
            child_level: 0,
            renderComponent: (
                <div className="md_1 mt-12">
                    <MarkdownWithCustomElements
                        markup={locTxt?.elements.docs_sec_intro?.md_body_1 ?? ''}
                    />
                </div>
            )
        },
        {
            key: 'concept',
            anchor: titleToAnchor(locTxt.elements.docs_sec_components.sidebar_labels),
            section_title: locTxt.elements.docs_sec_components.section_title,
            sidebar_labels: locTxt.elements.docs_sec_components.sidebar_labels,
            child_level: 0,
            renderComponent: (
                <div className="md_1 mt-12">
                    <MarkdownWithCustomElements
                        markup={locTxt.elements.docs_sec_components.md_body_1}
                    />
                </div>
            )
        },
        {
            key: 'composition',
            anchor: titleToAnchor(locTxt.elements.docs_sec_composition.sidebar_labels),
            section_title: locTxt.elements.docs_sec_composition.section_title,
            sidebar_labels: locTxt.elements.docs_sec_composition.sidebar_labels,
            child_level: 0,

            children: [
                {
                    key: 'composition-graphic',
                    anchor: titleToAnchor(locTxt.elements.docs_sub_sec_tree.sidebar_labels),
                    section_title: locTxt.elements.docs_sub_sec_tree.section_title,
                    sidebar_labels: locTxt.elements.docs_sub_sec_tree.sidebar_labels,
                    child_level: 1,
                    renderComponent: (
                        <div className="mt-4">
                            <VisxTree
                                locTxt={locTxt}
                                width={900}
                                height={700}
                                treeNodes={
                                    composeTreeNodes(treeNodes, locTxt)!
                                }
                                with_anchor_links={false}
                            />
                        </div>
                    )
                },
                {
                    key: 'composition-table',
                    anchor: titleToAnchor(locTxt.elements.docs_sub_sec_table.sidebar_labels),
                    section_title: locTxt.elements.docs_sub_sec_table.section_title,
                    sidebar_labels: locTxt.elements.docs_sub_sec_table.sidebar_labels,
                    child_level: 1,
                    renderComponent: (
                        <div className="overflow-auto mt-4">
                            <div style={{ minWidth: '120rem' }}>
                                <RecursiveTable
                                    treeNodes={treeNodes}
                                    locs={locTxt}
                                    withValueCol={false}
                                />
                            </div>
                        </div>
                    )
                }
            ]
        },

        {
            key: 'techstack',
            anchor: titleToAnchor(locTxt.elements.docs_sec_techstack.sidebar_labels),
            section_title: locTxt.elements.docs_sec_techstack.section_title,
            sidebar_labels: locTxt.elements.docs_sec_techstack.sidebar_labels,
            child_level: 0,
            renderComponent: (
                <div className="mt-12 md_1">
                    <MarkdownWithCustomElements
                        markup={locTxt.elements.docs_sec_techstack.md_body_1}
                    />
                </div>
            )
        },
        {
            key: 'api-docs',
            anchor: titleToAnchor(locTxt.elements.docs_sec_api.sidebar_labels),
            section_title: locTxt.elements.docs_sec_api.section_title,
            sidebar_labels: locTxt.elements.docs_sec_api.sidebar_labels,
            child_level: 0,
            renderComponent: (
                <div className="mt-12 md_1">
                    <MarkdownWithCustomElements
                        markup={locTxt.elements.docs_sec_api.md_body_1}
                    />
                    <div className="py-24" />
                    {isClient ? (
                        <div className="h-full w-full ">
                            <Suspense fallback={<div className="flex justify-center"><div className="loader_1" /></div>}>
                                <LazyScalarAPIDocs />
                            </Suspense>
                        </div>
                    ) : <div className="flex justify-center"><div className="loader_1" /></div>}
                </div>
            )
        },
    ]


    return (
        <>
            <title>{locTxt?.metas?.title}</title>
            <meta name="description" content={locTxt?.metas?.description} />
            <div className="p-1">
                <h1 className="text-2xl md:text-3xl mt-24">{locTxt.body.h1}</h1>

                <aside className="sidebar">
                    <div className="content_header">
                        <div>
                            <span>
                                {locTxt.elements.sidebar.table_of_contents}
                            </span>
                        </div>
                    </div>
                    <nav className="nav_wide">
                        <SidebarElement vc={viewConfig} trackElements={trackElements} />
                    </nav>
                </aside>


              <div className="mt-12 2xl:mt-0"></div>

 

                <SectionElements vc={viewConfig} />

            </div>
        </>
    )
}

