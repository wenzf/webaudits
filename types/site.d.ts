import type { UIMatch } from "react-router";
import type SITE_CONFIG from "~/site/site.config";

interface ExtendedUIMatch extends Omit<UIMatch, "handle"> {
    handle: {
        page?: keyof typeof CMS_CONFIG.ROUTES_CONFIG,
    }
}

type PageNamespaces = "NS_ABOUT" | "NS_DOCS" | "NS_AUDITS" | "NS_ECOS_V1"
    | "NS_LATEST" | "NS_BEST" | "NS_STATS" | "NS_HOME"
    | "NS_AUDITS_LAYOUT" | "NS_ECOS_V1_LAYOUT" | "NS_SITE_LAYOUT" | "NS_SITEMAPS"
    | "NS_ECOS_V1_ID" | "NS_PRIVACY"

type DataOriginType = "loader" | "locTxt"

type PageConfig = Record<PageNamespaces, {
    path_fragment?: string
    absolute_path?: string
    has_params?: boolean
    breadcrumb?: {
        data_origin?: PageNamespaces,
        data_key_type?: "dotprop",
        data_key?: string
    },
    schema_webpage_type?:string
    has_bg_1?:boolean
}>

interface RouteHandle {
    bc?: boolean
    page_key: PageNamespaces
}

interface SiteUIMatch extends UIMatch {
    handle: RouteHandle
}

type SortDirection = 'asc' | 'desc';

type SortType = 'string' | 'number';

type SiteLangs = readonly {
    lang_code: "en" | "de"
    lang_html: string
    lang_param: string | ""
    default: boolean
    label: string
}

type Settings = {
    theme: "dark" | "light" | "system"
    font_size: number
    show_cookie_consent_message: boolean
    ui_high_contrast: false
    ui_grayscale: false
    cms_show_hello_msg: true
}

type PKMainKey = "PS" | "DA" | "ME" | "IN"   // static page, media
type PKSubKey = "IM" | SiteLangs["lang_code"] | string   // image or document language code

// dynamo db, primary and sort key
interface DBBase {
    pk: `${PKMainKey}#${PKSubKey}` | "page" | "page-archive" | "page-stats" | "sitemap-index" | "sitemap-pages" | "request-counter" | string // type/lang, i.e. AR#en
    sk: string,
    createdAt: number
}


/* 
  -----------------------------------------------------------------------------
  CMS related below, TODO: clean up types
*/


interface PageBase extends DBBase {
    title: string
    description: string
    date_modified: number
}

interface AuthorPart {
    author_name: null | string
    author_url: null | string
    author_type: null | "Person" | "Organization"
    author_internal_id: null | string
}

interface PostBase extends PageBase, AuthorPart {
    categories?: string[]
    createdAt: number
    og_image?: {
        src?: string,
        mime?: string,
        width?: number,
        height?: number,
        alt?: string
    }
    slug?: string
    //  words: number
    //  article_type: string
    //  skyline?: string
    //  is_featured?: boolean
    //  featured_pos?: number
    //  client_name?: string
}

interface PostFull extends PostBase {
    md_body: string
    date_modified: number
    article_images: Record<DBBase["sk"], ImageFull>
    in_news_sitemap: boolean
    in_all_langs?: boolean
    custom_data?: string
}

interface DBImageBase extends DBBase {
    sources: {
        aspect: number
        width: number
        imgUrl: string
        mimeType: ImageMimeType
    }[]
}

interface DBIGBase extends DBImageBase {
    categories: string[]
}

interface ImagePart {
    license_name: null | string
    license_url: null | string
    date_published: number
    date_modified: number
}

// all translations for db
interface DBILFull extends DBIGBase, ImagePart, AuthorPart {
    alt: null | Record<string, string>
    fig_caption: null | Record<string, string>
}

// one translation for article
interface ImageFull extends DBImageBase, ImagePart, AuthorPart {
    alt: null | string
    fig_caption: null | string
}

interface DynamoDBItemReponse {
    Item: Record<string, any> | PostFull
    $metadata: any
    ConsumedCapacity?: ConsumedCapacity | undefined
}

interface MixedLoaderData {
    postData?: DynamoDBItemReponse
    locTxt?: Record<string, Record<string, string>>
    Body?: JSX.Element
    resStat?: ResStat
}

type IMAGE_TYPE_1 = {
    alt: string
    height: number
    width: number
    loading: "eager" | "lazy"
    src: string
    srcSet: string
    jpgFallbacks: string
}

