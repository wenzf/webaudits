import crypto from 'node:crypto';
import * as Toast from "@radix-ui/react-toast";
import { useEffect, useRef, useState } from "react";
import { Outlet, useRouteLoaderData, data, useLoaderData, useParams } from "react-router";
import { useThrottledCallback } from 'use-debounce';
import bcrypt from "bcryptjs";

import Footer from "~/site/ui/core/footer";
import Header from "~/site/ui/core/header";
import type { Route } from "./+types/site_layout";
import { langByParam } from "~/common/shared/lang";
import { getStaticData } from "~/common/utils/server/get_static_data.server";
import { ArrowUpIcon } from "@radix-ui/react-icons";
import { commitCsrfLikeSession, getCsrfLikeSession } from '~/common/utils/sessions/csrf_like_session.server';
import { Breadcrumbs } from '~/site/ui/core/breadcrumbs';
import type { RouteHandle, SiteLangs } from 'types/site';
import ClientLangDialog from '~/site/ui/core/dialogs/client_lang_dialog';
import CookieConsent from '~/site/ui/core/dialogs/coockie_consent';
import { useCurrentMatch } from '~/common/shared/hooks';
import SITE_CONFIG from '~/site/site.config';
import { BaseSEOMetaData, StaticPageMetaItemprops } from '~/site/shared/metas';
import NotFoundLang from '~/site/ui/core/other/notFoundLang';
import { DefaultErrorBoundary } from '~/site/ui/core/other/defaultErrorBoundary';


export const handle: RouteHandle = {
    bc: true,
    page_key: "NS_SITE_LAYOUT"
};


export const loader = async ({ params, request }: Route.LoaderArgs) => {
    const cookieHeader = request.headers.get('Cookie')
    const { lang } = params
    const langObj = langByParam(lang)
    const { lang_code, is_fallback } = langObj

    if (is_fallback) {
        const [locTxt] = await Promise.all([
            getStaticData(['loc_common'], lang_code),

        ])
        return data({
            locTxt,
            err: "NOT_FOUND"
        }, {
            status: 404
        })
    }

    const session = await getCsrfLikeSession(cookieHeader)
    const secret = crypto.randomBytes(32).toString('hex')
    const salt = await bcrypt.genSalt()
    session.flash('secret', secret)

    const [locTxt, hashedSecret] = await Promise.all([
        getStaticData(['loc_common'], lang_code),
        bcrypt.hash(secret, salt)
    ])

    return data({
        locTxt, csrfLike: hashedSecret
    }, {
        headers: {
            "Set-Cookie": await commitCsrfLikeSession(session)
        }
    })

}


