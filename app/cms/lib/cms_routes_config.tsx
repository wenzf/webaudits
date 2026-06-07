import { type RouteConfig, index, route, layout, prefix, } from "@react-router/dev/routes";

import CMS_CONFIG from "../cms.config";

const {
    EXTERNAL_APIS: {
        // YOUTUBE_V3, DEEPL_V2
     },
    URL_FRAGMENTS: {
        UF_CMS,
        UF_EDITOR,
        UF_DATABSE,
        UF_LOGOUT,
        UF_CMS_SETTINGS,
        UF_LOGIN,
        UF_CMS_INFOS
    } } = CMS_CONFIG

let cmsRouteConfig = [
        ...prefix(UF_CMS, [
            layout("./cms/lib/routes/layouts/cms_root_layout.tsx", [
                layout("./cms/lib/routes/layouts/cms_states_layout.tsx", [
                    index("./cms/lib/routes/ui_routes/cms_main.tsx"),
                    route(`${UF_EDITOR}/:pk/:sk`, "./cms/lib/routes/ui_routes/cms_editor.tsx"),
                    route(`${UF_DATABSE}/:pk?`, "./cms/lib/routes/ui_routes/cms_database.tsx"),
                    route(`${UF_CMS_SETTINGS}`, "./cms/lib/routes/ui_routes/cms_settings.tsx"),
                    route(`${UF_CMS_INFOS}`, "./cms/lib/routes/ui_routes/cms_info.tsx"),

                    route("actions/cud-db", "./cms/lib/routes/actions_and_loaders/cms_cud_db.tsx"),
                    route("actions/cud-id-db", "./cms/lib/routes/actions_and_loaders/cms_cud_id_db.tsx"),
                    route("actions/cd-s3", "./cms/lib/routes/actions_and_loaders/cms_cd_s3.tsx"),
                    route("loaders/r-db", "./cms/lib/routes/actions_and_loaders/site_r_db.tsx")

                ])
            ])
        ]),
    route(`${UF_LOGIN}`, "./cms/lib/routes/ui_routes/login.tsx"),
    route(`${UF_LOGOUT}`, "./cms/lib/routes/actions_and_loaders/cms_logout.tsx"),

]
// optionals
/*
if (DEEPL_V2) {
    cmsRouteConfig = [...cmsRouteConfig,
    route('/actions/translate', './cms/lib/routes/actions_and_loaders/cms_deepl_api.tsx')]
}

if (YOUTUBE_V3) {
    cmsRouteConfig = [...cmsRouteConfig,
    route("/loader/ext-api", "./cms/lib/routes/actions_and_loaders/cms_r_ext_api.tsx")]
}
*/
export default cmsRouteConfig satisfies RouteConfig