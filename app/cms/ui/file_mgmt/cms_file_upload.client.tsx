import * as Dialog from '@radix-ui/react-dialog'
import { Cross1Icon, MinusCircledIcon, PlusCircledIcon } from '@radix-ui/react-icons'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { useFetcher, useRouteLoaderData } from 'react-router'
import { useEffect, useReducer, useRef, type BaseSyntheticEvent } from 'react'
import clsx from 'clsx'

import CUIProgress from '../image_mgmt/crop_and_upload/cms_cui_upload_progress'
import { useCMSStates } from '~/cms/cms_states'
import CMS_CONFIG from '~/cms/cms.config'
import SITE_CONFIG from '~/site/site.config'
import { useAuth } from '~/cms/utils/auth/useAuth'
import { useCurrentURL } from '~/common/shared/hooks'
import InputElement from '../generics/g_input_element'
import RadixSelect from '../radix/radix_select'
import COMMON_CONFIG from '~/common/common.config'


export default function CMSFileUpload() {
    const [{
        proc_cui_meta_alt,
        proc_cui_meta_fig_caption,
        proc_cui_meta_tag,
        proc_cui_meta_author_name,
        proc_cui_meta_author_type,
        proc_cui_meta_author_url,
        proc_cui_meta_license_name,
        proc_cui_meta_license_url
    }, setCMSStates] = useCMSStates()

    const thisNow = useRef(Date.now())
    const thisSK = thisNow.current.toString(36)
    const { MEDIA_DIRECTORIES } = COMMON_CONFIG
    const {
        AUTH_CONFIG: { MIN_AUTH_LVL_EDIT_RIGHTS },
        CREATE_AND_UPLOAD_IMAGES: { LICENSES },
        URL_FRAGMENTS: {UF_CMS}
    } = CMS_CONFIG
    const { SITE_DEPLOYMENT: { DISTRIBUTION_URL } } = SITE_CONFIG
    const fetcher = useFetcher({ key: 'fupload' })
    const fetcher2 = useFetcher({ key: 'fuploadddb' })
    const auth = useAuth()
    const currentURL = useCurrentURL()
    const hasEditRights = auth > MIN_AUTH_LVL_EDIT_RIGHTS
    const rootLoaderData = useRouteLoaderData('root')

    const {
        locTxt: {
            crop_and_upload_images: {
                cui_label_author,
                cui_label_name,
                cui_label_url,
                cui_label_license,
                cui_label_tags,
                cui_label_alt_desc,
                cui_label_fig_caption,
            },
            ui_labels: {
                add,
                remove
            },
            image_gallery: {
                ig_author_url,
                ig_author_type
            },
            file_upload: {
                fu_files,
                fu_file_type,
                fu_name,
                fu_type,
                fu_size,
                fu_preparing,
                fu_prepared,
                fu_image,
                fu_video,
                fu_doc,
                fu_directory,
                fu_title
            }
        } } = useRouteLoaderData('cms/routes/layouts/cms_root_layout')

    const [{
        payload,
        hasUrls,
        fileDirectory
    }, dispatch] = useReducer(((st, act) => {
        return {
            ...st,
            ...act.reduce((
                i: Record<string, unknown>,
                j: Record<string, unknown>
            ) => ({ ...i, ...j }), {})
        }
    }), {
        payload: [],
        hasUrls: false,
        fileDirectory: 'videos'
    })

    interface FilePayloadBase { pathTo: string, mimeType: string }
    interface FilePayloadWithFile extends FilePayloadBase { file: File, fileSize: number, }

    const onFileChange = async (e: BaseSyntheticEvent) => {
        let fpayload: FilePayloadWithFile[] = []
        let dataForRequest: FilePayloadBase[] = []
        for (let i = 0; i < e.target.files.length; i += 1) {
            const file = e.target.files[i]
            const pathTo = file.name.split('.')[0]
            const mimeType = file.type
            const fileSize = file.size

            // for state
            fpayload = [
                ...fpayload, {
                    file,
                    pathTo: `files/${fileDirectory}/${thisSK}/${pathTo}`,
                    mimeType,
                    fileSize
                }]

            // for url requester, without file and file size
            dataForRequest = [
                ...dataForRequest, {
                    pathTo: `files/${fileDirectory}/${thisSK}/${pathTo}`,
                    mimeType,
                }
            ]
        }

        dispatch([{ payload: fpayload }])
        await onRequestSignedUrls(dataForRequest)
    }


    const uploadFile = async () => {
        const payloadLength = payload.length
        if (!hasEditRights || !payloadLength || !hasUrls) return

        setCMSStates({
            type: "update_val",
            key: "proc_cui_progress",
            value: 2 // start
        })
        setCMSStates({ type: "update_val", key: "proc_cui_progress", value: 2 })

        let fileMetaDataForDynamoDB: { url: string, size: number, mime: string }[] = []

        for (let i = 0; i < payload.length; i += 1) {
            const { file, mimeType, fileSize } = payload[i]
            setCMSStates({
                type: "update_val", key: "proc_cui_progress_counter_1",
                value: [i + 1, payloadLength]
            })
            const anyFile = await fetch(fetcher.data.resp[i].signedUrl, {
                body: file,
                method: "PUT",
                headers: {
                    "Content-Type": mimeType,
                    "Content-Disposition": `attachment; filename="${fetcher.data.resp[i].signedUrl.split("?")[0]}"`,
                },
                mode: 'cors',
                
            });

            const urlRaw = anyFile.url.split("?")[0]
            const origin = new URL(urlRaw).origin
            const url = urlRaw.replace(origin, DISTRIBUTION_URL)

            fileMetaDataForDynamoDB = [
                ...fileMetaDataForDynamoDB,
                { url, size: fileSize, mime: mimeType }
            ]
        }

        setCMSStates({ type: "update_val", key: "proc_cui_progress", value: 3 })

        const full: Record<string, unknown> = {
            author_name: proc_cui_meta_author_name,
            author_url: proc_cui_meta_author_url,
            license_name: proc_cui_meta_license_name,
            license_url: proc_cui_meta_license_url,
            categories: proc_cui_meta_tag.map((it) => it[0]),
            sources: fileMetaDataForDynamoDB,
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

        let pk = "ME#"
        if (fileDirectory === "videos") {
            pk += "VI"
        } else if (fileDirectory === "images") {
            pk += "IM"
        } else if (fileDirectory === "documents") {
            pk += "DO"
        } else {
            return
        }

        await fetcher2.submit({
            requestType: "put_image_data",
            redirect_to: currentURL,
            pk,
            sk: thisSK,
            csrf: rootLoaderData.csrfToken,
            ...fullStringified
        }, {
            method: 'post',
            action: `/${UF_CMS}/actions/cud-id-db`,
            encType: "application/x-www-form-urlencoded"
        })

        setCMSStates({ type: "update_val", key: "proc_cui_progress", value: 4 })
        const timeout = setTimeout(() => {
            setCMSStates({
                type: 'change_bool',
                key: 'ui_show_file_upload'
            })
            setCMSStates({ type: 'reset_proc_cui' })
        }, 1200)

        return () => clearTimeout(timeout)
    }


    const onRequestSignedUrls = async (payload: FilePayloadBase[]) => {
        if (!hasEditRights || !payload.length) return
        fetcher.submit({
            requestType: 'requestSignedURLs',
            specsForFilesToUpload: payload as any,
            csrf: rootLoaderData.csrfToken
        }, {
            encType: "application/json",
            action: `/${UF_CMS}/actions/cd-s3`,
            method: 'post',
        })
    }


    useEffect(() => {
        if (fetcher.data?.resp?.length) {
            dispatch([{ hasUrls: true }])
        }
    }, [fetcher.data])


    return (
        <Dialog.Root open={true}>
            <Dialog.Portal>
                <Dialog.Overlay className="bg-neutral-50 dark:bg-neutral-950 fixed z-[101] inset-0" />
                <Dialog.Content className='component_as_modal fixed -translate-x-2/4 -translate-y-2/4 w-[95vw] h-[95vh] left-2/4 top-2/4 z-[111] overflow-auto bg-neutral-100 dark:bg-neutral-900 text-neutral-950 dark:text-neutral-50 rounded'>

                    <div className='w-full h-full z-[2]'>
                        <div className='p-2'>
                            <Dialog.Title className='text-slate-800 dark:text-slate-200 text-xl font-semibold'>
                                {fu_title}
                            </Dialog.Title>
                            <VisuallyHidden.VisuallyHidden>
                                <Dialog.Description>
                                    Upload any file
                                </Dialog.Description>
                            </VisuallyHidden.VisuallyHidden>

                            <table className='table_1 max-w-4xl mt-6'>
                                <caption>
                                    {fu_files}
                                </caption>
                                <thead>
                                    <tr>
                                        <th>{fu_file_type}</th>
                                        <th>MIME</th>
                                        <th>{fu_directory}</th>
                                        <th>DB PK</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{fu_video}</td>
                                        <td><code>.webm, .mp4</code></td>
                                        <td><code>/files/videos</code></td>
                                        <td><code>ME#VI</code></td>
                                    </tr>
                                    <tr>
                                        <td>{fu_image}</td>
                                        <td><code>.jpg, .webp, .png, .svg</code></td>
                                        <td><code>/files/images</code></td>
                                        <td><code>ME#IM</code></td>
                                    </tr>

                                    <tr>
                                        <td>{fu_doc}</td>
                                        <td><code>.pdf</code></td>
                                        <td><code>/files/documents</code></td>
                                        <td><code>ME#DO</code></td>
                                    </tr>
                                </tbody>
                            </table>

                        </div>

                        <div className='p-2 absolute top-2 right-2'>
                            <button
                                style={{ zIndex: 3 }}
                                type="button"
                                className="btn_1 icon relative small"
                                onClick={() =>
                                    setCMSStates({
                                        type: 'change_bool',
                                        key: 'ui_show_file_upload'
                                    })
                                }
                            >
                                <Cross1Icon
                                    width={16}
                                    height={16}
                                    aria-label={"close"}
                                />
                            </button>
                        </div>

                        <div className={clsx('flex gap-[0.5rem_2rem] flex-wrap relative',
                            { open: payload.length })}>
                            {payload.length > 0 && (
                                <div>
                                    {hasUrls ? (
                                        <div className='px-2 pt-2 text-slate-800 dark:text-slate-200 font-semibold'>
                                            {fu_prepared}
                                        </div>
                                    ) : (
                                        <div className='px-2 pt-2 text-slate-800 dark:text-slate-200 font-semibold'>
                                            {fu_preparing}
                                        </div>
                                    )}
                                    <div className='p-2 pb-6 max-w-full'>
                                        <table className='table_1 overflow-auto'>
                                            <caption>{fu_files}</caption>
                                            <thead>
                                                <tr>
                                                    <th>{fu_name}</th>
                                                    <th>{fu_type}</th>
                                                    <th>{fu_size}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {payload.map((it: FilePayloadWithFile, ind) => (
                                                    <tr key={ind}>
                                                        <td>{it.pathTo}</td>
                                                        <td>{it.mimeType}</td>
                                                        <td>{it.fileSize}</td>
                                                    </tr>
                                                ))}
                                            </tbody>

                                        </table>
                                    </div>

                                    <div className='p-2'>
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

                                    <div className='p-2'>
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
                                    <div className='p-2'>
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
                                    <div className='p-2'>
                                        {cui_label_tags}
                                        <div className='flex flex-col gap-2 mt-2 mb-4 pl-6'>
                                            <div className="flex gap-4 items-start flex-wrap">
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
                                                {proc_cui_meta_tag?.length > 0 && (
                                                    <div>
                                                        {proc_cui_meta_tag.map((it, ind) => (
                                                            <div
                                                                key={it[1]}
                                                                className="input_wrapper flex gap-4 items-center flex-wrap my-2">
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
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className='p-2'>
                                        <button
                                            disabled={!hasUrls}
                                            className='btn_3 reg'
                                            onClick={() => uploadFile()}
                                            type='button'>
                                            upload
                                        </button>
                                    </div>

                                </div>
                            )}
                        </div>

                        {!payload?.length ? (
                            <div className="flex wrap col_gray_11 justify-between p-2 max-w-lg p-2 absolute -translate-x-2/4 -translate-y-2/4 left-2/4 top-2/4 w-full">
                                <RadixSelect
                                    placeholder={fu_file_type}
                                    selectItems={MEDIA_DIRECTORIES}

                                    selectRootProps={{
                                        defaultValue: 'videos',
                                        onValueChange: (e) => dispatch([{ fileDirectory: e }])
                                    }}
                                />
                                <input
                                    multiple
                                    className='btn_3 reg'
                                    type="file"
                                    onChange={onFileChange}
                                />
                            </div>
                        ) : null}
                        <CUIProgress />
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root >
    )
}

