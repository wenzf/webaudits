import { Fragment, useEffect, useReducer, useRef, useState } from "react";
import {
    Form, useFetcher, useParams,
    useRouteLoaderData, useSearchParams
} from "react-router";
import {
    CheckCircledIcon,
    CircleBackslashIcon,
    Cross1Icon, CrossCircledIcon,
    Link1Icon,
    TrashIcon
} from "@radix-ui/react-icons";
import clsx from "clsx";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";

import SITE_CONFIG from "../../../site/site.config";
import RadixSelect from "../radix/radix_select";
import { createLangPathByParam } from "../../../common/shared/lang";
import CMS_CONFIG from "../../cms.config";
import { useAuth } from "../../utils/auth/useAuth";
import TooltipButton from "../radix/radix_tooltip_button";
import { CONTENT_TYPES } from "~/cms/cms_content_types";
import MulitpleItemInputListPassive from "../generics/g_multiple_item_input_list_passive";
import { createPathByPKAndSK, parseJSON } from "~/common/shared/misc";
import { useCurrentURL } from "~/common/shared/hooks";
import ImageInput from "../generics/g_image_input";
import DateTimeInput from "../generics/g_date_time_input";
import SaveIcon from "~/cms/assets/icons/icon_save";
import COMMON_CONFIG from "~/common/common.config";
import type { DBBase, PKMainKey } from "../../../../types/site";


