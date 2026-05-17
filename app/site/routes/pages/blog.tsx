//             className="md_1 art h-full main_container h-full pt-24 pb-12  md:pl-16 2xl:pl-1"
import { data, useLoaderData } from "react-router"

import { queryDynamoDB } from "~/common/utils/server/dynamodb.server"

import type { BlogPostFeed, RouteHandle } from "../../../../types/site"
import PostFeedPreview from "~/site/ui/blog/PostFeedPreview"
import { lastKeyJsonObjectToParam, lastKeyParamToJsonObject } from "~/site/utils/lastKey.server"
import FeeedPagination from "~/site/ui/blog/FeedPagination"
import type { Route } from "./+types/blog"
import { getStaticData } from "~/common/utils/server/get_static_data.server"
import { langByParam } from "~/common/shared/lang"


export const handle: RouteHandle = {
    page_key: "NS_BLOG",
    bc: true
};



export const loader = async ({ request, params }: Route.LoaderArgs) => {
    const filterCats = new URL(request.url)?.searchParams?.getAll('tags')
    //  console.log({tags})
    let ExclusiveStartKey = lastKeyParamToJsonObject(request)

    const { lang_code } = langByParam(params.lang)



    const [locTxt, res] = await Promise.all([
        getStaticData(['loc_blog'], lang_code) as Promise<Record<string, Record<string, string>>>,
        queryDynamoDB({
            IndexName: "CreatedAtIndex",
            Limit: 6,
            pk: "BP#en",
            ProjectionExpression: "pk, sk, createdAt, date_modified, h1_title, main_image, md_lead, tags",
            ExclusiveStartKey,
            excludeIfCreationDateInFuture: true,
            filterCats

        }) as Promise<{
            Items: BlogPostFeed[],
            LastEvaluatedKey?: {
                createdAt: { N: string },
                pk: { S: string },
                sk: { S: string },
            },
            Count: number
            ScannedCount: number

        } | null>
    ])

    const feed = res?.Items
    const lastKey = lastKeyJsonObjectToParam(res?.LastEvaluatedKey)

    return data({
        feed,
        lastKey,
        Count: res?.Count,
        ScannedCount:
            res?.ScannedCount,
        locTxt
    })
}


export default function Route() {

    const loaderData = useLoaderData<typeof loader>()


    return (
        <div className="h-full main_container h-full pt-24 pb-12 md:pl-16 2xl:pl-1">
            <title>{loaderData?.locTxt?.metas?.title}</title>
            <meta name="description" content={loaderData?.locTxt?.metas?.description} />
            <div className="max-w-3xl">
                <h1 className="md_art_h1">{loaderData?.locTxt?.body?.h1}</h1>
                <p>{loaderData?.locTxt?.body?.lead}</p>
            </div>

            <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6 pt-3 pb-15">
                {loaderData?.feed?.length ? loaderData.feed.map((it) => (
                    <PostFeedPreview
                        key={it.sk}
                        post={it}
                    />
                )) : null}
            </div>

            <FeeedPagination
                lastKey={loaderData?.lastKey}
            />


        </div>
    )
}


