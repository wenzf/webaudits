import invariant from "tiny-invariant";
import { Resource } from "sst/resource";

import { getDynamoDB, queryDynamoDB } from "~/common/utils/server/dynamodb.server";
import type { Route } from "./+types/site_r_db";
import type { DBBase } from "../../../../../types/site";
import { isAuth } from "~/cms/lib/utils/auth/auth.server";
import { redirect } from "react-router";
import CMS_CONFIG from "~/cms/cms.config";


/**
 * read dynamo db
 */

export const loader = async ({ request }: Route.LoaderArgs) => {
    invariant(Resource.session_secret_1.value)
    const searchParams = new URLSearchParams(new URL(request.url).search)
    const { AUTH_CONFIG: { MIN_AUTH_LVL_EDIT_RIGHTS } } = CMS_CONFIG
    const auth = await isAuth(request)
    if (auth < MIN_AUTH_LVL_EDIT_RIGHTS) throw redirect('/', { status: 302 })

    const requestType = searchParams.get('requestType');
    const pk = searchParams.get('pk') as DBBase["pk"] | null
    const lastKey_sk = searchParams.get('last_sk')
    const lastKey_created_at = searchParams.get('last_created_at')
    const ProjectionExpression = searchParams.get('projection') ?? undefined
    const categories = searchParams.get('categories')
    const keyword = searchParams.get('search')
    const table = searchParams.get('table')
    let filterCats = undefined

    if (categories) {
        try {
            filterCats = JSON.parse(categories)
        } catch {
            null
        }
    }

    if (requestType === "get_list" && pk) {
        const limit = searchParams.get('limit')
        const res = await queryDynamoDB({
            pk,
            ExclusiveStartKey: typeof lastKey_sk === "string" && typeof lastKey_created_at === "string"
                ? { pk: { S: pk }, sk: { S: lastKey_sk }, createdAt: { N: lastKey_created_at } }
                : undefined,
            Limit: limit ? parseInt(limit) : 10,
            ProjectionExpression,
            filterCats,
            tableName: table as any
        })
        return Response.json(res)
    } else if (requestType === "get_item" && pk) {
        const sk = searchParams.get('sk')

        if (sk) {
            const res = await getDynamoDB(pk, sk, table as any)
            return Response.json(res)
        }
    }

    return {}
}