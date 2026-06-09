import { redirect } from "react-router"
import { Resource } from "sst";
import invariant from 'tiny-invariant'

import CMS_CONFIG from "~/cms/cms.config";
import { isAuth } from "~/cms/lib/utils/auth/auth.server";
import { deleteDynamoDB, putDynamoDB } from "~/cms/lib/utils/server/cms_dynamodb.server";
import { parseJSON } from "~/common/shared/misc";
import type { Route } from "./+types/cms_cud_db";
import { CONTENT_TYPES } from "~/cms/cms_content_types";
import { createPlainText } from "~/cms/lib/utils/misc";
import type { DBBase } from "../../../../../types/site";



/**
 * create, update, delete entries on dynamo db 
 */

export const action = async ({ request }: Route.ActionArgs) => {
    invariant(Resource.session_secret_1.value)
    const formData = await request.formData()

    try {
        const auth = await isAuth(request)
        const { AUTH_CONFIG: { MIN_AUTH_LVL_EDIT_RIGHTS } } = CMS_CONFIG
        if (auth < MIN_AUTH_LVL_EDIT_RIGHTS) return redirect('/', { status: 302 })
    } catch (error) {
        return redirect('/', { status: 302 })
    }

    const redirect_to = formData.get('redirect_to')
    const requestType = formData.get('requestType')
    const createdAtAsString = formData.get('createdAt')
    const pk = formData.get('pk') as DBBase["pk"] | null
    const sk = formData.get('sk')
    const content_type = pk?.split('#')[0]
    const form_config = CONTENT_TYPES.find((it) => it.type_namespace === content_type) ?? null
    const data_items = form_config?.children.flatMap((it) => it.children as any)
    const createdAt = typeof createdAtAsString === "string" ? parseInt(createdAtAsString, 10) : 0

    const table = formData.get('table')

    if (
        typeof requestType === 'string'
        && typeof redirect_to === "string"
        && typeof pk === "string"
        && typeof sk === "string"
        && typeof content_type === "string"
        && (form_config || table === "_table_audit_v1")
    ) {
        if (requestType === "put_blog_or_page") {
            const title = formData.get('title')
            const postUrl = formData.get('postUrl')

            try {
                let payload: Record<string, unknown> = {}
                let plain_text = ""
                for (const [key, value] of formData) {
                    if (
                        key !== 'requestType'
                        && key !== 'redirect_to'
                        && key !== 'pk'
                        && key !== 'sk'
                        && key !== 'createdAt'
                        && key !== 'csrf'
                    ) {
                        data_items?.forEach((item: any) => {
                            if (item.data_namespace === key) {

                                const inSearch = item?.in_search

                                if (item.data_type === "string" && typeof value === "string") {
                                    const trimmed = value.trim()
                                    payload = { ...payload, [key]: trimmed }

                                    if (inSearch) plain_text += trimmed.toLowerCase() + " "

                                } else if (item.data_type === "boolean") {
                                    if (value === "on") {
                                        payload = { ...payload, [key]: true }
                                    } else {
                                        payload = { ...payload, [key]: false }
                                    }
                                } else if (item.data_type === "json" && typeof value === "string") {
                                    payload = { ...payload, [key]: parseJSON(value) }
                                } else if (item.data_type === "list") {

                                    const round1 = parseJSON(value);
                                    let subList: Record<string, string | number>[] = []
                                    if (Array.isArray(round1)) {
                                        round1.forEach((li) => {
                                            const oe = Object.entries(li)
                                            oe.forEach(([k, v]) => {
                                                const parsedVal = parseJSON(v)
                                                // @ts-expect-error todo
                                                subList = [...subList, { [k]: parsedVal }]

                                                if (inSearch && item.list_config?.length) {
                                                    const inSrch = item.list_config.find((it: any) => it.item_namespace === k)
                                                    if (inSrch.in_search) {

                                                        if (typeof v === "string") plain_text += v.toLowerCase() + " "
                                                    }
                                                }
                                            })

                                        })
                                    }
                                    payload = { ...payload, [key]: round1 }
                                } else if (item.data_type === "number") {
                                    if (typeof value === "string") {
                                        payload = { ...payload, [key]: parseInt(value, 10) ?? null }
                                    } else {
                                        payload = { ...payload, [key]: null }
                                    }
                                }
                            }
                        })
                    }
                }
                if (plain_text) payload = { ...payload, plain_text: createPlainText(plain_text) }
                const res = await putDynamoDB({
                    ...payload,
                    pk,
                    sk,
                    createdAt
                }, table as any)
                await res

                const params = new URLSearchParams()
                params.set('tempMsgTitle', 'tm_post_published_title')
                if (typeof title === "string") params.set('tempMsgDescription', title)
                if (typeof postUrl === "string") params.set('tempMsgUrl', postUrl)

                return redirect(redirect_to + '?' + params.toString())
            } catch (err) {
                return null
            }
        } else if (requestType === "delete_db_post") { // used for post
            const title = formData.get('title')
            const params = new URLSearchParams()

            if (typeof title === "string") {
                params.set('tempMsgTitle', 'tm_post_deleted_title')
                params.set('tempMsgDescription', title ?? 'title')
            }

            try {
                const res = await deleteDynamoDB(pk, sk, table as any);
                return redirect(redirect_to + '?' + params.toString())
            } catch (err) {
                console.log('cud_db 1____CATCH__________', { err })
                return err

            }
        }
    }
    return null
}

export const loader = () => redirect('/', { status: 404 })

