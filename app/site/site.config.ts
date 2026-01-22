import type { PageConfig, SiteLangs } from "types/site"

export const SST_APP_NAMESPACE = 'webaudit'


const SITE_LANGS: SiteLangs[] = [
    {
        lang_code: "en", // alpha-2
        lang_html: "en-US",
        lang_param: '',
        default: true,
        label: "English"
    },
    {
        lang_code: "de",
        lang_html: "de-CH",
        lang_param: 'de',
        default: false,
        label: "Deutsch"
    }

]


const ALT_LANG_TXT: Record<SiteLangs["lang_code"], string> = {
    en: "View this page in English",
    de: "Diese Seite auf Deutsch anzeigen"
}


const HEADERS_DEFAULTS = {
    XML_HEADERS: {
        "Content-Type": "application/xml; charset=utf-8",
        "x-content-type-options": "nosniff",
      //  "Cache-Control": `public, max-age=${60 * 10}, s-maxage=${60 * 60 * 24}`,
    },
    CACHE_CONTROL_HEADER_MID: {
        "Cache-Control": `public, max-age=${60 * 10}, s-maxage=${60 * 60 * 4}`
    }
}



const PAGE_CONFIG: PageConfig = {
    "NS_SITE_LAYOUT": {
        path_fragment: '',
        absolute_path: '/',
        breadcrumb: {
            data_origin: "NS_SITE_LAYOUT",
            data_key_type: "dotprop",
            data_key: "locTxt.breadcrumbs.home"
        }
    },
    "NS_HOME": {

    },
    "NS_ABOUT": {
        path_fragment: 'about',
        absolute_path: '/about',
        breadcrumb: {
            data_origin: "NS_SITE_LAYOUT",
            data_key_type: "dotprop",
            data_key: "locTxt.breadcrumbs.about",
        },
        schema_webpage_type: "AboutPage"
    },
    "NS_DOCS": {
        path_fragment: 'docs',
        absolute_path: '/docs',
        breadcrumb: {
            data_origin: "NS_DOCS",
            data_key_type: "dotprop",
            data_key: "locTxt.elements.breadcrumb"
        }
    },
    "NS_AUDITS": {
        path_fragment: 'audits',
        absolute_path: '/audits',

    },
    "NS_AUDITS_LAYOUT": {
        path_fragment: 'audits',
        absolute_path: '/audits',
        breadcrumb: {
            data_origin: "NS_SITE_LAYOUT",
            data_key_type: "dotprop",
            data_key: "locTxt.breadcrumbs.audits"
        }
    },
    "NS_ECOS_V1_LAYOUT": {
        path_fragment: 'ecos-v1',
        absolute_path: '/audits/ecos-v1',
        breadcrumb: {
            data_origin: "NS_SITE_LAYOUT",
            data_key_type: "dotprop",
            data_key: "locTxt.breadcrumbs.ecos_v1"
        }
    },
    "NS_ECOS_V1": {
        path_fragment: 'ecos-v1',
        absolute_path: '/audits/ecos-v1'
    },
    "NS_ECOS_V1_ID": {
        breadcrumb: {
            data_origin: "NS_ECOS_V1_ID",
            data_key_type: "dotprop",
            data_key: "audit.domain"
        },
        absolute_path: '/audits/ecos-v1/:id',
        has_params: true
    },
    "NS_BEST": {
        path_fragment: 'best',
        absolute_path: '/audits/ecos-v1/best',
        breadcrumb: {
            data_origin: "NS_BEST",
            data_key_type: "dotprop",
            data_key: "locTxt.pages.best.breadcrumb"
        },
        schema_webpage_type: "CollectionPage"
    },
    "NS_LATEST": {
        path_fragment: 'latest',
        absolute_path: '/audits/ecos-v1/latest',
        breadcrumb: {
            data_origin: "NS_LATEST",
            data_key_type: "dotprop",
            data_key: "locTxt.pages.latest.breadcrumb"
        },
        schema_webpage_type: "CollectionPage"
    },
    "NS_STATS": {
        path_fragment: 'stats',
        absolute_path: '/audits/ecos-v1/stats',
        breadcrumb: {
            data_origin: "NS_STATS",
            data_key_type: "dotprop",
            data_key: "locTxt.elements.breadcrumb"
        }
    },
    "NS_PRIVACY": {
        path_fragment: 'privacy',
        absolute_path: '/privacy',
        breadcrumb: {
            data_origin: "NS_PRIVACY",
            data_key_type: "dotprop",
            data_key: "locTxt.elements.breadcrumb"
        }
    },

    "NS_SITEMAPS": {
        path_fragment: "sitemaps",
        absolute_path: '/sitemaps'
    }
}



const SITE_DEPLOYMENT: Record<string, string> = {
    //DISTRIBUTION_URL: 'https://d1g7d6jgerafhe.cloudfront.net', // bucked for ltf
    //  DISTRIBUTION_URL: 'https://d2vh9rzcbi449v.cloudfront.net', // bucked for ltf
    //  DOMAIN_URL: 'http://localhost:3434',
    //  DOMAIN_NAME: 'http://localhost:3434',

    DISTRIBUTION_URL: 'https://webaudits.org', // bucked for ltf
    DOMAIN_URL: 'https://webaudits.org',
    DOMAIN_NAME: 'https://webaudits.org',

    S3_BUCKET_FILES_FOLDER_NAME: 'files', // react-aws.com/files/images/abc123/abc123.jpg
    S3_BUCKET_IMAGES_FOLDER_NAME: 'images',
    S3_BUCKET_VIDEOS_FOLDER_NAME: 'videos',
}



const SITE_CONFIG = Object.freeze({
    SITE_LANGS,
    SITE_DEPLOYMENT,
    HEADERS_DEFAULTS,
    PAGE_CONFIG,
    ALT_LANG_TXT
})

export default SITE_CONFIG