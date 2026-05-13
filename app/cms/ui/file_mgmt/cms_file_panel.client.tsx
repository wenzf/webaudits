import { Link, useFetcher, useRouteLoaderData } from "react-router"
import { InView } from "react-intersection-observer";
import { Fragment, useEffect, useReducer, useState } from "react"
import { Cross1Icon, ExternalLinkIcon, EyeOpenIcon, ListBulletIcon } from "@radix-ui/react-icons";
import { Rnd } from "react-rnd";

import { useCMSStates } from "~/cms/cms_states";
import TooltipButton from "../radix/radix_tooltip_button";
import InputList from "../generics/g_input_list";
import RadixSelect from "../radix/radix_select";
import CMS_CONFIG from "~/cms/cms.config";
import clsx from "clsx";
import CopytToClipboardButton from "../generics/g_copy_to_clipboard_button";
import { SourcesTable, TRFragment1 } from "../generics/g_table_fragments";
import COMMON_CONFIG from "~/common/common.config";


export default function FilePanelMain() {
    const fetcher = useFetcher({ key: 'loader' })
    const [{
        ui_window_width,
        ui_fp_data_feed,
        ui_fp_data_feed_last_key_sk,
        ui_fp_data_feed_last_key_created_at,
    }, setCMSStates] = useCMSStates()
    const [cats, setCats] = useState<(string | number)[]>([])
    const [scrollYPos, setScrollYPos] = useState<null | number>(null)
   // const stringifiedCats = JSON.stringify(cats)

    const { MEDIA_TYPES} = COMMON_CONFIG

    const {  AUTH_CONFIG: { MIN_AUTH_LVL_EDIT_RIGHTS } } = CMS_CONFIG

    const { locTxt: {
        ui_labels: { btn_close },
        database: {
            db_cats,
            db_sub_type
        },
        image_gallery: {
            ig_sources,
            ig_alt_description,
            ig_fig_caption,
            ig_license_name,
            ig_author_name
        },
        tooltips_texts: {
            tt_query_files
        },
        files_panel: {
            fp_title,
            fp_author,
            fp_license
        }
    } } = useRouteLoaderData('cms/routes/layouts/cms_root_layout')

    const [{
        pkSubKey,
        currentOpen
    }, dispatch] = useReducer(((st, act) => {
        return {
            ...st,
            ...act.reduce((
                i: Record<string, unknown>,
                j: Record<string, unknown>
            ) => ({ ...i, ...j }), {})
        }
    }), {
        pkMainKey: '',
        pkSubKey: '',
        categories: [],
        keyword: '',
        expandElement: null,
        isEditing: false,
        isEditingValidJson: true,
        currentOpen: ''
    })

    const onCloseComponent = () => {
        setCMSStates({
            type: 'change_bool',
            key: 'ui_show_file_panel'
        })
    }
    const onGetItemList = () => {
        const searchParams = new URLSearchParams()
        searchParams.set('requestType', "get_list")
        searchParams.set('pk', `ME#${pkSubKey}`)
        if (cats?.length) searchParams.set('categories', JSON.stringify(cats))
        if (ui_fp_data_feed_last_key_sk) searchParams.set('last_sk', ui_fp_data_feed_last_key_sk)


        if (ui_fp_data_feed_last_key_created_at) {
            searchParams.set('last_created_at', ui_fp_data_feed_last_key_created_at.toString())
        }

        fetcher.load(`/cms/loaders/r-db?${searchParams.toString()}`)
    }


    useEffect(() => {
        if (typeof window === "object") {
            setScrollYPos(window.scrollY)
        }
    }, [])



    useEffect(() => {
        if (fetcher?.data?.Items) {
            setCMSStates({
                type: "add_items_to_arr",
                key: "ui_fp_data_feed",
                value: fetcher?.data?.Items
            })
            setCMSStates({
                type: "update_val",
                key: "ui_fp_data_feed_last_key_sk",
                value: fetcher?.data?.LastEvaluatedKey?.sk?.S ?? null
            })
            setCMSStates({
                type: "update_val",
                key: "ui_fp_data_feed_last_key_created_at",
                value: fetcher?.data?.LastEvaluatedKey?.createdAt?.N ?? null
            })
        }
    }, [fetcher?.data])



    return (
        <>
            {scrollYPos !== null && (
                <Rnd
                    className="z-[111] h-full w-full"
                    default={{
                        x: Math.round(ui_window_width / 2) - 12,
                        y: scrollYPos + 24,
                        width: '50%',
                        height: '90%',

                    }}
                >
                    <div className="overflow-auto z-[111] bg-neutral-100 dark:bg-neutral-900 text-neutral-950 dark:text-neutral-50 rounded h-full w-full border border-neutral-500 overflow-hidden">
                        <div className="flex p-2 gap-2 justify-between"
                        >
                            <div className='p-2 text-slate-800 dark:text-slate-200 text-xl font-semibold'>
                                {fp_title}
                                {ui_fp_data_feed?.length ? ` (${ui_fp_data_feed.length})` : null}
                            </div>

                            <div className="flex gap-2 ">
                                {pkSubKey && (
                                    <TooltipButton
                                        triggerProps={{
                                            className: 'btn_3 icon small',
                                            type: 'button',
                                            onClick: () => onGetItemList()
                                        }}
                                        tooltipText={tt_query_files}
                                    >
                                        <ListBulletIcon width={16} height={16} aria-label="show list" />
                                    </TooltipButton>
                                )}

                                <RadixSelect
                                    selectTriggerProps={{ className: clsx('reg h-[33px]', { btn_1: pkSubKey !== "", btn_3: pkSubKey === "" }) }}
                                    placeholder={db_sub_type}
                                    selectItems={MEDIA_TYPES}
                                    selectRootProps={{
                                        onValueChange: (e: any) => {
                                            setCMSStates({
                                                type: "update_val",
                                                key: "ui_fp_data_feed",
                                                value: []
                                            })
                                            dispatch([{ pkSubKey: e }])
                                        },
                                        value: pkSubKey ?? ''
                                    }}
                                />

                                <InputList
                                    setter={setCats}
                                    addButtonAttributes={{ className: 'btn_1 icon small' }}
                                    inputAttributes={{ placeholder: db_cats }}
                                    wrapperDivAttributes={{ style: { alignItems: 'flex-start' } }}
                                />

                                <button
                                    type="button"
                                    className="btn_1 icon small"
                                    onClick={() => onCloseComponent()}
                                >
                                    <Cross1Icon aria-label={btn_close} width={16} height={16} />
                                </button>
                            </div>

                        </div>
                        <div className="flex flex-wrap">
                            <div className="overflow-y-auto max-h-[95vh] il_feed w-full">
                                {ui_fp_data_feed.length ? (
                                    <table className="table_1 w-full table-fixed">
                                        <thead>
                                            <tr>
                                                <th className="w-24">PK</th>
                                                <th className="w-30">SK</th>
                                                <th>{db_cats}</th>
                                                <th className="w-12"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ui_fp_data_feed.map((it, ind) => (
                                                <Fragment key={ind}>
                                                    <tr className={clsx({ 'is_marked': currentOpen === `${it.pk}-${it.sk}` })}>
                                                        <td><code>{it.pk}</code></td>
                                                        <td><code>{it.sk}</code></td>
                                                        <td>{it?.categories?.length ? (
                                                            <ul className="list-disc pl-6">
                                                                {it.categories.map((itt: string, indd: number) => (
                                                                    <li key={indd}>{itt}</li>
                                                                ))}
                                                            </ul>
                                                        ) : null}</td>
                                                        <td className="w-12">
                                                            <button
                                                                type="button"
                                                                className={clsx("icon small", { btn_2: currentOpen === `${it.pk}-${it.sk}`, btn_1: currentOpen !== `${it.pk}-${it.sk}` })}
                                                                onClick={() => {
                                                                    if (currentOpen !== `${it.pk}-${it.sk}`) {
                                                                        dispatch([{ currentOpen: `${it.pk}-${it.sk}` }])
                                                                    } else {
                                                                        dispatch([{ currentOpen: "" }])
                                                                    }
                                                                }}

                                                            >
                                                                <EyeOpenIcon width={20} height={20} aria-hidden />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    {currentOpen === `${it.pk}-${it.sk}` ? (
                                                        <>
                                                            <TRFragment1
                                                                item={it?.alt}
                                                                label={ig_alt_description}
                                                                isType2
                                                            />
                                                            <TRFragment1
                                                                item={it?.fig_caption}
                                                                label={ig_fig_caption}
                                                                isType2
                                                            />
                                                            <tr className="is_marked">
                                                                <td />
                                                                <th>{ig_sources}</th>
                                                                <td colSpan={2} style={{ padding: 0 }}>
                                                                    {it.sources?.length ? (
                                                                        <SourcesTable
                                                                            sources={it.sources}
                                                                            className="is_marked w-full p-0"
                                                                        />
                                                                    ) : null}
                                                                </td>
                                                            </tr>

                                                            <tr className="is_marked">
                                                                <td />
                                                                <th>{fp_author}</th>
                                                                <td colSpan={2} style={{ padding: 0 }}>
                                                                    {it?.author_url || it?.author_name ? (
                                                                        <table className="w-full p-0">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <th className="w-30">{ig_author_name}</th>
                                                                                    <td>{it?.author_name}</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <th className="w-30">URL</th>
                                                                                    <td>
                                                                                        {it?.author_url &&
                                                                                            <div className="flex gap-2">
                                                                                                <Link to={it.author_url} target="_blank" rel="noopener noreferrer"
                                                                                                    className="btn_5 icon small"
                                                                                                >
                                                                                                    <ExternalLinkIcon width={20} height={20} aria-label="Link" />
                                                                                                </Link>

                                                                                                <CopytToClipboardButton
                                                                                                    buttonProps={{ className: 'btn_5 icon small' }}
                                                                                                    copyText={it.author_url}
                                                                                                />

                                                                                            </div>
                                                                                        }
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    ) : null}
                                                                </td>
                                                            </tr>
                                                            <tr className="is_marked">
                                                                <td />
                                                                <th>{fp_license}</th>
                                                                <td colSpan={2} style={{ padding: 0 }}>
                                                                    {it?.license_url || it?.license_name ? (
                                                                        <table className="w-full">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <th className="w-30">{ig_license_name}</th>
                                                                                    <td>{it?.license_name}</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <th className="w-30">URL</th>
                                                                                    <td>
                                                                                        {it?.license_url &&
                                                                                            <div className="flex gap-2">
                                                                                                <Link to={it?.license_url} target="_blank" rel="noopener noreferrer"
                                                                                                    className="btn_5 icon small"
                                                                                                >
                                                                                                    <ExternalLinkIcon width={20} height={20} aria-label="Link" />
                                                                                                </Link>
                                                                                                <CopytToClipboardButton
                                                                                                    buttonProps={{ className: 'btn_5 icon small' }}
                                                                                                    copyText={it.license_url}
                                                                                                />

                                                                                            </div>
                                                                                        }
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    ) : null}
                                                                </td>
                                                            </tr>
                                                        </>
                                                    ) : null}
                                                </Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : null}
                                {(!ui_fp_data_feed_last_key_sk && !ui_fp_data_feed?.length && fetcher.state !== "idle") && <div className="is_fetching" />}
                                {ui_fp_data_feed_last_key_sk ? (
                                    <InView
                                        className="w-full relative"
                                        as="div"
                                        onChange={(inView) => inView
                                            ? onGetItemList()
                                            : {}}
                                    >
                                        {fetcher.state !== "idle" && <div className="is_fetching" />}
                                    </InView>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </Rnd>
            )}
        </>
    )
}



