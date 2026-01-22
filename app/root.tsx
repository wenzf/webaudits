import { randomUUID } from 'node:crypto';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useParams,
  useRouteLoaderData,
} from "react-router";
import { isbot } from 'isbot'
import { UAParser } from 'ua-parser-js';
import { Resource } from "sst";
import invariant from "tiny-invariant";
import { useContext } from "react";
import clsx from "clsx";

import type { Route } from "./+types/root";
import "./app.css";
import { getSettingsSession } from "./common/utils/sessions/settings.server";
import { langByParam } from "./common/shared/lang";
import COMMON_CONFIG from "./common/common.config";
import { isAuth } from "./cms/utils/auth/auth.server";
import { NonceContext } from "./common/utils/headers/nonce_context";
import { DefaultErrorBoundary } from './site/ui/core/other/defaultErrorBoundary';


export async function loader({ request }: Route.LoaderArgs) {
  invariant(Resource.session_secret_1.value)
  const cookieHeader = request.headers.get('Cookie')
  const userAgent = request.headers.get('User-Agent') ?? ''
  const is_bot = isbot(userAgent)
  const { browser, device, } = UAParser(userAgent)

  let [
    settingsSession,
    auth
  ] = await Promise.all([
    getSettingsSession(cookieHeader),
    isAuth(request)
  ])

  let settings

  if (Object.keys(settingsSession.data).length) {
    settings = settingsSession.data
  } else {
    settings = { ...COMMON_CONFIG.SETTINGS_DEFAULT, random: randomUUID() }
  }

  return Response.json({
    settings,
    is_bot,
    auth,
    ua: {
      is_mobile: device.is('mobile'),
      browser_vendor: browser.name
    },
  })
}

export function Layout({ children }: { children: React.ReactNode }) {
  let { settings: { theme, font_size, ui_grayscale, ui_high_contrast } } = useRouteLoaderData("root")
  let { lang } = useParams()
  let { lang_html } = langByParam(lang)
  const cspNonce = useContext(NonceContext);

  return (
    <html
      lang={lang_html}
      className={clsx(theme ?? 'system', { "grayscale": ui_grayscale, 'contrast': ui_high_contrast })}
      style={{ fontSize: `${font_size ?? 100}%` }}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links nonce={cspNonce} />
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
  return <Outlet />;
}


export function ErrorBoundary({ error }: { error: Error }) {
  return <DefaultErrorBoundary error={error} />
}

