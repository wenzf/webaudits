import { createContext, useContext, useReducer } from 'react';
import type { Dispatch, ReactNode, Reducer } from 'react'

import type {
    EDITOR_STATES, FP_STATES, HELPER_STATES, IG_STATES, PROC_CUI_STATES,
    ReducerAction, UI_STATES
} from './cms';
import type { DBBase } from '../../types/site';


// prevent duplicates
function addUniqueDBItems(
    existingArray: DBBase[],
    newObjects: DBBase[]
): DBBase[] {
    const existingSks = new Set(existingArray.map((obj) => obj.sk));
    const uniqueNewObjects = newObjects.filter((obj) => !existingSks.has(obj.sk));
    return [...existingArray, ...uniqueNewObjects];
}


const fp_init: FP_STATES = {
        ui_fp_data_feed: [],
        ui_fp_data_feed_last_key: null ,
        ui_fp_data_feed_filters: "[]",
        proc_fp_progress_is_deleting_file: false,
        proc_fp_progress_s3_deleted: 0,
        proc_fp_progress_db_deleted: 0,
            ui_fp_data_feed_last_key_sk: null,
    ui_fp_data_feed_last_key_created_at: null 
}



const ig_init: IG_STATES = {
    ui_ig_data_feed: [],
    ui_ig_data_feed_last_key: null,
    ui_ig_data_feed_last_key_sk: null,
    ui_ig_data_feed_last_key_created_at: null,
    ui_ig_data_feed_filters: "[]",
    ui_ig_data_item_details: {},
    ui_ig_show_item: null,
    proc_ig_progress_is_deleting_image: false,
    proc_ig_progress_s3_deleted: 0,
    proc_ig_progress_db_deleted: 0,
}

const proc_cui_init: PROC_CUI_STATES = {
    proc_cui_image_src: null,
    proc_cui_crop: { x: 0, y: 0 },
    proc_cui_rotation: 0,
    proc_cui_zoom: 1,
    proc_cui_cropped_area_pixels: null,
    proc_cui_aspect: 1.778,
    proc_cui_mime_type: null,
    proc_cui_suffix: null,
    proc_cui_width: null,
    proc_cui_specs_for_files_to_upload: [],
    proc_cui_meta_alt: null,
    proc_cui_meta_fig_caption: null,
    proc_cui_meta_author_name: null,
    proc_cui_meta_author_url: null,
    proc_cui_meta_author_type: "Person",
    proc_cui_meta_license_name: null,
    proc_cui_meta_license_url: null,
    proc_cui_meta_tag: [],
    ui_cui_show_line_1: true,
    ui_cui_show_line_2: false,
    ui_cui_show_line_3: false,
    proc_cui_progress: 0,
    proc_cui_progress_counter_1: [],
    proc_cui_step: 0
}

const ui_init: UI_STATES = {
    ui_show_image_upload: false,
    ui_show_image_gallery: false,
    ui_show_file_panel: false,
    ui_show_create_custom_markup: false,
    ui_show_translate_article_or_page: false,
    ui_show_copied_to_clipboard: false,
    ui_show_item_saved_to_db: false,
    ui_show_markup_generator:false,
    ui_navbar_open: false,
    ui_show_file_upload: false,
    ui_window_width: 0,
    ui_window_height: 0,
    ui_breadcrumb_text: ""

}

const helper_states: HELPER_STATES = {
    internal_clipboard_1: null,
    internal_clipboard_2: null,
    internal_clipboard_3: null,
}

const editor_init: EDITOR_STATES = {
    proc_main_image: null,
    proc_article_images: {},
    proc_is_choosing_main_image: false,
    proc_is_choosing_article_image: false
}



export const initStates = {
    ...fp_init,
    ...ui_init,
    ...proc_cui_init,
    ...ig_init,
    ...helper_states,
    ...editor_init,
}

const CMSContext = createContext<null | [typeof initStates, Dispatch<ReducerAction>]>(null);

const reducer: Reducer<typeof initStates, ReducerAction> = (state, action) => {
    switch (action.type) {
        case 'update_val':
            if (action.value && action.key) return { ...state, [action.key]: action.value };
        case 'change_bool':
            // @ts-expect-error todo
            if (action.key) return { ...state, [action.key]: !(state[action.key]) }
        case 'reset_proc_cui':
            return { ...state, ...proc_cui_init }
        case 'add_items_to_arr':
            // @ts-expect-error todo
            if (action.key && Array.isArray(state[action.key]) && Array.isArray(action.value)) {
                // @ts-expect-error todo
                return { ...state, [action.key]: addUniqueDBItems(state[action.key] as [], action.value as []) }
            }
        case "add_item_to_obj":
            // @ts-expect-error todo
            if (action.key && action.key in state && typeof state[action.key] === "object") {
                return {
                    ...state, [action.key]: {
                        // @ts-expect-error todo
                        ...state[action.key] as object,
                        ...action.value as object
                    }
                }
            }

        case "reset_internal_clipboards":
            return { ...state, ...helper_states }

        case "upate_val_many":
            const many = action.value as Record<string, string | boolean | number | null | unknown>
            return { ...state, ...many }

        default:
            return state;
    }
};



export function CMSStatesProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initStates);
    return (
        <CMSContext.Provider value={[
            state,
            dispatch
        ]}>
            {children}
        </CMSContext.Provider>
    );
}


export function useCMSStates() {
    const context = useContext(CMSContext);
    if (!context) throw new Error(`Hook must be used within a Provider`);
    return context;
}
