import {
    Form, redirect, useActionData, useFetcher, useLoaderData,
    useNavigate, useParams, useRouteLoaderData, useSearchParams
} from "react-router"
import { useEffect, useReducer, type BaseSyntheticEvent } from "react"
import { CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons"
import clsx from "clsx"

import { isAuth } from "../../utils/auth/auth.server"
import CMS_CONFIG from "../../../cms.config"
import { putDynamoDB } from "../../utils/server/cms_dynamodb.server"
import { queryDynamoDB } from "~/common/utils/server/dynamodb.server"
import { useCurrentURL } from "../../../../common/shared/hooks"
import { useAuth } from "../../utils/auth/useAuth"
import SITE_CONFIG from "~/site/site.config"
import { createLangPathByParam } from "~/common/shared/lang"
import RadixSelect from "../../ui/radix/radix_select"
import InputList from "../../ui/generics/g_input_list"
import { parseJSON } from "~/common/shared/misc"
import Pagination from "~/common/ui/generics/g_pagination"
import type { Route } from "./+types/cms_database"
import { useCMSStates } from "~/cms/lib/cms_states"
import CopytToClipboardButton from "~/cms/lib/ui/generics/g_copy_to_clipboard_button"
import { CmsDBViewRows } from "~/cms/lib/ui/db_view/cms_db_view_rows"
import type { DBBase } from "../../../../../types/site"
import { AuthenticityTokenInput } from "remix-utils/csrf/react"


const { URL_FRAGMENTS: { UF_CMS, UF_DATABSE },
    ROUTES_CONFIG: { C_CMS_DATABASE: { pageHandle } } } = CMS_CONFIG


export const handle = {
    page: pageHandle
}


export const action = async ({ request }: Route.ActionArgs) => {
    await isAuth(request, true)
    const formData = await request.formData()
    const payload = formData.get('payload')
    const type = formData.get('type')
    const table = formData.get('table')

    try {
        const auth = await isAuth(request)
        const { AUTH_CONFIG: { MIN_AUTH_LVL_EDIT_RIGHTS } } = CMS_CONFIG
        if (auth < MIN_AUTH_LVL_EDIT_RIGHTS) return redirect('/', { status: 302 })

        if (typeof payload === "string" && typeof type === "string") {
            if (type === "edit") {
                const parsed = JSON.parse(payload)
                const res = await putDynamoDB(parsed)
                return Response.json({ res })
            } else if (type === "bulk_upload") {
                const parsed = JSON.parse(payload)
                if (parsed?.length) {
                    let jobs: Promise<unknown>[] = []
                    for (let i = 0; i < parsed.length; i += 1) {
                        jobs = [...jobs, putDynamoDB(parsed[i], table as any)]
                    }
                    const res = await Promise.all(jobs)

                    return Response.json({ "db_updated": true })
                }
            }
        }
    } catch (err) {
        return null
    }
}


export const loader = async ({ params, request }: Route.LoaderArgs) => {
    await isAuth(request, true)
    const { pk } = params

    if (!pk) return Response.json({})

    const realPk = pk.replace('_', '#') as DBBase["pk"]

    const searchParams = new URLSearchParams(new URL(request.url).searchParams)
    const lastSK = searchParams.get('last_sk')
    const lastCreatedAt = searchParams.get('last_created_at')
    const filterCats = searchParams.get('categories')?.split(' ').map((it) => decodeURIComponent(it))
    const table = searchParams.get('table')

    const res = await queryDynamoDB({
        pk: realPk,
        filterCats,
        ExclusiveStartKey: (lastSK && lastCreatedAt)
            ? { pk: { S: realPk }, sk: { S: lastSK }, createdAt: { N: lastCreatedAt } }
            : undefined,
        Limit: 250,
        ProjectionExpression: undefined,
        tableName: table as any
    })

    return Response.json(res)
}


export default function DatabaseInterface() {
    const { lang, pk } = useParams()
    const [sp] = useSearchParams()
    const { SITE_LANGS } = SITE_CONFIG

    const { AUTH_CONFIG: { MIN_AUTH_LVL_EDIT_RIGHTS }, URL_FRAGMENTS: {UF_CMS}, 
    PAGE_TYPES, MEDIA_TYPES } = CMS_CONFIG
    const langs: [string, string][] = SITE_LANGS.map((it) => [it.label, it.lang_code])
    const currentUrl = useCurrentURL()
    const auth = useAuth()
    const fetcherDB = useFetcher({ key: 'delete_db_post' })
    const hasEditRights = auth > MIN_AUTH_LVL_EDIT_RIGHTS
    const loaderData = useLoaderData();
    const rootLoaderData = useRouteLoaderData('root')
    const navigate = useNavigate()
    const actionData = useActionData()
    const fetcherDB2 = useFetcher({ key: 'delete_db_entries' })
    const fetcherS3 = useFetcher({ key: 'delete_s3' })

    const [{
        proc_ig_progress_s3_deleted,
        proc_ig_progress_db_deleted,
        proc_ig_progress_is_deleting_image,
    }, setCMSStates] = useCMSStates()

    const entryTypeFromParam = pk?.split('_')[0] === "ME" ? "file" : 'doc'
    const pkMainFromParam = pk?.split('_')[0] ?? null
    const pkSubKeyFromParam = pk?.split('_')[1] ?? null
    const categoriesFromSp = sp.get('categories')?.split(' ').map((it) => decodeURIComponent(it))
    const keywordFromSp = sp.get('keyword') ?? ''

    const searchParams = new URLSearchParams()

    const {
        locTxt: {
            database: {
                db_cats,
                db_keyword,
                db_query,
                db_title,
                db_action,
                db_confirm_delete,
                db_entry_type,
                db_file_type,
                db_document_type,
                db_lang,
                db_sub_type,
                db_doc,
                db_file
            },
            ui_labels: {
                ui_not_allowed_in_guest_mode
            },
        } } = useRouteLoaderData('cms/lib/routes/layouts/cms_root_layout')

    const [{
        tableName,
        pkMainKey,
        pkSubKey,
        entryType, // doc, media
        categories,
        keyword,
        expandElement,
        isEditing,
        isEditingValidJson,
        showRawData,
        actionType,
        upladJsonHasPayload,
        isUploadJsonFormatValid
    }, dispatch] = useReducer(((st, act) => {
        return {
            ...st,
            ...act.reduce((
                i: Record<string, unknown>,
                j: Record<string, unknown>
            ) => ({ ...i, ...j }), {})
        }
    }), {
        tableName: "_table",
        entryType: entryTypeFromParam,
        pkMainKey: pkMainFromParam,
        pkSubKey: pkSubKeyFromParam,
        categories: [],
        keyword: '',
        expandElement: null,
        isEditing: false,
        isEditingValidJson: true,
        showRawData: false,
        actionType: 'query',
        isUploadJsonFormatValid: false,
        upladJsonHasPayload: false
    })


    const onDoQuery = (e: BaseSyntheticEvent) => {
        e.preventDefault()
        if (tableName === "_table_audit_v1") {

            searchParams.set('table', '_table_audit_v1')

            navigate(createLangPathByParam(lang, 
                `/${UF_CMS}/${UF_DATABSE}/${pkMainKey}${searchParams && '?'}${searchParams.toString()}`))
        } else {
            navigate(createLangPathByParam(lang, 
                `/${UF_CMS}/${UF_DATABSE}/${pkMainKey}_${pkSubKey}${searchParams && '?'}${searchParams.toString()}`))
        }

    }


    const onDeletePost = (pk: string, sk: string) => {
        if (            hasEditRights && pk && sk) {
            fetcherDB.submit({
                requestType: 'delete_db_post',
                pk,
                sk,
                redirect_to: createLangPathByParam(lang, currentUrl),
                title: 'Delete',
                table: tableName,
                csrf: rootLoaderData.csrfToken
            }, {
                encType: "application/x-www-form-urlencoded",
                action: `/${UF_CMS}/actions/cud-db`,
                method: 'post'
            })
        }

    }


    const onDeleteFile = async (item: any) => {
        if (!hasEditRights) return
        await fetcherDB2.submit({
            requestType: 'delete_db_item',
            pk: item.pk,
            sk: item.sk,
            redirect_to: currentUrl,
            table: tableName,
            csrf: rootLoaderData.csrfToken

        }, {
            encType: "application/x-www-form-urlencoded",
            action: `/${UF_CMS}/actions/cud-id-db`,
            method: 'post',
        })
        const keys = item.sources.map((it: any) => new URL(it.url).pathname.slice(1))
        await fetcherS3.submit({
            requestType: 'deleteFiles',
            keys,
            folder: item?.sk,
            csrf: rootLoaderData.csrfToken
        }, {
            encType: "application/json",
            action: `/${UF_CMS}/actions/cd-s3`,
            method: 'post',
        })
    }

    useEffect(() => {
        if (fetcherDB.state === "idle") {
            if (proc_ig_progress_db_deleted !== 2
                && proc_ig_progress_is_deleting_image) {
                setCMSStates({
                    type: "update_val",
                    key: "proc_ig_progress_db_deleted", value: 2
                })
            }
        }
        if (fetcherS3?.data?.res === "ok") {
            if (proc_ig_progress_s3_deleted !== 2
                && proc_ig_progress_is_deleting_image) {
                setCMSStates({
                    type: "update_val",
                    key: "proc_ig_progress_s3_deleted", value: 2
                })
            }
        }
        if (fetcherDB.state === "idle"
            && fetcherS3?.data?.res === "ok"
            && proc_ig_progress_is_deleting_image) {
            const timeout = setTimeout(() => {
                setCMSStates({
                    type: "update_val",
                    key: "proc_ig_progress_is_deleting_image", value: false
                })
            }, 800)
            return () => clearTimeout(timeout)
        }
    }, [
        fetcherDB?.state,
        fetcherS3?.data,
        proc_ig_progress_s3_deleted,
        proc_ig_progress_db_deleted])


    useEffect(() => {
        if (categories.length) {
            const pa = categories?.map((it) => encodeURIComponent(it)).join(' ')
            searchParams.set('categories', pa)
        } else {
            searchParams.delete('categories')
        }

        if (keyword?.length) {
            searchParams.set('keyword', keyword)
        } else {
            searchParams.delete('keyword')
        }

    }, [JSON.stringify(categories), keyword])


    useEffect(() => {
        if (actionData?.db_updated === true) {
            setCMSStates({ type: "update_val", key: "ui_show_item_saved_to_db", value: true })
        }

    }, [actionData])


    return (
        <main className="max-w-5xl mx-auto mt-8">
            <div className="flex flex-col gap-7 px-4 pb-12">

                <div>
                    <RadixSelect
                        selectTriggerProps={{ className: 'btn_1 reg' }}
                        placeholder="Default"
                        selectItems={[['default', '_table'], ['Audit v1', '_table_audit_v1']]}

                        selectRootProps={{
                            onValueChange: (e) => {
                                dispatch([{
                                    tableName: e,
                                }]);
                                searchParams.set('table', e)
                            },

                            defaultValue: '_table',

                        }}
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => dispatch([{ actionType: 'query' }])}
                        type="button" className={clsx('reg btn_1', { active: actionType === "query" })}>
                        Query
                    </button>
                    <button
                        onClick={() => dispatch([{ actionType: 'bulk_upload' }])}
                        type="button" className={clsx('reg btn_1', { active: actionType === "bulk_upload" })}>
                        Upload
                    </button>
                </div>

                {actionType === "bulk_upload" && (
                    <div>
                        <Form method="POST" className="relative" >

                            <input type="hidden" name="type" value="bulk_upload" />
                            <textarea
                                rows={20}
                                style={{
                                    fontFamily: 'monospace',
                                    padding: '0.5rem',
                                    whiteSpace: 'break-spaces'
                                }}
                                className="inp_1 w-full resize"

                                placeholder={JSON.stringify(
                                    [
                                        { pk: "ME#IM", sk: "adsf123", createdAt: 12343456 },
                                        { pk: "ME#IM", sk: "xyz9876", createdAt: 23434556 }
                                    ]
                                    , null, 2)}
                                name="payload"
                                onChange={(e) => {
                                    const isValid = parseJSON(e.currentTarget.value);
                                    let formatOk = isValid ? true : false
                                    if (Array.isArray(isValid)) {
                                        for (let i = 0; i < isValid.length; i += 1) {
                                            try {
                                                const { pk, sk, createdAt } = isValid[i]
                                                if (typeof pk !== "string" || typeof sk !== "string" || (typeof createdAt !== 'number' && tableName === "_table")) {
                                                    formatOk = false
                                                }
                                            } catch {
                                                formatOk = false
                                            }
                                        }

                                    } else {
                                        formatOk = false
                                    }
                                    dispatch([{
                                        isEditingValidJson: isValid ? true : false,
                                        isUploadJsonFormatValid: formatOk,
                                        upladJsonHasPayload: e.currentTarget.value?.length ? true : false
                                    }])
                                }}
                            />
                            {upladJsonHasPayload && (
                                <div className="absolute top-2 right-5">
                                    {isEditingValidJson ? (
                                        <div className="flex gap-2 flex-col">
                                            <div className="flex justify-end gap-2 text-green-800 dark:text-green-200">
                                                <span>JSON valid</span>
                                                <CheckCircledIcon width={20} height={20} />
                                            </div>
                                            <div>
                                                {isUploadJsonFormatValid ? (
                                                    <div className="flex justify-end gap-2 text-green-800 dark:text-green-200">
                                                        <span>Format valid</span>
                                                        <CheckCircledIcon width={20} height={20} />
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end gap-2 text-amber-800 dark:text-amber-200">
                                                        <span>Format not valid</span>
                                                        <CrossCircledIcon width={20} height={20} />
                                                    </div>

                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end gap-2 text-amber-800 dark:text-amber-200">
                                            <span>JSON not valid</span>
                                            <CrossCircledIcon width={20} height={20} />
                                        </div>
                                    )}
                                </div>
                            )}
                            {(isUploadJsonFormatValid && upladJsonHasPayload) &&
                                <div className="flex justify-end py-2">
                                    <button type="submit" className="btn_3 reg"
                                        disabled={!hasEditRights}
                                    >
                                        upload
                                        {!hasEditRights ? (
                                            <span>
                                                ({" "}{ui_not_allowed_in_guest_mode})
                                            </span>) : null}

                                    </button>
                                </div>}
                            <AuthenticityTokenInput />
                        </Form>
                    </div>
                )}

                {(tableName === "_table_audit_v1" && actionType === "query") && (
                    <>
                        <form className="cms_tool_bar flex gap-3 sticky justify-between z-[2] flex-col py-2 border-b border-neutral-200 dark:border-neutral-800">
                            <div className="flex gap-2 flex-wrap items-center">
                                <RadixSelect
                                    selectTriggerProps={{ className: 'btn_1 reg' }}
                                    placeholder={db_entry_type}
                                    selectItems={[['Page', 'page'], ['Page Archive', 'page-archive'], ['Select', 'select']]}

                                    selectRootProps={{

                                        onValueChange: (e) => {
                                            dispatch([{
                                                pkMainKey: e
                                            }]);
                                        },
                                        defaultValue: 'select'
                                    }}
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => dispatch([{ showRawData: false }])}
                                    type="button" className={clsx('reg btn_1', { active: !showRawData })}>
                                    Table
                                </button>
                                <button
                                    onClick={() => dispatch([{ showRawData: true }])}
                                    type="button" className={clsx('reg btn_1', { active: showRawData })}>
                                    JSON
                                </button>
                                <button
                                    disabled={!pkMainKey}
                                    type="submit" className="btn_3 reg" onClick={(e) => onDoQuery(e)}>
                                    {db_query}
                                </button>
                            </div>
                        </form>
                        {!showRawData && loaderData?.Items ? (
                            <div className="overflow-auto">
                                <table className="table_1 table-fixed">
                                    <thead>
                                        <tr>
                                            <th className="w-16">PK</th>
                                            <th className="w-60">SK</th>
                                            {entryTypeFromParam === "doc" ? (
                                                <th>{db_title}</th>
                                            ) : null}
                                            {entryTypeFromParam === "file" ? (
                                                <th>{db_cats}</th>
                                            ) : null}
                                            <th className="w-60">{db_action}</th>
                                        </tr>
                                    </thead>

                                    <CmsDBViewRows
                                        loaderData={loaderData}
                                        entryTypeFromParam={entryTypeFromParam}
                                        expandElement={expandElement}
                                        isEditing={isEditing}
                                        dispatch={dispatch}
                                        hasEditRights={hasEditRights}
                                        onDeleteFile={onDeleteFile}
                                        onDeletePost={onDeletePost}
                                        entryType={entryType}
                                        isEditingValidJson
                                    />

                                </table>
                                <Pagination />

                            </div>

                        ) : null}


                    </>
                )}


                {(tableName === "_table" && actionType === "query") && (
                    <>
                        <form className="cms_tool_bar flex gap-3 sticky justify-between z-[2] flex-col py-2 border-b border-neutral-200 dark:border-neutral-800">
                            <div className="flex gap-2 flex-wrap items-center">
                                <RadixSelect
                                    selectTriggerProps={{ className: 'btn_1 reg' }}
                                    placeholder={db_entry_type}
                                    selectItems={[[db_doc, 'doc'], [db_file, 'file']]}

                                    selectRootProps={{
                                        onValueChange: (e) => {
                                            dispatch([{
                                                entryType: e,
                                                pkMainKey: null,
                                                pkSubKey: null
                                            }]);
                                        },
                                        defaultValue: entryType ?? undefined
                                    }}
                                />

                                <RadixSelect
                                    selectTriggerProps={{ className: 'btn_1 reg' }}
                                    placeholder={
                                        entryType === "doc"
                                            ? db_document_type
                                            : entryType === "file"
                                                ? db_file_type
                                                : '-----'
                                    }
                                    selectItems={
                                        entryType === "doc"
                                            ? PAGE_TYPES.map((it) => ([it[0], it[1]]))
                                            : entryType === "file"
                                                ? [["Media", 'ME']]
                                                : []
                                    }

                                    selectRootProps={{
                                        onValueChange: (e) => dispatch([{
                                            pkMainKey: e,
                                            pkSubKey: null
                                        }]),
                                        value: pkMainKey ?? ''
                                    }}
                                />

                                <RadixSelect
                                    selectTriggerProps={{ className: 'btn_1 reg' }}
                                    placeholder={entryType === "doc" ? db_lang : entryType === "file" ? db_sub_type : ''}
                                    selectItems={entryType === "doc" ? langs : entryType === "file" ? MEDIA_TYPES : []}
                                    selectRootProps={{
                                        onValueChange: (e) => dispatch([{ pkSubKey: e }]),
                                        value: pkSubKey ?? ''
                                    }}
                                />
                            </div>
                            <div className="flex gap-6 flex-wrap justify-between">

                                <div className="flex gap-6 flex-wrap items-start">
                                    {entryType === "doc" ? (
                                        <div className="input_wrapper flex gap-4 flex-wrap items-center">
                                            <label htmlFor="q_keyword">{db_keyword}</label>
                                            <input
                                                defaultValue={keywordFromSp}
                                                type="search"
                                                id="q_keyword"
                                                className="inp_1"
                                                onChange={(e) => dispatch([{ keyword: e.target.value.trim() }])}
                                            />
                                        </div>
                                    ) : null}

                                    {pkMainKey === "AR" || pkMainKey === "IM" || pkMainKey === "VI" ? (
                                        <div className="flex gap-2 items-start flex-wrap">
                                            <span className="p-1">{db_cats}</span>
                                            <InputList
                                                addButtonAttributes={{ className: "btn_1 icon small" }}
                                                wrapperDivAttributes={{ className: 'input_wrapper flex gap-4 items-start flex-wrap' }}
                                                setter={(e) => dispatch([{ categories: e }])}
                                                defaultValues={categoriesFromSp}
                                                inputAttributes={{ className: 'inp_1' }}
                                            />
                                        </div>
                                    ) : null}

                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => dispatch([{ showRawData: false }])}
                                        type="button" className={clsx('reg btn_1', { active: !showRawData })}>
                                        Table
                                    </button>
                                    <button
                                        onClick={() => dispatch([{ showRawData: true }])}
                                        type="button" className={clsx('reg btn_1', { active: showRawData })}>
                                        JSON
                                    </button>
                                    <button
                                        disabled={!pkMainKey || !pkSubKey}
                                        type="submit" className="btn_3 reg" onClick={(e) => onDoQuery(e)}>
                                        {db_query}
                                    </button>
                                </div>
                            </div>

                        </form>

                        {showRawData && loaderData?.Items ? (
                            <div className="relative">
                                <CopytToClipboardButton
                                    buttonProps={{ className: 'btn_1 icon small absolute top-2 right-6' }}
                                    copyText={JSON.stringify(loaderData.Items) as string}
                                />
                                <textarea rows={7} readOnly className="inp_1 resize w-full" defaultValue={JSON.stringify(loaderData.Items, null, 2)} />
                            </div>
                        ) : null}
                        {/** ---- */}

                        {!showRawData && loaderData?.Items ? (
                            <div className="overflow-auto">
                                <table className="table_1 table-fixed">
                                    <thead>
                                        <tr>
                                            <th className="w-16">PK</th>
                                            <th className="w-60">SK</th>
                                            {entryTypeFromParam === "doc" ? (
                                                <th>{db_title}</th>
                                            ) : null}
                                            {entryTypeFromParam === "file" ? (
                                                <th>{db_cats}</th>
                                            ) : null}
                                            <th className="w-60">{db_action}</th>
                                        </tr>
                                    </thead>

                                    <CmsDBViewRows
                                        loaderData={loaderData}
                                        entryTypeFromParam={entryTypeFromParam}
                                        expandElement={expandElement}
                                        isEditing={isEditing}
                                        dispatch={dispatch}
                                        hasEditRights={hasEditRights}
                                        onDeleteFile={onDeleteFile}
                                        onDeletePost={onDeletePost}
                                        entryType={entryType}
                                        isEditingValidJson
                                    />

                                </table>
                                <Pagination />

                            </div>

                        ) : null}
                    </>
                )}
            </div>
        </main>
    )
}