import bcrypt from "bcryptjs";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { Resource } from "sst/resource"
import type { Route } from "./+types/loader_audit_1"
import { getClientToken } from "~/common/utils/sessions/client_token_session.server";
import invariant from "tiny-invariant";

const lambdaClient = new LambdaClient({});

export const loader = async ({ request, context }: Route.ActionArgs) => {
    invariant(Resource.audit_api_secret_2.value)
    const searchParams = new URLSearchParams(new URL(request.url).search)
    const rurl = searchParams.get('rurl')

    if (typeof rurl !== "string") return Response.json({
        url: null
    })

    const cookieHeader = request.headers.get('Cookie')
    const session = await getClientToken(cookieHeader)

    const headersFail = new Headers();
    headersFail.append('Cache-Control', 'no-store');
    let requestOk = false
    if (session.has('secret')) {
        const csrf_pw = session.get('secret')
        const re = await bcrypt.compare(
            Resource.session_secret_4.value,
            csrf_pw
        )
        requestOk = re
    }

    if (!requestOk) return Response.json({
        csrf: null
    }, { headers: headersFail })

    const request_url = new URL(Resource.webaudit_function2.url)
    const request_params = new URLSearchParams()
    request_params.set('url', rurl)
    request_params.set('requestid', Resource.audit_api_secret_2.value)
    request_url.search = request_params.toString()

    let res: PageAuditResult & APIErrorResponse;

    try {
        const command = new InvokeCommand({
            FunctionName: Resource.webaudit_function2.name,
            Payload: JSON.stringify({
                queryStringParameters: {
                    url: rurl,
                    requestid: Resource.audit_api_secret_2.value
                }
            }),
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 360_000);
        request.signal.addEventListener('abort', () => controller.abort());

        const invokeResponse = await lambdaClient.send(command, { abortSignal: controller.signal });
        clearTimeout(timeoutId);

        const rawPayload = Buffer.from(invokeResponse.Payload!).toString('utf-8');
        const lambdaResult = JSON.parse(rawPayload);

        res = JSON.parse(lambdaResult.body);
    } catch (ii) {
        console.log({ ii }, 'catch__')
        return Response.json({ err: ii }, {
            headers: headersFail
        })
    }

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


    return Response.json(res, {
        status,
        statusText,
        headers: headersSuccess
    })
}

