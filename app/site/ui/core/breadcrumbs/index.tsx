
import { NavLink, useMatches, useParams } from "react-router"
import { getProperty } from 'dot-prop';
import { CaretRightIcon } from "@radix-ui/react-icons";

import SITE_CONFIG from "~/site/site.config"
import { localizedPath } from "~/common/shared/lang"
import type { PageNamespaces, SiteUIMatch } from "../../../../../types/site";


/**
 * breadcrumbs via SITE_CONFIG.PAGE_CONFIG workS only if all path segments are nested
 * in layout routes.
 * In the case of /blog/:slug, /blog is no layout route. => override `crumbConfig`, see line 72
 *  */ 

export const Breadcrumbs = () => {
    const params = useParams()

    const matches = useMatches() as SiteUIMatch[]
    const { PAGE_CONFIG } = SITE_CONFIG

    const routeMap = matches.filter(
        (match: SiteUIMatch) => match.handle && match.handle.bc && match.handle.page_key)

    let crumbsConfig: { path: string, position: number, label: string, is_last: boolean }[] = []
    const le = routeMap.length

    for (let i = 0; i < le; i += 1) {
        const oneMatch = routeMap[i]
        const page_key = oneMatch.handle.page_key
        const pageConfig = PAGE_CONFIG[page_key as PageNamespaces]

        let label = ""
        if (pageConfig?.breadcrumb) {
            const breadcrumb_config = pageConfig.breadcrumb
            if (
                breadcrumb_config.data_origin
                && breadcrumb_config.data_key_type
                && breadcrumb_config.data_key) {
                const dataMatch = matches.find(
                    (it: SiteUIMatch) => it?.handle?.page_key === breadcrumb_config.data_origin)?.data
                if (breadcrumb_config.data_key_type === "dotprop") {
                    label = getProperty(dataMatch, breadcrumb_config.data_key)
                }
            }
        }

        let path = localizedPath(params.lang, page_key)

        if (pageConfig.has_params) {
            const matches = path.match(/:([^/]+)/g);
            if (matches) {
                matches.forEach((it) => {
                    const paramKey = it.replace(':', '')
                    const paramValue = params[paramKey]
                    if (typeof paramValue === "string") {
                        path = path.replace(it, paramValue)
                    }
                })
            }
        }

        crumbsConfig = [...crumbsConfig, {
            path,
            position: i + 1,
            label,
            is_last: (i + 1) === le
        }]
    }

    const is_blog_slug = routeMap[routeMap.length - 1]?.handle?.page_key === "NS_BLOG_SLUG"    
    if (is_blog_slug && crumbsConfig?.length === 2) {
        crumbsConfig[1].position = 3
        crumbsConfig = [
            crumbsConfig[0],
            {
                path: localizedPath(params.lang, "NS_BLOG"),
                position: 2,
                label: "Blog",
                is_last: false
            },
            crumbsConfig[1]
        ]
    }

    if (crumbsConfig.length === 1) return null

    return (
        <nav className="absolute left-2 top-12 z-[9] p-[3px] overflow-auto max-w-full">
            <ol itemScope itemType="https://schema.org/BreadcrumbList"
                className="flex gap-1 [&_li]:items-center [&_a]:hover:underline"
            >
                {crumbsConfig.map((it) => (
                    <li key={it.position} itemProp="itemListElement" itemScope
                        itemType="https://schema.org/ListItem"
                        className="flex gap-0.5 whitespace-nowrap"
                    >
                        {!it.is_last ? (
                            <>
                                <NavLink itemProp="item" to={it.path} end viewTransition>
                                    <span itemProp="name">{it.label}</span>
                                </NavLink>
                                <CaretRightIcon aria-hidden />
                            </>
                        ) : (
                            <span>
                                <span itemProp="name">{it.label}</span>
                                <link itemProp="item" href={it.path} />
                            </span>

                        )}
                        <meta itemProp="position" content={it.position.toString()} />
                    </li>
                ))}

            </ol>
        </nav>
    )
}