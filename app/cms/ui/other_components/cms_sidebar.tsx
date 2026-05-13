import {
    Fragment, type ButtonHTMLAttributes,
    type HTMLAttributes, type RefAttributes
} from "react";
import {
    NavLink, useParams, useRouteLoaderData,
    type NavLinkProps
} from "react-router";
import {
    DashboardIcon,
    ExitIcon,
    FilePlusIcon,
    GearIcon,
    HomeIcon,
    InfoCircledIcon
} from "@radix-ui/react-icons";
import clsx from "clsx";


import { useCMSStates } from "~/cms/cms_states";
import { createLangPathByParam } from "~/common/shared/lang";
import TooltipButton from "../radix/radix_tooltip_button";

import CMS_CONFIG from "~/cms/cms.config";
import PostAddIcon from "~/cms/assets/icons/icon_post_add";
import ImageArrowUpIcon from "~/cms/assets/icons/icon_image_arrow_up";
import PhotoLibraryIcon from "~/cms/assets/icons/icon_photo_library";
import DataObjectIcon from "~/cms/assets/icons/icon_data_object";
import DatabaseIcon from "~/cms/assets/icons/icon_databse";
import FileCopyIcon from "~/cms/assets/icons/icon_file_copy";
import LeftPanelCloseIcon from "~/cms/assets/icons/icon_left_panel_close";
import LeftPanelOpenIcon from "~/cms/assets/icons/icon_left_panel_open";




