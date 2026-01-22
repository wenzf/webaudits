
import { data, useLoaderData } from "react-router"

import { queryDynamoDB } from "~/common/utils/server/dynamodb.server"
import type { Route } from "./+types/audits_ecos_v1_latest"
import SortableAuditTableList from "~/site/ui/lists/SortableAuditTableList"
import type { RouteHandle } from "types/site"
import { getStaticData } from "~/common/utils/server/get_static_data.server"
import { langByParam } from "~/common/shared/lang"


export const handle: RouteHandle = {
    bc: true,
    page_key: "NS_LATEST"
};


export const loader = async ({ params }: Route.LoaderArgs) => {
    const { lang } = params
    const { lang_code } = langByParam(lang)
    const [
        auditsByDatesRes,
        locTxt
    ] = await Promise.all([
        queryDynamoDB({
            pk: 'page',
            tableName: "_table_audit_v1",
            IndexName: "createdAtIndex",
            ProjectionExpression: "pk, sk, created_at, score, score_e, score_c, score_o, score_s, final_url",
            Limit: 100
        }),
        getStaticData(['loc_audits_v1_lists'], lang_code)
    ]) as any


    return data({
        auditsByDate: auditsByDatesRes?.Items,
        locTxt
    })

}

export default function Route() {
    const loaderData = useLoaderData()

    return (
        <>
            <title>{loaderData?.locTxt?.pages?.latest?.metas?.title}</title>
            <meta name="description" content={loaderData?.locTxt?.pages?.latest?.metas?.description} />
            <section className="gap-12 flex justify-center flex-col items-center first_slide_height pt-24 pb-12">
                <h1 itemProp="name" className="text-2xl md:text-3xl self-start">
                    {loaderData.locTxt.audit_lists.titles.latest_many}</h1>
                <div className="overflow-auto max-w-full">
                    <SortableAuditTableList
                        locTxt={loaderData.locTxt}
                        tableCaption={loaderData.locTxt.audit_lists.table_captions.latest_many}
                        listData={loaderData.auditsByDate}
                        defaultSortSettings={{
                            focusItemKey: "created_at",
                            focusItemDataType: "number",
                            direction: "desc"
                        }}
                    />
                </div>
            </section>
        </>
    )
}