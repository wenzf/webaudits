import { useFetcher, useRouteLoaderData } from "react-router"
import { CheckIcon, MinusIcon } from "@radix-ui/react-icons"
import clsx from "clsx";
import { useReducer } from "react";

import CMS_CONFIG from "../../cms.config";
import { useAuth } from "../../utils/auth/useAuth";
import { useCurrentURL } from "~/common/shared/hooks";


const { AUTH_CONFIG: { ADMIN_AUTH_LVL, GUEST_AUTH_LVL, MIN_AUTH_LVL_EDIT_RIGHTS,
    MIN_AUTH_LVL_CREATE_RIGHTS,
    MIN_AUTH_LVL_READ_RIGHTS,
    MIN_AUTH_LVL_USE_EXT_API_RIGHTS
}, EXTERNAL_APIS: { YOUTUBE_V3, DEEPL_V2 }, ROUTES_CONFIG: { C_CMS_SETTINGS: { pageHandle } } } = CMS_CONFIG


export const handle = {
    page: pageHandle
}


export function meta() {
    return [
        { title: 'CMS Settings' },
    ];
}


export default function CMSSettings() {
    const settingsFetchter = useFetcher({ key: 'settingsFetcher' })
    const auth = useAuth()
    const currentURL = useCurrentURL()

    const { settings } = useRouteLoaderData('root')

    let { locTxt: {
        account_cms_settings: {
            ac_is_admin,
            ac_is_guest,
            ac_account, ac_caption,
            ac_role,
            ac_rights,
            ac_read,
            ac_editing,
            ac_create,
            ac_ext_apis,
            ac_cms,
            ac_enabled_ext_apis
        } } } = useRouteLoaderData('cms/routes/layouts/cms_root_layout')


    const [{
        theme
    }, dispatch] = useReducer(((st, act) => {
        return {
            ...st,
            ...act.reduce((
                i: Record<string, unknown>,
                j: Record<string, unknown>
            ) => ({ ...i, ...j }), {})
        }
    }), {
        theme: settings.theme
    })



    const onChangeSettings = (key: string, value: string | number | boolean) => {
        if (typeof document === "object") {
            const doc = document.documentElement
            let additionalValue = {}
            if (key === "theme") {
                if (doc.classList.contains(theme)) doc.classList.replace(theme, value as string)
            }

            // else if (key === "font_size") {
            //     doc.style.fontSize = `${value}%`
            // } else if (key === "ui_high_contrast") {
            //     if (value) {
            //         doc.classList.add('contrast')
            //     } else {
            //         doc.classList.remove('contrast')
            //     }
            // } else if (key === "ui_grayscale") {
            //     if (value) {
            //         doc.classList.add('grayscale')
            //     } else {
            //         doc.classList.remove('grayscale')
            //     }
            // } else if (key === "show_images") {
            //     if (!value) additionalValue = { show_high_res_images: false }
            // }

            dispatch([{ [key]: value, ...additionalValue }])

            settingsFetchter.submit({
                payload: JSON.stringify({ [key]: value, ...additionalValue }),
                redirect_to: currentURL
            }, {
                method: "post",
                action: "/cms/actions/cu-settings",
                encType: "application/x-www-form-urlencoded"
            })
        }
    }


    return (
        <div className="max-w-2xl m-auto">

            <table className="table_1 style_1 mt-8 table-auto" width={"100%"}>
                <caption>{ac_caption}</caption>
                <tbody>
                    <tr>
                        <th rowSpan={7} colSpan={1}>{ac_account}</th>
                    </tr>
                    <tr>
                        <th colSpan={1} >{ac_role}</th>
                        <td colSpan={2}>
                            {auth === ADMIN_AUTH_LVL ? ac_is_admin : null}
                            {auth === GUEST_AUTH_LVL ? ac_is_guest : null}
                        </td>
                    </tr>
                    <tr>
                        <th rowSpan={5} colSpan={1}>{ac_rights}</th>
                    </tr>
                    <tr>
                        <th  >{ac_read}</th>
                        <td className="txt_al_c">
                            {auth >= MIN_AUTH_LVL_READ_RIGHTS ? <CheckIcon /> : <MinusIcon />}
                        </td>
                    </tr>
                    <tr>
                        <th>{ac_editing}</th>
                        <td className="txt_al_c">
                            {auth >= MIN_AUTH_LVL_EDIT_RIGHTS ? <CheckIcon /> : <MinusIcon />}
                        </td>
                    </tr>
                    <tr>
                        <th>{ac_create}</th>
                        <td className="txt_al_c">
                            {auth >= MIN_AUTH_LVL_CREATE_RIGHTS ? <CheckIcon /> : <MinusIcon />}
                        </td>
                    </tr>
                    <tr>
                        <th>{ac_ext_apis}</th>
                        <td className="txt_al_c">
                            {auth >= MIN_AUTH_LVL_USE_EXT_API_RIGHTS ? <CheckIcon /> : <MinusIcon />}
                        </td>
                    </tr>
                    <tr>
                        <th rowSpan={4} colSpan={1}>{ac_cms}</th>
                    </tr>
                    <tr>
                        <th rowSpan={3} >{ac_enabled_ext_apis}</th>
                    </tr>
                    <tr>
                        <th>Youtube V3</th>
                        <td className="txt_al_c">{YOUTUBE_V3 ? <CheckIcon /> : <MinusIcon />}</td>
                    </tr>
                    <tr>
                        <th>DeepL V2</th>
                        <td className="txt_al_c">{DEEPL_V2 ? <CheckIcon /> : <MinusIcon />}</td>
                    </tr>
                </tbody>
            </table>

            <div className="w-full my-9 border-t border-neutral-200 dark:border-neutral-800" />
            <div className='flex gap-4 w-full justify-between p-2 mt-8'>

                <span>
                    Theme
                </span>
                <div className='flex gap-2'>
                    <button
                        disabled={theme === "system"}
                        className={clsx("btn_1 reg", {
                            active: theme === "system"
                        })}
                        type="button"

                        onClick={() => onChangeSettings(
                            'theme', 'system')}
                    >
                        System
                    </button>

                    <button
                        disabled={theme === "light"}
                        className={clsx("btn_1 reg", {
                            active: theme === "light"
                        })}
                        type="button"
                        onClick={() => onChangeSettings(
                            'theme', 'light')}
                    >
                        Light
                    </button>

                    <button
                        disabled={theme === "dark"}
                        className={clsx("btn_1 reg", {
                            active: theme === "dark"
                        })}
                        type="button"
                        onClick={() => onChangeSettings(
                            'theme', 'dark')}
                    >
                        Dark
                    </button>
                </div>
            </div>

            <div className="w-full my-9 border-t border-neutral-200 dark:border-neutral-800" />

        </div>
    )
}