import { data, useLoaderData } from "react-router"

import { queryDynamoDB } from "~/common/utils/server/dynamodb.server"
import SortableAuditTableList from "~/site/ui/lists/SortableAuditTableList"
import type { RouteHandle } from "types/site"
import type { Route } from "./+types/audits_ecos_v1_best"
import { getStaticData } from "~/common/utils/server/get_static_data.server"
import { langByParam } from "~/common/shared/lang"


export const handle: RouteHandle = {
    bc: true,
    page_key: "NS_BEST"
};


export const loader = async ({ params }: Route.LoaderArgs) => {
    const { lang_code } = langByParam(params.lang)
    const [
        auditsByScoresRes, locTxt
    ] = await Promise.all([
        queryDynamoDB({
            pk: 'page',
            tableName: "_table_audit_v1",
            IndexName: "scoreIndex",
            ProjectionExpression: "pk, sk, created_at, score, score_e, score_c, score_o, score_s, final_url",
            Limit: 100
        }),
        getStaticData(['loc_audits_v1_lists'], lang_code)
    ]) as any

    return data({
        auditsByScores: auditsByScoresRes?.Items,
        locTxt
    })
}


export default function Route() {
    const loaderData = useLoaderData()

    return (
        <>
            <title>{loaderData?.locTxt?.pages?.best?.metas?.title}</title>
            <meta name="description" content={loaderData?.locTxt?.pages?.best?.metas?.description} />

            <section className="flex gap-12 justify-center flex-col items-center first_slide_height pt-24 pb-12">
                <h1 className="text-2xl md:text-3xl self-start">{loaderData.locTxt.audit_lists.titles.best_many}</h1>
                <div className="overflow-auto max-w-full">
                    <SortableAuditTableList
                        locTxt={loaderData.locTxt}
                        tableCaption={loaderData.locTxt.audit_lists.table_captions.best_many}
                        listData={loaderData.auditsByScores}
                        defaultSortSettings={{
                            focusItemKey: "score",
                            focusItemDataType: "number",
                            direction: "desc"
                        }}
                    />
                </div>
            </section>
        </>
    )
}