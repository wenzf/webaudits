
import { data, useLoaderData } from "react-router"

import { getDynamoDB } from "~/common/utils/server/dynamodb.server"
import type { Route } from "./+types/about"
import { langByParam } from "~/common/shared/lang"
import MarkdownWithCustomElements from "~/site/shared/markdown"
import Logo2 from "~/site/icons/Logo2"
import type { RouteHandle } from "types/site"
import SITE_CONFIG from "~/site/site.config"


export const handle: RouteHandle = {
    page_key: "NS_ABOUT",
    bc: true
};


export const headers = () => {
    return SITE_CONFIG.HEADERS_DEFAULTS.CACHE_CONTROL_HEADER_MID
}


export const loader = async ({ params }: Route.LoaderArgs) => {
    const { lang } = params
    const { lang_code } = langByParam(lang)

    const [
        pageContentRes
    ] = await Promise.all([
        getDynamoDB(`PS#${lang_code}`, "about")
    ])

    if (!pageContentRes?.Item) throw data(null, { status: 404 })

    return data({
        pageContent: pageContentRes?.Item,
    })
}


export default function AboutPage() {
    const loaderData = useLoaderData()

    return (
        <>
            <title>{loaderData?.pageContent?.title}</title>
            <meta name="description" content={loaderData?.pageContent?.description} />

            <div className="md_1 art h-full pt-24 pb-12 max-w-xl z-[5] relative px-1 md:pl-16 2xl:pl-1">
                <MarkdownWithCustomElements
                    markup={loaderData?.pageContent?.md_body ?? ''}
                />
            </div>
            <div className="overflow-hidden" >
                <Logo2 className="w-2/4 h-auto fixed bottom-0 right-0 text-neutral-100 dark:text-neutral-900/50 translate-2/12" />
            </div>
        </>
    )
}

