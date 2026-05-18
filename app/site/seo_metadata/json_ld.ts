import type { MetaDescriptor } from "react-router"
import SITE_CONFIG, { SCHEMA_ORG_SELF_IDENTITY } from "../site.config"
import type { BlogPostView, IMAGE_TYPE_1, IMAGE_TYPE_OG, SiteLangs } from "../../../types/site"
import { createLangPathByParam } from "~/common/shared/lang"





const json_ld_base = [{
    "@type": "WebSite",
    "author": {
        "@id": SCHEMA_ORG_SELF_IDENTITY
    },
    "copyrightHolder": {
        "@id": SCHEMA_ORG_SELF_IDENTITY
    },
    "copyrightYear": `${new Date().getFullYear()}`,
    "creator": {
        "@id": SCHEMA_ORG_SELF_IDENTITY
    },
    "name": "Web Audits",
    "publisher": {
        "@id": SCHEMA_ORG_SELF_IDENTITY
    },
    "isFamilyFriendly": true,
    "isAccessibleForFree": true,
    "accessibilityHazard": "noSoundHazard",
    "accessibilityFeature": "alternativeText",
    "accessibilityControl": ["fullKeyboardControl", "fullMouseControl"],
    "url": "https://webaudits.org"
}]


export const createJsonLdImageObject = ({
    imgSourceObject,
    propsToInject = {},
}: {
    imgSourceObject: Partial<IMAGE_TYPE_1 & IMAGE_TYPE_OG>
    propsToInject?: MetaDescriptor
}): MetaDescriptor[] => {
    const { SITE_DEPLOYMENT: { DOMAIN_URL } } = SITE_CONFIG
    let caption
    const src = imgSourceObject?.src
    if (!src) return []

    if (imgSourceObject?.alt) {
        caption = imgSourceObject.alt
    } else if (imgSourceObject?.figCaption) {
        caption = imgSourceObject.figCaption
    }

    const width = imgSourceObject?.width
    const height = imgSourceObject?.height
    const license_name = imgSourceObject.license_name
    const license_url = imgSourceObject?.license_url
    const author_name = imgSourceObject?.author_name
    const author_url = imgSourceObject?.author_url
    const author_type = imgSourceObject?.author_type


    let jsonLdObject: MetaDescriptor = {
        "@type": "ImageObject",
        contentUrl: src,
        url: src,
    }

    if (caption) jsonLdObject = { ...jsonLdObject, caption }
    if (width) jsonLdObject = { ...jsonLdObject, width }
    if (height) jsonLdObject = { ...jsonLdObject, height }
    if (license_url) jsonLdObject = { ...jsonLdObject, license: license_url }
    if (author_url) jsonLdObject = { ...jsonLdObject, acquireLicensePage: author_url }




    if (author_name && author_url) {
        jsonLdObject = {
            ...jsonLdObject,
            creditText: `${author_name} / ${author_url.replace('https://', '')}`,
            copyrightNotice: `© ${author_name}.${license_name ? ` Licensed under ${license_name}` : ""}`
        }
    } else if (author_name && license_name) {
        jsonLdObject = {
            ...jsonLdObject,
            creditText: `${author_name} / ${license_name}`,
            copyrightNotice: `© ${author_name}.${license_name ? ` Licensed under ${license_name}` : ""}`
        }
    }

    if (author_url || author_name) {
        let creator = {}
        if (author_url) creator = { ...creator, url: author_url }
        if (author_name) creator = { ...creator, name: author_name }
        if (author_type) creator = { ...creator, "@type": author_type }
        jsonLdObject = { ...jsonLdObject, creator }
    }

    if (propsToInject) jsonLdObject = { ...jsonLdObject, ...propsToInject }

    return [jsonLdObject]
}


