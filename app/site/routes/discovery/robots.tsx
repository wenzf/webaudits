import CMS_CONFIG from "~/cms/cms.config";
import SITE_CONFIG from "~/site/site.config";



export const loader = () => {
    const {URL_FRAGMENTS: {UF_LOGIN}} = CMS_CONFIG
  const robotText = `User-agent: *\nDisallow: /${UF_LOGIN}\nAllow: /\nSitemap: ${SITE_CONFIG.SITE_DEPLOYMENT.DOMAIN_URL}/sitemaps/sitemap-index.xml`
  return new Response(robotText, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff"
    }
  });
};