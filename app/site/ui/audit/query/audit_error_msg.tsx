import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { CONFIG_API_LIMIT_DURATION, CONFIG_API_LIMIT_NUMBER } from "~/audit_api/v1/audit.config";


export default function AuditErrorMessage({ type, url, fetcherData, locTxt }: {
    type: "default" | "could_not_load_page" | "limit",
    url: string,
    fetcherData: {
        err: string,
        errorCollection: Record<string, any>[]
    } | unknown,
    locTxt: Record<string, any>
}) {
    const [isOpen, setIsOpen] = useState(true)

    useEffect(() => {
        return () => setIsOpen(true)
    }, [])


    return (
        <Dialog.Root open={isOpen}>
            <Dialog.Portal>
                <Dialog.Overlay className="bg-neutral-50/90 dark:bg-neutral-950/90 fixed z-[101] w-full h-full top-0 left-0" />
                <Dialog.Content className='fixed -translate-x-2/4 -translate-y-2/4 w-xs md:w-xl h-96 max-h-full left-2/4 top-2/4 z-[111] overflow-auto bg-white dark:bg-black  text-neutral-900 dark:text-neutral-50 rounded-xl outline-none border-0 inset-0 ring ring-neutral-300 dark:ring-neutral-700 shadow-2xl dark:shadow shadow-neutral-300 dark:shadow-neutral-700 border_squircle'>

                    <div className="flex flex-col justify-between h-full bg-neutral-100/70 dark:bg-neutral-900/70 p-4 ">

                        <div className="flex justify-end">
                            <Dialog.Close
                                className="bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-950 p-2 rounded"
                                onClick={() => setIsOpen(false)}>
                                {locTxt.audit_error_msg.close}
                            </Dialog.Close>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Dialog.Title className="text-xl font-medium text-neutral-800 dark:text-neutral-200">
                                {locTxt.audit_error_msg.title}
                            </Dialog.Title>
                            <div>
                                <Dialog.Description>
                                    {locTxt.audit_error_msg.error_types[type]
                                        ?.replace('{{time}}', Math.floor(CONFIG_API_LIMIT_DURATION / 3600000))
                                        ?.replace('{{number}}', CONFIG_API_LIMIT_NUMBER)
                                    }
                                </Dialog.Description>
                                <div className="font-mono text-[14px]">
                                    {url}
                                </div>
                            </div>
                        </div>

                        <details className="ring ring-neutral-300 dark:ring-neutral-700 max-w-full">
                            <summary className="p-2 bg-neutral-200 dark:bg-neutral-900 rounded">
                                {locTxt.audit_error_msg.details}
                            </summary>
                            <div className="overflow-auto font-mono text-xs">
                                <pre className="whitespace-break-spaces bg-neutral-50 dark:bg-neutral-950">
                                    {JSON.stringify(fetcherData, null, 2)}
                                </pre>
                            </div>
                        </details>

                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}