
import { useMatches } from "react-router";

import SITE_CONFIG from "../site.config";
import { getCurrentMatchByMatches } from "../utils/matches";
import { createLangPathByParam, langByParam, localizedPath } from "~/common/shared/lang";
import type { IMAGE_TYPE_OG, SiteUIMatch } from "../../../types/site";


export const BaseSEOMetaData = () => {
    const { SITE_DEPLOYMENT: { DOMAIN_URL }, SITE_LANGS, PAGE_CONFIG: {
        NS_BLOG_SLUG, NS_BLOG } } = SITE_CONFIG
    const matches = useMatches()
    const matchRes = getCurrentMatchByMatches(matches as SiteUIMatch[])
    if (!matchRes || !matchRes?.pageKey) return null

    const { match, pageKey } = matchRes
    const loaderData = match.loaderData as any
    const langParam = match.params.lang
    const { lang_html } = langByParam(langParam)
    const canonical = DOMAIN_URL + localizedPath(langParam, pageKey, match.params)

    let og_image = DOMAIN_URL + "/brand/og-image.png"
    let og_image_type = "image/png"
    let og_image_width = "1200"
    let og_image_height = "630"
    let og_image_alt = "webaudits.org logo"

    if (pageKey === "NS_BLOG_SLUG" && loaderData?.post?.og_image) {
        const optional_og_image: IMAGE_TYPE_OG = loaderData?.post?.og_image;
        if (optional_og_image?.alt) og_image_alt = optional_og_image?.alt
        if (optional_og_image?.src) og_image = optional_og_image.src
        if (optional_og_image?.height) og_image_height = optional_og_image.height.toString()
        if (optional_og_image?.width) og_image_width = optional_og_image.width.toString()
        if (optional_og_image?.mime) og_image_type = optional_og_image.mime
    }
    let hrefLangs: [string, string][] = []
    if (pageKey === "NS_BLOG_SLUG" && loaderData?.post?.hreflangs?.length) {
        const alternativePaths = loaderData?.post?.hreflangs
        hrefLangs = [[lang_html, canonical]]
        for (let i = 0; i < alternativePaths.length; i += 1) {
            const langObj = langByParam(alternativePaths[i].lang === "en"
                ? undefined
                : alternativePaths[i].lang)
            hrefLangs = [...hrefLangs, [
                langObj.lang_html,
                DOMAIN_URL + createLangPathByParam(langObj.lang_param,
                    `/${NS_BLOG.path_fragment}/${alternativePaths[i].pathname}`)
            ]]
        }
    } else {
        hrefLangs = SITE_LANGS.map((it) => [
            it.lang_html,
            DOMAIN_URL + localizedPath(it.lang_param, pageKey, match.params)])
    }


    return (
        <>
            <link rel="icon" href={DOMAIN_URL + "/favicon.ico"} sizes="any" />
            <link rel="icon" href={DOMAIN_URL + "/brand/icon.svg"} type="image/svg+xml" />
            <link rel="apple-touch-icon" href={DOMAIN_URL + "/brand/apple-touch-icon.png"} />
            {process.env.NODE_ENV === "production" && (
                <link rel="manifest" href={DOMAIN_URL + "/site.webmanifest"} />
            )}
            <meta property="og:url" content={canonical} />
            <link rel="canonical" href={canonical} />
            <meta property="og:locale" content={lang_html.replace('-', '_')} />
            {...SITE_LANGS.filter((it) => it.lang_html !== lang_html).map((ii) => (
                <meta key={ii.lang_code} property="og:locale:alternate"
                    content={ii.lang_html.replace('-', '_')} />))}
            {hrefLangs?.length ? hrefLangs.map((it) => (
                <link key={it[0]}
                    rel="alternate"
                    hrefLang={it[0]}
                    href={it[1]} />
            )) : null}
            <meta property="og:image" content={og_image} />
            <meta property="og:image:secure_url" content={og_image} />
            <meta property="og:image:type" content={og_image_type} />
            <meta property="og:image:width" content={og_image_width} />
            <meta property="og:image:height" content={og_image_height} />
            <meta property="og:image:alt" content={og_image_alt} />
        </>
    )
}


export const StaticPageMetaItemprops = () => (
    <>
        <meta itemProp="accessibilityFeature" content="keyboardNavigation" />
        <meta itemProp="accessibilityFeature" content="aria" />
        <meta itemProp="accessibilityFeature" content="fullKeyboardControl" />
        <meta itemProp="accessibilityFeature" content="displayTransformability" />
        <meta itemProp="accessibilityFeature" content="noMotionHazard" />
        <meta itemProp="accessibilityFeature" content="noSoundHazard" />
        <meta itemProp="accessibilityFeature" content="alternativeText" />
        <meta itemProp="accessibilityControl" content="fullKeyboardControl" />
        <meta itemProp="accessibilityHazard" content="noFlashingHazard" />
        <meta itemProp="accessibilityHazard" content="noMotionHazard" />
        <meta itemProp="accessibilityHazard" content="noSoundHazard" />
        <link itemProp="publisher" href="https://webaudits.org/about#contact" />
        <meta name="msvalidate.01" content="6DCCF2846BD9A91B5A8764CF0F5C1E76" />
    </>
)




// export const createBaseSEOMetaData = (matches: SiteUIMatch[]): MetaDescriptor[] => {
//     const matchRes = getCurrentMatchByMatches(matches)
// 
//     if (!matchRes) return []
// 
//     const { match, pageKey } = matchRes
//     const langParam = match.params.lang
// 
//     const { lang_html } = langByParam(langParam)
// 
// 
//     return [
//         {
//             rel: "canonical",
//             href: DOMAIN_URL + localizedPath(langParam, pageKey, match.params)
//         },
//         ...SITE_LANGS.map((it) => ({
//             rel: "alternate",
//             hrefLang: it.lang_html,
//             href: DOMAIN_URL + localizedPath(it.lang_param, pageKey, match.params),
//         })),
//         {
//             property: "og:locale",
//             content: lang_html.replace('-', '_'),
//         },
//         ...SITE_LANGS.filter((it) => it.lang_html !== langParam).map((ii) => ({
//             property: "og:locale:alternate",
//             content: ii.lang_html.replace('-', '_'),
//         }))
// 
// 
//     ]
// }


