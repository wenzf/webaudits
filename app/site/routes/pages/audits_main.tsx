import { useLoaderData, data } from "react-router"

import type { RouteHandle, SiteLangs } from "../../../../types/site"
import MarkdownWithCustomElements from "~/common/shared/markdown"
import type { Route } from "./+types/about"
import { langByParam } from "~/common/shared/lang"
import { getDynamoDB } from "~/common/utils/server/dynamodb.server"
import AsideTranslation from "~/site/ui/core/asides/AsideTranslation"


export const handle: RouteHandle = {
    page_key: "NS_AUDITS"
}


export const loader = async ({ params }: Route.LoaderArgs) => {
    const { lang } = params
    const { lang_code } = langByParam(lang)

    const [
        pageContentRes
    ] = await Promise.all([
        getDynamoDB(`PS#${lang_code}`, "audits")
    ])

    return data({
        pageContent: pageContentRes?.Item
    })
}


export default function Audit() {
    const loaderData = useLoaderData()


    const source_lang = loaderData?.pageContent?.source_lang
    const pk = loaderData?.pageContent?.pk
    const ai_translated = loaderData?.pageContent?.ai_translated
    const ai_translation_reviewed = loaderData?.pageContent?.ai_translation_reviewed


    return (
        <>
            <title>{loaderData?.pageContent?.title}</title>
            <meta name="description" content={loaderData?.pageContent?.description} />
            <article className="flex flex-col items-center max-w-7xl m-auto">
                <MarkdownWithCustomElements
                    markup={loaderData.pageContent?.md_body ?? ''}
                />

                {source_lang ? (
                    <AsideTranslation
                        target_lang={pk.split("#")[1] as SiteLangs["lang_code"]}
                        source_lang={source_lang}
                        ai_translated={ai_translated}
                        ai_translation_reviewed={ai_translation_reviewed}

                    />
                ) : null}

            </article>
        </>
    )
}