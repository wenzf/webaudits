import crypto from 'node:crypto';
import { lazy, Suspense, useEffect, useState } from "react";
import {
    Form, redirect, useLoaderData, useNavigation, useRouteLoaderData, useSearchParams
} from "react-router";
import type {
    ActionFunction, HeadersFunction, LoaderFunction, MetaFunction
} from 'react-router'
import bcrypt from "bcryptjs";
import { Resource } from "sst";
import invariant from 'tiny-invariant'
import { ClientOnly } from "remix-utils/client-only";
import 'tiny-react-captcha/lib/trc-styles.css'

import CMS_CONFIG from "../../cms.config";
import { commitAuthSession, destroyAuthSession, getAuthSession } from "../../utils/auth/auth.server";
import { createLangPathByParam, langByParam } from "~/common/shared/lang";
import { getStaticData } from "~/common/utils/server/get_static_data.server";
import Spinner from "~/common/ui/generics/g_spinner";
import clsx from "clsx";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { HoneypotInputs } from "remix-utils/honeypot/react";


const TinyReactCaptcha = lazy(() => import('tiny-react-captcha'));

const {
    AUTH_CONFIG: { ADMIN_AUTH_LVL, GUEST_AUTH_LVL }, URL_FRAGMENTS: { UF_CMS, UF_LOGIN },
    ROUTES_CONFIG: { C_LOGIN_COMP: { ltf, pageHandle } }
} = CMS_CONFIG


export const handle = {
    page: pageHandle
}

export const meta: MetaFunction = () => {
    return [
        { title: 'Login' },
        { name: "robots", content: "noindex, nofollow" }
    ];
}

export const headers: HeadersFunction = () => {
    return {
        "Cache-Control": "no-store",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "same-origin",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1"
    }
}

export const loader: LoaderFunction = async ({ request, params }) => {
    invariant(Resource.session_secret_1.value)
    const { lang_code } = langByParam(params.lang)
    const authSession = await getAuthSession(request.headers.get('Cookie'));
    if (authSession.data.auth_lvl) {
        return redirect(createLangPathByParam(params.lang, `/${UF_CMS}`), {
            status: 302,
        })
    }
    const [locTxt] = await Promise.all([
        getStaticData(['loc_login'], lang_code),

    ])
    return Response.json({ locTxt })
}

export const action: ActionFunction = async ({ request, params }) => {
    invariant(Resource.session_secret_1.value)
    try {
    } catch (error) {
        return redirect('/', { status: 302 })
    }
    const authSession = await getAuthSession(request.headers.get('Cookie'))
    const formData = await request.formData()
    const username = formData.get('username')
    const password = formData.get('password')

    if (typeof username === 'string' && typeof password === 'string') {
        const admin_pwhash = Resource.admin_pw_hash_1.value
        const admin_unhash = Resource.admin_un_hash_1.value
        const admin_pwMatch = await bcrypt.compare(password, admin_pwhash)
        const admin_unMatch = await bcrypt.compare(username, admin_unhash)

        const guest_pwhash = Resource.guest_pw_hash_1.value
        const guest_unhash = Resource.guest_un_hash_1.value
        const guest_pwMatch = await bcrypt.compare(password, guest_pwhash)
        const guest_unMatch = await bcrypt.compare(username, guest_unhash)

        if (admin_pwMatch && admin_unMatch) {
            authSession.set('auth_lvl', ADMIN_AUTH_LVL)
            authSession.set('salt', crypto.randomBytes(32).toString('hex'))
            return redirect(createLangPathByParam(params.lang, `/${UF_CMS}`), {
                headers: new Headers({
                    'Set-Cookie': await commitAuthSession(authSession)
                })
            })
        } else if (guest_pwMatch && guest_unMatch) {
            authSession.set('auth_lvl', GUEST_AUTH_LVL)
            return redirect(createLangPathByParam(params.lang, `/${UF_CMS}`), {
                headers: new Headers({
                    'Set-Cookie': await commitAuthSession(authSession)
                })
            })
        }
    }

    const sp = new URLSearchParams()
    sp.set('login_failed', 'TRUE')
    return redirect(createLangPathByParam(params.lang, `/${UF_LOGIN}?${sp.toString()}`), {
        headers: new Headers({
            'Set-Cookie': await destroyAuthSession(authSession)
        }),
    })
}


