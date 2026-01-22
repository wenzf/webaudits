import clsx from "clsx";
import { NavLink } from "react-router";

import { titleToAnchor } from "~/site/utils/urls";


export const SidebarLink = ({
    label,
    transformLabelToAnchor,
    anchor,
    sectionsInView
}: {
    label: string
    transformLabelToAnchor?: boolean
    anchor?: string
    sectionsInView: string[]
}) => {
    let _anchor = ""

    if (transformLabelToAnchor) {
        _anchor += titleToAnchor(label)
    } else {
        _anchor += anchor
    }

    const to = "#" + _anchor

    return (
        <NavLink to={to}
            className={clsx(
                '2xl:border-b flex', {
                'border-b-neutral-400 dark:border-b-neutral-600':
                    sectionsInView.includes(_anchor),
                'border-b-transparent':
                    !sectionsInView.includes(_anchor)
            })}
        >
            {label}
        </NavLink>
    )
}


export const SidebarElement = ({
    vc, trackElements
}: { vc: ViewConfig[], trackElements: string[] }) => (
    <menu>
        {vc.map((it) => (
            <li className="pl-3" key={it.key}>
                <SidebarLink
                    label={it.sidebar_labels}
                    sectionsInView={trackElements}
                    anchor={it.anchor}
                />
                {it.children?.length ? (
                    <SidebarElement
                        vc={it.children}
                        trackElements={trackElements}
                    />
                ) : null}
            </li>
        ))}
    </menu>
)