import { index, route, prefix, layout, type RouteConfig } from "@react-router/dev/routes";
import SITE_CONFIG from "./site.config";

const {
  PAGE_CONFIG: {
    NS_ABOUT, NS_DOCS, NS_AUDITS_LAYOUT,
    NS_BEST, NS_STATS, NS_SITEMAPS, NS_LATEST,
    NS_AUDITS, NS_ECOS_V1, NS_PRIVACY
  }

} = SITE_CONFIG

const siteRoutesConfig = [
  ...prefix(':lang?', [
    layout("./site/routes/layouts/site_layout.tsx", [
      index("./site/routes/pages/home.tsx"),
      route(`${NS_ABOUT.path_fragment}`, './site/routes/pages/about.tsx'),
      route(`${NS_PRIVACY.path_fragment}`, './site/routes/pages/privacy.tsx'),
      route(`${NS_DOCS.path_fragment}`, './site/routes/pages/docs.tsx'),
      ...prefix(NS_AUDITS.path_fragment!, [
        layout("./site/routes/layouts/audits_layout.tsx", [
          index('./site/routes/pages/audits_main.tsx'),
          ...prefix(NS_ECOS_V1.path_fragment!, [
            layout("./site/routes/layouts/ecos_layout.tsx", [
              index('./site/routes/pages/audits_ecos_v1.tsx'),
              route(`${NS_LATEST.path_fragment}`, './site/routes/pages/audits_ecos_v1_latest.tsx'),
              route(`${NS_BEST.path_fragment}`, './site/routes/pages/audits_ecos_v1_best.tsx'),
              route(`${NS_STATS.path_fragment}`, './site/routes/pages/audits_ecos_v1_stats.tsx'),
              route(`:id`, './site/routes/pages/audits_ecos_v1_id.tsx'),
            ])
          ])
        ])
      ]),
      route("*", "./site/routes/pages/not_found.tsx"),
    ]),
  ]),
  route("/loader/audit-v1", './site/routes/actions_and_loaders/loader_audit_1.tsx'),
  route(`/${NS_SITEMAPS.path_fragment}/sitemap-index.xml`, "./site/routes/discovery/sitemap_index.tsx"),
  route(`/${NS_SITEMAPS.path_fragment}/${NS_AUDITS_LAYOUT.path_fragment}/:type/:number.xml`, "./site/routes/discovery/sitemaps_audit_type_number.tsx"),
  route(`/${NS_SITEMAPS.path_fragment}/pages.xml`, "./site/routes/discovery/sitemaps_pages.tsx"),
  route("/robots.txt", "./site/routes/discovery/robots.tsx"),
  route("/carbon.txt", "./site/routes/discovery/carbon.tsx"),
  route('/api/ecos/v1/:type/:id?.json', './site/routes/pages/audits_ecos_v1_id_json.ts')

//  , route("/dev", "./site/dev/dev.tsx"),
]

export default siteRoutesConfig satisfies RouteConfig