export default function Login() {
    const [captchaOk, setCaptchaOk] = useState(false)
    const [sp, setSp] = useSearchParams()
    const { state } = useNavigation()
    const [isClient, setIsClient] = useState(false)


    let { settings: { theme } } = useRouteLoaderData('root')

    let { locTxt: { form_labels: { fl_user_name, fl_password, fl_login },
        text_labels: { tl_h1, tl_login_failed, tl_try_again } } } = useLoaderData();

    const tryAgain = () => {
        setCaptchaOk(false)
        setSp((prev) => {
            prev.delete('login_failed')
            return prev
        })
    }


    useEffect(() => setIsClient(true), [])


    return (
        <main className="h-screen mx-2 relative flex justify-center items-center">

            {sp.get('login_failed') === "TRUE" ? (
                <div className="max-w-lg p-2 absolute -translate-x-2/4 -translate-y-2/4 left-2/4 top-2/4 w-full flex-col gap-4 p-2">
                    <div className="font-medium text-4xl text-amber-800 pb-6"
                        style={{ fontFamily: 'sans-serif' }}
                    >{tl_login_failed}</div>
                    <button
                        className="flex grow bg-slate-700 cursor-pointer text-slate-50 p-1 justify-center rounded hover:bg-slate-800"
                        onClick={() => tryAgain()}
                    >{tl_try_again}
                    </button>
                </div>
            ) : (
                <>
                    {!captchaOk ? (
                        <ClientOnly fallback={null}>
                            {() => (
                                <Suspense fallback={null}>
                                    {isClient && <TinyReactCaptcha
                                        okCallback={setCaptchaOk}
                                        perferedTheme={theme === "sytem" ? "auto" : theme}
                                    />}

                                </Suspense>
                            )}
                        </ClientOnly>
                    ) : (
                        <Form
                            name="login form"
                            method="post"
                            className={clsx("max-w-lg p-2 absolute -translate-x-2/4 -translate-y-2/4 left-2/4 top-2/4 w-full flex-col gap-4 p-2  border border-neutral-500 rounded",
                                { 'opacity-60': state !== "idle" }
                            )}
                            encType="application/x-www-form-urlencoded"
                        >
                            <h1 style={{ fontFamily: 'sans-serif', fontSize: '2rem', fontWeight: 600 }}>{tl_h1}</h1>
                            <div className="flex flex-wrap items-center p-2 gap-4">
                                <label className="grow" htmlFor="username">{fl_user_name}</label>
                                <input
                                    style={{ fontFamily: 'sans-serif' }}
                                    minLength={4}
                                    disabled={state !== "idle"}
                                    required
                                    aria-required
                                    className="flex grow bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-200 p-1"
                                    type="text"
                                    id="username"
                                    name="username"
                                    autoComplete="username"

                                />
                            </div>
                            <div className="flex flex-wrap items-center p-2 gap-4">
                                <label className="grow" htmlFor="password">{fl_password}</label>
                                <input
                                    style={{ fontFamily: 'sans-serif' }}
                                    minLength={7}
                                    disabled={state !== "idle"}
                                    required
                                    aria-required
                                    className="flex grow bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-200 p-1"
                                    type="password"
                                    id="password"
                                    name="password"
                                    autoComplete="current-password"
                                />
                            </div>
                            <div className="flex">
                                <button
                                    style={{ fontFamily: 'sans-serif' }}
                                    disabled={state !== "idle"}
                                    className="flex grow bg-slate-700 cursor-pointer text-slate-50 p-1 justify-center rounded hover:bg-slate-800"
                                    type="submit"
                                >
                                    {fl_login}
                                </button>
                            </div>
                            <AuthenticityTokenInput />
                            <HoneypotInputs label="Please leave this field blank" />
                        </Form>
                    )}
                    <Spinner />
                </>
            )}

        </main>
    )

}
