import { Suspense, useEffect, useState } from "react"
import { Outlet, useRouteLoaderData, useSearchParams } from "react-router"
import clsx from "clsx";

import { useCMSStates } from "~/cms/cms_states"
import { usePathHandle } from "~/common/shared/hooks";
import CMS_CONFIG from "~/cms/cms.config";
import Spinner from "~/common/ui/generics/g_spinner";

import MarkupGenerator from "~/cms/ui/markup_generator/cms_markup_generator.client";
import CUImain from "~/cms/ui/image_mgmt/crop_and_upload/cms_cui_main.client";
import ImageGalleryMain from "~/cms/ui/image_mgmt/gallery/cms_gallery_main.client";
import FilePanelMain from "~/cms/ui/file_mgmt/cms_file_panel.client";
import CMSFileUpload from "~/cms/ui/file_mgmt/cms_file_upload.client";
import RadixToast from "~/cms/ui/radix/radix_toast";
import CMSSidebar from "~/cms/ui/other_components/cms_sidebar";


export default function CMSStatesLayerLayout() {
    const [isClient, setIsClient] = useState(false)
    const [{
        ui_show_image_upload,
        ui_show_image_gallery,
        ui_show_copied_to_clipboard,
        ui_show_file_upload,
        ui_navbar_open,
        ui_window_width,
        ui_breadcrumb_text,
        ui_show_file_panel,
        ui_show_item_saved_to_db,
        ui_show_markup_generator
    }, setCMSStates] = useCMSStates()
    const [sps, setSps] = useSearchParams();

    let {
        locTxt: {
            toast_messages: {
                tm_post_published_details,
                tm_image_saved_details,
                tm_image_deleted_details,
                tm_post_deleted_details,
                tm_cppied_to_clipboard_title,
                tm_copied_to_clipobard_details
            },
            crumb_labels }
    } = useRouteLoaderData('cms/routes/layouts/cms_root_layout');

    let { locTxt: { toast_messages }
    } = useRouteLoaderData('cms/routes/layouts/cms_root_layout');

    const clearSearchParams = () => {
        setSps((prev) => {
            prev.delete('tempMsgTitle')
            prev.delete('tempMsgDescription')
            prev.delete('tempMsgUrl')
            return prev
        }, { preventScrollReset: true })
    }

    const onCloseToast = () => {
        setCMSStates({ type: "update_val", key: "ui_show_copied_to_clipboard", value: false })
    }

    useEffect(() => {
        setIsClient(true)
        const document_element = document.documentElement
        function getComponentHeight() {
            if (document_element) {
                const height = document_element.offsetHeight;
                const width = document_element.offsetWidth

                setCMSStates({
                    type: "upate_val_many",
                    value: {
                        ui_window_width: width,
                        ui_window_height: height
                    }
                })
            }
        }

        if (typeof window === "object" && typeof document === "object") {
            document_element.classList.add('is_cms')
            getComponentHeight();
            window.addEventListener('resize', getComponentHeight);
        }

        return () => {
            if (typeof window === "object" && typeof document === "object") {
                document_element.classList.remove('is_cms');
                document_element.removeEventListener('resize', getComponentHeight);
            }
        }
    }, [])

    useEffect(() => {
        if (typeof window === "object" && typeof document === "object") {

            const document_element = document.documentElement
            const isOverflowHidden = document_element.classList.contains('overflow-hidden')
            if (ui_window_width < 640 && ui_navbar_open && !isOverflowHidden) {
                document_element.classList.add('overflow-hidden')
            } else if (isOverflowHidden) {
                document_element.classList.remove('overflow-hidden')
            }
        }

    }, [ui_window_width, ui_navbar_open])

    const handle = usePathHandle()

    useEffect(() => {
        if (handle) {
            try {
                // @ts-expect-error should be ok
                setCMSStates({ type: "update_val", key: "ui_breadcrumb_text", value: crumb_labels[CMS_CONFIG.ROUTES_CONFIG[handle].crumbLabel] })
            } catch {
                setCMSStates({ type: "update_val", key: "ui_breadcrumb_text", value: "" })
            }
        }
    }, [handle])


    return (
        <>

            <CMSSidebar />
            <h1 className={clsx("absolute p-1 xl:fixed z-40 left-0 top-2 transform font-semibold text-neutral-800  dark:text-neutral-200 rounded text-xl", {
                'translate-x-14 lg:translate-x-26': !ui_navbar_open,
                'translate-x-68 lg:translate-x-68': ui_navbar_open
            })}>
                {ui_breadcrumb_text}
            </h1>

            <main className={clsx("mt-12 w-full",
                {
                    "max-w-[calc(100vw_-_17rem)]": ui_navbar_open,
                    "max-w-[calc(100vw_-_4rem)]": !ui_navbar_open
                })}>

                <Outlet />
            </main>


            {ui_show_markup_generator && (
                <MarkupGenerator />
            )}

            {ui_show_image_upload && (
                <CUImain />
            )}

            {ui_show_image_gallery && (
                <ImageGalleryMain />
            )}

            {ui_show_file_panel && (
                <FilePanelMain />
            )}


            {ui_show_file_upload && (

                <CMSFileUpload />
            )}

            {isClient && sps.get('tempMsgTitle') && (
                <Suspense fallback={null}>
                    <RadixToast
                        onCloseCallback={clearSearchParams}
                        title={toast_messages[sps.get('tempMsgTitle') ?? '']}
                        details={
                            sps.get('tempMsgTitle') === "tm_post_published_title"
                                ? tm_post_published_details?.replace('{{placeholder}}',
                                    sps.get('tempMsgDescription')) ?? ''
                                : sps.get('tempMsgTitle') === "tm_post_deleted_title"
                                    ? tm_post_deleted_details?.replace('{{placeholder}}',
                                        sps.get('tempMsgDescription')) ?? ''
                                    : sps.get('tempMsgTitle') === "tm_image_saved_title"
                                        ? tm_image_saved_details ?? ''
                                        : sps.get('tempMsgTitle') === "tm_image_deleted_title"
                                            ? tm_image_deleted_details?.replace('{{placeholder}}',
                                                sps.get('tempMsgDescription')) ?? ''
                                            : ''
                        }
                        url={sps.get('tempMsgUrl') ?? undefined}
                    />
                </Suspense>
            )}

            {(isClient && ui_show_copied_to_clipboard) && (
                <Suspense fallback={null}>
                    <RadixToast
                        onCloseCallback={onCloseToast}
                        title={tm_cppied_to_clipboard_title}
                        details={tm_copied_to_clipobard_details}
                    />
                </Suspense>
            )}

            {(isClient && ui_show_item_saved_to_db) && (
                <Suspense fallback={null}>
                    <RadixToast
                        title={"Saved"}
                        details={"DB has been updated succesfully"}
                    />
                </Suspense>
            )}

            <Spinner />
        </>
    )
}