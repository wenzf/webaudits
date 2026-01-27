import type { SiteUIMatch } from "types/site";
import { useMatches } from "react-router";

import SITE_CONFIG from "../site.config";
import { getCurrentMatchByMatches } from "../utils/matches";
import { langByParam, localizedPath } from "~/common/shared/lang";


export const BaseSEOMetaData = () => {
    const { SITE_DEPLOYMENT: { DOMAIN_URL }, SITE_LANGS } = SITE_CONFIG
    const matches = useMatches()
    const matchRes = getCurrentMatchByMatches(matches as SiteUIMatch[])

    if (!matchRes || !matchRes?.pageKey) return null

    const { match, pageKey } = matchRes
    const langParam = match.params.lang
    const { lang_html } = langByParam(langParam)
    const canonical = DOMAIN_URL + localizedPath(langParam, pageKey, match.params)
    return (
        <>
            <link rel="icon" href={DOMAIN_URL + "/favicon.ico"} sizes="any" />
            <link rel="icon" href={DOMAIN_URL + "/brand/icon.svg"} type="image/svg+xml" />
            <link rel="apple-touch-icon" href={DOMAIN_URL + "/brand/apple-touch-icon.png"} />
            <link rel="manifest" href={DOMAIN_URL + "/site.webmanifest"} />
            <link rel="canonical" href={canonical} />
            {...SITE_LANGS.map((it) => (
                <link key={it.lang_html} rel="alternate" hrefLang={it.lang_html}
                    href={DOMAIN_URL + localizedPath(it.lang_param, pageKey, match.params)} />
            ))}
            <meta property="og:locale" content={lang_html.replace('-', '_')} />
            {...SITE_LANGS.filter((it) => it.lang_html !== langParam).map((ii) => (
                <meta key={ii.lang_code} property="og:locale:alternate"
                    content={ii.lang_html.replace('-', '_')} />
            ))}
            <meta property="og:url" content={canonical} />
            <meta property="og:image" content={DOMAIN_URL + "/brand/og-image.png"} />
            <meta property="og:image:secure_url" content={DOMAIN_URL + "/brand/og-image.png"} />
            <meta property="og:image:type" content="image/png" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content="webaudits.org logo" />
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


