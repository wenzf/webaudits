import { Link1Icon } from "@radix-ui/react-icons"
import type { Attributes, ComponentPropsWithoutRef} from "react"
import { NavLink } from "react-router"

import { useCurrentURL } from "~/common/shared/hooks"
import SITE_CONFIG from "~/site/site.config"


export const AnchorLinkOnHover = ({
    anchorLink, ariaLabel
}: { anchorLink: string, ariaLabel: string }) => {
    const currentURL = useCurrentURL()
    const rootDomain = SITE_CONFIG.SITE_DEPLOYMENT.DOMAIN_URL
    return <NavLink
        className="anchor_link"
        aria-label={ariaLabel}
        to={rootDomain + currentURL + '#' + anchorLink}
    >
        <Link1Icon width={33} height={24} aria-hidden />
    </NavLink>
}

type LvlHeaderProps = ComponentPropsWithoutRef<'span'> & {
    lvl: number, content: string, anchorLink: string
}


export const LvlHeader = ({ lvl, content, anchorLink, ...props }: LvlHeaderProps) => {
    if (lvl === 0) return <><div className='anchor_link_frame audit_sub_header s_h2 wrap-break-word'><h2> <span {...props}>{content}</span></h2><AnchorLinkOnHover anchorLink={anchorLink} ariaLabel={content} /></div></>
    if (lvl === 1) return <><div className='anchor_link_frame audit_sub_header s_h3 wrap-break-word'><h3> <span {...props}>{content}</span></h3><AnchorLinkOnHover anchorLink={anchorLink} ariaLabel={content} /></div></>
    if (lvl === 2) return <><div className='anchor_link_frame audit_sub_header s_h4 wrap-break-word'><h4> <span {...props}>{content}</span></h4><AnchorLinkOnHover anchorLink={anchorLink} ariaLabel={content} /></div></>
    if (lvl === 3) return <><div className='anchor_link_frame audit_sub_header s_h5 wrap-break-word'><div><span {...props}>{content}</span></div><AnchorLinkOnHover anchorLink={anchorLink} ariaLabel={content} /></div></>
    return null
}