export default function CMSSidebar() {
    const { lang } = useParams()
    const [{ ui_navbar_open, ui_show_image_gallery, ui_show_file_panel,
        ui_show_markup_generator }, setCMSStates] = useCMSStates()

    const { locTxt: {
        nav_labels: { nl_logout },
        sidebar_labels: {
            sbl_label_main,
            sbl_title_documents,
            sbl_label_documents,
            sbl_title_files,
            sbl_label_general_files,
            sbl_label_image_files,
            sbl_label_image_library,
            sbl_title_data,
            sbl_label_data,
            sbl_title_cms,
            sbl_label_cms,
            sbl_label_images,
            sbl_label_files_panel,
            sbl_label_info
        }
    } } = useRouteLoaderData('cms/routes/layouts/cms_root_layout')

    const { URL_FRAGMENTS: { UF_LOGOUT, UF_CMS, UF_EDITOR,
        UF_CMS_SETTINGS, UF_DATABSE, UF_CMS_INFOS } } = CMS_CONFIG


    const sidebarItems: {
        type: "navlink" | "button" | "title",
        Icon?: React.ExoticComponent | any,
        title?: string
        expanded_description?: string
        tooltip_text?: string,
        wrapper_classname?: string,
        trigger_props?: HTMLAttributes<HTMLButtonElement>
        | ButtonHTMLAttributes<HTMLButtonElement>
        | NavLinkProps & RefAttributes<HTMLButtonElement>,
        id?: string
    }[] = [
            {
                type: "navlink",
                Icon: DashboardIcon,
                trigger_props: { end: true, to: createLangPathByParam(lang, `/${UF_CMS}`) },
                tooltip_text: sbl_label_main,
                expanded_description: sbl_label_main
            },
            {
                type: "title",
                title: sbl_title_documents
            },
            {
                type: "navlink",
                Icon: PostAddIcon,
                trigger_props: {
                    to: createLangPathByParam(lang, `/${UF_CMS}/${UF_EDITOR}/_/_`),
                    end: true,
                    reloadDocument: true,
                },
                tooltip_text: sbl_label_documents,
                expanded_description: sbl_label_documents
            },
            {
                type: "title",
                title: sbl_label_images
            },
            {
                type: "button",
                Icon: ImageArrowUpIcon,
                trigger_props: {
                    type: 'button',
                    onClick: () => setCMSStates({
                        type: 'change_bool',
                        key: 'ui_show_image_upload'
                    }),
                },
                tooltip_text: sbl_label_image_files,
                expanded_description: sbl_label_image_files
            },
            {
                type: "button",
                Icon: PhotoLibraryIcon,
                trigger_props: {
                    type: 'button',
                    onClick: () => setCMSStates({
                        type: 'change_bool',
                        key: 'ui_show_image_gallery'
                    }),
                },
                tooltip_text: sbl_label_image_library,
                expanded_description: sbl_label_image_library,
                id: 'imagelibrary'
            },
            {
                type: "title",
                title: sbl_title_files
            },
            {
                type: "button",
                Icon: FilePlusIcon,
                trigger_props: {
                    type: 'button',
                    onClick: () => setCMSStates({
                        type: 'change_bool',
                        key: 'ui_show_file_upload'
                    }),
                },
                tooltip_text: sbl_label_general_files,
                expanded_description: sbl_label_general_files
            },
            {
                type: "button",
                Icon: FileCopyIcon,
                trigger_props: {
                    type: 'button',
                    onClick: () => setCMSStates({
                        type: 'change_bool',
                        key: 'ui_show_file_panel'
                    }),
                },
                tooltip_text: sbl_label_files_panel,
                expanded_description: sbl_label_files_panel,
                id: "filepanel"
            },

            {
                type: "title",
                title: "SEO"
            },
            {
                type: "button",
                Icon: DataObjectIcon,
                trigger_props: {
                    type: 'button',
                    onClick: () => setCMSStates({
                        type: 'change_bool',
                        key: 'ui_show_markup_generator'
                    }),
                },
                tooltip_text: "ld+json Markup generator",
                expanded_description: "ld+json Markup generator",
                id: "markupGenerator"
            },
            {
                type: "title",
                title: sbl_title_data
            },
            {
                type: "navlink",
                Icon: DatabaseIcon,
                trigger_props: {
                    to: createLangPathByParam(lang, `/${UF_CMS}/${UF_DATABSE}`),
                },
                tooltip_text: sbl_label_data,
                expanded_description: sbl_label_data
            },
            {
                type: "title",
                title: sbl_title_cms
            },
            {
                type: "navlink",
                Icon: InfoCircledIcon,
                trigger_props: {
                    end: true,
                    to: createLangPathByParam(lang, `/${UF_CMS}/${UF_CMS_INFOS}`),
                },
                tooltip_text: sbl_label_info,
                expanded_description: sbl_label_info
            },
            {
                type: "navlink",
                Icon: GearIcon,
                trigger_props: {
                    end: true,
                    to: createLangPathByParam(lang, `/${UF_CMS}/${UF_CMS_SETTINGS}`),
                },
                tooltip_text: sbl_label_cms,
                expanded_description: sbl_label_cms
            },
            {
                wrapper_classname: "flex relative btn_logout",
                type: "navlink",
                Icon: ExitIcon,
                trigger_props: {
                    to: `/${UF_LOGOUT}`,
                    onClick: () => setCMSStates({ type: "change_bool", key: 'ui_show_help' }),
                },
                tooltip_text: nl_logout,
                expanded_description: nl_logout
            }
        ]


    return (
        <aside className={
            clsx(" bg-neutral-100 dark:bg-neutral-900  will-change-[width] overflow-y-hidden",
                { "w-full sm:w-64": ui_navbar_open, "w-12": !ui_navbar_open }
            )}>

            <div className={clsx("bg-neutral-100 dark:bg-neutral-900 will-change-[width] h-screen z-50 fixed left-0 top-0 overflow-y-auto overflow-x-hidden pb-12 border-r border-r-neutral-200 dark:border-r-neutral-800",
                { "w-full sm:w-64": ui_navbar_open, 'w-12': !ui_navbar_open }
            )}>
                <div className="flex p-2 gap-4 flex-col lg:flex-row">
                    <NavLink to="/" className={clsx('btn_1 icon small')} viewTransition>
                        <HomeIcon width={20} height={20} aria-hidden />
                    </NavLink>

                    <button className={clsx("btn_1 icon small lg:fixed lg:top-2",
                        { 'left-14': !ui_navbar_open, 'left-54': ui_navbar_open }
                    )}
                        onClick={() => setCMSStates({
                            type: "change_bool",
                            key: "ui_navbar_open"
                        })}
                    >
                        {ui_navbar_open ? (
                            <LeftPanelCloseIcon width={20} height={20} aria-hidden />
                        ) : (
                            <LeftPanelOpenIcon width={20} height={20} aria-hidden />
                        )}
                    </button>
                </div>

                <div className="flex flex-col p-2 gap-2">
                    <nav className={clsx('flex flex-col gap-2 relative ')}>
                        <div className={clsx(
                            { '-mt-2': !ui_navbar_open, 'mt-4': ui_navbar_open }
                        )} />

                        {sidebarItems.map((it, ind) => (
                            <Fragment key={ind}>
                                {(it.type === "button" || it.type === "navlink") && (
                                    <div className={it?.wrapper_classname ? it?.wrapper_classname : 'flex relative'}>
                                        <TooltipButton
                                            isNavLink={it.type === "navlink"}
                                            rootProps={ui_navbar_open ? { onOpenChange: () => { }, open: false } : {}}
                                            contentProps={{ side: 'right' }}
                                            tooltipText={it.tooltip_text}
                                            triggerProps={{
                                                ...it.trigger_props,
                                                className: clsx('btn_1 icon small', {
                                                    "with_ring":
                                                        (it?.id === "imagelibrary" && ui_show_image_gallery)
                                                        || (it?.id === "filepanel" && ui_show_file_panel)
                                                        || (it?.id === "markupGenerator" && ui_show_markup_generator)
                                                }),
                                            }}
                                        >
                                            {it.Icon && <it.Icon width={20} height={20} aria-label={it.tooltip_text} />}
                                        </TooltipButton>
                                        <div
                                            aria-hidden={!ui_navbar_open}
                                            className={
                                                clsx("absolute top-2/4 transform -translate-y-2/4 transform transition-transform duration-100 ease-linear text-sm text-left",
                                                    { 'opacity-0 translate-x-2 w-0': !ui_navbar_open },
                                                    { 'translate-x-14 ': ui_navbar_open }
                                                )}>
                                            {it.expanded_description}
                                        </div>
                                    </div>
                                )}
                                {it.type === "title" && (
                                    <div
                                        aria-hidden={!ui_navbar_open}
                                        className={
                                            clsx("text-sm overflow-hidden mt-4 h-6",
                                                { 'hidden': !ui_navbar_open }
                                            )
                                        }>
                                        {it.title}
                                    </div>
                                )}
                            </Fragment>
                        ))}
                    </nav>
                </div>
            </div>

        </aside>
    )
}