export const createJsonLdArticleObject = ({ blogPostView, propsToInject = {},
}: { blogPostView?: BlogPostView, propsToInject?: MetaDescriptor }): MetaDescriptor[] => {
    const { SITE_DEPLOYMENT: { DOMAIN_URL }, PAGE_CONFIG: { NS_BLOG } } = SITE_CONFIG
    if (!blogPostView || !blogPostView.sk) return []


    let langCode = "en"
    let inLanguage = "en-US"
    if (blogPostView.pk.split('#')[1] === "de") {
        inLanguage = "de-CH"
        langCode = "de"
    }

    const path = createLangPathByParam(langCode === "en" ? undefined : langCode, `/${NS_BLOG.path_fragment}/${blogPostView.sk}`)

    const canonical = DOMAIN_URL + path

    let jsonLdObject: MetaDescriptor = {
        "@type": blogPostView.schema_article_type ?? "Article",
        "@id": `${canonical}#id`,
        mainEntityOfPage: DOMAIN_URL + "/" + NS_BLOG.path_fragment + "/" + blogPostView.sk,
        dateCreated: new Date(blogPostView.createdAt).toISOString(),
        dateModified: new Date(blogPostView.date_modified).toISOString(),
        datePublished: new Date(blogPostView.createdAt).toISOString(),
        description: blogPostView.description,
        headline: blogPostView.h1_title,
        publisher: {
            "@id": SCHEMA_ORG_SELF_IDENTITY
        },
        inLanguage,
        url: canonical
    }

    if (blogPostView?.md_lead) {
        jsonLdObject = {
            ...jsonLdObject,
            abstract: blogPostView.md_lead
        }
    }

    if (blogPostView?.eyebrow) {
        jsonLdObject = {
            ...jsonLdObject,
            alternativeHeadline: blogPostView.eyebrow
        }
    }

    if (blogPostView?.authors?.length) {
        let authors: BlogPostView["authors"] = []
        for (let i = 0; i < blogPostView.authors.length; i += 1) {
            const oneAuthor = blogPostView.authors[i]
            if (oneAuthor.author_name && oneAuthor.author_type) {
                let author: any = {
                    "@type": oneAuthor.author_type,
                    name: oneAuthor.author_name
                }
                if (oneAuthor.author_url) {
                    author = { ...author, url: oneAuthor.author_url }
                }
                authors = [...authors, author]
            }
        }
        if (authors.length) jsonLdObject = { ...jsonLdObject, author: authors }
    } else {
        jsonLdObject = {
            ...jsonLdObject, author: {
                "@id": SCHEMA_ORG_SELF_IDENTITY
            }
        }
    }

/*
    if (blogPostView?.author_name && blogPostView?.post_author_type) {
        let author: Record<string, string> = {
            "@type": "Person",
            name: blogPostView.author_name
        }

        if (blogPostView?.author_url) {
            author = { ...author, url: blogPostView.author_url }
        }

        jsonLdObject = { ...jsonLdObject, author: [author] }
    } else {
        jsonLdObject = {
            ...jsonLdObject, author: {
                "@id": SCHEMA_ORG_SELF_IDENTITY
            }
        }
    }
*/


    if (blogPostView?.alternative_keywords) {
        jsonLdObject = {
            ...jsonLdObject,
            keywords: blogPostView.alternative_keywords.map((it) => it.tag).join(', ')
        }
    }

    if (blogPostView?.main_keyword) {
        jsonLdObject = { ...jsonLdObject, about: blogPostView?.main_keyword }
    }

    if (propsToInject) jsonLdObject = { ...jsonLdObject, ...propsToInject }

    return [jsonLdObject]
}


export const jsonLdBuilder = (metas: MetaDescriptor[] = []) => {
    const jsonLdMarkup: MetaDescriptor = {
        "script:ld+json": {
            "@context": "https://schema.org",
            "@graph": [
                ...json_ld_base,

                ...metas
            ]
        }
    }

    return jsonLdMarkup
}



export const createJsonLdFaqPageObject = ({
    faq_title,
    faq_description,
    faq_qa_pairs
}: {
    faq_title: BlogPostView["faq_title"],
    faq_description: BlogPostView["faq_description"],
    faq_qa_pairs: BlogPostView["faq_qa_pairs"],
}): MetaDescriptor[] => {
    if (!faq_qa_pairs?.length) return []

    let jsonLdObject: MetaDescriptor = {
        "@type": "FAQPage",
        mainEntity: faq_qa_pairs.map((it) => ({
            "@type": "Question",
            name: it.q,
            acceptedAnswer: { "@type": "Answer", text: it.a }
        }))

    }

    if (faq_title) jsonLdObject = { ...jsonLdObject, about: faq_title }
    if (faq_description) jsonLdObject = { ...jsonLdObject, description: faq_description }

    return [jsonLdObject]
}