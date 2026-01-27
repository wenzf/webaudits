import { useMemo } from "react";
import { data, NavLink, useLoaderData, useParams, useRouteLoaderData } from "react-router";

import RequestAuditForm from "~/site/ui/audit/query/request_audit_form";
import type { Route } from "./+types/home";
import MarkdownWithCustomElements from "~/site/shared/markdown";
import { langByParam, localizedPath } from "~/common/shared/lang";
import { checkRateLimit, getDynamoDB, queryDynamoDB } from "~/common/utils/server/dynamodb.server";
import AuditTableList from "~/site/ui/lists/AuditTableList";
import { createBinData, createBoxBlotData } from "~/site/utils/data";
import VisxViolinPlot from "~/site/ui/charts/visx_violin_plot";
import { formatTimestamp } from "~/site/utils/time";
import { formatNumber } from "~/site/utils/numbers";
import { getStaticData } from "~/common/utils/server/get_static_data.server";
import type { RouteHandle } from "types/site";
import { CONFIG_API_LIMIT_DURATION, CONFIG_API_LIMIT_NUMBER } from "~/audit_api/v1/audit.config";
import SITE_CONFIG from "~/site/site.config";


export const handle: RouteHandle = {
  page_key: "NS_HOME",
  bc: false
};


export const loader = async ({ params }: Route.LoaderArgs) => {
  const { lang } = params
  const { lang_code } = langByParam(lang)
  const [
    pageContentRes,
    auditsByScoresRes,
    auditsByCreationRes,
    statsRes,
    locTxt,
    requestCounter
  ] = await Promise.all([
    getDynamoDB(`PS#${lang_code}`, "main"),
    queryDynamoDB({
      pk: 'page',
      tableName: "_table_audit_v1",
      IndexName: "scoreIndex",
      ProjectionExpression: "pk, sk, created_at, score, score_e, score_c, score_o, score_s, final_url",
      Limit: 10
    }),
    queryDynamoDB({
      pk: 'page',
      tableName: "_table_audit_v1",
      IndexName: "createdAtIndex",
      ProjectionExpression: "pk, sk, created_at, score, score_e, score_c, score_o, score_s, final_url",
      Limit: 10
    }),
    getDynamoDB('page-stats', 'main', '_table_audit_v1'),
    getStaticData(['loc_audits_form', 'loc_audits_v1_lists', 'loc_home'], lang_code),
    checkRateLimit(
      CONFIG_API_LIMIT_NUMBER,
      CONFIG_API_LIMIT_DURATION,
      false
    )
  ]) as any


  return data({
    pageContent: pageContentRes?.Item,
    auditsByScores: auditsByScoresRes?.Items,
    auditsByCreation: auditsByCreationRes?.Items,
    stats: statsRes?.Item,
    locTxt,
    requestCounter
  }, {
    //  headers: SITE_CONFIG.HEADERS_DEFAULTS.CACHE_CONTROL_HEADER
  })
}


