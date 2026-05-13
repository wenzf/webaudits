import { redirect } from "react-router"
import { Resource } from "sst";
import invariant from 'tiny-invariant'
import CMS_CONFIG from "~/cms/cms.config";
import { isAuth } from "~/cms/utils/auth/auth.server";
import { deleteDynamoDB, putDynamoDB } from "~/cms/utils/server/cms_dynamodb.server";
import type { Route } from "./+types/cms_cud_id_db";
import type { DBBase } from "../../../../types/site";


/**
 * create, update, delete entries on dynamo db 
 */

export const action = async ({ request }: Route.ActionArgs) => {
    const formData = await request.formData()
    invariant(Resource.session_secret_1.value)

    const { AUTH_CONFIG: { MIN_AUTH_LVL_EDIT_RIGHTS } } = CMS_CONFIG
    try {
        const auth = await isAuth(request)
        if (auth < MIN_AUTH_LVL_EDIT_RIGHTS) return redirect('/', { status: 302 })
    } catch (error) {
        return redirect('/', { status: 302 })
    }

    const redirect_to = formData.get('redirect_to')
    const requestType = formData.get('requestType')
    const pk = formData.get('pk') as DBBase["pk"] | null
    const sk = formData.get('sk')

    const table = formData.get('table')

    const dateNow = Date.now()

    if (
        typeof requestType === 'string'
        && typeof redirect_to === "string"
        && typeof pk === "string"
        && typeof sk === "string"
    ) {
        if (requestType === "put_image_data") {

            const payload: Record<string, unknown> = {}
            for (const [key, value] of formData) {
                if (
                    key !== 'requestType'
                    && key !== 'redirect_to'
                    && key !== "pk"
                    && key !== "sk"
                    && key !== "csrf"
                ) {
                    payload[key] = typeof value === "string" ? JSON.parse(value) : {}
                }
            }

            try {
                const res = await putDynamoDB({ ...payload, pk, sk }, table as any)
                await res
                const params = new URLSearchParams()
                params.set('tempMsgTitle', 'tm_image_saved_title')

                return redirect(redirect_to + '?' + params.toString())

            } catch (err) {
                return null
            }
        } else if (requestType === "delete_db_item") { // used for image db
            try {
                const res = await deleteDynamoDB(pk, sk, table as any);
                return redirect(redirect_to)
            } catch (err) {
                return err
            }
        }
    }
    return null
}

export const loader = () => redirect('/', { status: 404 })

