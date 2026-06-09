import { CheckIcon, UpdateIcon } from "@radix-ui/react-icons"
import * as Dialog from '@radix-ui/react-dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { useRouteLoaderData } from "react-router"

import { useCMSStates } from "~/cms/lib/cms_states"

export default function ImageDeleteProgress() {
    const [{ proc_ig_progress_is_deleting_image,
        proc_ig_progress_s3_deleted,
        proc_ig_progress_db_deleted, }
    ] = useCMSStates()

    if (!proc_ig_progress_is_deleting_image
        && (proc_ig_progress_s3_deleted !== 2
            && proc_ig_progress_db_deleted !== 2)

    ) return null


    const { locTxt: {
        crop_and_upload_images: {
            cui_delete_title,
            cui_delete_description,
            cui_delete_db_entry,
            cui_delete_files,
            cui_delete_done
        }
    } } = useRouteLoaderData('cms/lib/routes/layouts/cms_root_layout')

    return (

        <Dialog.Root open={true}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed z-[9998] inset-0 bg-neutral-50 dark:bg-neutral-950" />
                <Dialog.Content className='fixed -translate-x-2/4 -translate-y-2/4 w-[95vw] h-[95vh] left-2/4 top-2/4 z-[9999] overflow-auto bg-neutral-100 dark:bg-neutral-900 text-neutral-950 dark:text-neutral-50'>
                    <VisuallyHidden.VisuallyHidden>

                        <Dialog.Title>
                            {cui_delete_title}
                        </Dialog.Title>
                        <Dialog.Description>
                            {cui_delete_description}
                        </Dialog.Description>
                    </VisuallyHidden.VisuallyHidden>

                    <div className="max-w-lg p-2 absolute -translate-x-2/4 -translate-y-2/4 left-2/4 top-2/4 w-full cui_progress"
                        style={{ zIndex: 12 }}>
                        <h3 className="text-lg font-normal" >{cui_delete_title}</h3>
                        <div className="cui_progress_step flex">
                            <div>
                                {cui_delete_db_entry}
                            </div>

                            <div>
                                {proc_ig_progress_db_deleted > 1
                                    ? (
                                        <CheckIcon
                                            aria-hidden
                                            width={18}
                                            height={18}
                                        />
                                    ) : (
                                        <UpdateIcon
                                            aria-hidden
                                            width={18}
                                            height={18}
                                            className="ani_infinite_rotate"
                                        />
                                    )
                                }
                            </div>
                        </div>

                        <div className="cui_progress_step flex">
                            <div>
                                {cui_delete_files}
                            </div>
                            <div>
                                {proc_ig_progress_s3_deleted > 1
                                    ? <CheckIcon aria-hidden width={18} height={18} />
                                    : <UpdateIcon aria-hidden width={18} height={18}
                                        className="ani_infinite_rotate" />
                                }
                            </div>
                        </div>

                        <div className="cui_progress_step flex">
                            <div>
                                {cui_delete_done}
                            </div>
                            <div>
                                {proc_ig_progress_s3_deleted > 1
                                    && proc_ig_progress_db_deleted > 1
                                    ? <CheckIcon aria-hidden width={18} height={18} />
                                    : null}
                            </div>

                        </div>

                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}