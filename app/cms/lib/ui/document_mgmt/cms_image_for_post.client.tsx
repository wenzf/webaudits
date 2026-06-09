import { Fragment, useEffect, useState, type BaseSyntheticEvent } from "react"
import { Pencil1Icon } from "@radix-ui/react-icons"
import { useRouteLoaderData } from "react-router"

import InputElement from "../generics/g_input_element"
import RadixSelect from "../radix/radix_select"
import { convertImageDataToImageProps } from "../image_mgmt/gallery/cms_gallery_utils";
import { SourcesTable } from "../generics/g_table_fragments";
import type { DBILFull, ImageFull, SiteLangs } from "../../../../../types/site"



export default function ImageForPostForm({
    init,
    lang,
    isMainImage,
    setter,
    id
}: {
    init?: DBILFull | ImageFull,
    lang: SiteLangs["lang_code"],
    isMainImage?: boolean,
    setter?: (e: ImageFull) => void,
    id?: string
}) {
    let alt = ''
    let figCaption = ''
    if (init) {
        if ('alt' in init) {
            if (typeof init.alt === "string") {
                alt = init.alt
            } else if (init.alt !== null
                && lang in init.alt) {
                alt = init.alt[lang]
            }
        }
        if ('fig_caption' in init) {
            if (typeof init.fig_caption === "string") {
                figCaption = init.fig_caption
            } else if (init.fig_caption !== null
                && lang in init.fig_caption) {
                figCaption = init.fig_caption[lang]
            }
        }
    }
    const {
        locTxt: {
            image_gallery: {
                ig_alt_description,
                ig_fig_caption,
                ig_license_name,
                ig_license_url,
                ig_author_name,
                ig_author_url,
                ig_author_type,
            },
            ui_labels: {
                copy_to_clipboard,
                ul_edit
            }
        } } = useRouteLoaderData('cms/lib/routes/layouts/cms_root_layout')

    const [edit, setEdit] = useState(false)
    const [imgaePropsState, setImagePropsState] = useState<null | any>(null)

    const imageProps = [ // label, namespace, init value, type
        [ig_alt_description, 'alt', alt, 'text',],
        [ig_fig_caption, 'fig_caption', figCaption, 'text',],
        [ig_author_name, 'author_name',
            init && init?.author_name ? init?.author_name : '', 'text',],
        [ig_author_url, 'author_url',
            init && init?.author_url ? init?.author_url : '', 'url',],
        [ig_author_type, 'author_type',
            init && init?.author_type ? init.author_type : '', 'select'],
        [ig_license_name, 'license_name',
            init && init?.license_name ? init?.license_name : '', 'text',],
        [ig_license_url, 'license_url',
            init && init?.license_url ? init?.license_url : '', 'url',],
    ]
    const [imgConf, setImgConf] = useState<ImageFull | object>({})

    const initStringified = JSON.stringify(init)
    const imgConfStringified = JSON.stringify(imgConf)

    useEffect(() => {
        if (init) {
            const ip = imageProps.reduce((obj, [, namespace, value]) => {
                return Object.assign(obj, { [namespace]: value });
            }, { sources: init.sources }) as ImageFull
            setImgConf(ip)
            if (ip) {
                const ipConv = convertImageDataToImageProps(ip as DBILFull)
                setImagePropsState(ipConv)
            }
        }
    }, [initStringified])


    useEffect(() => {
        if (typeof setter === "function") setter(imgConf as ImageFull)
    }, [imgConfStringified])


    return (
        <div className="relative">
            <div className="z-[2] absolute right-0 top-0" >
                <button
                    className="btn_1 icon"
                    type="button"
                    onClick={() => setEdit((prev) => !prev)}
                >
                    <Pencil1Icon
                        width={16}
                        height={16}
                        aria-label={ul_edit} />
                </button>
            </div>

            {imgaePropsState ? (
                <img
                    alt="preview image"
                    src={imgaePropsState?.mainSrc}
                    width={imgaePropsState?.mainSrcWidth}
                    height={imgaePropsState?.mainSrcHeight}
                    srcSet={imgaePropsState?.srcset}
                />
            ) : null}

            {(edit && imgConf) && (
                <div>
                    <div className="flex gap-2 flex-col">
                        {imageProps.map((it) => (
                            <Fragment key={it[1]}>
                                {it[3] === 'select' ? (
                                    <RadixSelect
                                        selectRootProps={{
                                            defaultValue: it[2],
                                            onValueChange: (e:any) => setImgConf((prev) => ({
                                                ...prev, [it[1]]: e
                                            }))
                                        }}
                                        placeholder="Author type"
                                        selectTriggerProps={{ "aria-label": ig_author_type }}
                                        selectItems={
                                            [["Person", "Person"],
                                            ["Organization", "Organization"]]}
                                    />
                                ) : (
                                    <InputElement
                                        label={it[0]}
                                        uid
                                        inputProps={{
                                            defaultValue: it[2],
                                            onChange: (e: BaseSyntheticEvent) => setImgConf((prev) => ({
                                                ...prev, [it[1]]: e.target.value
                                            })),
                                            type: it[3]
                                        }}
                                    />
                                )}
                            </Fragment>
                        ))}
                    </div>
                    <SourcesTable sources={(init?.sources)!} />
                </div>
            )}
            {isMainImage && (
                <input type="hidden"
                    name="main_image"
                    value={JSON.stringify(imgConf)} />
            )}

        </div>)
}
