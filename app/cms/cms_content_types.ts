import type { ContentType, ContentTypeField } from "./cms"

/**
 * CONFIGURATION OF CMS DATA INPUTS
 */

// FRAGMENTS

const ITEM_FRAGMENT_TEXT_REQUIRED: Pick<ContentTypeField, "data_type" | "input_type" | "input_classname" | "isRequired"> = {
    data_type: "string",
    input_type: "text",
    input_classname: "inp_1 grow",
    isRequired: true
}

const ITEM_FRAGMENT_TEXTAREA: Pick<ContentTypeField, "data_type" | "input_classname" | "input_type"> = {
    input_type: "textarea",
    input_classname: "inp_1 grow resize w-full",
    data_type: 'string',
}

// ITEMS

// metas

const CONTENT_TYPE_ITEM_TITLE = {
    ...ITEM_FRAGMENT_TEXT_REQUIRED,
    input_label: "Meta Title",
    input_id: "page-title",
    input_description: "",
    data_namespace: "title",
}

const CONTENT_TYPE_ITEM_EYEBROW = {
    ...ITEM_FRAGMENT_TEXT_REQUIRED,
    input_label: "eyebrow",
    input_id: "eyebrow",
    input_description: "",
    data_namespace: "eyebrow",
}

const CONTENT_TYPE_ITEM_META_DESCRIPTION = {
    ...ITEM_FRAGMENT_TEXT_REQUIRED,
    input_label: "Meta Description",
    input_id: "meta-description",
    input_description: "90-160 chars incl. whitespace",
    data_namespace: "description",
}

const CONTENT_TYPE_ITEM_OG_IMAGE: ContentTypeField = {
    input_type: "custom_image",
    input_label: "og:image (Image Type OG)",
    input_id: "og_image",
    input_description: "1.91:1 aspect",
    data_namespace: "og_image",
    data_type: 'json',
    check_json: true,
    is_json: true,
    custom_config: {
        is_active: false,
        data_keys: ["src", "width", "height", "alt", "mime"],
    }
}

const CONTENT_TYPE_ITEM_DATE_TIME_PUBLISHED: ContentTypeField = {
    input_type: "custom_date_time",
    input_label: "Date Published",
    input_classname: "",
    input_id: "createdAt",
    input_description: "createdAt sort index",
    data_namespace: "createdAt",
    data_type: 'number',
}

const CONTENT_TYPE_ITEM_DATE_TIME_MODIFIED: ContentTypeField = {
    input_type: "custom_date_time",
    input_label: "Date Modified",
    input_id: "date_modified",
    data_namespace: "date_modified",
    input_description: "If date is in future, article is not displayed in the feed or sitemaps.",
    data_type: 'number',
}

const CONTENT_TYPE_ITEM_READING_TIME_IN_MINS: ContentTypeField = {
    input_type: "number",
    input_label: "Reading time in mins",
    input_id: "reading_time",
    data_namespace: "reading_time",
    data_type: 'number',
    input_classname: "inp_1 grow",
}

// texts

const CONTENT_TYPE_ITEM_H1_TITLE = { // OKK
    ...ITEM_FRAGMENT_TEXT_REQUIRED,
    input_label: "Title",
    input_id: "h1-title",
    input_description: "<h1> title",
    data_namespace: "h1_title",
}

const CONTENT_TYPE_ITEM_LEAD = {
    ...ITEM_FRAGMENT_TEXTAREA,
    input_label: "Article lead",
    input_id: "md_lead",
    input_description: "HTML / .md",
    data_namespace: "md_lead",
    isRequired: false,
    input_props: { rows: 3 },
    in_search: false,
}

const CONTENT_TYPE_ITEM_BODY = {
    ...ITEM_FRAGMENT_TEXTAREA,
    input_label: "Text body",
    input_id: "md_body",
    input_description: "HTML / .md",
    data_namespace: "md_body",
    isRequired: true,
    input_props: { rows: 12 },
    in_search: false,
}

const CONTENT_TYPE_ITEM_BODY_TOP = {
    ...ITEM_FRAGMENT_TEXTAREA,
    input_label: "Text body top",
    input_id: "md_body_top",
    input_description: "HTML / .md",
    data_namespace: "md_body_top",
    isRequired: true,
    input_props: { rows: 12 },
    in_search: false,
}

// blog

