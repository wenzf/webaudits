import { useEffect, useReducer } from "react";
import { useFetcher } from "react-router";
import { useRouteLoaderData } from "react-router";
import { Cross1Icon, ImageIcon } from "@radix-ui/react-icons";
import clsx from "clsx";

import ImageDeleteProgress from "./cms_gallery_delete_progress";
import NotAllowedInGuestMode from "../../other_components/cms_not_allowed_in_guest_mode";
import { useAuth } from "~/cms/utils/auth/useAuth";
import CMS_CONFIG from "~/cms/cms.config";
import { useCurrentURL } from "~/common/shared/hooks";
import { useCMSStates } from "~/cms/cms_states";
import TooltipButton from "../../radix/radix_tooltip_button";
import SITE_CONFIG from "~/site/site.config";
import CopytToClipboardButton from "../../generics/g_copy_to_clipboard_button";
import { convertImageDataToImageProps } from "./cms_gallery_utils";
import { SourcesTable, TRFragment1, TRFragment2 } from "../../generics/g_table_fragments";
import type { DBIGBase, DBILFull } from "../../../../../types/site";


export default function ImageGalleryItem({
    item,
    onGetImageList
}: {
    item: DBIGBase,
    onGetImageList: (e: "get_item", f: string) => void
}) {
    const [{
        img_markup_main_cover_lang,
        img_markup_main_cover_loading,
        img_gallery_item_lang,
        img_type_1_item,
        img_type_1_item_lang,
        img_type_2_item,
        img_type_2_item_lang,
        img_type_og_item,
        img_type_og_item_lang
    }, dispatch] = useReducer(((st, act) => {
        return {
            ...st,
            ...act.reduce((
                i: Record<string, unknown>,
                j: Record<string, unknown>
            ) => ({ ...i, ...j }), {})
        }
    }), {
        img_markup_main_cover: '',
        img_markup_main_cover_lang: 'en',
        img_markup_main_cover_loading: 'eager',
        img_markup_in_text: '',
        img_gallery_item: '',
        img_gallery_item_lang: "en",
        img_type_1_item: '',
        img_type_1_item_lang: 'en',
        img_type_2_item: '',
        img_type_2_item_lang: 'en',
        img_type_og_item: '',
        img_type_og_item_lang: 'en'
    })

    const fetcherDB = useFetcher({ key: 'delete_db_entries' })
    const fetcherS3 = useFetcher({ key: 'delete_s3' })
    const { AUTH_CONFIG: { MIN_AUTH_LVL_EDIT_RIGHTS } } = CMS_CONFIG
    const auth = useAuth()
    const currentURL = useCurrentURL()
    const hasEditRights = auth > MIN_AUTH_LVL_EDIT_RIGHTS
    const { pk, sk, categories, sources } = item
    const rootLoaderData = useRouteLoaderData('root')

    const [{
        ui_ig_data_item_details,
        ui_ig_show_item,
        proc_ig_progress_s3_deleted,
        proc_ig_progress_db_deleted,
        proc_ig_progress_is_deleting_image,
        proc_is_choosing_main_image,
        proc_is_choosing_article_image
    }, setCMSStates] = useCMSStates()

    const fullItem = ui_ig_show_item === sk
        && ui_ig_show_item in ui_ig_data_item_details
        ? ui_ig_data_item_details[ui_ig_show_item]
        : null

    let previewImage = sources?.slice()
        .sort((a, b) => a.width - b.width)[2]

    if (!previewImage && sources?.length) previewImage = sources[0]

    const {
        locTxt: {
            image_gallery: {
                ig_no_image,
                ig_select_image,
                ig_categories,
                ig_sources,
                ig_alt_description,
                ig_fig_caption,
                ig_license_name,
                ig_license_url,
                ig_author_name,
                ig_author_url,
                ig_author_type,
                ig_date_published,
                ig_date_modified,
                ig_delete_image,
                ig_confirm_delete,
                ig_image_details
            },
            ui_labels: {
                btn_close
            }
        } } = useRouteLoaderData('cms/routes/layouts/cms_root_layout')

    const onDeleteImage = async () => {
        if (!hasEditRights) return
        setCMSStates({
            type: "upate_val_many",
            value: {
                proc_ig_progress_is_deleting_image: true,
                proc_ig_progress_db_deleted: 1,
                proc_ig_progress_s3_deleted: 1
            }
        })
        await fetcherDB.submit({
            requestType: 'delete_db_item',
            pk: pk ?? fullItem?.pk,
            sk: sk ?? fullItem?.sk,
            redirect_to: currentURL,
            csrf: rootLoaderData.csrfToken
        }, {
            encType: "application/x-www-form-urlencoded",
            action: '/cms/actions/cud-id-db',
            method: 'post',
        })
        const keys = sources.map((it) => new URL(it.imgUrl).pathname.slice(1))
        await fetcherS3.submit({
            requestType: 'deleteFiles',
            keys,
            folder: sk ?? fullItem?.sk,
            csrf: rootLoaderData.csrfToken
        }, {
            encType: "application/json",
            action: '/cms/actions/cd-s3',
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


    const selectImage = () => {
        if (proc_is_choosing_article_image) {
            setCMSStates({
                type: "add_item_to_obj",
                key: "proc_article_images",
                value: {
                    [fullItem!.sk]: fullItem
                }
            })
            setCMSStates({
                type: "upate_val_many", value: {
                    proc_is_choosing_article_image: false,
                    ui_show_image_gallery: false
                }
            })
        } else if (proc_is_choosing_main_image) {
            setCMSStates({
                type: "upate_val_many",
                value: {
                    proc_main_image: fullItem,
                    proc_is_choosing_main_image: false,
                    ui_show_image_gallery: false
                }
            })
        }
    }


    const onCreateImageMarkup = (
        type: "img_markup_main_cover" | "img_markup_in_text"
            | "img_gallery_item" | "img_type_1_item" | "img_type_2_item"
            | "img_type_og_item") => {
        if (!fullItem) return
        if (ui_ig_show_item === item.sk) {
            const thisItem = fullItem as DBILFull
            let alt = ""
            let loading = ""
            let classname = ""

            let figCaption = ''

            let author_name = thisItem?.author_name ?? ''
            let author_url = thisItem?.author_url ?? ''
            let license_name = thisItem?.license_name ?? ''
            let license_url = thisItem?.license_url ?? ''
            let author_type = thisItem?.author_type ?? 'Person'

            if (type === "img_type_1_item") {
                if (thisItem.alt && img_type_1_item_lang in thisItem.alt) {
                    alt = thisItem.alt[img_type_1_item_lang]
                }

                if (thisItem.fig_caption && img_type_1_item_lang in thisItem.fig_caption) {
                    figCaption = thisItem.fig_caption[img_type_1_item_lang]
                }

            } else if (type === "img_type_2_item") {
                if (thisItem.alt && img_type_2_item_lang in thisItem.alt) {
                    alt = thisItem.alt[img_type_2_item_lang]
                }
            } else if (type === "img_type_og_item") {
                if (thisItem.alt && img_type_og_item_lang in thisItem.alt) {
                    alt = thisItem.alt[img_type_og_item_lang]
                }
            }


            const {
                srcset,
                jpgFallbacks, mainSrc,
                mainSrcWidth, mainSrcHeight,
                // aspect,
                // thumbnail, thumbnailHeight, thumbnailWidth
            } = convertImageDataToImageProps(thisItem)


            if (type === "img_markup_main_cover") {
                const markup = `<img class="${classname}" src="${mainSrc}" ${jpgFallbacks}srcset="${srcset}" alt="${alt}" loading="${loading}" />`
                dispatch([{ img_markup_main_cover: markup }])
            } else if (type === "img_markup_in_text") {

            }
            else if (type === "img_type_1_item") {
                const markup = JSON.stringify({
                    src: mainSrc,
                    srcSet: srcset,
                    width: mainSrcWidth,
                    height: mainSrcHeight,
                    alt: alt,
                    jpgFallbacks,
                    figCaption,
                    license_name,
                    license_url,
                    author_name,
                    author_url,
                    author_type
                })

                dispatch([{ img_type_1_item: markup }])
            }
            // else if (type === "img_type_2_item") {
            //     const markup = JSON.stringify({
            //         src: mainSrc,
            //         width: mainSrcWidth,
            //         height: mainSrcHeight,
            //         loading: "lazy",
            //         alt: alt,
            //     })
            // 
            //     dispatch([{ img_type_2_item: markup }])
            // } 
            else if (type === "img_type_og_item") {

                const candidate1 = thisItem.sources.find((it) =>
                    it.width === 1200 && it.mimeType === "image/jpeg");
                const candidate2 = thisItem.sources.find((it) =>
                    it.width === 1200);

                if (candidate1) {
                    const markup = JSON.stringify({
                        src: candidate1.imgUrl,
                        width: candidate1.width,
                        height: Math.round(candidate1.width / candidate1.aspect),
                        alt,
                        mime: candidate1.mimeType
                    })
                    dispatch([{ img_type_og_item: markup }])
                } else if (candidate2) {

                    const markup = JSON.stringify({
                        src: candidate2.imgUrl,
                        width: candidate2.width,
                        height: Math.round(candidate2.width / candidate2.aspect),
                        alt,
                        mime: candidate2.mimeType
                    })
                    dispatch([{ img_type_og_item: markup }])
                } else {
                    const le = sources.length

                    const candidate3 = sources[le - 1]
                    const markup = JSON.stringify({
                        src: candidate3.imgUrl,
                        width: candidate3.width,
                        height: Math.round(candidate3.width / candidate3.aspect),
                        alt,
                        mime: candidate3.mimeType
                    })
                    dispatch([{ img_type_og_item: markup }])
                }
            }

        }
    }


    return (
        <>
            <div
                tabIndex={0}
                className={clsx('il_item', 'border_gr_4', {
                    'full is_marked': ui_ig_show_item === item.sk
                })}
                role="button"
                onFocus={() => onGetImageList("get_item", item.sk)}
            >
                <div>
                    {previewImage ? (
                        <div className="il_preview_image_frame">
                            <img
                                src={previewImage.imgUrl}
                                width={previewImage.width}
                                height={Math.round(previewImage.width
                                    / previewImage.aspect)}
                                alt="preview image" />
                        </div>
                    ) : (
                        <div>
                            {ig_no_image}
                        </div>
                    )}
                </div>

                <div className="flex gap-2 absolute"
                    style={{ top: '0.75rem', right: '0.75rem' }}>
                    {fullItem && (
                        <>
                            {(proc_is_choosing_main_image
                                || proc_is_choosing_article_image) && (
                                    <TooltipButton
                                        tooltipText={ig_select_image}
                                        triggerProps={{
                                            className: 'btn_1 reg h-[33px]',
                                            onClick: () => selectImage(),
                                            type: 'button'
                                        }}
                                    >
                                        {ig_select_image}
                                    </TooltipButton>
                                )}

                            <button
                                tabIndex={-1}
                                type="button"
                                className="btn_1 icon small"
                                onClick={() => setCMSStates({
                                    type: "update_val",
                                    key: "ui_ig_show_item",
                                    value: null
                                })}
                            >
                                <Cross1Icon
                                    aria-label={btn_close}
                                    width={16}
                                    height={16}
                                />
                            </button>
                        </>
                    )}

                    {(ui_ig_show_item !== item.sk) && (
                        <TooltipButton
                            tooltipText={ig_image_details}
                            triggerProps={{
                                tabIndex: -1,
                                className: 'btn_1 icon small',
                                type: 'button',
                                onClick: () => onGetImageList("get_item", item.sk)
                            }}
                        >
                            <ImageIcon
                                width={16}
                                height={16}
                                aria-label={ig_image_details}
                            />
                        </TooltipButton>
                    )}

                </div>
                <table className="table_1 style_1">
                    <tbody>
                        <tr>
                            <th>{ig_categories}</th>
                            <td>
                                {(categories?.length
                                    ?? fullItem?.categories?.length) ? (
                                    <ul className="ul_1">
                                        {(categories
                                            ?? fullItem?.categories).map((it, ind) => (
                                                <li key={ind}>{it}</li>
                                            ))}
                                    </ul>
                                ) : null}
                            </td>
                        </tr>

                        {(ui_ig_show_item === item.sk) && (
                            <>
                                {fullItem && (
                                    <>
                                        <tr>
                                            <th>{ig_sources}</th>
                                            <td style={{ padding: 0 }}>
                                                {sources && (
                                                    <SourcesTable sources={sources} />
                                                )}
                                            </td>
                                        </tr>
                                        <TRFragment1
                                            label={ig_alt_description}
                                            item={fullItem.alt} />
                                        <TRFragment1
                                            label={ig_fig_caption}
                                            item={fullItem.fig_caption} />
                                        <TRFragment2
                                            label={ig_license_name}
                                            item={fullItem.license_name} />
                                        <TRFragment2
                                            label={ig_license_url}
                                            item={fullItem.license_url} isUrl />
                                        <TRFragment2
                                            label={ig_author_name}
                                            item={fullItem.author_name} />
                                        <TRFragment2
                                            label={ig_author_url}
                                            item={fullItem.author_url} isUrl />
                                        <TRFragment2
                                            label={ig_author_type}
                                            item={fullItem.author_type} />
                                        <TRFragment2
                                            label={ig_date_published}
                                            item={fullItem.date_published} isTime />
                                        <TRFragment2
                                            label={ig_date_modified}
                                            item={fullItem.date_modified} isTime />
                                        <TRFragment2
                                            item={pk ?? fullItem?.pk} label="pk" />
                                        <TRFragment2
                                            item={sk ?? fullItem?.sk} label="sk" />

                                        <tr>
                                            <th>
                                                Image Type OG
                                                <br />
                                                <code>
                                                    og:image
                                                </code>
                                            </th>
                                            <td>
                                                <div className="flex flex-col gap-4">
                                                    <div className="flex gap-4">
                                                        {SITE_CONFIG.SITE_LANGS.map((it) => (
                                                            <button
                                                                className={clsx("btn_1 reg",
                                                                    {
                                                                        active:
                                                                            it.lang_code === img_type_og_item_lang
                                                                    })}
                                                                onClick={() => dispatch([{
                                                                    img_type_og_item_lang: it.lang_code
                                                                }])}
                                                                key={it.lang_code}>
                                                                {it.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div>
                                                        <button
                                                            onClick={() => onCreateImageMarkup("img_type_og_item")}
                                                            className="btn_1 reg" type="button">
                                                            get JSON
                                                        </button>
                                                    </div>
                                                    {img_type_og_item ? (
                                                        <div className="relative">
                                                            <textarea name="copy"
                                                                className="inp_1 w-full resize"
                                                                readOnly value={img_type_og_item}
                                                                rows={5} />
                                                            <CopytToClipboardButton
                                                                copyText={img_type_og_item}
                                                                buttonProps={{
                                                                    className:
                                                                        "btn_3 icon small absolute top-2 right-4"
                                                                }}
                                                            />
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </td>
                                        </tr>

                                        <tr>
                                            <th>
                                                Image Type 1 (JSON)
                                                <br />
                                                <code>
                                                    responsive / srcset
                                                </code>
                                            </th>
                                            <td>
                                                <div className="flex flex-col gap-4">
                                                    <div className="flex gap-4">
                                                        {SITE_CONFIG.SITE_LANGS.map((it) => (
                                                            <button
                                                                className={clsx("btn_1 reg h-[33px]",
                                                                    { active: it.lang_code === img_type_1_item_lang })}
                                                                onClick={() => dispatch([{
                                                                    img_type_1_item_lang: it.lang_code
                                                                }])}
                                                                key={it.lang_code}>
                                                                {it.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div>
                                                        <button
                                                            onClick={() => onCreateImageMarkup("img_type_1_item")}
                                                            className="btn_1 reg h-[33px]" type="button">
                                                            get JSON
                                                        </button>
                                                    </div>
                                                    {img_type_1_item ? (
                                                        <div className="relative">
                                                            <textarea name="copy"
                                                                className="inp_1 w-full resize"
                                                                readOnly value={img_type_1_item}
                                                                rows={5} />

                                                            <CopytToClipboardButton
                                                                copyText={img_type_1_item}
                                                                buttonProps={{
                                                                    className:
                                                                        "btn_3 icon small absolute top-2 right-4"
                                                                }}
                                                            />

                                                        </div>
                                                    ) : null}
                                                </div>
                                            </td>
                                        </tr>
                                        {/**
 *                                         <tr>
                                            <th>
                                                Image Type 2 (JSON)
                                                <br />
                                                <code>
                                                    simple
                                                </code>
                                            </th>
                                            <td>
                                                <div className="flex flex-col gap-4">
                                                    <div className="flex gap-4">
                                                        {SITE_CONFIG.SITE_LANGS.map((it) => (
                                                            <button
                                                                className={clsx("btn_1 reg",
                                                                    { active: it.lang_code === img_type_2_item_lang })}
                                                                onClick={() => dispatch([{
                                                                    img_type_2_item_lang: it.lang_code
                                                                }])}
                                                                key={it.lang_code}>
                                                                {it.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div>
                                                        <button
                                                            onClick={() => onCreateImageMarkup("img_type_2_item")}
                                                            className="btn_1 reg" type="button">
                                                            get JSON
                                                        </button>
                                                    </div>
                                                    {img_type_2_item ? (
                                                        <div className="relative">
                                                            <textarea name="copy" className="inp_1 w-full resize"
                                                                readOnly value={img_type_2_item}
                                                                rows={5} />
                                                            <CopytToClipboardButton
                                                                copyText={img_type_2_item}
                                                                buttonProps={{
                                                                    className:
                                                                        "btn_3 icon small absolute top-2 right-4"
                                                                }}
                                                            />
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </td>
                                        </tr>
 */}


                                        <tr>
                                            <td colSpan={2}>
                                                <details className="btn_1 reg flex gap-2 items-center justify-center p-2">
                                                    <summary tabIndex={-1}>{ig_delete_image}</summary>
                                                    <button type="button" className="btn_1 reg adm"
                                                        disabled={!hasEditRights}
                                                        onClick={() => onDeleteImage()}>
                                                        {ig_confirm_delete}
                                                        {!hasEditRights && <NotAllowedInGuestMode />}
                                                    </button>
                                                </details>
                                            </td>
                                        </tr>
                                    </>
                                )}
                            </>
                        )}
                    </tbody>
                </table>
            </div>

            <ImageDeleteProgress />

        </>
    )
}


