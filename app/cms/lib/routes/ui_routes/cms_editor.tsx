import {
    useLoaderData,
} from "react-router"

import { getDynamoDB } from "~/common/utils/server/dynamodb.server"
import { getStaticData } from "~/common/utils/server/get_static_data.server"
import type { Route } from "./+types/cms_editor"
import CMS_CONFIG from "~/cms/cms.config"
import { isAuth } from "~/cms/lib/utils/auth/auth.server"
import type { DBBase } from "../../../../../types/site"
import PostInput from "~/cms/lib/ui/document_mgmt/cms_create_and_edit_post"


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
    const {  pk, sk } = params

    const [locTxt, currentData] = await Promise.all([
        getStaticData([], "en"),
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