const CONTENT_TYPE_ITEM_TAGS_LIST: ContentTypeField = {
    input_type: "list",
    input_label: "Tags",
    input_classname: "",
    input_id: "tags",
    input_description: "",
    data_namespace: "tags",
    data_type: 'list',
    isRequired: false,
    input_props: {},
    check_json: false,
    is_json: false,
    in_search: false,
    list_config: [
        {
            item_namespace: "tag",
            input_type: "text",
            input_label: "tag",
            input_props: {},
            check_json: false,
            is_json: false,
            in_search: false,
            isRequired: true
        }
    ],
    custom_config: null
}


const CONTENT_TYPE_HREF_LANG_LIST: ContentTypeField = {
    input_type: "list",
    input_label: "Alternative language versions",
    input_classname: "",
    input_id: "hreflangs",
    input_description: `rel="alternate" hreflang="en"`,
    data_namespace: "hreflangs",
    data_type: 'list',
    isRequired: false,
    input_props: {},
    check_json: false,
    is_json: false,
    in_search: false,
    list_config: [
        {
            item_namespace: "pathname",
            input_type: "text",
            input_label: "URL pathname",
            input_props: {},
            check_json: false,
            is_json: false,
            in_search: false,
            isRequired: true
        },
        {
            item_namespace: "lang",
            input_type: "text",
            input_label: "langcode",
            input_props: {},
            check_json: false,
            is_json: false,
            in_search: false,
            isRequired: true
        }
    ],
    custom_config: null
}

const CONTENT_TYPE_SLUG_ITEM = {
    ...ITEM_FRAGMENT_TEXT_REQUIRED,
    input_label: "DB sort key | slug",
    input_id: "sk-slug",
    input_description: "aZ-09, no whitespace",
    data_namespace: "sk",
}


const CONTENT_TYPE_ITEM_AUTHORS_LIST: ContentTypeField = {
    input_type: "list",
    input_label: "Authors",
    input_classname: "",
    input_id: "authors",
    input_description: "",
    data_namespace: "authors",
    data_type: 'list',
    isRequired: false,
    input_props: {},
    check_json: false,
    is_json: false,
    in_search: false,
    list_config: [
        {
            item_namespace: "author_name",
            input_type: "text",
            input_label: "Name",
            input_props: {},
            check_json: false,
            is_json: false,
            in_search: false,
            isRequired: true
            
        },
        {
            item_namespace: "author_url",
            input_type: "text",
            input_label: "URL",
            input_props: {},
            check_json: false,
            is_json: false,
            in_search: false,
            isRequired: false
        },
        {
            item_namespace: "author_type",
            input_type: "text",
            input_label: "Type (Person | Organization)",
            input_props: {},
            check_json: false,
            is_json: false,
            in_search: false,
            isRequired: true
        }
    ],
    custom_config: null
}

// structurd data / schema.org

const CONTENT_TYPE_ITEM_SCHEMA_ORG_ARTICLE_TYPE: ContentTypeField = {
    data_type: "string",
    input_type: "text",
    input_label: "schema.org article type",
    input_props: { defaultValue: "Article" },
    input_classname: "inp_1 grow",
    input_id: "schema_article_type",
    input_description: "BlogPosting | SocialMediaPosting | Article | AdvertiserContentArticle | NewsArticle | Report | SatiricalArticle | ScholarlyArticle | TechArticle | AnalysisNewsArticle | BackgroundNewsArticle | OpinionNewsArticle | ReportageNewsArticle | ReviewNewsArticle",
    data_namespace: "schema_article_type",
    isRequired: false
}

const CONTENT_TYPE_ITEM_MAIN_KEYWORD: ContentTypeField = {
    data_type: "string",
    input_type: "text",
    input_label: "Main keyword",
    input_classname: "inp_1 grow",
    input_id: "main-keyword",
    input_description: "",
    data_namespace: "main_keyword",
    isRequired: false
}

const CONTENT_TYPE_ITEM_ADDITIONAL_KEYWORDS: ContentTypeField = {
    input_type: "list",
    input_label: "Alternative keywords",
    input_classname: "",
    input_id: "alternative_keywords",
    input_description: "",
    data_namespace: "alternative_keywords",
    data_type: 'list',
    isRequired: false,
    input_props: {},
    check_json: false,
    is_json: false,
    in_search: false,
    list_config: [
        {
            item_namespace: "tag",
            input_type: "text",
            input_label: "Alternative keyword",
            input_props: {},
            check_json: false,
            is_json: false,
            in_search: false,
            isRequired: true
        }
    ],
    custom_config: null
}

// faq

