import type { DBBase, DBIGBase, DBILFull } from "./data"
import type { initStates } from "~/ui/cms/cms_states"
import type { authSchema } from "./z_schemes";
import type { HTMLInputTypeAttribute, HTMLProps } from "react";


type Auth = z.infer<typeof authSchema>;

type ReducerAction = {
    type: "update_val" | "change_bool" | "reset_proc_cui" | "add_items_to_arr"
    | "add_item_to_obj" | "reset_internal_clipboards" | "upate_val_many"
    key?: keyof typeof initStates
    value?: typeof initStates[keyof typeof initStates] | unknown | Record<string, string
        | boolean | number>
}

type ImageMimeType = 'image/png' | "image/jpeg" | "image/webp"

type SpecsForFilesToUpload = {
    mimeType: ImageMimeType
    pathTo: string,
    width: number,
    aspect: number,
    signedUrl?: string,
    imgUrl?: string
    ok?: boolean
    id?: string
}

// create upload images process
type PROC_CUI_STATES = {
    proc_cui_image_src: null | string,
    proc_cui_crop: { x: number, y: number },
    proc_cui_rotation: number,
    proc_cui_zoom: number,
    proc_cui_cropped_area_pixels: null | Area,
    proc_cui_aspect: number,
    proc_cui_mime_type: null | ImageMimeType
    proc_cui_suffix: null | "png" | "jpg" | "webp"
    proc_cui_width: null | number
    proc_cui_specs_for_files_to_upload: SpecsForFilesToUpload[],
    proc_cui_meta_alt: null | Record<string, string>
    proc_cui_meta_fig_caption: null | Record<string, string>
    proc_cui_meta_author_name: null | string
    proc_cui_meta_author_url: null | string
    proc_cui_meta_author_type: null | "Person" | "Organization"
    proc_cui_meta_license_name: null | string
    proc_cui_meta_license_url: null | string
    proc_cui_meta_tag: [string, string][] // value, id
    ui_cui_show_line_1: boolean
    ui_cui_show_line_2: boolean
    ui_cui_show_line_3: boolean
    proc_cui_progress: number
    proc_cui_progress_counter_1: number[] // [current/total]
    proc_cui_step: number
}


type FP_STATES = {
    ui_fp_data_feed: DBBase[]
    ui_fp_data_feed_last_key: null | string
    ui_fp_data_feed_filters: null | string

    ui_fp_data_feed_last_key_sk: null,
    ui_fp_data_feed_last_key_created_at: null | number

    proc_fp_progress_is_deleting_file: boolean
    proc_fp_progress_s3_deleted: number
    proc_fp_progress_db_deleted: number
}

// image gallery
type IG_STATES = {
    ui_ig_data_feed: DBIGBase[]
    ui_ig_data_feed_last_key: null,
    ui_ig_data_feed_last_key_sk: null,
    ui_ig_data_feed_last_key_created_at: null | number
    ui_ig_data_feed_filters: null | string
    ui_ig_data_item_details: Record<DBILFull["sk"], DBILFull>
    ui_ig_show_item: null | string
    proc_ig_progress_is_deleting_image: boolean
    proc_ig_progress_s3_deleted: number
    proc_ig_progress_db_deleted: number
}

// states of main cms components
type UI_STATES = {
    ui_show_image_upload: boolean
    ui_show_image_gallery: boolean
    ui_show_file_panel: boolean
    ui_show_create_custom_markup: boolean
    ui_show_translate_article_or_page: boolean
    ui_show_copied_to_clipboard: boolean

    ui_show_markup_generator: boolean

    // ui_show_help: boolean
    ui_show_file_upload: boolean
    ui_navbar_open: boolean



    ui_window_width: number
    ui_window_height: number
    ui_breadcrumb_text: string
    ui_show_item_saved_to_db: boolean
}

type HELPER_STATES = {
    // temporary storages, used to move data from image gallery to article / page editor
    internal_clipboard_1: null | DBBase
    internal_clipboard_2: null | DBBase
    // used for ui_help / HELP_STATES, CMS step by step tour
    internal_clipboard_3: null | { current: string }
}

type EDITOR_STATES = {
    proc_main_image: null | DBILFull
    // proc_article_images: [] | DBILFull[] // dev
    proc_article_images: Record<DBBase["sk"], DBILFull> // dev
    proc_is_choosing_main_image: boolean
    proc_is_choosing_article_image: boolean // dev
}



interface ContentTypeListChild {
    item_namespace: string
    input_type: HTMLInputTypeAttribute | "textarea" | "custom_image" | "custom_date_time" | "list"
    input_label?: string
    input_props?: HTMLProps
    isRequired?: boolean
    input_classname?: string
    is_json?: boolean
    in_search?: boolean
    check_json?: boolean
    custom_config?:unknown

}


type ContentTypeField = {
    input_type: HTMLInputTypeAttribute | "textarea" | "custom_image" | "custom_date_time" | "list"
    data_type: 'string' | "json" | "boolean" | "number" | "list"
    data_namespace: string
    input_id: string

    input_label?: string
    input_props?: HTMLProps
    isRequired?: boolean
    input_classname?: string
    is_json?: boolean
    in_search?: boolean
    check_json?: boolean
    input_description?: string
    list_config?: ContentTypeListChild[]
    custom_config?: {
        item_namespace?: string
        select_items?: [string, string][]
        placeholder?: string
        data_keys?: null | string[]
        is_active?: null | boolean
    } | null
}


type ContentTypeGroup = {
    group_title: string
    group_description?: string
    children: ContentTypeField[]
}


type ContentType = {
    type_namespace: string
    type_label: string
    children: ContentTypeGroup[]
}