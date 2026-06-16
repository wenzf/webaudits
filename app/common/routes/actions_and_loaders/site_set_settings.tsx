import { redirect } from "react-router";
import { Resource } from "sst";
import invariant from "tiny-invariant";

import { parseJSON } from "~/common/shared/misc";
import { commitSettingsSession, getSettingsSession } from "~/common/utils/sessions/settings.server";
import type { Route } from "./+types/site_set_settings";
import COMMON_CONFIG from "~/common/common.config";
import type { Settings } from '../../../../types/site';



export async function action({ request }: Route.ActionArgs) {
    invariant(Resource.session_secret_1.value, 'session_secret_1')

    try {
        let formData = await request.formData();
        const cookieHeader = request.headers.get('Cookie')
        const session = await getSettingsSession(cookieHeader)
        const payload = parseJSON(formData.get('payload')) as Partial<Settings>

        let redirect_to = formData.get('redirect_to')

        if (typeof redirect_to !== "string" || !redirect_to?.startsWith('/')) {
            redirect_to = "/"
        }

        const currentSettings = Object.keys(session.data)?.length
            ? session.data
            : { ...COMMON_CONFIG.SETTINGS_DEFAULT }

        const newSettings = { ...currentSettings, ...payload }

        Object.entries(newSettings).forEach(([key, value]) => {
            session.set(key, value)
        })

        return redirect(redirect_to ?? '/', {
            headers: { "Set-Cookie": await commitSettingsSession(session) },
            status: 200
        });

    } catch {
        return null
    }
}

export const loader = () => redirect('/', { status: 404 })

