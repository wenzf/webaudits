import SITE_CONFIG from "~/site/site.config";



export const loader = () => {
  const robotText = `User-agent: *\nDisallow: /login\nAllow: /\nSitemap: ${SITE_CONFIG.SITE_DEPLOYMENT.DOMAIN_URL}/sitemaps/sitemap-index.xml`
  return new Response(robotText, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff"
    }
  });
};