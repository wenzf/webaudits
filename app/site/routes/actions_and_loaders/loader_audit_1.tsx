import bcrypt from "bcryptjs";
import { Resource } from "sst/resource"
import type { Route } from "./+types/loader_audit_1"
import { getCsrfLikeSession } from "~/common/utils/sessions/csrf_like_session.server";
import invariant from "tiny-invariant";


export const loader = async ({ request }: Route.ActionArgs) => {
    invariant(Resource.audit_api_secret_2.value)
    const searchParams = new URLSearchParams(new URL(request.url).search)
    const rurl = searchParams.get('rurl')
    const csrf_like_hash = searchParams.get('csrf_like')
    const honeypot = searchParams.get('additional_info')

    if (typeof rurl !== "string") return Response.json({
        url: null
    })

    const cookieHeader = request.headers.get('Cookie')
    const session = await getCsrfLikeSession(cookieHeader)

    let requestOk = false
    if (typeof csrf_like_hash === "string") {
        const csrf_pw = session.get('secret')
        const re = await bcrypt.compare(csrf_pw, csrf_like_hash)
        requestOk = re
        if (typeof honeypot === "string" && honeypot?.length) requestOk = false
    }

    if (!requestOk) return Response.json({
        csrf: null
    })

    const signal = AbortSignal.timeout(360_000);
    const request_url = new URL(Resource.webaudit_function2.url)
    const request_params = new URLSearchParams()
    request_params.set('url', rurl)
    request_params.set('requestid', Resource.audit_api_secret_2.value)
    request_url.search = request_params.toString()

    const res: PageAuditResult & APIErrorResponse = await fetch(request_url,
        { signal, method: 'GET' })
        .then((it) => it.json())
        .catch((ii) => {
            console.log({ ii }, 'catch__')
            return { err: ii }
        })



    let status = 200
    let statusText = "OK"

    if (res?.err && res?.err === "LIMIT" || res?.err && res?.err === "FETCH_429") {
        status = 429
        statusText = "Too Many Requests"
    } else if (res?.err === 'FETCH_CATCH' || res?.err === 'CATCH') {
        status = 422
        statusText = "Unprocessable Entity"
    } else if (res?.err === "NOT_ALLOWED") {
        status = 401
        statusText = "Internal Server Error"
    } else if (res?.err) {
        status = 500
    }

    const headers = new Headers();
    headers.append('Cache-Control', 'no-store');
    
    return Response.json(res, {
        status,
        statusText,
        headers
    })
}

