
import jstoxml from 'jstoxml';
import type { LoaderFunction } from 'react-router';
import SITE_CONFIG from '~/site/site.config';


const {
    HEADERS_DEFAULTS: { XML_HEADERS },
    SITE_DEPLOYMENT: { DOMAIN_URL },
    PAGE_CONFIG: {
        NS_AUDITS_LAYOUT,
        NS_ECOS_V1_LAYOUT,
        NS_ABOUT,
        NS_BEST,
        NS_LATEST,
        NS_DOCS,
        NS_STATS
    }
} = SITE_CONFIG


export const loader: LoaderFunction = async () => {

    const pages = [
        `${DOMAIN_URL}/${NS_ABOUT.path_fragment}`,
        `${DOMAIN_URL}/${NS_DOCS.path_fragment}`,
        `${DOMAIN_URL}/${NS_AUDITS_LAYOUT.path_fragment}`,
        `${DOMAIN_URL}/${NS_AUDITS_LAYOUT.path_fragment}/${NS_ECOS_V1_LAYOUT.path_fragment}`,
        `${DOMAIN_URL}/${NS_AUDITS_LAYOUT.path_fragment}/${NS_ECOS_V1_LAYOUT.path_fragment}/${NS_BEST.path_fragment}`,
        `${DOMAIN_URL}/${NS_AUDITS_LAYOUT.path_fragment}/${NS_ECOS_V1_LAYOUT.path_fragment}/${NS_LATEST.path_fragment}`,
        `${DOMAIN_URL}/${NS_AUDITS_LAYOUT.path_fragment}/${NS_ECOS_V1_LAYOUT.path_fragment}/${NS_STATS.path_fragment}`
    ]

    let content: Record<"url", { loc: string }>[] = []
    let xmlContent = {
        _name: 'urlset',
        _attrs: {
            xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'
        }
    }

    const xmlOptions = {
        header: true,
        indent: '  '
    };

    for (let i = 0; i < pages.length; i += 1) {
        try {
            content = [...content, {
                url: { loc: pages[i] }
            }]
        } catch {
            null
        }
    }

    // @ts-expect-error todo
    if (content?.length) xmlContent = { ...xmlContent, _content: content }

    const markup = jstoxml.toXML(xmlContent, xmlOptions)

    return new Response(markup, {
        status: 200,
        headers: new Headers(XML_HEADERS)
    })


} 