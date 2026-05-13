import { Outlet, type LinksFunction } from "react-router";
import { Resource } from "sst";
import invariant from 'tiny-invariant'
import '@fontsource-variable/inter?.css'

import { langByParam } from "~/common/shared/lang";
import { getStaticData } from "~/common/utils/server/get_static_data.server";
import { isAuth } from "~/cms/utils/auth/auth.server";
import { CMSStatesProvider } from "~/cms/cms_states";
import type { Route } from "./+types/cms_root_layout";
import CMS_CONFIG from "~/cms/cms.config";


//import '../../cms_css.css';
// import '../../cms_css.css';

import cmsStyles from '../../cms_css.css?url';
import { authMiddleware } from "~/middleware/cms-auth.server";


export const middleware = [authMiddleware]


export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: cmsStyles },
    // Add other stylesheets here if needed
  ];
};

const {
    ROUTES_CONFIG: { C_CMS_ROOT_LAYOUT: { ltf } } } = CMS_CONFIG


export const loader = async ({ request, params }: Route.LoaderArgs) => {
    invariant(Resource.session_secret_1.value)
    const { lang_code } = langByParam(params.lang)

    const [locTxt] = await Promise.all([
        getStaticData(ltf, lang_code)
    ])

    await isAuth(request, true)
    return Response.json({ locTxt }, {
        status: 200
    })
}

export default function AdminLayout() {
    return (
        <div id="cms">
            <CMSStatesProvider>
                <Outlet />
            </CMSStatesProvider>
        </div>
    )
}