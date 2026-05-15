//             className="md_1 art h-full main_container h-full pt-24 pb-12  md:pl-16 2xl:pl-1"
import { data, useLoaderData } from "react-router"

import { queryDynamoDB } from "~/common/utils/server/dynamodb.server"

import type { BlogPostFeed, RouteHandle } from "../../../../types/site"
import PostFeedPreview from "~/site/ui/blog/PostFeedPreview"
import { lastKeyJsonObjectToParam, lastKeyParamToJsonObject } from "~/site/utils/lastKey.server"
import FeeedPagination from "~/site/ui/blog/FeedPagination"
import type { Route } from "./+types/blog"


export const handle: RouteHandle = {
    page_key: "NS_BLOG",
    bc: true
};



export const loader = async ({ request }: Route.LoaderArgs) => {
    let ExclusiveStartKey = lastKeyParamToJsonObject(request)
    const res = await queryDynamoDB({
        IndexName: "CreatedAtIndex",
        Limit: 6,
        pk: "BP#en",
        ProjectionExpression: "pk, sk, createdAt, date_modified, h1_title, main_image, md_lead, tags",
        ExclusiveStartKey,
        excludeIfCreationDateInFuture: true

    }) as {
        Items: BlogPostFeed[],
        LastEvaluatedKey?: {
            createdAt: { N: string },
            pk: { S: string },
            sk: { S: string },
        },
        Count: number
        ScannedCount: number

    } | null

    const feed = res?.Items
    const lastKey = lastKeyJsonObjectToParam(res?.LastEvaluatedKey)

    return data({
        feed,
        lastKey,
        Count: res?.Count,
        ScannedCount:
            res?.ScannedCount
    })
}


export default function Route() {

    const loaderData = useLoaderData<typeof loader>()


    return (
        <div
          className="h-full main_container h-full pt-24 pb-12  md:pl-16 2xl:pl-1"

        >
            <h1>Insights and blogs about website performance and sustainability</h1>
            <p>Explore practical insights, guides, and expert perspectives on improving website performance, reducing CO₂ emissions, enhancing accessibility, and strengthening security.</p>

            <h2 className="rf_36">Latest Blogs</h2>
            <div
                //className="py-8 grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6 pt-3 pb-15"
            >
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

            <title>Blog post feed title</title>
            <meta name="description" content="Blog post overview meta description" />
        </div>
    )
}


