import {
    useLoaderData,
    // useLocation, useSearchParams
} from "react-router"
// import { lazy, Suspense } from "react"

import { langByParam } from "~/common/shared/lang"
import { getDynamoDB } from "~/common/utils/server/dynamodb.server"
import { getStaticData } from "~/common/utils/server/get_static_data.server"
import type { Route } from "./+types/cms_editor"
import CMS_CONFIG from "~/cms/cms.config"
import { isAuth } from "~/cms/utils/auth/auth.server"
import type { DBBase } from "../../../../types/site"
import PostInput from "~/cms/ui/document_mgmt/cms_create_and_edit_post"




// const PostInput = lazy(() => import("../../ui/document_mgmt/cms_create_and_edit_post.client"))
const { ROUTES_CONFIG: { C_CMS_EDITOR: { pageHandle } } } = CMS_CONFIG

export const handle = {
    page: pageHandle
}

export function meta() {
    return [
        { title: 'CMS Editor' },
    ];
}


export const loader = async ({ params, request }: Route.LoaderArgs) => {
    await isAuth(request, true)
    const { lang, pk, sk } = params
    const { lang_code } = langByParam(lang)

    //    if (pk === "_"  || sk === "_") return null

    const [locTxt, currentData] = await Promise.all([
        getStaticData([], lang_code),
        getDynamoDB(pk.replace('_', '#') as DBBase["pk"], sk)
    ])

    return Response.json({ locTxt, currentData });
}


export default function DocEditor() {
    let loaderData = useLoaderData()

    return (
        <div className="max-w-5xl m-auto p-2">

            <PostInput {...loaderData.currentData?.Item ?? {}} />
        </div>
    )

}