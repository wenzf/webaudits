
import jstoxml from 'jstoxml';
import type { LoaderFunction } from 'react-router';
import { getDynamoDB } from '~/common/utils/server/dynamodb.server';
import SITE_CONFIG from '~/site/site.config';


const {
    HEADERS_DEFAULTS: { XML_HEADERS },
    SITE_DEPLOYMENT: { DOMAIN_URL },
    PAGE_CONFIG: { NS_AUDITS_LAYOUT, NS_ECOS_V1_LAYOUT }
} = SITE_CONFIG


export const loader: LoaderFunction = async ({ params }) => {
    const { type, number } = params

    if ((type === NS_ECOS_V1_LAYOUT.path_fragment) && number) {
        const res = await getDynamoDB('sitemap-pages', number, "_table_audit_v1")

        const pages = res?.Item?.pages
        if (pages?.length) {
            let content: Record<"url", { loc: string, lastmod: string }>[] = []
            let xmlContent = {
                _name: 'urlset',
                _attrs: {
                    xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'
                },
            }

            const xmlOptions = {
                header: true,
                indent: '  '
            };

            for (let i = 0; i < pages.length; i += 1) {
                try {
                    content = [...content, {
                        url: {
                            loc: `${DOMAIN_URL}/${NS_AUDITS_LAYOUT.path_fragment}/${NS_ECOS_V1_LAYOUT.path_fragment}/${pages[i][0]}`,
                            lastmod: new Date(pages[i][1]).toISOString()
                        }
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
    }
    return null
} 