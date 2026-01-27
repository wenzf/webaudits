import { data, useLoaderData } from "react-router";

import type { RouteHandle } from "types/site";
import { langByParam } from "~/common/shared/lang";
import { getStaticData } from "~/common/utils/server/get_static_data.server";
import RequestAuditForm from "~/site/ui/audit/query/request_audit_form";
import type { Route } from "./+types/audits_ecos_v1";
import { checkRateLimit } from "~/common/utils/server/dynamodb.server";
import { CONFIG_API_LIMIT_DURATION, CONFIG_API_LIMIT_NUMBER } from "~/audit_api/v1/audit.config";


export const handle: RouteHandle = {
    page_key: "NS_ECOS_V1"
};


export const loader = async ({ params }: Route.LoaderArgs) => {
    const { lang } = params
    const { lang_code } = langByParam(lang)

    const [
        locTxt,
        requestCounter
    ] = await Promise.all([
        getStaticData(["loc_audits_form", "loc_audits_v1"], lang_code),
        checkRateLimit(
            CONFIG_API_LIMIT_NUMBER,
            CONFIG_API_LIMIT_DURATION,
            false
        )
    ])

    return data({
        locTxt: locTxt as Record<string, Record<string, string>>,
        requestCounter
    })
}


export default function Route() {
    const loaderData = useLoaderData()

    return (
        <>
            <title>{loaderData?.locTxt?.metas?.title}</title>
            <meta name="description" content={loaderData?.locTxt?.metas?.description} />
            <div className="main_container flex justify-center items-center flex-col gap-[5vh] lg:gap-32">

                <h1 className="text-3xl">ECOS Audit</h1>

                <div className="max-w-full">
                    <RequestAuditForm locTxt={loaderData.locTxt} />
                </div>

            </div>


        </>
    )
}