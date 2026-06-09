import type { ComponentType } from "react"
import { NavLink } from "react-router"
import { enumeratedBinding } from "~/site/utils/strings"

export default function PostBadge({ arr, anchorId, Icon, locs }: {
    arr?: string[],
    anchorId: string,
    Icon: ComponentType<{ width: number, height: number }>
    locs: {
        label: string
        and: string
    }
}) {

    if (!locs.label) return null

    return (
        <NavLink
            end
            to={`#${anchorId}`}
            aria-describedby={anchorId}
            className="inline-flex flex-wrap items-center gap-1.5 ring ring-neutral-300 dark:ring-neutral-700 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded-xs px-1 leading-3 gap-y-0.5">
            <Icon width={16} height={16} aria-hidden />
            <span className="text-sm whitespace-nowrap">
                {locs.label}
            </span>

            {(arr?.length && locs.and) ? (
                <>
                    <span className="text-sm">•</span>
                    <span className="inline-flex flex-wrap gap-x-1 text-sm text-neutral-800 dark:text-neutral-200">
                        {arr.map((it, ind) => (
                            <span key={ind}>
                                <span className="font-mono text-xs tracking-tight whitespace-nowrap"
                                    style={{ wordSpacing: "-0.325em" }}
                                >
                                    {it}
                                </span>
                                {enumeratedBinding({ and: locs.and, ind, arr })}
                            </span>
                        ))}
                    </span>
                </>
            ) : null}
        </NavLink>
    )
}