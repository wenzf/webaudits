import jstoxml from 'jstoxml';
import { getDynamoDB } from '~/common/utils/server/dynamodb.server';
import SITE_CONFIG from '~/site/site.config';


export const loader = async () => {
    const { SITE_DEPLOYMENT: { DOMAIN_URL },
    PAGE_CONFIG: {
        NS_AUDITS_LAYOUT, NS_ECOS_V1_LAYOUT
    }
    } = SITE_CONFIG
    const sitemapIndexReq = getDynamoDB('sitemap-index', 'main', '_table_audit_v1')
    const [sitemapIndexRes] = await Promise.all([sitemapIndexReq])
    const numberOfAuditSitemaps = sitemapIndexRes?.Item?.score ?? 0
    let auditSitemaps: { sitemap: { loc: string } }[] = [
        {
            sitemap: { loc: `${DOMAIN_URL}/sitemaps/pages.xml` }
        }
    ]
    for (let i = 0; i < numberOfAuditSitemaps; i += 1) {
        auditSitemaps = [...auditSitemaps, {
            sitemap: { loc: `${DOMAIN_URL}/sitemaps/${NS_AUDITS_LAYOUT.path_fragment}/${NS_ECOS_V1_LAYOUT.path_fragment}/${i + 1}.xml` }
        }]
    }

    const xmlOptions = {
        header: true,
        indent: '  '
    };

    const xmlContent = {
        _name: 'sitemapindex',
        _attrs: {
            xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'
        },
        _content: [...auditSitemaps]
    }

    const markup = jstoxml.toXML(xmlContent, xmlOptions)

    return new Response(markup, {
        status: 200,
          headers: new Headers(SITE_CONFIG.HEADERS_DEFAULTS.XML_HEADERS)
    })
}