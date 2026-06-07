import { Form, useActionData, useLoaderData, useRouteLoaderData } from "react-router";
import { Pencil1Icon, PlusCircledIcon, TrashIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";

import { useCurrentURL } from "../../../../common/shared/hooks";
import { useAuth } from "../../utils/auth/useAuth";
import CMS_CONFIG from "../../../cms.config";
import { isAuth } from "~/cms/lib/utils/auth/auth.server";
import type { Route } from "./+types/cms_main";
import { queryDynamoDB } from "~/common/utils/server/dynamodb.server";
import { deleteDynamoDB, putDynamoDB } from "~/cms/lib/utils/server/cms_dynamodb.server";
import SaveIcon from "~/cms/lib/assets/icons/icon_save";
import MarkdownWithCustomElements from "~/common/shared/markdown"


const {
    AUTH_CONFIG: {
        GUEST_AUTH_LVL, ADMIN_AUTH_LVL, MIN_AUTH_LVL_EDIT_RIGHTS
    },

    ROUTES_CONFIG: { C_CMS_MAIN: { pageHandle } }
} = CMS_CONFIG


export const handle = {
    page: pageHandle
}


export const action = async ({ request }: Route.ActionArgs) => {
    await isAuth(request, true)
    const formData = await request.formData()
    const sk = formData.get('sk')
    const body = formData.get('body')
    const type = formData.get('type')
    const createdAt = formData.get('createdAt')

    if (typeof sk === "string" && typeof type === "string" && typeof createdAt === "string") {
        try {
            if (type === "edit") {
                const res = await putDynamoDB({
                    pk: "IN#notes",
                    sk,
                    createdAt: parseInt(createdAt),
                    body
                })
                return Response.json({ res })
            } else if (type === "delete") {
                const res = await deleteDynamoDB("IN#notes", sk)
            }
        } catch {
            null
        }
    }


    return null
}


export const loader = async ({ request }: Route.LoaderArgs) => {
    await isAuth(request, true)

    const res = await queryDynamoDB({
        pk: "IN#notes",
        Limit: 50,
        ProjectionExpression: undefined,

    })

    return Response.json({ notes: res?.Items })
}


export default function CMSMain() {
    const auth = useAuth()
    const currentURL = useCurrentURL()
    let { settings } = useRouteLoaderData('root')
    const loaderData = useLoaderData()
    const actionData = useActionData()
    const [editNote, setEditNote] = useState<null | string>(null)
    const [addNote, setAddNote] = useState(false)

    const {URL_FRAGMENTS: {UF_CMS}} = CMS_CONFIG

    const hasEditRights = auth > MIN_AUTH_LVL_EDIT_RIGHTS

    let {
        locTxt: {
            hello_msg: {
                hm_title,
                hm_msg_guest,
                hm_msg_admin,
                hm_msg_tt,
                hm_msg_dont_show_msg,
                hm_desc
            },
            ui_labels: {
                ui_not_allowed_in_guest_mode
            },
        }
    } = useRouteLoaderData('cms/lib/routes/layouts/cms_root_layout')

    const notes = loaderData?.notes

    useEffect(() => {
        if (actionData?.res) {
            setEditNote(null)
            setAddNote(false)
        }
    }, [actionData?.res])


    if (auth < 1) return null

    return (
        <div className="max-w-2xl m-auto p-2">
            {settings?.cms_show_hello_msg ? (
                <div className="flex gap-4 flex-col p-4 bg-neutral-100 dark:bg-neutral-900 rounded-sm">

                    <h2 className="text-xl">{hm_title}</h2>
                    <ul className="list-disc pl-6 flex flex-col gap-2">
                        <li>{hm_desc}</li>
                        {auth === GUEST_AUTH_LVL ? (
                            <li>
                                {hm_msg_guest}
                            </li>
                        ) : null}
                        {auth === ADMIN_AUTH_LVL ? (
                            <li>
                                {hm_msg_admin}
                            </li>
                        ) : null}
                        <li>
                            {hm_msg_tt}
                        </li>
                    </ul>

                    <div className="p-2">
                        <Form
                            method="post"
                            className="flex justify-end w-full"
                            action={`/${UF_CMS}/actions/cu-settings`}
                            encType="application/x-www-form-urlencoded"
                        >
                            <input
                                type="hidden"
                                name="redirect_to"
                                value={currentURL}
                            />
                            <input
                                type="hidden"
                                name="payload"
                                value={JSON.stringify({ cms_show_hello_msg: false })}
                            />
                            <button type="submit" className="btn_1 reg p-2">
                                {hm_msg_dont_show_msg}
                            </button>
                            <AuthenticityTokenInput />
                        </Form>

                    </div>
                </div>
            ) : null}

            <div className="flex gap-4 flex-col p-4 bg-neutral-100 dark:bg-neutral-900 rounded-sm mt-4">

                <div className="flex justify-between">
                    <h2 className="text-xl">Notes</h2>
                    <button type="button"
                        className="btn_1 icon small"
                        onClick={() => setAddNote((prev) => !prev)}
                    >
                        <PlusCircledIcon width={20} height={20} />
                    </button>
                </div>

                {addNote && (
                    <div>
                        <Form
                            method="post"
                            encType="application/x-www-form-urlencoded"
                        >
                            <div>
                                <div className="flex gap-2 p-2">
                                    <label htmlFor="newSk">Title / SK</label>
                                    <input id="newSk" type="text" name="sk" className="inp_1 grow" placeholder="string-no-whitespace" />
                                </div>

                                <textarea
                                    placeholder="note in markdown and / or HMTL"
                                    rows={7}
                                    name="body"
                                    className="inp_1 resize w-full"
                                />
                                <input type="hidden" name="createdAt" value={Date.now()} />
                                <input type="hidden" name="type" value="edit" />
                            </div>

                            <div className="flex justify-end">
                                <button type="submit" className={clsx("btn_3", {
                                    'icon small': hasEditRights,
                                    'flex gap-2 p-2': !hasEditRights
                                })}
                                    disabled={!hasEditRights}
                                >
                                    <SaveIcon width={20} height={20} />
                                    {hasEditRights ? null : (<span> {ui_not_allowed_in_guest_mode}</span>)}
                                </button>
                            </div>
                            <AuthenticityTokenInput />
                        </Form>
                    </div>
                )}

                {notes?.length ? (
                    <div>

                        {notes.map((it: any, ind: number) => (
                            <div key={`${it.sk}-${ind}`}>
                                <div className="bg-neutral-50 dark:bg-neutral-950 pt-2" />
                                <div className="text-xl mt-4 px-2">{it.sk}</div>
                                {editNote === it?.sk ? (
                                    <Form
                                        method="post"
                                        encType="application/x-www-form-urlencoded"
                                    >
                                        <input type="hidden" name="sk" value={it.sk} />
                                        <input type="hidden" name="type" value="edit" />

                                        <textarea
                                            name="body"
                                            defaultValue={it?.body ?? ''}
                                            className="inp_1 resize w-full mt-2"
                                            rows={7}
                                        />

                                        <input type="hidden" name="createdAt" value={it.createdAt} />
                                        <div className="flex gap-2 justify-end w-full">
                                            <button
                                                className={clsx("btn_3", { 'small icon': hasEditRights, 'flex gap-2 p-2': !hasEditRights })}
                                                type="submit"
                                                disabled={!hasEditRights}>
                                                <SaveIcon width={20} height={20} />
                                                {hasEditRights ? null : (<span> {ui_not_allowed_in_guest_mode}</span>)}
                                            </button>

                                            <button
                                                type="button"
                                                className="btn_1 icon small"
                                                onClick={() => setEditNote(null)}
                                            >
                                                <Pencil1Icon width={20} height={20} />
                                            </button>
                                        </div>
                                        <AuthenticityTokenInput />
                                    </Form>
                                ) : (
                                    <div>
                                        <div
                                            className="cms_notes px-2 py-4">
                                                <MarkdownWithCustomElements
                                                markup={it?.body ?? ''}
                                                />
                                        </div>


                                        <div className="flex gap-2 pb-4 justify-end">
                                            <button
                                                type="button"
                                                className="btn_1 icon small"
                                                onClick={() => setEditNote(it?.sk)}
                                            >
                                                <Pencil1Icon width={20} height={20} />
                                            </button>
                                            <details className="flex gap-2">
                                                <summary className="btn_1 icon small">
                                                    <TrashIcon width={20} height={20} />
                                                </summary>

                                                <Form
                                                    method="post"
                                                    encType="application/x-www-form-urlencoded"
                                                >
                                                    <input type="hidden" name="sk" value={it.sk} />
                                                    <input type="hidden" name="type" value="delete" />
                                                    <input type="hidden" name="createdAt" value={it.creaedAt} />

                                                    <button type="submit" className="btn_4 reg small"
                                                        disabled={!hasEditRights}>
                                                        confirm delete
                                                        {" "}
                                                        ({hasEditRights ? null : (
                                                            <span> {ui_not_allowed_in_guest_mode}</span>)})
                                                    </button>
                                                    <AuthenticityTokenInput />
                                                </Form>
                                            </details>
                                        </div>
                                    </div>
                                )}

                            </div>
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    )
}



