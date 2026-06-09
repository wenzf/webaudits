import { useEffect, useRef, type BaseSyntheticEvent } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { getOrientation } from 'get-orientation/browser'
import { useFetcher, useRouteLoaderData, useSearchParams } from 'react-router'
import { useDebounce } from 'use-debounce';
import { CheckIcon, Cross1Icon, MinusCircledIcon, PlusCircledIcon } from '@radix-ui/react-icons'
import * as Dialog from '@radix-ui/react-dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import clsx from 'clsx';
import 'react-easy-crop/react-easy-crop.css'

import {
    getCroppedImg, getRotatedImage, readFile, scaleImageFromSource,
    urltoFile
} from './cms_cui_utils'
import CUIProgress from './cms_cui_upload_progress'
import NotAllowedInGuestMode from '../../other_components/cms_not_allowed_in_guest_mode'
import { useCMSStates } from '~/cms/lib/cms_states'
import CMS_CONFIG from '~/cms/cms.config'
import { useCurrentURL } from '~/common/shared/hooks'
import SITE_CONFIG from '~/site/site.config'
import { useAuth } from '~/cms/lib/utils/auth/useAuth'
import type { SpecsForFilesToUpload } from '~/cms/lib/cms'
import RadixSelect from '../../radix/radix_select'
import InputElement from '../../generics/g_input_element'


const OrientationToAngle = new Map()
OrientationToAngle.set(3, 180)
OrientationToAngle.set(6, 90)
OrientationToAngle.set(8, -90)