const CONTENT_TYPE_ITEM_FAQ_TITLE: ContentTypeField = { // OKK
    data_type: "string",
    input_type: "text",
    input_label: "FAQ block title",
    input_classname: "inp_1 grow",
    input_id: "faq-title",
    input_description: "",
    data_namespace: "faq_title",
    isRequired: false
}

const CONTENT_TYPE_ITEM_FAQ_DESCRIPTION: ContentTypeField = { // OKK
    data_type: "string",
    input_type: "textarea",
    input_label: "FAQ block description",
    input_classname: "inp_1 grow resize w-full",
    input_props: { rows: 2 },
    input_id: "faq-description",
    input_description: "simple markdown",
    data_namespace: "faq_description",
    isRequired: false
}

const CONTENT_TYPE_ITEM_FAQ_QUESTION_ANSWER_PAIRS: ContentTypeField = {
    input_type: "list",
    input_label: "FAQ question & answer pairs",
    input_classname: "",
    input_id: "faq_qa_pairs",
    input_description: "",
    data_namespace: "faq_qa_pairs",
    data_type: 'list',
    isRequired: true,
    input_props: {},
    check_json: false,
    is_json: false,
    in_search: false,
    list_config: [
        {
            item_namespace: "q",
            input_type: "text",
            input_label: "Question",
            input_props: {},
            check_json: false,
            is_json: false,
            in_search: false,
            isRequired: true
        },
        {
            item_namespace: "a",
            input_type: "textarea",
            input_label: "Answer (simple markdown)",
            input_classname: "inp_1 grow resize w-full",
            input_props: { rows: 3 },
            check_json: false,
            is_json: false,
            in_search: false,
            isRequired: true
        },
        {
            item_namespace: "item_display_position",
            input_type: "number",
            input_label: "Position in list, the higher the value, the more on top",
            input_props: {},
            check_json: false,
            is_json: false,
            in_search: false,
            isRequired: true
        },
    ],
    custom_config: null
}

// ----

const CONTENT_TYPE_ITEM_RELATED_POSTS: ContentTypeField = {
    input_type: "list",
    input_label: "Blog posts list",
    input_classname: "",
    input_id: "related_posts_list",
    input_description: "",
    data_namespace: "related_posts_list",
    data_type: 'list',
    isRequired: false,
    input_props: {},
    check_json: false,
    is_json: false,
    in_search: false,
    list_config: [
        {
            item_namespace: "sk",
            input_type: "text",
            input_label: "DB sort key / slug",
            input_props: {},
            check_json: false,
            is_json: false,
            in_search: false,
            isRequired: true
        },
        {
            item_namespace: "pk",

            input_type: "text",
            input_label: "DB primary key (BP#en for articles)",
            input_props: {},
            check_json: false,
            is_json: false,
            in_search: false,
            isRequired: true
        },
        {
            item_namespace: "item_display_position",
            input_type: "number",
            input_label: "Position in list, the higher the value, the more on top",
            input_props: {},
            check_json: false,
            is_json: false,
            in_search: false,
            isRequired: true
        },
    ],
    custom_config: null
}



const CONTENT_TYPE_ITEM_BLOG_POST_MAIN_IMAGE: ContentTypeField = {
    input_type: "custom_image",
    input_label: "Main image (Image Type 1)",
    input_classname: "",
    input_id: "main_image",
    input_description: "",
    data_namespace: "main_image",
    data_type: 'json',
    isRequired: false,
    input_props: {},
    list_config: [],
    check_json: true,
    is_json: true,
    in_search: false,
    custom_config: {
        is_active: false,
        data_keys: ["src", "width", "height", "alt", "srcSet", "jpgFallbacks", "license_name", "license_url", "author_name", "author_url", "author_type"]
    }
}

// GROUPS

const CONTENT_TYPE_ITEMS_GROUP_COMMONS_META_DATA = {
    group_title: "SEO Metadata",
    group_description: "Page metadata",
    children: [
        CONTENT_TYPE_ITEM_TITLE,
        CONTENT_TYPE_ITEM_META_DESCRIPTION,
        CONTENT_TYPE_ITEM_MAIN_KEYWORD,
        CONTENT_TYPE_ITEM_ADDITIONAL_KEYWORDS,
        CONTENT_TYPE_ITEM_SCHEMA_ORG_ARTICLE_TYPE,
        CONTENT_TYPE_ITEM_READING_TIME_IN_MINS
    ]
}