export default function SiteLayout() {
    const { is_bot, ua: { is_mobile }, settings: {
        show_cookie_consent_message,
        msg_lang_hint } } = useRouteLoaderData('root')
    const loaderData = useLoaderData()
    const [showScrollToTop, setShowScrollToTop] = useState(false)
    const scrollPosRef = useRef(0)
    const { lang } = useParams()
    const { lang_code } = langByParam(lang)
    const [showClientLangDialog, setshowClientLangDialog] = useState<null | SiteLangs["lang_code"][]>(null)
    const currentMatch = useCurrentMatch()
    const pageKey = currentMatch?.handle?.page_key

    const pageSchema = pageKey
        ? SITE_CONFIG?.PAGE_CONFIG?.[pageKey]?.schema_webpage_type ?? "WebPage"
        : "WebPage"


    const has_bg_1 = pageKey ? SITE_CONFIG?.PAGE_CONFIG?.[pageKey]?.has_bg_1 ?? false : false

    const scrollToTop = () => {
        if (typeof window === "object") {
            window.scroll(0, 0)
        }
    }

    const scrollListener = () => {
        try {
            if (typeof window === "object" && "document" in window) {
                const scrollPosition = window.scrollY
                const docHeight = document.documentElement.scrollHeight
                const viewHeight = window.innerHeight
                const delta = 0
                const activeRange = viewHeight * 3

                if ((docHeight / viewHeight) > 3) {
                    if ((scrollPosRef.current > (scrollPosition + delta)
                        && (scrollPosition > activeRange))) {
                        setShowScrollToTop(true)
                    } else {
                        setShowScrollToTop(false)
                    }
                    scrollPosRef.current = scrollPosition
                } else {
                    if (showScrollToTop) setShowScrollToTop(false)
                }
            }
        } catch {
            setShowScrollToTop(false)
        }
    }

    const debouncedScrollListener = useThrottledCallback(scrollListener, 300)

    useEffect(() => {
        if (typeof window === "object"
            && typeof document === "object"
            && 'documentElement' in document
        ) {
            try {
                if (is_mobile && !is_bot) {
                    const innerHeight = window.innerHeight
                    const footerHeight = 48
                    let headerHeight = 44

                    const bottomTopMargin = footerHeight + headerHeight
                    document.documentElement.style.setProperty('--initial-window-height',
                        `${innerHeight}px`)
                    document.documentElement.style.setProperty('--body-container-min-height',
                        `${innerHeight - bottomTopMargin}px`)
                    document.documentElement.style.setProperty('--body-first-slide-height',
                        `${innerHeight - headerHeight}px`)
                    document.documentElement.style.setProperty('--body-container-two-thirds-height',
                        `${Math.round(innerHeight * 0.68) - bottomTopMargin}px`)
                }

                if (!is_bot) {
                    window.addEventListener("scroll", debouncedScrollListener)
                    return () => window?.removeEventListener('scroll', debouncedScrollListener)
                }
            } catch {
                null
            }
        }
    }, []);



    useEffect(() => {
        if (msg_lang_hint
            && typeof window === "object"
            && "navigator" in window
        ) {
            try {
                const mainLang = navigator?.language?.toLowerCase()
                const alternativeLangs = navigator?.languages?.map(
                    (it) => it.split('-')[0]?.toLowerCase())

                if (mainLang?.startsWith(lang_code)
                    || alternativeLangs.includes(lang_code)) {
                    return
                }

                let lang_suggestions: SiteLangs["lang_code"][] = []
                const langConfig = SITE_CONFIG.SITE_LANGS
                for (let i = 0; i < langConfig.length; i += 1) {
                    const supportedLang = langConfig[i].lang_code
                    if (mainLang.startsWith(supportedLang)
                        || alternativeLangs.includes(supportedLang)) {
                        lang_suggestions = [...lang_suggestions, supportedLang]
                    }
                }
                if (!lang_suggestions?.length) return

                setshowClientLangDialog(lang_suggestions)
            } catch {
                null
            }

            return () => setshowClientLangDialog(null)
        }
    }, [lang])



    return (
        <>
            <Header />

                        {has_bg_1 && <div className='grid-background' />}

            {loaderData?.err === "NOT_FOUND" ? (
                <main className="main_container max-w-7xl m-auto relative pt-[44px]"
                >
                    <NotFoundLang />
                </main>
            ) : (
                <>
                    <Breadcrumbs />

                    <main
                        itemScope itemType={`https://schema.org/${pageSchema}`}
                        className="main_container max-w-7xl m-auto relative pt-[44px]"
                    >
                        <Outlet />
                        <StaticPageMetaItemprops />
                    </main>
                </>
            )}

            <Footer />


            {loaderData?.err !== "NOT_FOUND" && (
                <>
                    {(showClientLangDialog || show_cookie_consent_message) && (
                        <Toast.Provider swipeDirection="right">
                            {showClientLangDialog && <ClientLangDialog showClientLangDialog={showClientLangDialog} />}
                            {show_cookie_consent_message && <CookieConsent />}
                            <Toast.Viewport className="fixed rounded flex flex-col gap-2.5 w-full  sm:w-[390px] grow max-w-full z-[2147483647] m-0 right-2 bottom-2 p-2 bg-white/80 dark:bg-black/80" />
                        </Toast.Provider>
                    )}

                    {showScrollToTop && (
                        <button
                            type='button'
                            className="p-2 bg-black/80 dark:bg-white/80 text-neutral-200 dark:text-neutral-800 fixed bottom-2 right-2 z-50 rounded"
                            onClick={() => scrollToTop()}
                        >
                            <ArrowUpIcon width={22} height={22} />
                        </button>
                    )}

                    <BaseSEOMetaData />
                </>
            )}


            {/**
 *             <div className="h-screen w-full fixed top-0 left-0 -z-10
            [background-image:linear-gradient(to_right,rgba(0,0,0,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.2)_1px,transparent_1px)] 
            dark:[background-image:linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] 
            [background-size:100px_100px]
            [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
 */}




        </>

    )
}

export function ErrorBoundary({ error }: { error: Error }) {
    return <DefaultErrorBoundary error={error} />

}