export default function CUImain() {
    const fetcher = useFetcher({ key: 'f1' })
    const fetcherTranslate = useFetcher({ key: 'translate' })
    const fetcher2 = useFetcher({ key: 'f2' })
    const [sps] = useSearchParams();
    const rootLoaderData = useRouteLoaderData('root')

    const [{
        proc_cui_image_src,
        proc_cui_crop,
        proc_cui_rotation,
        proc_cui_zoom,
        proc_cui_cropped_area_pixels,
        proc_cui_aspect,
        ui_cui_show_line_1,
        ui_cui_show_line_2,
        ui_cui_show_line_3,
        proc_cui_specs_for_files_to_upload,
        proc_cui_mime_type,
        proc_cui_meta_alt,
        proc_cui_meta_fig_caption,
        proc_cui_meta_tag,
        proc_cui_meta_author_name,
        proc_cui_meta_author_type,
        proc_cui_meta_author_url,
        proc_cui_meta_license_name,
        proc_cui_meta_license_url,
        proc_cui_progress,
        internal_clipboard_1,
        internal_clipboard_2,
        proc_cui_step
    }, setCMSStates] = useCMSStates()
    const {
        locTxt: {
            crop_and_upload_images: {
                cui_btn_crop,
                cui_label_aspect,
                cui_btn_formats,
                cui_btn_metas,
                cui_label_author,
                cui_label_name,
                cui_label_url,
                cui_label_license,
                cui_label_tags,
                cui_btn_upload,
                cui_label_zoom,
                cui_label_rotation,
                cui_label_mime_type,
                cui_label_width,
                cui_label_alt_desc,
                cui_label_fig_caption,
                cui_main_title,
                cui_main_description,
                cui_step_choose_image,
                cui_step_crop,
                cui_step_format,
                cui_step_metas,
                cui_step_upload,
                cui_step_next,
            },
            ui_labels: {
                btn_close,
                add,
                remove
            },
            image_gallery: {
                ig_author_url,
                ig_author_type
            },
            target_langs
        } } = useRouteLoaderData('cms/lib/routes/layouts/cms_root_layout')
    const [debouncedZoom] = useDebounce(proc_cui_zoom, 300);
    const [debouncedRotation] = useDebounce(proc_cui_rotation, 300);
    const currentURL = useCurrentURL()
    const thisNow = useRef(Date.now())
    const thisSK = thisNow.current.toString(36)
    const { CREATE_AND_UPLOAD_IMAGES: { ASPECTS, LICENSES, IMAGE_SIZES },
        AUTH_CONFIG: { MIN_AUTH_LVL_EDIT_RIGHTS }, URL_FRAGMENTS: {UF_CMS}
     } = CMS_CONFIG
    const { SITE_DEPLOYMENT: { DISTRIBUTION_URL, S3_BUCKET_FILES_FOLDER_NAME,
        S3_BUCKET_IMAGES_FOLDER_NAME } } = SITE_CONFIG
    const auth = useAuth()
    const hasEditRights = auth > MIN_AUTH_LVL_EDIT_RIGHTS
    const uploadFolder = `${S3_BUCKET_FILES_FOLDER_NAME}/${S3_BUCKET_IMAGES_FOLDER_NAME}/${thisSK}/`


    const onSetFormatPreset = (type: "jpg/webp" | "png" | "thumbnail" | "preview_snippet" | "og_image" | "main_article_image") => {
        let preset: Partial<SpecsForFilesToUpload>[] = []
        for (let i = 0; i < IMAGE_SIZES.length; i += 1) {
            if (IMAGE_SIZES[i][2]) {
                //                if (type === "jpg/webp") {
                if (IMAGE_SIZES[i][3].includes(type)) {
                    preset = [
                        ...preset,
                        {
                            mimeType: 'image/jpeg',
                            pathTo: uploadFolder,
                            width: IMAGE_SIZES[i][1],
                            aspect: proc_cui_aspect,
                            id: Math.random().toString(36).replace('0.', '')
                        },
                    ]
                    /**
                     * EXCLUDE .webp images for usecases
                     */
                    if (type !== "og_image") {
                        preset = [...preset, {
                            mimeType: 'image/webp',
                            pathTo: uploadFolder,
                            width: IMAGE_SIZES[i][1],
                            aspect: proc_cui_aspect,
                            id: Math.random().toString(36).replace('0.', '')
                        }
                        ]
                    }

                } else if (type === "png") {
                    preset = [...preset,
                    {
                        mimeType: "image/png",
                        pathTo: uploadFolder,
                        width: IMAGE_SIZES[i][1],
                        aspect: proc_cui_aspect,
                        id: Math.random().toString(36).replace('0.', '')
                    }]
                }
            }
        }
        setCMSStates({
            type: "update_val",
            key: "proc_cui_specs_for_files_to_upload",
            value: preset
        })

    }

    const onCloseComponent = () => {
        setCMSStates({ type: 'change_bool', key: 'ui_show_image_upload' })
        setCMSStates({ type: 'reset_proc_cui' })
    }

    const onCropComplete = (_: Area, croppedAreaPixels: Area) => {
        setCMSStates({
            type: "update_val",
            key: "proc_cui_cropped_area_pixels",
            value: croppedAreaPixels
        })
    }

    const onRequestSignedUrls = async () => {
        if (!hasEditRights) return
        setCMSStates({
            type: "update_val",
            key: "proc_cui_progress",
            value: 1 // start
        })
        fetcher.submit({
            requestType: 'requestSignedURLs',
            specsForFilesToUpload: proc_cui_specs_for_files_to_upload,
            csrf: rootLoaderData.csrfToken
        }, {
            encType: "application/json",
            action: `/${UF_CMS}/actions/cd-s3`,
            method: 'post',
        })
    }

    const uploadImages = async (allJobs: SpecsForFilesToUpload[]) => {
        if (!hasEditRights) return
        setCMSStates({
            type: "update_val", key: "proc_cui_progress_counter_1",
            value: [0, allJobs.length]
        })

        try {
            const croppedImage = await getCroppedImg(
                proc_cui_image_src!,
                proc_cui_cropped_area_pixels!,
                proc_cui_rotation
            )

            let confirmed: SpecsForFilesToUpload[] = []
            let sources: Partial<SpecsForFilesToUpload>[] = []

            for (let i = 0; i < allJobs.length; i += 1) {
                const { signedUrl, width, mimeType } = allJobs[i]
                if (signedUrl) {
                    const fileName = new URL(signedUrl).pathname.split("?")[0]
                    const scaled = await scaleImageFromSource(croppedImage,
                        proc_cui_cropped_area_pixels!, width, mimeType)
                    const imageAsFile = await urltoFile(scaled, fileName, mimeType)

                    const image = await fetch(signedUrl, {
                        body: imageAsFile,
                        method: "PUT",
                        headers: {
                            "Content-Type": mimeType,
                            "Content-Disposition": `attachment; filename="${signedUrl.split("?")[0]}"`,
                        },
                        mode: 'cors'
                    });

                    if (image.ok && image.url) {
                        const imgUrlRaw = image.url.split("?")[0]

                        // replace bucket url with domain name
                        const origin = new URL(imgUrlRaw).origin
                        const imgUrl = imgUrlRaw.replace(origin, DISTRIBUTION_URL)


                        confirmed = [...confirmed, { ...allJobs[i], ok: true, imgUrl }]
                        sources = [...sources, {
                            imgUrl,
                            width: allJobs[i].width,
                            aspect: allJobs[i].aspect,
                            mimeType: allJobs[i].mimeType
                        }]
                    } else {
                        confirmed = [...confirmed, { ...allJobs[i], ok: false }]
                    }
                    setCMSStates({
                        type: "update_val", key: "proc_cui_progress_counter_1",
                        value: [i + 1, allJobs.length]
                    })
                } else {
                    confirmed = [...confirmed, { ...allJobs[i], ok: false }]
                }
            }

            setCMSStates({ type: "update_val", key: "proc_cui_progress", value: 3 }) // data to db

            const base = {
                pk: "ME#IM",
                sk: thisSK,
            }

            const full: Record<string, unknown> = {
                author_name: proc_cui_meta_author_name,
                author_url: proc_cui_meta_author_url,
                license_name: proc_cui_meta_license_name,
                license_url: proc_cui_meta_license_url,
                categories: proc_cui_meta_tag.map((it) => it[0]),
                sources,
                alt: proc_cui_meta_alt,
                fig_caption: proc_cui_meta_fig_caption,
                date_published: thisNow.current,
                date_modified: thisNow.current,
                author_type: proc_cui_meta_author_type,
                createdAt: Date.now()
            }

            let fullStringified: Record<string, string> = {}
            for (const key in full) {
                if (key in full) fullStringified[key] = JSON.stringify(full[key])
            }

            fetcher2.submit({
                requestType: "put_image_data",
                redirect_to: currentURL,
                csrf: rootLoaderData.csrfToken,
                ...base,
                ...fullStringified
            }, {
                method: 'post',
                action: `/${UF_CMS}/actions/cud-id-db`,
                encType: "application/x-www-form-urlencoded"
            })

            setCMSStates({
                type: "upate_val_many",
                value: {
                    internal_clipboard_1: {
                        ...base,
                        categories: proc_cui_meta_tag.map((it) => it[0]),
                    },
                    internal_clipboard_2: { [thisSK]: { ...base, ...full } }
                }
            })

        } catch (err) {
            console.error({ err })
            return null
        }
    }

    const onFileChange = async (e: BaseSyntheticEvent) => {
        if (e.target.files && e.target.files.length > 0) {
            thisNow.current = Date.now()
            const file = e.target.files[0]
            setCMSStates({ type: "update_val", key: "proc_cui_mime_type", value: file.type })
            let imageDataUrl = await readFile(file)
            try {
                const orientation = await getOrientation(file)
                const rotation = OrientationToAngle.get(orientation)
                if (rotation) {
                    imageDataUrl = await getRotatedImage(imageDataUrl, rotation)
                }
            } catch (e) {
                console.warn('failed to detect the orientation')
            }
            setCMSStates({ type: "update_val", key: "proc_cui_image_src", value: imageDataUrl })
            setCMSStates({ type: "update_val", key: "proc_cui_step", value: 1 })
        }
    }

    // const onDoTranslate = async (originalLang: string) => {
    //     await fetcherTranslate.submit({
    //         data: JSON.stringify({
    //             proc_cui_meta_alt: proc_cui_meta_alt
    //                 ? proc_cui_meta_alt[originalLang]
    //                 : '',
    //             proc_cui_meta_fig_caption: proc_cui_meta_fig_caption
    //                 ? proc_cui_meta_fig_caption[originalLang]
    //                 : '',
    //             original_lang: originalLang,
    //             target_langs: translateTargetLangs,
    //             formality: translateFormality
    //         }),
    //         requestType: "translate_image_data",
    //     }, {
    //         method: 'POST',
    //         action: '/actions/translate',
    //         encType: "application/x-www-form-urlencoded"
    //     })
    // }

    useEffect(() => {
        if (fetcherTranslate?.data?.output) {
            const da = fetcherTranslate?.data?.output
            setCMSStates({
                type: "upate_val_many", value: {
                    proc_cui_meta_alt: { ...proc_cui_meta_alt, ...da.proc_cui_meta_alt },
                    proc_cui_meta_fig_caption: {
                        ...proc_cui_meta_fig_caption, ...da.proc_cui_meta_fig_caption
                    }
                }
            })
        }
    }, [fetcherTranslate?.data])

    useEffect(() => {
        if (!hasEditRights) return
        if (fetcher.data?.requestType === "requestSignedURLs") {
            setCMSStates({ type: "update_val", key: "proc_cui_progress", value: 2 }) // uploading images
            uploadImages(fetcher.data.resp).catch((err) => {
                console.error({ err })
            })
        }
    }, [fetcher?.data])

    useEffect(() => {
        if (!hasEditRights) return
        if (sps.get('tempMsgTitle') === "tm_image_saved_title") {
            setCMSStates({ type: "update_val", key: "proc_cui_progress", value: 4 }) // done
            const timeout = setTimeout(() => {

                setCMSStates({
                    type: "upate_val_many",
                    value: {
                        proc_cui_progress: 0,
                        ui_show_image_upload: false,
                        ui_show_image_gallery: true,
                        ui_ig_show_item: thisSK
                    }
                })

                setCMSStates({ type: 'reset_proc_cui' })
                setCMSStates({
                    type: "add_items_to_arr",
                    key: "ui_ig_data_feed", value: [internal_clipboard_1]
                })
                setCMSStates({
                    type: "add_item_to_obj",
                    key: "ui_ig_data_item_details", value: internal_clipboard_2
                })
                setCMSStates({ type: "reset_internal_clipboards" })
            }, 1200)
            return () => clearTimeout(timeout)
        }
    }, [sps.get('tempMsgTitle')])



    return (
        <Dialog.Root open={true}>
            <Dialog.Portal>
                <Dialog.Overlay className="bg-neutral-50 dark:bg-neutral-950 fixed z-[101] inset-0" />
                <Dialog.Content className='component_as_modal fixed -translate-x-2/4 -translate-y-2/4 w-[95vw] h-[95vh] left-2/4 top-2/4 z-[111] overflow-auto bg-neutral-100 dark:bg-neutral-900 text-neutral-950 dark:text-neutral-50 rounded'>
                    <div>
                        <div className='w-full z-[2]'>

                            <div className='p-2 text-slate-800 dark:text-slate-200 text-xl font-semibold'>
                                <Dialog.Title>
                                    {cui_main_title}
                                </Dialog.Title>
                                <VisuallyHidden.VisuallyHidden>

                                    <Dialog.Description>
                                        {cui_main_description}
                                    </Dialog.Description>
                                </VisuallyHidden.VisuallyHidden>
                            </div>

                            <div className="flex wrap col_gray_11 justify-between text-sm text-neutral-800 dark:text-neutral-200">

                                <ol className="cui_steps_ol bg_trans_gray_8 z-[3] m-0 pl-8 pr-2 pt-2 pb-2">
                                    <li>{cui_step_choose_image}
                                        {proc_cui_step > 0
                                            && <CheckIcon
                                                aria-hidden
                                                width={16}
                                                height={16}
                                            />}
                                    </li>
                                    <li>{cui_step_crop}
                                        {proc_cui_step > 1
                                            && <CheckIcon
                                                aria-hidden
                                                width={16}
                                                height={16}
                                            />}
                                    </li>
                                    <li>{cui_step_format}
                                        {proc_cui_step > 2
                                            && <CheckIcon
                                                aria-hidden
                                                width={16}
                                                height={16}
                                            />}
                                    </li>
                                    <li>{cui_step_metas}
                                        {proc_cui_step > 3
                                            && <CheckIcon
                                                aria-hidden
                                                width={16}
                                                height={16}
                                            />}
                                    </li>
                                    <li>{cui_step_upload}
                                        {proc_cui_step > 4
                                            && <CheckIcon
                                                aria-hidden
                                                width={16}
                                                height={16}
                                            />}
                                    </li>
                                </ol>

                                <div className='p-2 fixed top-2 right-2 z-10'>
                                    <button
                                        style={{ zIndex: 3 }}
                                        disabled={proc_cui_progress > 0}
                                        type="button"
                                        className="btn_1 icon relative small z-10"
                                        onClick={() => onCloseComponent()}
                                    >
                                        <Cross1Icon
                                            width={16}
                                            height={16}
                                            aria-label={btn_close}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {proc_cui_image_src ? (
                            <>
                                <Cropper
                                    image={proc_cui_image_src}
                                    crop={proc_cui_crop}
                                    rotation={debouncedRotation ?? 0}
                                    zoom={debouncedZoom}
                                    aspect={proc_cui_aspect}
                                    onCropChange={proc_cui_step > 1
                                        ? () => { }
                                        : (e) => setCMSStates({
                                            type: "update_val",
                                            key: "proc_cui_crop",
                                            value: e
                                        })}
                                    onRotationChange={proc_cui_step > 1
                                        ? () => { }
                                        : (e) => setCMSStates({
                                            type: "update_val",
                                            key: "proc_cui_rotation",
                                            value: e
                                        })}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={proc_cui_step > 1
                                        ? () => { }
                                        : (e) => setCMSStates({
                                            type: "update_val",
                                            key: "proc_cui_zoom",
                                            value: e
                                        })}
                                    disableAutomaticStylesInjection
                                />
                                <div className='pt-48 z-20 fixed overflow-y-auto max-h-[95vh] bottom-0'>

                                    <div className={clsx('bg-neutral-100/90 dark:bg-neutral-900/90 items-start flex gap-[0.5rem_2rem] flex-wrap relative p-2',
                                        { open: ui_cui_show_line_1 })} >

                                        <button
                                            className='btn_1 w-20 reg'
                                            onClick={() => setCMSStates({
                                                type: 'change_bool',
                                                key: 'ui_cui_show_line_1'
                                            })}
                                        >
                                            {cui_btn_crop}
                                        </button>
                                        {ui_cui_show_line_1 && (
                                            <div className='flex gap-2 flex-col'>
                                                <InputElement
                                                    label={cui_label_zoom}
                                                    inputProps={{
                                                        disabled: proc_cui_step > 1,
                                                        onChange: (e: BaseSyntheticEvent) => {
                                                            setCMSStates({
                                                                type: "update_val",
                                                                key: "proc_cui_zoom",
                                                                value: parseFloat(e.target.value)
                                                            })
                                                        },
                                                        defaultValue: proc_cui_zoom,
                                                        type: 'range',
                                                        min: 1,
                                                        max: 3,
                                                        step: 0.1
                                                    }}
                                                />
                                                <InputElement
                                                    label={cui_label_rotation}
                                                    inputProps={{
                                                        disabled: proc_cui_step > 1,
                                                        onChange: (e: BaseSyntheticEvent) => {
                                                            setCMSStates({
                                                                type: "update_val",
                                                                key: "proc_cui_rotation",
                                                                value: parseInt(e.target.value)
                                                            })
                                                        },
                                                        defaultValue: proc_cui_zoom,
                                                        type: 'range',
                                                        min: 0,
                                                        max: 360,
                                                        step: 1,
                                                    }}
                                                />
                                                <div 
                                                className="flex gap-4 flex-col"
                                                >
                                                    <div>
                                                    {cui_label_aspect}
                                                    </div>

                                                    <ul className='list-disc'>
                                                        {ASPECTS.map((it, ind) => (
                                                            <li key={ind} className='ml-6'>
                                                                <InputElement
                                                                    wrapperProps={{
                                                                        className: 'ring ring-inset ring-neutral-300 dark:ring-neutral-600 p-1 gap-2 flex'
                                                                    }}

                                                                    label={it[1]}
                                                                    inputProps={{
                                                                        disabled: proc_cui_step > 1,
                                                                        defaultChecked: it[0] === proc_cui_aspect,
                                                                        name: 'aspect',
                                                                        value: it[0],
                                                                        type: 'radio',
                                                                        onChange: () => {
                                                                            setCMSStates({
                                                                                type: "update_val",
                                                                                key: "proc_cui_aspect",
                                                                                value: it[0]
                                                                            })
                                                                        }
                                                                    }}
                                                                />
                                                            </li>

                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>)}

                                        {proc_cui_step === 1 && (
                                            <button
                                                className='btn_1 reg'
                                                onClick={() => {
                                                    setCMSStates({
                                                        type: "upate_val_many",
                                                        value: {
                                                            proc_cui_step: 2,
                                                            ui_cui_show_line_1: false,
                                                            ui_cui_show_line_2: true,
                                                        }
                                                    })
                                                }}
                                            >
                                                {cui_step_next}
                                            </button>
                                        )}

                                    </div>

                                    <div className={clsx('bg-neutral-100/90 dark:bg-neutral-900/90 items-start flex gap-[0.5rem_2rem] flex-wrap relative p-2', {
                                        open: ui_cui_show_line_2
                                    })}>
                                        <button
                                            className='btn_1 reg w-20'
                                            onClick={() => {
                                                setCMSStates({
                                                    type: 'change_bool',
                                                    key: 'ui_cui_show_line_2'
                                                })
                                            }}
                                        >
                                            {cui_btn_formats}
                                        </button>
                                        {ui_cui_show_line_2 && (
                                            <>
                                                <div className="items-start flex gap-4 items-center flex-wrap">

                                                    <div className='flex flex-col gap-2'>

                                                        <button
                                                            type='button'
                                                            className='btn_1 reg'
                                                            onClick={() => onSetFormatPreset('thumbnail')}
                                                        >
                                                            thumbnail
                                                        </button>
                                                        <button
                                                            type='button'
                                                            className='btn_1 reg'
                                                            onClick={() => onSetFormatPreset('preview_snippet')}
                                                        >
                                                            preview_snippet
                                                        </button>

                                                        <button
                                                            type='button'
                                                            className='btn_1 reg'
                                                            onClick={() => onSetFormatPreset('og_image')}
                                                        >
                                                            og_image
                                                        </button>

                                                        <button
                                                            type='button'
                                                            className='btn_1 reg'
                                                            onClick={() => onSetFormatPreset('main_article_image')}
                                                        >
                                                            main_article_image
                                                        </button>
                                                        {/**
 *  <button
                                                            type='button'
                                                            className='btn_1 reg'
                                                            onClick={() => onSetFormatPreset('jpg/webp')}
                                                        >
                                                            Preset jpg/webp
                                                        </button>
                                                          <button
                                                            type='button'
                                                            className='btn_1 reg'
                                                            onClick={() => onSetFormatPreset('png')}
                                                        >
                                                            Preset png
                                                        </button>
 */}



                                                        <button
                                                            className='btn_1 reg'
                                                            onClick={() => setCMSStates({
                                                                type: "update_val",
                                                                key: "proc_cui_specs_for_files_to_upload",
                                                                // ------------------
                                                                value: [
                                                                    ...proc_cui_specs_for_files_to_upload, {
                                                                        mimeType: proc_cui_mime_type!,
                                                                        pathTo: uploadFolder,
                                                                        width: 768,
                                                                        aspect: proc_cui_aspect,
                                                                        id: Math.random()
                                                                            .toString(36)
                                                                            .replace('0.', '')
                                                                    }]
                                                            })}
                                                        >
                                                            <PlusCircledIcon
                                                                width={16}
                                                                height={16}
                                                                aria-label={add}
                                                            />
                                                        </button>

                                                    </div>
                                                    <div className='flex flex-col gap-2'>
                                                        {proc_cui_specs_for_files_to_upload.map((it, ind) => (
                                                            <div
                                                                key={it.id}
                                                                className='flex wrap gap-2'
                                                            >
                                                                <RadixSelect
                                                                    selectTriggerProps={{
                                                                        "aria-label": cui_label_mime_type,
                                                                        className: 'h-[33px] btn_1 reg w-16'

                                                                    }}
                                                                    placeholder={cui_label_mime_type}
                                                                    selectRootProps={{
                                                                        defaultValue: it.mimeType,
                                                                        onValueChange: (e) => {
                                                                            const value = proc_cui_specs_for_files_to_upload
                                                                            value[ind].mimeType = e as SpecsForFilesToUpload["mimeType"]
                                                                            setCMSStates({
                                                                                type: "update_val",
                                                                                key: "proc_cui_specs_for_files_to_upload",
                                                                                value
                                                                            })
                                                                        }
                                                                    }}
                                                                    selectItems={[
                                                                        ["png", "image/png"],
                                                                        ["jpg", "image/jpeg"],
                                                                        ["webp", "image/webp"]
                                                                    ]}
                                                                />
                                                                <RadixSelect
                                                                    placeholder={cui_label_width}
                                                                    selectTriggerProps={{
                                                                        "aria-label": cui_label_width,
                                                                        className: 'h-[33px] btn_1 reg w-16',
                                                                    }}
                                                                    selectItems={IMAGE_SIZES.map((it) => [it[0], it[1]])}
                                                                    selectRootProps={{
                                                                        defaultValue: it.width.toString(),
                                                                        onValueChange: (e) => {
                                                                            const value = proc_cui_specs_for_files_to_upload
                                                                            value[ind].width = parseInt(e)
                                                                            setCMSStates({
                                                                                type: "update_val",
                                                                                key: "proc_cui_specs_for_files_to_upload",
                                                                                value
                                                                            })
                                                                        }
                                                                    }}
                                                                />
                                                                <button
                                                                    className='btn_1 icon small'
                                                                    onClick={() => {
                                                                        const value = proc_cui_specs_for_files_to_upload
                                                                            .filter((ii) => ii?.id !== it?.id)
                                                                        setCMSStates({
                                                                            type: "update_val",
                                                                            key: "proc_cui_specs_for_files_to_upload",
                                                                            value: value
                                                                        })
                                                                    }}
                                                                >
                                                                    <MinusCircledIcon
                                                                        width={16}
                                                                        height={16}
                                                                        aria-label={remove}
                                                                    />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                {proc_cui_step === 2 && (
                                                    <button
                                                        className='btn_1 reg'
                                                        disabled={proc_cui_specs_for_files_to_upload.length === 0}
                                                        onClick={() => setCMSStates({
                                                            type: "upate_val_many", value: {
                                                                proc_cui_step: 3,
                                                                ui_cui_show_line_2: false,
                                                                ui_cui_show_line_3: true,
                                                            }
                                                        })}>
                                                        {cui_step_next}
                                                    </button>
                                                )}
                                            </>)}
                                    </div>

                                    <div className={clsx('bg-neutral-100/90 dark:bg-neutral-900/90 items-start flex gap-[0.5rem_2rem] flex-wrap relative p-2',
                                        { open: ui_cui_show_line_3 })}>
                                        <button
                                            className='btn_1 reg w-20'
                                            onClick={() => setCMSStates({
                                                type: 'change_bool',
                                                key: 'ui_cui_show_line_3'
                                            })}
                                        >
                                            {cui_btn_metas}
                                        </button>
                                        {ui_cui_show_line_3 && (
                                            <div>
                                                <div>
                                                    {SITE_CONFIG.SITE_LANGS.map((it) => (
                                                        <div key={it.lang_html}>
                                                            {it.label}
                                                            <div className='item_to_right flex flex-col gap-2 mt-2 mb-4 pl-6'>
                                                                <InputElement
                                                                    uid label={cui_label_alt_desc}
                                                                    inputProps={{
                                                                        value: proc_cui_meta_alt
                                                                            ? (proc_cui_meta_alt[it.lang_code] ?? '') : '',
                                                                        onChange: (e: BaseSyntheticEvent) => {
                                                                            const value = proc_cui_meta_alt ?? {}
                                                                            value[it.lang_code] = e.target.value
                                                                            setCMSStates({
                                                                                type: "update_val",
                                                                                key: "proc_cui_meta_alt",
                                                                                value
                                                                            })
                                                                        }
                                                                    }}
                                                                />
                                                                <InputElement
                                                                    uid label={cui_label_fig_caption}
                                                                    inputProps={{
                                                                        value: proc_cui_meta_fig_caption
                                                                            ? (proc_cui_meta_fig_caption[it.lang_code] ?? '') : '',
                                                                        onChange: (e: BaseSyntheticEvent) => {
                                                                            const value = proc_cui_meta_fig_caption ?? {}
                                                                            value[it.lang_code] = e.target.value
                                                                            setCMSStates({
                                                                                type: "update_val",
                                                                                key: "proc_cui_meta_fig_caption",
                                                                                value
                                                                            })
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div>
                                                    {cui_label_author}
                                                    <div className='item_to_right flex flex-col gap-2 mt-2 mb-4 pl-6'>
                                                        <InputElement
                                                            uid label={cui_label_name}
                                                            inputProps={{
                                                                onChange: (e: BaseSyntheticEvent) => {
                                                                    setCMSStates({
                                                                        type: "update_val",
                                                                        key: "proc_cui_meta_author_name",
                                                                        value: e.target.value
                                                                    })
                                                                }
                                                            }}
                                                        />
                                                        <InputElement
                                                            uid label={cui_label_url}
                                                            inputProps={{
                                                                type: ig_author_url,
                                                                onChange: (e: BaseSyntheticEvent) => {
                                                                    setCMSStates({
                                                                        type: "update_val",
                                                                        key: "proc_cui_meta_author_url",
                                                                        value: e.target.value
                                                                    })
                                                                }
                                                            }}
                                                        />
                                                        <RadixSelect
                                                            placeholder={ig_author_type}
                                                            selectTriggerProps={{
                                                                "aria-label": ig_author_type
                                                            }}
                                                            selectItems={[["Person", "Person"],
                                                            ["Organization", "Organization"]]}
                                                            selectRootProps={{
                                                                defaultValue: "Person",
                                                                onValueChange: (e) => {
                                                                    setCMSStates({
                                                                        type: "update_val",
                                                                        key: "proc_cui_meta_author_type",
                                                                        value: e
                                                                    })
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    {cui_label_license}
                                                    <div className='item_to_right flex flex-col gap-2 mt-2 mb-4 pl-6'>

                                                        <RadixSelect
                                                            placeholder={cui_label_license}
                                                            selectTriggerProps={{
                                                                "aria-label": cui_label_license
                                                            }}
                                                            selectItems={LICENSES}
                                                            selectRootProps={{
                                                                onValueChange: (e) => {
                                                                    setCMSStates({
                                                                        type: "update_val",
                                                                        key: "proc_cui_meta_license_url",
                                                                        value: e
                                                                    })
                                                                    setCMSStates({
                                                                        type: "update_val",
                                                                        key: "proc_cui_meta_license_name",
                                                                        value: LICENSES
                                                                            .filter((it) => it[1] === e)[0][0]
                                                                    })
                                                                }
                                                            }}
                                                        />

                                                        <InputElement
                                                            uid label={cui_label_name}
                                                            inputProps={{
                                                                onChange: (e: BaseSyntheticEvent) => {
                                                                    setCMSStates({
                                                                        type: "update_val",
                                                                        key: "proc_cui_meta_license_name",
                                                                        value: e.target.value
                                                                    })
                                                                }
                                                            }}
                                                        />

                                                        <InputElement
                                                            uid label={cui_label_url}
                                                            inputProps={{
                                                                type: 'url',
                                                                onChange: (e: BaseSyntheticEvent) => {
                                                                    setCMSStates({
                                                                        type: "update_val",
                                                                        key: "proc_cui_meta_license_url",
                                                                        value: e.target.value
                                                                    })
                                                                }
                                                            }}
                                                        />

                                                    </div>
                                                </div>
                                                <div>
                                                    {cui_label_tags}
                                                    <div className='item_to_right flex flex-col gap-2 mt-2 mb-4 pl-6'>
                                                        <div className="input_wrapper items-start flex gap-4 items-center flex-wrap">
                                                            <button
                                                                className='btn_1 reg icon small'
                                                                onClick={() => setCMSStates({
                                                                    type: "update_val",
                                                                    key: "proc_cui_meta_tag",
                                                                    value: [
                                                                        ...proc_cui_meta_tag,
                                                                        ["", Math.random()
                                                                            .toString(36)
                                                                            .replace('0.', '')]]
                                                                })}
                                                            >
                                                                <PlusCircledIcon
                                                                    width={16}
                                                                    height={16}
                                                                    aria-label={add}
                                                                />
                                                            </button>
                                                            {proc_cui_meta_tag?.length ? (
                                                                <div>
                                                                    {proc_cui_meta_tag.map((it, ind) => (
                                                                        <div
                                                                            key={it[1]}
                                                                            className="input_wrapper flex gap-4 items-center flex-wrap mb-2">
                                                                            <label htmlFor={`tag_${ind}`}>
                                                                                <code>
                                                                                    {ind.toString()}
                                                                                </code>

                                                                            </label>
                                                                            <input
                                                                                type='text'
                                                                                className='inp_1'
                                                                                id={`tag_${ind}`}
                                                                                onChange={(e) => {
                                                                                    const value = proc_cui_meta_tag
                                                                                    value[ind][0] = e.target.value
                                                                                    setCMSStates({
                                                                                        type: "update_val",
                                                                                        key: "proc_cui_meta_tag",
                                                                                        value
                                                                                    })
                                                                                }}
                                                                            />
                                                                            <button
                                                                                type='button'
                                                                                className='btn_1 icon small'
                                                                                onClick={() => {
                                                                                    const value = proc_cui_meta_tag.filter(
                                                                                        (itt) => itt[1] !== it[1])
                                                                                    setCMSStates({
                                                                                        type: "update_val",
                                                                                        key: "proc_cui_meta_tag",
                                                                                        value
                                                                                    })
                                                                                }}
                                                                            >
                                                                                <MinusCircledIcon
                                                                                    width={16}
                                                                                    height={16}
                                                                                    aria-label={remove} />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className='bg-neutral-100/90 dark:bg-neutral-900/90 items-start flex gap-[0.5rem_2rem] flex-wrap relative p-2'>
                                        <button
                                            disabled={proc_cui_step !== 3 || !hasEditRights}
                                            type='button'
                                            className={clsx('btn_3 reg', { 'w-20': hasEditRights })}

                                            onClick={() => onRequestSignedUrls()}
                                        >
                                            {cui_btn_upload}
                                            {!hasEditRights && <NotAllowedInGuestMode />}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className='max-w-lg p-2 absolute -translate-x-2/4 -translate-y-2/4 left-2/4 top-2/4 w-full'>
                                <input
                                    className='btn_3 reg'
                                    type="file"
                                    onChange={onFileChange}
                                    accept="image/*"
                                />
                            </div>
                        )}
                        <CUIProgress />

                    </div>

                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root >
    )
}
