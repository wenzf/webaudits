import { useFetcher, useRouteLoaderData, useSearchParams } from "react-router"
import { InView } from "react-intersection-observer";
import { useCallback, useEffect, useState } from "react"
import { Cross1Icon, ListBulletIcon } from "@radix-ui/react-icons";
import { Rnd } from "react-rnd";

import ImageGalleryItem from "./cms_gallery_item.cient";
import { useCMSStates } from "~/cms/cms_states";
import TooltipButton from "../../radix/radix_tooltip_button";
import InputList from "../../generics/g_input_list";
import type { DBIGBase } from "../../../../../types/site";




function filterDBItemsFeedByCats(
    feed: DBIGBase[],
    cats: (string | number)[]
) {
    if (!cats.length) return feed.sort((a, b) => b.createdAt - a.createdAt)

    let outp: DBIGBase[] = []
    for (let i = 0; i < feed.length; i += 1) {
        const oneEntry = feed[i];
        const thisCats = oneEntry?.categories
        if (thisCats) {
            let didMatch = false
            for (let j = 0; j < thisCats.length; j += 1) {
                if (cats.includes(thisCats[j])) didMatch = true
            }
            if (didMatch) outp = [...outp, oneEntry]
        }
    }
    return outp.sort((a, b) => b.createdAt - a.createdAt)
}


