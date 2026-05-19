import type { LoaderFunction } from "react-router"
import jstoxml from 'jstoxml';

import { queryDynamoDB } from "~/common/utils/server/dynamodb.server"
import SITE_CONFIG from "~/site/site.config"
import type { BlogPostFeed } from "../../../../types/site"
import { localizedPath } from "~/common/shared/lang";
import { unixToNewsSitemapDate } from "~/site/utils/time";




export const loader: LoaderFunction = async ({ params }) => {
    const { type } = params
    const { SITE_DEPLOYMENT: { DOMAIN_URL }, HEADERS_DEFAULTS: { XML_HEADERS } } = SITE_CONFIG
    const langs = SITE_CONFIG.SITE_LANGS.map((it) => it.lang_code)


    let ProjectionExpression

    if (type === "news") {
        ProjectionExpression = "pk, sk, createdAt, h1_title, date_published"
    } else if (type === "regular") {
        ProjectionExpression = "pk, sk, createdAt, date_modified, hreflangs"
    } else {
        return new Response(null, {
            status: 404
        })
    }


    let jobs: Promise<unknown>[] = []

    for (let i = 0; i < langs.length; i += 1) {
        jobs = [...jobs, queryDynamoDB({
            IndexName: "CreatedAtIndex",
            Limit: 1000,
            pk: `BP#${langs[i]}`,
            //            ProjectionExpression: "pk, sk, createdAt, h1_title, date_published",
            ProjectionExpression,
            excludeIfCreationDateInFuture: true,
            newsSitemapOnly: type === "news"

        }) as Promise<{
            Items: BlogPostFeed[],
            LastEvaluatedKey?: {
                createdAt: { N: string },
                pk: { S: string },
                sk: { S: string },
            },
            Count: number
            ScannedCount: number

        } | null>]
    }

    const [...res] = await Promise.all(jobs)

    const pages = res.map((it: any) => it.Items).flat()

    let content: any = []

    let xmlContent = type === "news" ? {
        _name: 'urlset',
        _attrs: {
            xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
            "xmlns:news": "http://www.google.com/schemas/sitemap-news/0.9"
        },
    } : {
        _name: 'urlset',
        _attrs: {
            xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
            "xmlns:xhtml": "http://www.w3.org/1999/xhtml"
        },
    }

    const xmlOptions = {
        header: true,
        indent: '  '
    };





    if (pages?.length) {

        for (let i = 0; i < pages.length; i += 1) {
            try {
                const page = pages[i]
                const langFromPk = page?.pk?.split('#')[1]
                const langParams = langFromPk === "en" ? undefined : langFromPk
                const sk = page?.sk

                if (type === "news") {

                    const h1 = page?.h1_title
                    const createdAt = unixToNewsSitemapDate(page?.createdAt)
                    if (langFromPk && sk && h1 && createdAt) {

                        content = [...content, {
                            url: [{
                                loc: `${DOMAIN_URL}${localizedPath(langParams, "NS_BLOG")}/${sk}`
                            },
                            {
                                "news:news": {
                                    "news:publication": {
                                        "news:name": "Web Audits",
                                        "news:language": langFromPk
                                    },
                                    "news:publication_date": createdAt,
                                    "news:title": h1
                                }
                            }]
                        }]
                    }

                } else if (type === "regular") {

                    const date_modified = unixToNewsSitemapDate(page?.date_modified)
                    if (langFromPk && sk) {
                        const thisLoc = `${DOMAIN_URL}${localizedPath(langParams, "NS_BLOG")}/${sk}`

                        let url = [
                            { loc: thisLoc },
                            { lastmod: date_modified },
                        ]
                        const hreflangs: { lang: string, pathname: string }[] = page?.hreflangs
                        if (hreflangs) {
                            let xhtmls = [
                                {
                                    _name: 'xhtml:link',
                                    _attrs: {
                                        rel: 'alternate',
                                        hreflang: langFromPk,
                                        href: thisLoc
                                    },
                                    _content: ""
                                }
                            ]
                            if (langFromPk === "en") {
                                xhtmls = [
                                    ...xhtmls, {
                                        _name: 'xhtml:link',
                                        _attrs: {
                                            rel: 'alternate',
                                            hreflang: "x-default",
                                            href: thisLoc
                                        },
                                        _content: ""
                                    }]
                            }

                            for (let j = 0; j < hreflangs.length; j += 1) {
                                const althref = hreflangs[j]
                                xhtmls = [...xhtmls, {
                                    _name: 'xhtml:link',
                                    _attrs: {
                                        rel: 'alternate',
                                        hreflang: althref.lang,
                                        href: `${DOMAIN_URL}${localizedPath(althref.lang === "en" ? undefined : althref.lang, "NS_BLOG")}/${althref.pathname}`
                                    },
                                    _content: ""
                                }]
                            }
                            // @ts-ignore all... todo
                            url = [url, ...xhtmls]
                        }
                        content = [...content, {
                            url
                        }]
                    }
                }
            } catch (err) {
                null
            }

        }

    }

    // @ts-expect-error todo
    if (content?.length) xmlContent = { ...xmlContent, _content: content }

    const markup = jstoxml.toXML(xmlContent, xmlOptions)

    return new Response(markup, {
        status: 200,
        headers: new Headers(XML_HEADERS)
    })


//    return null
} 