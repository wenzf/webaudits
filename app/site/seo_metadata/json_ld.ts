import type { MetaDescriptor } from "react-router"
import SITE_CONFIG from "../site.config"
import type { BlogPostView, IMAGE_TYPE_1, IMAGE_TYPE_OG } from "../../../types/site"

const json_ld_base = [{
    "@id": "https://websitegrader.eco/#identity",
    "@type": "Organization",
    name: "WebsiteGrader",
    url: "https://websitegrader.eco",
    image: [
        "https://wefrick.com/files/images/mewlj07a/d19e1665-b265-4854-8fd5-b16645152db7.png",
    ]
},
{
    "@type": "WebSite",
    "author": {
        "@id": "https://websitegrader.eco/#identity"
    },
    "copyrightHolder": {
        "@id": "https://websitegrader.eco/#identity"
    },
    "copyrightYear": `${new Date().getFullYear()}`,
    "creator": {
        "@id": "https://websitegrader.eco/#identity"
    },
    // "dateCreated": new Date(loaderData.post.createdAt).toISOString(),
    // "dateModified": new Date(loaderData.post.date_modified).toISOString(),
    // "datePublished": new Date(loaderData.post.createdAt).toISOString(),
    // "description": loaderData.post.description,
    // "headline": loaderData.post.title,
    "inLanguage": "en",
    //"mainEntityOfPage": canonical,
    "name": "WebsiteGrader",
    "publisher": {
        "@id": "https://websitegrader.eco/#identity"
    },
    "isFamilyFriendly": true,
    "isAccessibleForFree": true,
    "accessibilityHazard": "noSoundHazard",
    "accessibilityFeature": "alternativeText",
    "accessibilityControl": ["fullKeyboardControl", "fullMouseControl"],
    "url": "https://websitegrader.eco"



    //"sameAs": [
    //    "https://www.linkedin.com/in/wenzel-frick-38287488",
    //    "https://github.com/wenzf"
    //]
},



]


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

    //   const canonical = DOMAIN_URL + "/" + NS_BLOGS.path_fragment + "/" + blogPostView.sk


    let jsonLdObject: MetaDescriptor = {
        "@type": blogPostView.schema_article_type ?? "Article",
        mainEntityOfPage: DOMAIN_URL + "/" + NS_BLOG.path_fragment + "/" + blogPostView.sk,
        dateCreated: new Date(blogPostView.createdAt).toISOString(),
        dateModified: new Date(blogPostView.date_modified).toISOString(),
        datePublished: new Date(blogPostView.createdAt).toISOString(),
        description: blogPostView.description,
        headline: blogPostView.h1_title,
        alternativeHeadline: blogPostView.title,
        publisher: {
            "@id": "https://websitegrader.eco/#identity"
        },
        inLanguage: "en-US"


    }


    if (blogPostView?.author_name) {
        let author: Record<string, string> = {
            "@type": "Person",
            name: blogPostView.author_name
        }

        if (blogPostView?.author_url) {
            author = { ...author, url: blogPostView.author_url }
        }

        jsonLdObject = { ...jsonLdObject, author: [author] }
    }

    if (blogPostView?.alternative_keywords) {
        jsonLdObject = { ...jsonLdObject, keywords: blogPostView.alternative_keywords.map((it) => it.tag).join(',') }
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