export default function ImageGalleryMain() {
    const fetcher = useFetcher({ key: 'loader' })
    const [{ ui_show_image_gallery,
        ui_ig_data_feed,
        ui_ig_data_feed_last_key,
        ui_ig_data_item_details,
        proc_ig_progress_s3_deleted,
        proc_ig_progress_db_deleted,
        proc_ig_progress_is_deleting_image,
        ui_ig_show_item,
        ui_window_width,
        ui_ig_data_feed_last_key_sk,
        ui_ig_data_feed_last_key_created_at
    }, setCMSStates] = useCMSStates()

    const { locTxt: { ui_labels: { btn_close } }
    } = useRouteLoaderData('cms/routes/layouts/cms_root_layout')
    const [, setSps] = useSearchParams()
    const [cats, setCats] = useState<(string | number)[]>([])
    const [scrollYPos, setScrollYPos] = useState<null | number>(null)
    const stringifiedCats = JSON.stringify(cats)

    const fileredEntriesCB = useCallback(() => {
        return filterDBItemsFeedByCats(ui_ig_data_feed, cats)
    }, [stringifiedCats, ui_ig_data_feed])

    const filteredEntries = fileredEntriesCB()

    const { locTxt: {
        image_gallery: {
            ig_title,
            ig_categories
        },
        tooltips_texts: {
            tt_act_query_images
        }
    } } = useRouteLoaderData('cms/routes/layouts/cms_root_layout')

    const onCloseComponent = () => {
        setCMSStates({
            type: 'change_bool',
            key: 'ui_show_image_gallery'
        })
    }
    const onGetImageList = (
        requestType: "get_list" | "get_item",
        sk?: string
    ) => {
        const searchParams = new URLSearchParams()
        searchParams.set('requestType', requestType)
        searchParams.set('pk', 'ME#IM')

        if (requestType === "get_list") {
            searchParams.set('projection', 'pk, sk, sources, categories, createdAt')
            if (cats?.length) {
                searchParams.set('categories',
                    JSON.stringify(cats))
            }

            if (ui_ig_data_feed_last_key_sk) {
                searchParams.set('last_sk', ui_ig_data_feed_last_key_sk)
            }

            if (ui_ig_data_feed_last_key_created_at) {
                searchParams.set('last_created_at', ui_ig_data_feed_last_key_created_at.toString())
            }

        } else if (requestType === "get_item" && sk) {
            console.log('get item')
            setCMSStates({
                type: "update_val",
                key: "ui_ig_show_item",
                value: sk
            })
            if (sk in ui_ig_data_item_details) return
            searchParams.set('sk', sk)
        }

        fetcher.load(`/cms/loaders/r-db?${searchParams.toString()}`)

        console.log('after fetch', fetcher.data)
    }
    /**
     * store image data to cmsState
     */
    useEffect(() => {



        if (fetcher?.data?.Items) {
            setCMSStates({
                type: "add_items_to_arr",
                key: "ui_ig_data_feed",
                value: fetcher?.data?.Items
            })
            setCMSStates({
                type: "update_val",
                key: "ui_ig_data_feed_last_key",
                value: fetcher?.data?.LastEvaluatedKey?.sk?.S ?? null
            })
            setCMSStates({
                type: "update_val",
                key: "ui_ig_data_feed_last_key_sk",
                value: fetcher?.data?.LastEvaluatedKey?.sk?.S ?? null
            })
            setCMSStates({
                type: "update_val",
                key: "ui_ig_data_feed_last_key_created_at",
                value: fetcher?.data?.LastEvaluatedKey?.createdAt?.N ?? null
            })
        } else if (fetcher?.data?.Item) {

            console.log('received item', { fetcher })

            setCMSStates({
                type: "add_item_to_obj",
                key: "ui_ig_data_item_details",
                value: { [fetcher?.data?.Item.sk]: fetcher?.data?.Item }
            })
        }
    }, [fetcher?.data])


    useEffect(() => {
        if (ui_ig_show_item && proc_ig_progress_s3_deleted === 2
            && proc_ig_progress_db_deleted === 2
            && !proc_ig_progress_is_deleting_image) {

            const copy1 = ui_ig_data_item_details
            if (copy1.hasOwnProperty(ui_ig_show_item)) delete copy1[ui_ig_show_item]

            setCMSStates({
                type: "upate_val_many",
                value: {
                    ui_ig_data_feed: ui_ig_data_feed.filter((it) => it.sk !== ui_ig_show_item),
                    ui_ig_data_item_details: copy1,
                    ui_ig_show_item: null,
                    proc_ig_progress_s3_deleted: 0,
                    proc_ig_progress_db_deleted: 0,
                    ui_show_image_upload: false
                }
            })


            setSps((prev) => {
                prev.set('tempMsgTitle', 'tm_image_deleted_title')
                prev.set('tempMsgDescription', ui_ig_show_item)
                return prev
            })
        }
    }, [
        ui_ig_show_item,
        proc_ig_progress_s3_deleted,
        proc_ig_progress_db_deleted,
        ui_ig_data_feed,
        proc_ig_progress_is_deleting_image
    ])

    useEffect(() => {
        if (typeof window === "object") {

            setScrollYPos(window.scrollY)
        }
    }, [])

    if (!ui_show_image_gallery) return null



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
                        <div className="flex p-2 gap-2 justify-between">
                            <div className='p-2 text-slate-800 dark:text-slate-200 text-xl font-semibold'>
                                {ig_title}
                                {filteredEntries?.length ? ` (${filteredEntries?.length})` : null}
                            </div>

                            <div className="flex gap-2 ">
                                <TooltipButton
                                    triggerProps={{
                                        className: 'btn_3 icon small',
                                        type: 'button',
                                        onClick: () => onGetImageList("get_list")
                                    }}
                                    tooltipText={tt_act_query_images}
                                >
                                    <ListBulletIcon width={16} height={16} aria-label="show list" />
                                </TooltipButton>

                                <InputList
                                    setter={setCats}
                                    addButtonAttributes={{ className: 'btn_1 icon small' }}
                                    inputAttributes={{ placeholder: ig_categories }}
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
                            <div className="overflow-y-auto max-h-[95vh] il_feed">
                                {ui_ig_data_feed?.length > 0 && filteredEntries.map((it) => (
                                    <ImageGalleryItem
                                        key={it.pk + it.sk}
                                        item={it as DBIGBase}
                                        onGetImageList={onGetImageList}
                                    />
                                ))}
                                {(!ui_ig_data_feed_last_key && !ui_ig_data_feed?.length && fetcher.state !== "idle") && <div className="is_fetching" />}
                                {ui_ig_data_feed_last_key ? (
                                    <InView
                                        as="div"
                                        className="w-full relative"
                                        onChange={(inView) => inView
                                            ? onGetImageList("get_list")
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