export default function Home() {
  const loaderData = useLoaderData()

  const {
    pageContent,
    auditsByScores,
    auditsByCreation,
    stats
  } = loaderData

  const { locTxt } = useRouteLoaderData('site/routes/layouts/site_layout')
  const { lang } = useParams()
  const { lang_html } = langByParam(lang)

  const statsData = useMemo(() => {
    const mdTemplate = loaderData?.locTxt?.elements?.stats_texts?.explain_stats_list_1
    if (!stats || !mdTemplate) return null
    const { created_at, stats_score_main, score_main } = stats
    const boxPlot = createBoxBlotData(stats_score_main, 'Main')
    const { n, firstQuartile, thirdQuartile, p10, p90, median, mean } = boxPlot
    const md_stats_explainer_1 = mdTemplate.replace('{{count}}', formatNumber(n, lang_html))
      .replace('{{lastUpdate}}', formatTimestamp(stats.created_at, lang_html, {
        year: "2-digit", month: "numeric", day: "numeric"
      }, "Europe/London")?.readable ?? '')
      .replace(/{{mean}}/g, mean)
      .replace(/{{p90}}/g, p90)
      .replace(/{{p75}}/g, thirdQuartile)
      .replace(/{{p50}}/g, median)
      .replace(/{{p25}}/g, firstQuartile)
      .replace(/{{p10}}/g, p10)
    return {
      stats_main: {
        created_at,
        boxPlot,
        binData: createBinData(score_main)
      },
      md_stats_explainer_1
    }
  }, [stats, locTxt, lang])

  return (
    <>
      <title>{loaderData?.pageContent?.title}</title>
      <meta name="description" content={loaderData?.pageContent?.description} />

      <div className="first_slide_height flex justify-center items-center flex-col gap-[5vh] lg:gap-32">
        <div className="flex flex-col lg:items-center lg:flex-row">
          <MarkdownWithCustomElements
            markup={pageContent?.md_body_top ?? ''}
          />
        </div>

        <div className="max-w-full">
          <RequestAuditForm locTxt={loaderData?.locTxt} />

        </div>
      </div>

      <MarkdownWithCustomElements
        markup={pageContent?.md_body ?? ''}
      />

      <section className="border-t px-3 py-12 gap-12 flex justify-center flex-col items-center border-t-neutral-300 dark:border-t-neutral-700 first_slide_height">
        <h2 className="text-2xl md:text-3xl self-start">{loaderData.locTxt.audit_lists.titles.best_10}</h2>
        <div className="overflow-auto max-w-full">
          <AuditTableList
            locTxt={loaderData.locTxt}
            tableCaption={loaderData.locTxt.audit_lists.table_captions.best_10}
            listData={auditsByScores}
          />
          <div className="md_1 text-right mt-12 pr-2">
            <NavLink
              viewTransition
              to={localizedPath(lang, "NS_BEST")}
            >
              {loaderData.locTxt.audit_lists.link_labels.best_many_audits}
            </NavLink>
          </div>
        </div>

      </section>
      <section className="border-t px-3 py-12 gap-12 flex justify-center flex-col items-center border-t-neutral-300 dark:border-t-neutral-700 first_slide_height">
        <h2 className="text-2xl md:text-3xl self-start">{loaderData.locTxt.audit_lists.titles.latest_10}</h2>
        <div className="overflow-auto max-w-full">
          <AuditTableList
            locTxt={loaderData.locTxt}
            tableCaption={loaderData.locTxt.audit_lists.table_captions.latest_10}
            listData={auditsByCreation}
          />
          <div className="md_1 text-right mt-12 pr-2">
            <NavLink
              viewTransition
              to={localizedPath(lang, "NS_LATEST")}
            >
              {loaderData.locTxt.audit_lists.link_labels.latest_many_audits}
            </NavLink>
          </div>
        </div>
      </section>

      <section className="border-t px-3 py-12 gap-12 flex justify-center flex-col items-center border-t-neutral-300 dark:border-t-neutral-700 first_slide_height">
        {statsData && (
          <div className="flex justify-between w-full flex-wrap gap-8">
            <div className="md_1 mt-12">
              <h2 className="text-2xl md:text-3xl self-start mb-8">
                {loaderData?.locTxt.elements?.stats_texts.title}
              </h2>
              <MarkdownWithCustomElements
                markup={statsData?.md_stats_explainer_1 ?? ''}
              />
              <div className="mt-8">
                <NavLink
                  to={localizedPath(lang, "NS_STATS")}
                >
                  {loaderData?.locTxt?.elements?.stats_texts.link_label_to_stats_page}
                </NavLink>
              </div>

            </div>

            <div>
              <VisxViolinPlot
                data={statsData.stats_main}
                width={400}
                height={550}
                markerValue={undefined}
                aria_label={loaderData?.locTxt?.elements.aria_labels_and_titles?.statistical_violin_boxplot?.aria_label}
                title={loaderData?.locTxt?.elements?.aria_labels_and_titles?.statistical_violin_boxplot?.title}
              />
            </div>
          </div>
        )}
      </section>

      <div
        className="border-t flex items-center border-t-neutral-300 dark:border-t-neutral-700 first_slide_height"
      >
        <section className="px-3 py-12 flex gap-8 flex-wrap max-w-full w-full justify-between">
          <h2 className="text-2xl md:text-3xl">
            {loaderData?.locTxt?.elements?.contribute_section.sub_title}
          </h2>
          <div className="w-2xl max-w-full mt-8 lg:mt-0">
            <p className="md:text-xl font-light">
              {loaderData?.locTxt?.elements?.contribute_section.msg_1}
            </p>
            <div className="md_1 text-right mt-12 pr-2">
              <NavLink
                viewTransition
                to={localizedPath(lang, "NS_ABOUT") + "#contribute"}
              >
                {loaderData?.locTxt?.elements?.contribute_section.link_label}
              </NavLink>
            </div>
          </div>
        </section>
      </div>



    </>
  );
}



