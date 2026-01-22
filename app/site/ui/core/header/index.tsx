import clsx from "clsx"
import NavMenu from "./navMenu"
import { NavLink, useNavigation, useParams, useRouteLoaderData } from "react-router"

import { createLangPathByParam } from "~/common/shared/lang"
import LogoSmall from "~/site/icons/LogoSmall"


export default function Header() {
    const { lang } = useParams()
    const { locTxt } = useRouteLoaderData('site/routes/layouts/site_layout')
    const { state } = useNavigation()

    return (
        <header className="fixed top-0 z-10 w-full  flex justify-between h-[44px]">
            <div className="bg-neutral-50/90 dark:bg-neutral-950/90 w-full">
                <div>
                    <NavLink
                        end
                        viewTransition
                        className="absolute b_x top-0 2xl:top-0.5 left-0.5 z-50 inline-flex gap-2 items-center p-0.5 2xl:p-1 hover:bg-neutral-300 hover:dark:bg-neutral-700 mt-1 ml-0.5 rounded focus:ring ring-neutral-700 dark:ring-neutral-300"
                        to={createLangPathByParam(lang, '/')}
                    >
                        <LogoSmall
                            aria-label={locTxt?.aria_labels_and_titles?.logo?.aria_label}
                            className="text-neutral-700/90 dark:text-neutral-300/90"
                            width={32}
                            height={32}
                        />
                        <span className="logo_txt">
                            Web <br /> Audits
                        </span>
                    </NavLink>
                </div>
                <NavMenu />
            </div>

            <div className={clsx("loader_2", { "is_loading": state === "loading" })} >
                <div />
            </div>

        </header>
    )
}