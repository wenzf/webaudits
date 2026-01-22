import { getDynamoDB } from "~/common/utils/server/dynamodb.server"
import type { Route } from "./+types/audits_ecos_v1_id_json"


export async function loader({ params, request }: Route.LoaderArgs) {
    const { id, type } = params
    const sp = new URL(request.url).searchParams
    const responseType = sp.get('responseType')
    let dataType = ""
    let job
    const retrieved = Date.now()

    if (!id && type === "stats") {
        dataType = "stats"
        job = getDynamoDB('page-stats', 'main', '_table_audit_v1')
    } else if (id && type === "page-audit") {
        dataType = "page-audit"
        if (responseType && responseType === "full") {
            job = getDynamoDB('page', id, "_table_audit_v1")
        } else {
            job = getDynamoDB('page',
                id,
                "_table_audit_v1",
                "sk, score, score_e, score_c, score_o, score_s, created_at")
        }
    } else if (id && type === "page-archive") {
        dataType = "page-archive"
        job = getDynamoDB("page-archive", id, "_table_audit_v1")
    }

    if (job) {
        const res = await job
        if (res?.Item) {
            const data = res.Item
            return Response.json({
                status: 200,
                dataType,
                retrieved,
                data
            })
        } else {
            return Response.json({
                status: 404,
                dataType,
                retrieved
            })
        }
    }

    return Response.json({
        status: 500,
        dataType,
        retrieved
    })
}