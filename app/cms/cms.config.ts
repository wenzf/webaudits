
// default image settings (cui)
const ASPECTS: [number, string][] = [
    [2.5, '12.5/5 (main article image)'],
    [1.91, '1.91/1 (og:image)'],
    [1.333, '4/3 (preview snippet)'],
    [1, '1 (thumbnail)'],
    [1.778, '16/9'],
    [1.5, '3/2'],
    [1.25, '5/4'],
    [0.8, '4/5'],
    [0.75, '3/4'],
    [0.667, '2/3'],
    [0.5625, '9/16'],
]

// label, width, in default
/*
const IMAGE_SIZES: [string, number, boolean][] = [
    ["300", 300, false],
    ["420", 420, true],
    ["768", 768, true],
    ["1200", 1200, true],
    ["1536", 1536, true],
    ["2048", 2048, false]
]
*/


// label, width, in default / usecases 
const IMAGE_SIZES: [string, number, boolean, string[]][] = [
    ["80", 80, true, ["thumbnail"]],
    ["160", 160, true, ["thumbnail"]],
    ["240", 240, true, ["thumbnail"]],
    ["400", 400, true, ["preview_snippet"]],
    ["800", 800, true, ["preview_snippet"]],
    ["1200", 1200, true, ["og_image", "preview_snippet"]],
    ["1280", 1280, true, ["main_article_image"]],
    ["2560", 2560, true, ["main_article_image"]],
    ["3840", 3840, true, ["main_article_image"]],
]



const LICENSES: [string, string][] = [
    ["CC0", "https://creativecommons.org/publicdomain/zero/1.0/"],
    ["CC BY 4.0", "https://creativecommons.org/licenses/by/4.0/"],
    ["CC-BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0/"],
    ["CC BY-NC 4.0", "https://creativecommons.org/licenses/by-nc/4.0/"],
    ["Unsplash", "https://unsplash.com/license"]
]

// article type schema.org
/*
const ARTICLE_TYPES: [string, string][] = [
    ["BlogPosting", "BlogPosting"],
    ["SocialMediaPosting", "SocialMediaPosting"],
    ["Article", "Article"],
    ["AdvertiserContentArticle", "AdvertiserContentArticle"],
    ["NewsArticle", "NewsArticle"],
    ["Report", "Report"],
    ["SatiricalArticle", "SatiricalArticle"],
    ["ScholarlyArticle", "ScholarlyArticle"],
    ["TechArticle", "TechArticle"],
    ["AnalysisNewsArticle", "AnalysisNewsArticle"],
    ["BackgroundNewsArticle", "BackgroundNewsArticle"],
    ["OpinionNewsArticle", "OpinionNewsArticle"],
    ["ReportageNewsArticle", "ReportageNewsArticle"],
    ["ReviewNewsArticle", "ReviewNewsArticle"]
]
*/
// label, PSSubkey, (sk)
/*
const PAGE_TYPES: [string, string, null | string][] = [
    ['Home Page', 'PH', 'home'],
    ['Welcome Page', 'PW', 'welcome'],
    ['Experiments Feed', 'PE', 'experiments'],
    ['Experiments Item', 'PI', null]
]


const MEDIA_TYPES: [string, string][] = [
    ['Image', 'IM'],
    ['Video', 'VI'],
    ['Document', 'DO']
]

const MEDIA_DIRECTORIES: [string, string][] = [
    ['Video', 'videos'],
    ['Image', 'images'],
    ['Document', 'documents']
]

*/

// for deepL translation
const TRANSLATE_TARGET_LANGS: string[] = [
    "en-US",
    "en-GB",
    'de'
]

const URL_FRAGMENTS = {
    UF_CMS: 'cms',
    UF_LOGIN: 'login',
    UF_EDITOR: 'editor',
    UF_LOGOUT: 'logout',
    UF_CMS_SETTINGS: 'settings',
    UF_DATABSE: 'database',
    UF_CMS_INFOS: 'info'
}

const ROUTES_CONFIG = {
    C_LOGIN_COMP: {
        ltf: ['loc_login'],
        pageHandle: 'C_LOGIN_COMP',
        crumbLabel: 'c_login'
    },
    C_CMS_ROOT_LAYOUT: {
        ltf: ["loc_cms"],
        pageHandle: 'C_CMS_ROOT_LAYOUT',
        crumbLabel: ''
    },
    C_CMS_MAIN: {
        ltf: [],
        pageHandle: 'C_CMS_MAIN',
        crumbLabel: 'c_cms'
    },
    C_CMS_EDITOR: {
        ltf: [],
        pageHandle: 'C_CMS_EDITOR',
        crumbLabel: 'c_editor'
    },
    C_CMS_SETTINGS: {
        ltf: [],
        pageHandle: 'C_CMS_SETTINGS',
        crumbLabel: 'c_settings'
    },
    C_CMS_DATABASE: {
        ltf: [],
        pageHandle: 'C_CMS_DATABASE',
        crumbLabel: 'c_database'
    },
    C_CMS_INFO: {
        ltf: [],
        pageHandle: 'C_CMS_INFO',
        crumbLabel: 'c_info'
    }
}

// authorization levels
const AUTH_CONFIG = {
    ADMIN_AUTH_LVL: 99,
    GUEST_AUTH_LVL: 1,
    MIN_AUTH_LVL_EDIT_RIGHTS: 2,

    MIN_AUTH_LVL_READ_RIGHTS: 1,
    MIN_AUTH_LVL_CREATE_RIGHTS: 2,
    MIN_AUTH_LVL_USE_EXT_API_RIGHTS: 2
}

const EXTERNAL_APIS = {
    YOUTUBE_V3: false,
    DEEPL_V2: false
}

const CMS_CONFIG = Object.freeze({
    CREATE_AND_UPLOAD_IMAGES: {
        ASPECTS,
        LICENSES,
        IMAGE_SIZES
    },
    // CONTENT: {
    //     //        ARTICLE_TYPES,
    //     PAGE_TYPES,
    //     MEDIA_TYPES,
    //     MEDIA_DIRECTORIES
    // },
    AUTH_CONFIG,
    EXTERNAL_APIS,
    TRANSLATE_TARGET_LANGS,
    URL_FRAGMENTS,
    ROUTES_CONFIG,
//    ARTICLE_TYPES
})


export default CMS_CONFIG