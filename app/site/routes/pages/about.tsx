
import { data, useLoaderData } from "react-router"

import { getDynamoDB } from "~/common/utils/server/dynamodb.server"
import type { Route } from "./+types/about"
import { langByParam } from "~/common/shared/lang"
import type { RouteHandle, SiteLangs } from "../../../../types/site"
import MarkdownWithCustomElements from "~/common/shared/markdown"
import AsideTranslation from "~/site/ui/core/asides/AsideTranslation"




export const handle: RouteHandle = {
    page_key: "NS_ABOUT",
    bc: true
};


// export const headers = () => {
//     return SITE_CONFIG.HEADERS_DEFAULTS.CACHE_CONTROL_HEADER_MID
// }


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

    const source_lang = loaderData?.pageContent?.source_lang
    const pk = loaderData?.pageContent?.pk
    const ai_translated = loaderData?.pageContent?.ai_translated
    const ai_translation_reviewed = loaderData?.pageContent?.ai_translation_reviewed

    return (
        <>
            <title>{loaderData?.pageContent?.title}</title>
            <meta name="description" content={loaderData?.pageContent?.description} />

            <div
                className="md_1 art h-full pt-24 pb-12 z-[5] relative px-1 md:pl-16 2xl:pl-1"
            >


                <MarkdownWithCustomElements
                    markup={loaderData?.pageContent?.md_body ?? ''}
                // withCustomComponents
                />


                {source_lang ? (
                    <AsideTranslation
                        target_lang={pk.split("#")[1] as SiteLangs["lang_code"]}
                        source_lang={source_lang}
                        ai_translated={ai_translated}
                        ai_translation_reviewed={ai_translation_reviewed}

                    />
                ) : null}

            </div>



        </>
    )
}

