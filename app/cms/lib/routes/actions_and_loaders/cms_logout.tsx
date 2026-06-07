import { redirect, type LoaderFunction } from "react-router";
import invariant from 'tiny-invariant'
import { Resource } from "sst";

import { destroyAuthSession, getAuthSession } from "~/cms/lib/utils/auth/auth.server";
import CMS_CONFIG from "~/cms/cms.config";


export const loader: LoaderFunction = async ({ request }) => {
    const { URL_FRAGMENTS: { UF_LOGIN } } = CMS_CONFIG
    invariant(Resource.session_secret_1.value)
    const session = await getAuthSession(
        request.headers.get("Cookie")
    );

    return redirect(`/${UF_LOGIN}`, {
        headers: new Headers({
            'Set-Cookie': await destroyAuthSession(session),

        })
    })

}


