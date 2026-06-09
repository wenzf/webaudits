import type { MiddlewareFunction } from "react-router";
import COMMON_CONFIG from "~/common/common.config";
import { getSettingsSession, settingsSessionContext } from "~/common/utils/sessions/settings.server";
import type { Settings } from "../../types/site";


export const settingsMiddleware: MiddlewareFunction = async ({ request, context }, next) => {
    const cookieHeader = request.headers.get("Cookie");
    const settingsSession = await getSettingsSession(cookieHeader);

    let settings

    if (Object.keys(settingsSession.data).length) {
        settings = settingsSession.data

    } else {
        settings = {
            ...COMMON_CONFIG.SETTINGS_DEFAULT,
        }
    }
    context.set(settingsSessionContext, settings as Settings)

    return next();
};