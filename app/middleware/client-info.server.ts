import { isbot } from "isbot";

import { createContext, type MiddlewareFunction } from "react-router";
import { UAParser } from "ua-parser-js";
import { isAuth } from "~/cms/lib/utils/auth/auth.server";

// CMS DEPENDENCY

export const clientInfoSessionContext = createContext<{
    ua: { is_mobile: boolean, browser_vendor?: string },
    auth: number,
    is_bot: boolean
} | null>(null)

export const clientInfoMiddleware: MiddlewareFunction = async ({ request, context }, next) => {

    const userAgent = request.headers.get('User-Agent') ?? ''
    const is_bot = isbot(userAgent)
    const { browser, device, } = UAParser(userAgent)
    const auth = await isAuth(request)

    context.set(clientInfoSessionContext, {
        auth,
        is_bot,
        ua: {
            is_mobile: device.is('mobile'),
            browser_vendor: browser.name
        }
    })

    return next();
};