export default function PostInput({ ...props }: Record<string, any>) {
    const {
        AUTH_CONFIG: { MIN_AUTH_LVL_EDIT_RIGHTS },
        URL_FRAGMENTS: { UF_CMS }
    } = CMS_CONFIG
    const { SITE_LANGS } = SITE_CONFIG
    const { PAGE_TYPES } = COMMON_CONFIG
    const {
        locTxt: {
            editor_labels: {
                el_content_language,
                el_content_type,
                el_mode,
                el_mode_create_new_item,
                el_translated_from_to,
                el_edit_item,
                el_select_type_and_lang,
                el_type
            },
            ui_labels: {
                confirm_delete,
                ui_not_allowed_in_guest_mode
            },
            tooltips_texts: {
                tt_act_publish,
                tt_act_delete,
                tt_act_abort_add_content,
                tt_act_visit_page
            },
            page_types,
            target_langs
        }
    } = useRouteLoaderData('cms/routes/layouts/cms_root_layout')
    const currentURL = useCurrentURL()
    const [searchParams] = useSearchParams()
    const params = useParams()
    const auth = useAuth()
    const fetcherDB = useFetcher({ key: 'delete_db_post' })
    const [jsonCheck, setJsonCheck] = useState<Record<string, null | string | object>>({})
    const pkParam = params.pk
    const rootLoaderData = useRouteLoaderData('root')

    const [state, dispatch] = useReducer(((st, act) => {
        return {
            ...st,
            ...act.reduce((
                i: Record<string, unknown>,
                j: Record<string, unknown>
            ) => ({ ...i, ...j }), {})
        }
    }), {
        c_lang: pkParam?.length === 1 ? props?.lang : pkParam?.split('_')[1],
        c_type: pkParam?.length === 1 ? props.type : pkParam?.split('_')[0],
    })

    const { c_lang, c_type } = state

    const thisPk = props.pk ?? `${c_type}#${c_lang}` as DBBase["pk"]
    const hasEditRights = auth > MIN_AUTH_LVL_EDIT_RIGHTS

    const onDeletePost = () => {
        if (props.pk && props.sk && props.title && hasEditRights) {
            fetcherDB.submit({
                requestType: 'delete_db_post',
                pk: props.pk,
                sk: props.sk,
                redirect_to: createLangPathByParam(params.lang, '/cms'),
                title: props.title,
                csrf: rootLoaderData.csrfToken
            }, {
                encType: "application/x-www-form-urlencoded",
                action: '/cms/actions/cud-db',
                method: 'post',
            })
        }
    }

    const form_config = CONTENT_TYPES.find((it) => it.type_namespace === c_type)
    const forms_ref = useRef<{ [key: string]: HTMLInputElement | HTMLTextAreaElement }>({})

    const setInputRef = (itemKey: string) => (element: HTMLInputElement | HTMLTextAreaElement | null) => {
        if (element) {
            forms_ref.current[itemKey] = element;
        } else {
            delete forms_ref.current[itemKey];
        }
    };

    useEffect(() => {
        dispatch([{
            c_lang: pkParam?.length === 1 ? props.lang : pkParam?.split('_')[1],
            c_type: pkParam?.length === 1 ? props.type : pkParam?.split('_')[0],
            c_page_sk: props.sk
        }])
    }, [props.sk, props.pk])


    useEffect(() => {
        if (forms_ref.current !== null && typeof forms_ref.current === "object") {
            form_config?.children.forEach((it, sec) => {
                it.children.forEach((itt, item) => {
                    const namespace = itt.data_namespace
                    if (namespace in props) {
                        if (forms_ref.current
                            && forms_ref.current[`input-${sec}-${item}`]) {
                            if (itt.data_type === "string") {
                                if (namespace in props) forms_ref.current[`input-${sec}-${item}`].value = props[namespace]
                            } else if (itt.data_type === "boolean") {
                                if (props[namespace]) {
                                    (forms_ref.current[`input-${sec}-${item}`] as HTMLInputElement).checked = true
                                } else {
                                    (forms_ref.current[`input-${sec}-${item}`] as HTMLInputElement).checked = false
                                }
                            } else if (itt.data_type === "json") {
                                if (props[namespace]) forms_ref.current[`input-${sec}-${item}`].value = JSON.stringify(props[namespace], null, 2)
                            } else if (itt.data_type === "number") {
                                //@ts-expect-error todo
                                if (namespace in props && typeof props[namespace] === "number") forms_ref.current[`input-${sec}-${item}`].value = parseInt(props[namespace], 10)
                            }
                        }
                        if (itt.input_type === "custom_select") {
                            dispatch([{ [`inp-s-${namespace}`]: props[namespace] }])
                        }
                    }
                })
            })
        }
    }, [form_config])


    return (
        <div>

            <Form
                preventScrollReset
                method='post'
                className="flex flex-col gap-7 pb-12 font-light"
                action="/cms/actions/cud-db"
                encType="application/x-www-form-urlencoded"
            >
                {/* meta */}
                <input type="hidden" name="requestType" value="put_blog_or_page" />
                <input type="hidden" name="redirect_to"
                    value={currentURL}
                />
                <input type="hidden" name="pk" value={thisPk} />


                {!props.sk && PAGE_TYPES
                    .filter((it) => it[1] === c_type && it[2])
                    .map((ii, ind) => (
                        <Fragment key={ind}>
                            {ii[2] && <input
                                type="hidden"
                                name="sk"
                                value={ii[2] ?? ''}
                            />}

                        </Fragment>))
                }

                {props.sk ? (
                    <input type="hidden" name="sk" value={props.sk} />
                ) : null}

                {/* header */}
                <div className="flex py-2 gap-2 sticky top-0 justify-between z-40 bg-neutral-100
                 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
                    <div className={clsx("flex flex-wrap gap-2")}>

                        <TooltipButton
                            triggerProps={{
                                id: 'submit',
                                type: 'submit',
                                className: clsx('btn_3 icon small'),
                                disabled: !hasEditRights
                            }}
                            tooltipText={hasEditRights ? tt_act_publish : (
                                <div>
                                    <div>{tt_act_publish}</div>
                                    <div className="flex text-red-900 dark:text-red-100">
                                        <CircleBackslashIcon width={16} height={16} aria-hidden />
                                        {" "}
                                        {ui_not_allowed_in_guest_mode}
                                    </div>
                                </div>
                            )}>
                            <SaveIcon
                                width={16}
                                height={16}
                                aria-label={tt_act_publish}
                            />
                            {/**
                             *                             {!hasEditRights && <NotAllowedInGuestMode />}
                             */}

                        </TooltipButton>

                        {props.pk && (
                            <>
                                <TooltipButton
                                    isNavLink
                                    triggerProps={{
                                        id: 'page',
                                        className: clsx('btn_1 icon small'),
                                        end: true,
                                        to: createPathByPKAndSK(props.pk, props.sk),
                                        target: '_blank'
                                    }}
                                    tooltipText={tt_act_visit_page}>
                                    <Link1Icon
                                        width={16}
                                        height={16}
                                        aria-label={tt_act_visit_page}
                                    />
                                </TooltipButton>

                                <TooltipButton
                                    tooltipText={hasEditRights ? tt_act_delete : (
                                        <div>
                                            <div>{tt_act_delete}</div>
                                            <div className="flex text-red-900 dark:text-red-100">
                                                <CircleBackslashIcon width={16} height={16} aria-hidden />
                                                {" "}
                                                {ui_not_allowed_in_guest_mode}
                                            </div>
                                        </div>
                                    )}
                                    triggerElement={
                                        <details className="flex gap-2 items-center h-[33px]">
                                            <summary
                                                tabIndex={-1}
                                                className="btn_1 icon small cursor-pointer">
                                                <TrashIcon
                                                    width={16}
                                                    height={16}
                                                    aria-label={tt_act_delete}
                                                />
                                            </summary>
                                            <button
                                                disabled={!hasEditRights}
                                                type="button"
                                                className="btn_4 reg"
                                                onClick={() => (onDeletePost())}
                                            >
                                                {confirm_delete}

                                            </button>
                                            {/**
                                             *                                             {!hasEditRights && <NotAllowedInGuestMode />}
                                             */}

                                        </details>
                                    }
                                />
                            </>
                        )}
                    </div>
                    <div>
                        <TooltipButton
                            isNavLink
                            triggerProps={{
                                end: true,
                                className: clsx("btn_1 icon small"),
                                to: createLangPathByParam(props.lang, `/${UF_CMS}`)
                            }}
                            tooltipText={tt_act_abort_add_content}>
                            <Cross1Icon width={16} height={16}
                                aria-label={tt_act_abort_add_content} />
                        </TooltipButton>
                    </div>
                </div>

                {/* SECTION MODE */}
                <div className={clsx("flex flex-col gap-4 border border-neutral-200 dark:border-neutral-800")}>
                    <div className="form_section_header">
                        <span>
                            {el_mode}
                        </span>
                    </div>

                    {!props?.sk ? (
                        <div className="pb-2">
                            <div className="p-2 text-xl">{el_mode_create_new_item}</div>
                            <ul className="list-disc ml-8">
                                {!c_type || !c_lang ? (
                                    <li className="m-1">
                                        {el_select_type_and_lang}
                                    </li>
                                ) : (
                                    <>
                                        <li className="m-1">{el_content_type}: <span className="italic">{page_types[c_type]}</span></li>
                                        <li className="m-1">{el_content_language}: <span className="italic">{target_langs[c_lang]}</span></li>
                                    </>
                                )}
                            </ul>
                        </div>


                    ) : null}
                    {props.sk ? (
                        <>
                            {searchParams.get('translation_result') ? (
                                <div className="p-2">
                                    {el_translated_from_to.replace('{{placeholder_1}}',
                                        searchParams.get('translate_from')).replace('{{placeholder_2}}',
                                            searchParams.get('target_lang'))}
                                </div>
                            ) : (
                                <div className="text-xl p-2">
                                    {el_edit_item.replace('{{placeholder}}',
                                        page_types[c_type ?? props?.type ?? 'document'])}

                                </div>
                            )}
                        </>
                    ) : null}
                </div>


                {/* SECTION CONTENT CONFIGURATION */}
                <div className={clsx("flex flex-col gap-4 border border-neutral-200 dark:border-neutral-800")}>
                    <div className="form_section_header">
                        <span>
                            {el_type}
                        </span>

                    </div>
                    {!props.pk ? (
                        <>
                            {/* new item */}
                            <div className="flex gap-4 items-center flex-wrap p-2">
                                <label htmlFor="content_lang">{el_content_language}</label>
                                <RadixSelect
                                    selectTriggerProps={{
                                        "aria-label": el_content_language
                                    }}
                                    id="content_lang"
                                    placeholder={el_content_language}

                                    selectItems={
                                        SITE_LANGS.map((it) => ([it.label, it.lang_code]))}
                                    selectRootProps={{
                                        // DEV: english only 
                                        //  defaultValue: c_lang,
                                        defaultValue: "en",
                                        onValueChange: (e: any) => dispatch([{ c_lang: e }]),
                                    }}
                                />
                            </div>
                            <div className="flex gap-4 items-center flex-wrap p-2">
                                <label htmlFor="content_type">{el_content_type}</label>
                                <RadixSelect
                                    id="content_type"
                                    selectTriggerProps={{ "aria-label": el_content_type }}
                                    selectRootProps={{
                                        defaultValue: props.type,
                                        // DEV english only
                                        // onValueChange: (e: any) => dispatch([{ c_type: e as PKMainKey }]),
                                        onValueChange: (e: any) => dispatch([{ c_type: e as PKMainKey, c_lang: 'en' }]),

                                    }}
                                    placeholder={el_content_type}
                                    selectItems={PAGE_TYPES.map((it) => ([it[0], it[1]]))}
                                />

                            </div>
                        </>
                    ) : (
                        <div className="pb-2">
                            <ul className="list-disc ml-8">
                                <li className="m-1">{el_content_type}<span className="italic">: {page_types[c_type!]}</span></li>
                                <li className="m-1">{el_content_language}<span className="italic">: {target_langs[c_lang!]}</span></li>
                            </ul>
                        </div>
                    )}

                </div>

                {/** DYNAMIC INPUTS */}
                {form_config?.children.map((sec, sec_idx) => (
                    <div key={sec_idx} className="flex flex-col gap-4 border border-neutral-200 dark:border-neutral-800">
                        <div className="form_section_header">
                            <span>{sec.group_title}</span>
                        </div>
                        {sec.group_description ? (
                            <div className="p-2 text-xl">{sec.group_description}</div>
                        ) : null}
                        {sec.children.map((input_item, it_idx) => (
                            <div key={input_item.input_id} className="flex gap-4 items-center flex-wrap p-2">
                                <div className="grow">
                                    <div className="flex gap-2 items-center flex-wrap relative">
                                        {input_item.input_type === "text"
                                            || input_item.input_type === "number"
                                            || input_item.input_type === "color"
                                            || input_item.input_type === "checkbox"
                                            || input_item.input_type === "url" ? (
                                            <>
                                                <label className="flex gap-2" htmlFor={input_item.input_id}>
                                                    {input_item.input_label}
                                                </label>
                                                <input
                                                    required={input_item.isRequired}
                                                    className={input_item.input_classname}
                                                    id={input_item.input_id}
                                                    type={input_item.input_type}
                                                    name={input_item.data_namespace}
                                                    ref={setInputRef(`input-${sec_idx}-${it_idx}`)}
                                                    {...input_item.input_props}
                                                />
                                            </>
                                        ) : null}
                                        {input_item.input_type === "textarea" ? (
                                            <>
                                                <label
                                                    className="flex gap-2"
                                                    htmlFor={input_item.input_id}
                                                >
                                                    {input_item.input_label}
                                                </label>
                                                <textarea

                                                    onChange={(e) => {
                                                        if (input_item?.check_json) {
                                                            setJsonCheck((prev) => ({
                                                                ...prev, [`json-idx-${input_item.input_id}`]: parseJSON(e.target.value)
                                                            }))
                                                        }
                                                    }}
                                                    required={input_item.isRequired}
                                                    className={input_item.input_classname}
                                                    id={input_item.input_id}
                                                    name={input_item.data_namespace}
                                                    ref={setInputRef(`input-${sec_idx}-${it_idx}`)}
                                                    {...input_item.input_props}
                                                />

                                                {input_item?.check_json && `json-idx-${input_item.input_id}` in jsonCheck ? (
                                                    <div className="absolute bottom-1 right-3 z-40">
                                                        {
                                                            jsonCheck[`json-idx-${input_item.input_id}`] ? (
                                                                <CheckCircledIcon width={20} height={20} aria-hidden className="text-green-800 dark:text-green-300" />
                                                            ) : (
                                                                <CrossCircledIcon width={20} height={20} aria-hidden className="text-red-800 dark:text-red-300" />
                                                            )}
                                                    </div>
                                                ) : null}
                                            </>
                                        ) : null}
                                        {input_item.input_type === "list" && input_item.list_config ? (
                                            <MulitpleItemInputListPassive
                                                group_label={input_item.input_label ?? ''}
                                                data_namespace={input_item.data_namespace}
                                                // @ts-expect-error todo type
                                                items_config={input_item.list_config}
                                                default_value={
                                                    props[input_item.data_namespace] ?? []
                                                }
                                            />
                                        ) : null}
                                        {input_item.input_type.startsWith('custom_') ? (
                                            <>
                                                <div>
                                                    {input_item.input_label}
                                                </div>

                                                {input_item.input_type === "custom_date_time" && (
                                                    <div className="p-2 w-full">

                                                        <DateTimeInput
                                                            default_value={props[input_item.data_namespace] ?? undefined}
                                                            data_namespace={input_item.data_namespace}
                                                        />
                                                    </div>
                                                )}

                                                {(input_item.input_type === "custom_image" && input_item.custom_config?.data_keys) ? (
                                                    <div className="w-full">
                                                        <ImageInput
                                                            data_keys={input_item.custom_config.data_keys}
                                                            data_namespace={input_item.data_namespace}
                                                            default_value={props[input_item.data_namespace] ?? undefined}
                                                        />
                                                    </div>
                                                ) : null}

                                                {input_item.input_type === "custom_select" && input_item?.custom_config?.select_items ? (
                                                    <>
                                                        <RadixSelect
                                                            id={input_item.input_id}
                                                            placeholder={input_item?.custom_config?.placeholder ?? 'SELECT'}
                                                            selectItems={input_item?.custom_config?.select_items as [string, string][] ?? []}
                                                            selectRootProps={{
                                                                name: input_item.data_namespace,
                                                                defaultValue: props[input_item.data_namespace] ?? undefined,
                                                                onValueChange: (e: any) => dispatch([{ [`inp-s-${input_item.data_namespace}`]: e }]),
                                                            }}
                                                        />

                                                        {(`inp-s-${input_item.data_namespace}` in state) ? (
                                                            <input
                                                                type="hidden"
                                                                name={input_item.data_namespace}
                                                                // @ts-expect-error todo
                                                                value={state[`inp-s-${input_item.data_namespace}`] ?? ''} />
                                                        ) : null}
                                                    </>
                                                ) : null}
                                            </>
                                        ) : null}
                                        {input_item.isRequired && <div className="text-slate-300 text-xl"> *</div>}
                                    </div>
                                    {input_item.input_description ? (
                                        <div className="italic text-right p-2">{input_item.input_description}</div>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                ))
                }
                <AuthenticityTokenInput />
            </Form >

        </div >
    )
}