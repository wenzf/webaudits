import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
    useParams,
    useRouteLoaderData,
} from "react-router"
import { Resource } from "sst"
import invariant from "tiny-invariant"
import { useContext } from "react"
import clsx from "clsx";
import { AuthenticityTokenProvider } from 'remix-utils/csrf/react'
import { HoneypotProvider } from 'remix-utils/honeypot/react'

import type { Route } from "./+types/root"
import mainCSS from "./app.css?url"
import { settingsSessionContext } from "./common/utils/sessions/settings.server"
import { langByParam } from "./common/shared/lang"
import { NonceContext } from "./common/utils/headers/nonce_context"
import { DefaultErrorBoundary } from './site/ui/core/other/defaultErrorBoundary'
import { csrfMiddleware } from './middleware/csrf.server'
import { csrfTokenMiddleware, getCsrfToken } from './middleware/csrf-token.server'
import { getHoneypotInputProps, honeypotMiddleware } from './middleware/honeypot.server'
import { timingsMiddleware } from './middleware/timings.server'
import { serverTimingMiddleware } from './middleware/servertiming.server'
import { settingsMiddleware } from './middleware/settings.server';
import { clientTokenMiddleware } from './middleware/client-token.server';
import { clientInfoMiddleware, clientInfoSessionContext } from "./middleware/client-info.server"

import madaWoff2 from "@fontsource-variable/mada/files/mada-latin-wght-normal.woff2?url";
import fontfaceDeclarations from './site/fonts/latin/fontface.css?url'


export const middleware = [
    timingsMiddleware,
    serverTimingMiddleware,
    csrfMiddleware,
    csrfTokenMiddleware,
    honeypotMiddleware,
    settingsMiddleware,
    clientInfoMiddleware,
    clientTokenMiddleware
];



export async function loader({ context }: Route.LoaderArgs) {
    invariant(Resource.session_secret_1.value)

    let [
        csrfToken,
        honeypotInputProps,
    ] = await Promise.all([
        getCsrfToken(context),
        getHoneypotInputProps(),
    ])

    let settings = context.get(settingsSessionContext)
    let clientInfo = context.get(clientInfoSessionContext)

    return Response.json({
        csrfToken,
        honeypotInputProps,
        settings,
        ...clientInfo
    })
}


export function Layout({ children }: { children: React.ReactNode }) {
    let rootLoaderData = useRouteLoaderData("root")
    let settings = rootLoaderData?.settings
    let { lang } = useParams()
    let { lang_code } = langByParam(lang)
    const cspNonce = useContext(NonceContext);

    const theme = settings?.theme
    const ui_grayscale = settings?.ui_grayscale
    const ui_high_contrast = settings?.ui_high_contrast
    const font_size = settings?.font_size

    return (
        <html
            lang={lang_code}
            className={clsx(theme ?? 'system', {
                "grayscale": ui_grayscale,
                'contrast': ui_high_contrast
            })}
            style={{ fontSize: `${font_size ?? 100}%` }}
        >
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="preload" href={madaWoff2} as="font" type="font/woff2" crossOrigin="anonymous" />
                <Meta />
                <Links nonce={cspNonce} />
                <link rel="stylesheet" href={mainCSS} />
                <link rel="stylesheet" href={fontfaceDeclarations} />

            </head>
            <body>
                {children}
                <ScrollRestoration nonce={cspNonce} />
                <Scripts nonce={cspNonce} />
            </body>
        </html>
    );
}


export default function App() {
    const loaderData = useLoaderData()
    return (
        <AuthenticityTokenProvider token={loaderData.csrfToken}>
            <HoneypotProvider {...loaderData.honeypotInputProps}>
                <Outlet />
            </HoneypotProvider>
        </AuthenticityTokenProvider>
    );
}


export function ErrorBoundary({ error }: { error: Error }) {
    return <DefaultErrorBoundary error={error} />
}

