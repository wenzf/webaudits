import { NavLink, useFetcher, useParams, useRouteLoaderData } from "react-router"
import * as Toast from "@radix-ui/react-toast";
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'

import { useCurrentURL } from "~/common/shared/hooks"
import { langByParam, langSwitcher } from "~/common/shared/lang"
import SITE_CONFIG from "~/site/site.config"
import type { SiteLangs } from "types/site";
import { ArrowRightIcon, Cross1Icon } from "@radix-ui/react-icons";


export default function ClientLangDialog({ showClientLangDialog
}: { showClientLangDialog: null | SiteLangs["lang_code"][] }) {
    const { settings: { msg_lang_hint } } = useRouteLoaderData('root')
    const { lang } = useParams()
    const { lang_code } = langByParam(lang)

    const currentURL = useCurrentURL()
    const { locTxt } = useRouteLoaderData('site/routes/layouts/site_layout')
    const settingsFetchter = useFetcher({ key: 'settingsFetcher' })

    const onChangeSettings = () => {
        settingsFetchter.submit({
            payload: JSON.stringify({ msg_lang_hint: false }),
            redirect_to: currentURL
        }, {
            method: "post",
            action: "/actions/cu-settings",
            encType: "application/x-www-form-urlencoded",
            preventScrollReset: true
        })
    }


    return (
        <>
            <Toast.Root duration={35_000}>
                <VisuallyHidden.VisuallyHidden>
                    <Toast.Title>
                        {locTxt.alternative_language.title}
                    </Toast.Title>
                </VisuallyHidden.VisuallyHidden>

                <div className="flex flex-col border_squircle rounded flex justify-between bg-neutral-200 dark:bg-neutral-800 shadow shadow-neutral-500/80 text-neutral-950 dark:text-neutral-50">
                    {showClientLangDialog?.map((it) => (
                        <div key={it} className="border_squircle rounded flex justify-between p-2">
                            <Toast.Description className="m-0 shrink inline-flex items-center justify-center font-normal">
                                {SITE_CONFIG.ALT_LANG_TXT[it]}
                            </Toast.Description>
                            <div className="flex gap-4">
                                <Toast.Action
                                    asChild
                                    altText={locTxt.alternative_language.dont_show_message_again}
                                >
                                    <button
                                        onClick={() => onChangeSettings()}
                                        type="button"
                                        className="b_1 reg ri text-center inline-flex items-center justify-center">
                                        <Cross1Icon
                                            aria-label={locTxt.alternative_language.dont_show_message_again}
                                        />
                                    </button>
                                </Toast.Action>
                                <Toast.Action
                                    asChild
                                    altText={SITE_CONFIG.ALT_LANG_TXT[it]}
                                >
                                    <NavLink
                                        viewTransition
                                        to={langSwitcher(lang, currentURL, it)}
                                        type="button"
                                        className="b_1 reg ri active text-sm inline-flex items-center justify-center">
                                        <ArrowRightIcon
                                            width={22}
                                            height={22}
                                            aria-label={SITE_CONFIG.ALT_LANG_TXT[it]}
                                        />
                                    </NavLink>
                                </Toast.Action>
                            </div>
                        </div>
                    ))}
                </div>
            </Toast.Root>
        </>
    )
}