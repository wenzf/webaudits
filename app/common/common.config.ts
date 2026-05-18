import type { PKMainKey } from "../../types/site"


const URL_FRAGMENTS = {
    UF_ABOUT: 'about',
    UF_IMPRESSUM: 'impressum',
    UF_DOCS: 'docs',
    UF_AUDIT: 'audit',


}
export type Page_Type = [
    label: string,
    pkMainKey: PKMainKey,
    sk: string | null,
    urlFragment: typeof URL_FRAGMENTS[keyof typeof URL_FRAGMENTS] | null
]

// CMS
const PAGE_TYPES: Page_Type[] = [
    ['Static Page', 'PS', null, null],
    ['Blog post', 'BP', null, null],
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

// settings cookie
const SETTINGS_DEFAULT = {
    theme: "system",
    font_size: 100,
    show_cookie_consent_message: true,
    ui_high_contrast: false,
    ui_grayscale: false,
    msg_lang_hint: true,
    cms_show_hello_msg: true,
}

const COMMON_CONFIG = {
    PAGE_TYPES, MEDIA_TYPES,
    MEDIA_DIRECTORIES,
    SETTINGS_DEFAULT
}


export default COMMON_CONFIG