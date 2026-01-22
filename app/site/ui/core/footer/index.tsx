import { Link, NavLink, useParams, useRouteLoaderData } from "react-router";

import LogoSmall from "~/site/icons/LogoSmall";
import { localizedPath } from "~/common/shared/lang";


export default function Footer() {
    const { lang } = useParams()
    const { locTxt } = useRouteLoaderData('site/routes/layouts/site_layout')

    return (
        <footer className="h-12 flex justify-between items-end-safe p-2 gap-4 relative z-[5]">
            <div
                itemScope itemType="https://schema.org/Organization"
                itemID="https://webaudits.org/#publisher"
                className="text-xs md_1 flex gap-x-2 gap-y-1 flex-wrap"
            >
                <div>
                    <Link
                        rel="license noreferrer noopener"
                        title="_blank"
                        to="http://creativecommons.org/licenses/by-sa/4.0/"
                    >
                        CC-BY-SA 4.0
                    </Link>
                </div>
                |
                <NavLink
                    viewTransition
                    to={localizedPath(lang, "NS_ABOUT") + "#contact"}>
                    {locTxt.footer.contact_link_label}
                </NavLink>
                |
                <NavLink
                    viewTransition
                    to={localizedPath(lang, "NS_PRIVACY")}>
                    {locTxt.footer.privacy_link_label}
                </NavLink>
                <meta itemProp="name" content="Web Audits" />
                <meta itemProp="url" content="https://webaudits.org" />
                <meta itemProp="logo" content="https://webaudits.org/brand/icon-512.png" />
                <link itemProp="sameAs" href="https://github.com/wenzf/webaudits" />
                <link itemProp="relatedLink" itemID="https://webaudits.org/#ecos-analyzer" />
            </div>

            <div>
                <LogoSmall
                    width={32}
                    height={32}
                    aria-hidden
                    className="text-neutral-300 dark:text-neutral-700 w-8 h-auto min-w-8 2xl:fixed bottom-2 right-2"
                />
                <span itemScope itemType="https://schema.org/SoftwareApplication"
                    itemID="https://webaudits.org/#ecos-analyzer">
                    <meta itemProp="name" content="Web Audits ECOS Analyzer" />
                    <meta itemProp="applicationCategory" content="DeveloperApplication" />
                    <meta itemProp="operatingSystem" content="Web Browser" />
                    <meta itemProp="url" content="https://webaudits.org/" />

                    <span itemProp="offers" itemScope itemType="https://schema.org/Offer">
                        <meta itemProp="price" content="0" />
                        <meta itemProp="priceCurrency" content="EUR" />
                    </span>
                    <link itemProp="creator" itemScope itemID="https://webaudits.org/#publisher" />
                </span>
            </div>
        </footer>
    )
}
