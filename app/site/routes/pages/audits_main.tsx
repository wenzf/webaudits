import { useLoaderData, data } from "react-router"

import type { RouteHandle } from "../../../../types/site"
import MarkdownWithCustomElements from "~/site/shared/markdown"
import type { Route } from "./+types/about"
import { langByParam } from "~/common/shared/lang"
import { getDynamoDB } from "~/common/utils/server/dynamodb.server"


export const handle: RouteHandle = {
  page_key: "NS_AUDITS"
};


// export const headers = () => {
//     return SITE_CONFIG.HEADERS_DEFAULTS.CACHE_CONTROL_HEADER_MID
// }


export const loader = async ({ params }: Route.LoaderArgs) => {
  const { lang } = params
  const { lang_code } = langByParam(lang)

  const [
    pageContentRes
  ] = await Promise.all([
    getDynamoDB(`PS#${lang_code}`, "audits")
  ])

  return data({
    pageContent: pageContentRes?.Item
  })
}


export default function Audit() {
  const loaderData = useLoaderData()

  return (
    <>
      <title>{loaderData?.pageContent?.title}</title>
      <meta name="description" content={loaderData?.pageContent?.description} />
      <section className="flex flex-col items-center max-w-7xl m-auto">
        <MarkdownWithCustomElements
          markup={loaderData.pageContent?.md_body ?? ''}
        />      
      </section>
    </>
  )
}