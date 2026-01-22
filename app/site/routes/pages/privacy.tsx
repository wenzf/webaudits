import { data, useLoaderData } from "react-router";
import { langByParam } from "~/common/shared/lang";
import { getStaticData } from "~/common/utils/server/get_static_data.server";
import MarkdownWithCustomElements from "~/site/shared/markdown";
import type { Route } from "./+types/privacy";
import type { RouteHandle } from "types/site";
import SITE_CONFIG from "~/site/site.config";


export const handle: RouteHandle = {
    page_key: "NS_PRIVACY",
    bc: true
};


export const headers = () => {
    return SITE_CONFIG.HEADERS_DEFAULTS.CACHE_CONTROL_HEADER_MID
}

export const loader = async ({ params }: Route.LoaderArgs) => {
    const { lang } = params
    const { lang_code } = langByParam(lang)

    const [
        locTxt,
    ] = await Promise.all([
        getStaticData(['loc_privacy'], lang_code),
    ])

    return data({
        locTxt: locTxt as Record<string, Record<string, string>>
    })
}


export default function PricacyPage() {
    const loaderData = useLoaderData()

    return (
        <>
            <title>{loaderData?.locTxt?.metas?.title}</title>
            <meta name="description" content={loaderData?.locTxt?.metas?.description} />
            <div className="main_container max-w-xl relative pt-[44px] md_1 art z-[9]">
                <div className="pt-12 pb-12 px-1 px-1 md:pl-16 2xl:pl-1">
                    <MarkdownWithCustomElements
                        markup={loaderData?.locTxt?.body.md_1 ?? ''}
                    />
                </div>

            </div>
        </>
    )
}