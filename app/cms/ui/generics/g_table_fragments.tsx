// import TimeElement from "~/common/ui/generics/g_time_element"
import CopytToClipboardButton from "./g_copy_to_clipboard_button"
import { ExternalLinkIcon } from "@radix-ui/react-icons"
import { Link, useRouteLoaderData } from "react-router"
import clsx from "clsx"
import type { DBILFull } from "../../../../types/site"



export const SourcesTable = ({
    sources,
    className
}: {
    sources: DBILFull["sources"] | any,
    className?: string
}) => {
    const {
        locTxt: {
            image_gallery: {
                ig_width,
                ig_mime_type,
                ig_aspect,
                ig_link
            }
        } } = useRouteLoaderData('cms/routes/layouts/cms_root_layout')


    let hasWidth = false
    let isUrl = false // or imgUrl
    let hasAspect = false
    let isMimeType = false
    let hasSize = false


    const sample = sources[0]

    if (sample?.url) isUrl = true
    if (sample?.width) hasWidth = true
    if (sample?.aspect) hasAspect = true
    if (sample?.mimeType) isMimeType = true
    if (sample?.size) hasSize = true

    return (
        <table className={className ?? 'w-full'}>
            <thead>
                <tr>
                    {hasWidth && <th>{ig_width}</th>}
                    <th>{ig_mime_type}</th>
                    {hasAspect && <th>{ig_aspect}</th>}
                    {hasSize && <th>size</th>}
                    <th>URL</th>
                </tr>
            </thead>
            <tbody>
                {sources.map((it: any, ind: number) => (
                    <tr key={ind}>
                        {hasWidth && <td>{it?.width}</td>}
                        <td>{isMimeType ? it?.mimeType : it?.mime}</td>
                        {hasAspect && <td>{it?.aspect}</td>}
                        {hasSize && <td>{(it.size / 1000).toFixed(2)} kb</td>}
                        <td>
                            <div className="flex gap-2">
                                <Link
                                    className="btn_5 icon small"
                                    target="_blank"
                                    to={isUrl ? it?.url : it?.imgUrl}
                                >
                                    <ExternalLinkIcon width={20} height={20} aria-label="Link" />
                                </Link>
                                <CopytToClipboardButton
                                    buttonProps={{ className: 'btn_5 icon small' }}
                                    copyText={isUrl ? it?.url : it?.imgUrl}
                                />
                            </div>

                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}


export const TRFragment1 = ({
    item,
    label,
    isType2
}: {
    item: DBILFull[keyof DBILFull],
    label: string
    isType2?: boolean
}) => (
    <>
        {item && (
            <tr className={clsx({ is_marked: isType2 })}>
                {isType2 && <td />}
                <th>{label}</th>
                <td colSpan={isType2 ? 2 : 1} style={{ padding: 0 }} >
                    <table className={clsx('w-full' //, { 'w-full': isType2 }

                    )
                    }>
                        <tbody>
                            {Object.entries(item).map((it, ind) => (
                                <tr key={ind}>
                                    <th>{it[0]}</th>
                                    <td>{it[1]}</td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </td>
            </tr>
        )}
    </>
)

export const TRFragment2 = ({
    item,
    label,
    isUrl,
    isTime
}: {
    item?: null | string | number
    label: string
    isUrl?: boolean
    isTime?: boolean
}) => (
    <tr>
        <th>{label}</th>
        <td>
            {item && (
                <>
                    {isUrl && (
                        <div className="flex gap-2">
                            <Link
                                className="btn_5 icon small"
                                tabIndex={-1}
                                style={{ wordBreak: 'break-all' }}
                                to={item as string}
                            >
                                <ExternalLinkIcon width={20} height={20} aria-label="Link" />
                            </Link>

                            <CopytToClipboardButton
                                buttonProps={{ className: 'btn_5 icon small' }}
                                copyText={item as string}
                            />

                        </div>
                    )}
                    {!isUrl && !isTime ? item : null}
                </>
            )}
        </td>
    </tr>

)
