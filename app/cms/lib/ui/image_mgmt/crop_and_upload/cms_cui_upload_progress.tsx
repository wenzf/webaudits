import { CheckIcon, UpdateIcon } from "@radix-ui/react-icons"
import * as Dialog from '@radix-ui/react-dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'


import { useRouteLoaderData } from "react-router"
import { useCMSStates } from "~/cms/lib/cms_states"


export default function CUIProgress() {
    const [{ proc_cui_progress, proc_cui_progress_counter_1 }
    ] = useCMSStates()

    const { locTxt: {
        crop_and_upload_images: {
            cui_upl_prog_title,
            cui_upl_prog_description,
            cui_upl_prog_preparing_uploads,
            cui_upl_prog_uploading,
            cui_upl_prog_store_to_db,
            cui_upl_prog_done
        }
    }
    } = useRouteLoaderData('cms/lib/routes/layouts/cms_root_layout')

    if (proc_cui_progress < 1) return null

    return (
        <Dialog.Root open={true}>
            <Dialog.Portal>
                <Dialog.Overlay className="bg-neutral-50 dark:bg-neutral-950 fixed z-[102] inset-0" />
                <Dialog.Content className='component_as_modal fixed -translate-x-2/4 -translate-y-2/4 w-[95vw] h-[95vh] left-2/4 top-2/4 z-[111] overflow-auto bg-neutral-100 dark:bg-neutral-900 text-neutral-950 dark:text-neutral-50 rounded'>
                    <VisuallyHidden.VisuallyHidden>
                        <Dialog.Title>
                            {cui_upl_prog_title}
                        </Dialog.Title>
                        <Dialog.Description>
                            {cui_upl_prog_description}
                        </Dialog.Description>
                    </VisuallyHidden.VisuallyHidden>

                    <div className="max-w-lg p-2 absolute -translate-x-2/4 -translate-y-2/4 left-2/4 top-2/4 w-full cui_progress"
                        style={{ zIndex: 12, minWidth: '250px' }}>
                        <h3 style={{
                            fontSize: '1.125rem',
                            fontWeight: 'normal'
                        }}>{cui_upl_prog_title}</h3>
                        <div className="cui_progress_step flex gap-4 items-center justify-center col_gray_11">
                            <div>
                                {cui_upl_prog_preparing_uploads}
                            </div>
                            <div>
                                {proc_cui_progress > 1 && (
                                    <CheckIcon
                                        aria-hidden width={18}
                                        height={18} />
                                )}
                                {proc_cui_progress === 1 && (
                                    <UpdateIcon
                                        aria-hidden
                                        width={18}
                                        height={18}
                                        className="ani_infinite_rotate" />
                                )}
                            </div>
                        </div>

                        <div className="cui_progress_step flex gap-4 items-center justify-center col_gray_11">
                            <div>
                                {cui_upl_prog_uploading}
                            </div>
                            <div>
                                {(proc_cui_progress > 1
                                    && proc_cui_progress_counter_1?.length) && (
                                        <code>
                                            {proc_cui_progress_counter_1[0]}/{proc_cui_progress_counter_1[1]}{' '}
                                        </code>
                                    )}

                                {proc_cui_progress > 2 && (
                                    <CheckIcon
                                        aria-hidden
                                        width={18}
                                        height={18}
                                    />)}
                                {proc_cui_progress === 2 && (
                                    <UpdateIcon
                                        aria-hidden
                                        width={18}
                                        height={18}
                                        className="ani_infinite_rotate" />
                                )}
                            </div>
                        </div>
                        <div className="cui_progress_step flex gap-4 items-center justify-center col_gray_11">
                            <div>
                                {cui_upl_prog_store_to_db}
                            </div>
                            <div>
                                {proc_cui_progress > 3 && (
                                    <CheckIcon
                                        aria-hidden
                                        width={18}
                                        height={18}
                                    />)}
                                {proc_cui_progress === 3 && (
                                    <UpdateIcon
                                        aria-hidden
                                        width={18}
                                        height={18}
                                        className="ani_infinite_rotate"
                                    />
                                )}
                            </div>
                        </div>
                        <div className="cui_progress_step flex gap-4 items-center justify-center col_gray_11">
                            <div>
                                {cui_upl_prog_done}
                            </div>
                            <div>
                                {proc_cui_progress === 4 && (
                                    <CheckIcon
                                        width={18}
                                        height={18}
                                        aria-hidden
                                    />
                                )}
                            </div>

                        </div>

                    </div>

                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}