const CONTENT_TYPE_ITEMS_GROUP_STATIC_PAGE_META_DATA = {
    group_title: "SEO Metadata",
    group_description: "Page metadata",
    children: [
        CONTENT_TYPE_ITEM_TITLE,
        CONTENT_TYPE_ITEM_META_DESCRIPTION,
        CONTENT_TYPE_ITEM_OG_IMAGE
    ]
}

const CONTENT_TYPE_ITEMS_GROUP_DATES = {
    group_title: "Dates",
    group_description: "",
    children: [
        CONTENT_TYPE_ITEM_DATE_TIME_PUBLISHED,
        CONTENT_TYPE_ITEM_DATE_TIME_MODIFIED,
    ]
}

const CONTENT_TYPE_ITEMS_GROUP_IMAGES = {
    group_title: "Images",
    group_description: "Main article, og, preview and thumbnail images",
    children: [
        CONTENT_TYPE_ITEM_BLOG_POST_MAIN_IMAGE,
        CONTENT_TYPE_ITEM_OG_IMAGE
    ]
}

const CONTENT_TYPE_ITEMS_GROUP_COMMONS_BODY = {
    group_title: "Article body",
    group_description: "",
    children: [
        CONTENT_TYPE_ITEM_EYEBROW,
        CONTENT_TYPE_ITEM_H1_TITLE,
        CONTENT_TYPE_ITEM_LEAD,
        CONTENT_TYPE_ITEM_BODY
    ]
}

const CONTENT_TYPE_ITEMS_GROUP_COMMONS_BODY_TOP = {
    group_title: "Article body",
    group_description: "",
    children: [
        CONTENT_TYPE_ITEM_BODY,
        CONTENT_TYPE_ITEM_BODY_TOP
    ]
}

const CONTENT_TYPE_ITEMS_GROUP_FAQ_BLOCK = {
    group_title: "FAQ Block",
    group_description: "Category FAQ block",
    children: [
        CONTENT_TYPE_ITEM_FAQ_TITLE,
        CONTENT_TYPE_ITEM_FAQ_DESCRIPTION,
        CONTENT_TYPE_ITEM_FAQ_QUESTION_ANSWER_PAIRS
    ]
}

const CONTENT_TYPE_ITEMS_FOR_STATIC = {
    group_title: "DB Key",
    group_description: "",
    children: [
        CONTENT_TYPE_SLUG_ITEM
    ]
}


const CONTENT_TYPE_ITEMS_BLOG_AUTHOR = {
    group_title: "Authors",
    group_description: "",
    children: [
        CONTENT_TYPE_ITEM_AUTHORS_LIST
    ]
}

const CONTENT_TYPE_ITEMS_FOR_BLOG_POST = {
    group_title: "Blog post",
    group_description: "URL slug /blogs/<url-slug>",
    children: [
        CONTENT_TYPE_SLUG_ITEM,
        CONTENT_TYPE_HREF_LANG_LIST,
        CONTENT_TYPE_ITEM_TAGS_LIST
    ]
}

const CONTENT_TYPE_ITEMS_RELATED_POSTS = {
    group_title: "Related posts",
    group_description: "",
    children: [
        CONTENT_TYPE_ITEM_RELATED_POSTS
    ]
}

const CONTENT_TYPE_PAGE_STATIC = {
    type_namespace: "PS",
    type_label: "Static Page",
    children: [
        CONTENT_TYPE_ITEMS_GROUP_STATIC_PAGE_META_DATA,
        CONTENT_TYPE_ITEMS_FOR_STATIC,
        CONTENT_TYPE_ITEMS_GROUP_COMMONS_BODY_TOP
    ]
}

const CONTENT_TYPE_BLOG_POST = {
    type_namespace: "BP",
    type_label: "Blog post",
    children: [
        CONTENT_TYPE_ITEMS_GROUP_COMMONS_META_DATA,
        CONTENT_TYPE_ITEMS_GROUP_DATES,
        CONTENT_TYPE_ITEMS_BLOG_AUTHOR,
        CONTENT_TYPE_ITEMS_GROUP_IMAGES,
        CONTENT_TYPE_ITEMS_FOR_BLOG_POST,
        CONTENT_TYPE_ITEMS_GROUP_COMMONS_BODY,
        CONTENT_TYPE_ITEMS_GROUP_FAQ_BLOCK,
        CONTENT_TYPE_ITEMS_RELATED_POSTS
    ]
}



export const CONTENT_TYPES: ContentType[] = [
    CONTENT_TYPE_PAGE_STATIC,
    CONTENT_TYPE_BLOG_POST
]