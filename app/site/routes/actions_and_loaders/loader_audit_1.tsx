import bcrypt from "bcryptjs";
import { Resource } from "sst/resource"
import type { Route } from "./+types/loader_audit_1"
import {
//    clientTokenSessionContext,
  //  destroyClientTokenSession,
    getClientToken
} from "~/common/utils/sessions/client_token_session.server";
import invariant from "tiny-invariant";


export const loader = async ({ request, context }: Route.ActionArgs) => {
    invariant(Resource.audit_api_secret_2.value)
    const searchParams = new URLSearchParams(new URL(request.url).search)
    const rurl = searchParams.get('rurl')

    if (typeof rurl !== "string") return Response.json({
        url: null
    })

    

//
    const cookieHeader = request.headers.get('Cookie')
    const session = await getClientToken(cookieHeader)

    const headersFail = new Headers();
    headersFail.append('Cache-Control', 'no-store');
    //headersFail.append('X-Fail', 'True');
    // headers.append("Set-Cookie", await destroyClientTokenSession(session))

    let requestOk = false
    if (session.has('secret')) {
        const csrf_pw = session.get('secret')
//        console.log({csrf_pw})
     //   const csrf_pw = clientTokenFromContext ?? ''
        const re = await bcrypt.compare(
            Resource.session_secret_4.value,
            csrf_pw
            //client_token_hash

        )
        requestOk = re

//        console.log({requestOk})
        //  if (typeof honeypot === "string" && honeypot?.length) requestOk = false
    }

    if (!requestOk) return Response.json({
        csrf: null
    }, {
        headers: headersFail
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
            return Response.json({ err: ii }, {
                headers: headersFail
            })
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

    const headersSuccess = new Headers();
    headersSuccess.append('Cache-Control', 'no-store');
    //headersSuccess.append('X-Fail', 'False');
   // headersSuccess.append("Set-Cookie", await destroyClientTokenSession(session))


    return Response.json(res, {
        status,
        statusText,
        headers: headersSuccess
    })
}

