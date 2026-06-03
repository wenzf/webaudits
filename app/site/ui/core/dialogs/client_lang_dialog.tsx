import { useFetcher, useNavigate, useParams, useRouteLoaderData } from "react-router"
import * as Toast from "@radix-ui/react-toast";
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { ArrowRightIcon, Cross1Icon } from "@radix-ui/react-icons";

import { useCurrentMatch, useCurrentURL } from "~/common/shared/hooks"
import { createLangPathByParam, langSwitcher } from "~/common/shared/lang"
import SITE_CONFIG from "~/site/site.config"
import type { SiteLangs } from "../../../../../types/site";


export default function ClientLangDialog({
    showClientLangDialog
}: {
    showClientLangDialog: null | SiteLangs[]
}) {
    const { PAGE_CONFIG: { NS_BLOG }, ALT_LANG_TXT } = SITE_CONFIG
    const { csrfToken } = useRouteLoaderData('root')
    const { lang } = useParams()
    const currentURL = useCurrentURL()
    const { locTxt } = useRouteLoaderData('site/routes/layouts/site_layout')
    const settingsFetchter = useFetcher({ key: 'settingsFetcher' })
    const navigate = useNavigate()
    const currentMatch = useCurrentMatch()
    const pageKey = currentMatch?.handle?.page_key

    const onSwitchLang = (it: SiteLangs) => {
        try {
            const targetLangCode = it.lang_code
            if (pageKey === "NS_BLOG_SLUG") {
                const hreflangs = (currentMatch?.loaderData as any)?.post?.hreflangs
                if (hreflangs?.length) {
                    const targetVersion = hreflangs.find((it: {
                        lang: string, pathname: string
                    }) => it.lang === targetLangCode)
                    if (targetVersion?.pathname) {
                        navigate(createLangPathByParam(it.lang_param,
                            `/${NS_BLOG.path_fragment}/${targetVersion.pathname}`))
                    } else {
                        navigate(createLangPathByParam(it.lang_param, `/${NS_BLOG.path_fragment}`))
                    }
                } else {
                    navigate(createLangPathByParam(it.lang_param, `/${NS_BLOG.path_fragment}`))
                }
            } else {
                navigate(
                    langSwitcher(
                        lang,
                        currentURL,
                        targetLangCode
                    ))
            }
        } catch {
            null
        }
    }

    const onChangeSettings = () => {
        try {
            settingsFetchter.submit({
                payload: JSON.stringify({ msg_lang_hint: false }),
                redirect_to: currentURL,
                csrf: csrfToken
            }, {
                method: "post",
                action: "/actions/cu-settings",
                encType: "application/x-www-form-urlencoded",
                preventScrollReset: true,
                defaultShouldRevalidate: true
            })
        } catch {
            null
        }
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
                        <div key={it.lang_code} className="border_squircle rounded flex justify-between p-2">
                            <Toast.Description className="m-0 shrink inline-flex items-center justify-center font-normal">
                                {ALT_LANG_TXT[it.lang_code]}
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
                                    altText={ALT_LANG_TXT[it.lang_code]}
                                >
                                    <button
                                        onClick={() => onSwitchLang(it)}
                                        type="button"
                                        className="b_1 reg ri active text-sm inline-flex items-center justify-center">
                                        <ArrowRightIcon
                                            width={22}
                                            height={22}
                                            aria-label={ALT_LANG_TXT[it.lang_code]}
                                        />
                                    </button>
                                </Toast.Action>
                            </div>
                        </div>
                    ))}
                </div>
            </Toast.Root>
        </>
    )
}