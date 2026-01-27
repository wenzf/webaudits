import * as Dialog from "@radix-ui/react-dialog";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useSearchParams, type Fetcher } from "react-router";

import { cleanUrl } from "~/audit_api/helpers/id_by_url";
import { CONFIG_AUDIT_RENEWAL_INTERVAL_IN_MS } from "~/audit_api/v1/audit.config";
import { shuffleArrayOfArrays } from "~/site/utils/arrays";
import { getFullDaysByMS, invertNumbers } from "~/site/utils/numbers";
import { truncateString } from "~/site/utils/strings";


const card_interval = 15_000

export default function LoadingDialog({
    url,
    fetcherState,
    locTxt
}: { url: string, fetcherState: Fetcher, locTxt: Record<string, any> }) {
    const [counter, setCounter] = useState(0)
    const shuffled: any = useRef(shuffleArrayOfArrays(Object.entries(locTxt.audit_fact_cards)))
    const numbMax = shuffled.current.length - 1
    const [sp] = useSearchParams()
    const updateAudit = sp.get('auditURL')?.length


    useEffect(() => {
        const interval = setInterval(() => {
            setCounter((prev) => {
                if (prev < numbMax) {
                    return prev + 1
                } else {
                    return 0
                }
            })
        }, card_interval)
        return () => clearInterval(interval)
    }, [])


    return (
        <Dialog.Root open={true}>
            <Dialog.Portal>
                <Dialog.Overlay className="bg-neutral-50 dark:bg-neutral-950 fixed z-[101] w-full h-full top-0 left-0" />
                <Dialog.Content className='fixed -translate-x-2/4 -translate-y-2/4 w-[95vw] h-[95vh] left-2/4 top-2/4 z-[111] overflow-auto bg-neutral-100/50 dark:bg-neutral-900/50 text-neutral-950 dark:text-neutral-50 rounded outline-none border-0 inset-0'>
                    <div className='w-full h-full z-[2]'>
                        <div className="loader_1 absolute top-[5vh] left-[5vw]" />
                        <div className='p-2 h-[95vh] flex flex-col justify-evenly'>
                            <div className="flex justify-between gap-3 max-w-xl mx-auto items-center">
                                <div
                                    //className="border-l border-l-neutral-700 dark:border-l-neutral-300 px-3 py-1"
                                    className="px-3 py-1"
                                >
                                    <Dialog.Title className='text-xl font-semibold'>
                                        {locTxt.wait_for_audit_results.audit_runs}
                                    </Dialog.Title>
                                    <Dialog.Description asChild>
                                        <div>
                                            <div className="font-mono">
                                                URL: {truncateString(cleanUrl(url))}
                                            </div>

                                            <div className="text-green-800 dark:text-green-200 mt-3">
                                                {updateAudit
                                                    ? locTxt.wait_for_audit_results.msg_2
                                                    : locTxt.wait_for_audit_results.msg_1?.replace('{{duration}}',
                                                        getFullDaysByMS(CONFIG_AUDIT_RENEWAL_INTERVAL_IN_MS))}
                                            </div>
                                        </div>
                                    </Dialog.Description>
                                </div>
                            </div>
                            <div>
                                {fetcherState.state === "loading" ? (
                                    <div className="relative flex justify-center items-center">
                                        {shuffled.current.map((it: any, ind: number) => (

                                            <div key={it[0]}
                                                hidden={ind === invertNumbers(counter + 2, numbMax)}
                                                className={clsx("fact_card", {
                                                    "is_next": ind === invertNumbers(counter + 2, numbMax),
                                                    "is_active": ind === counter,
                                                    "is_leaving": ind === invertNumbers(counter + 1, numbMax),
                                                })}>
                                                <div className="text-xl mb-3">{it[1].title}</div>
                                                <p>{it[1].text}{" "}</p>
                                                <div className="mt-2">{it[1].source}</div>
                                                <div className={clsx('h-1 relative mt-4 rounded',
                                                    { "slideshow_prog": ind === counter })} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex justify-center overflow-hidden">
                                        <CheckCircledIcon
                                            aria-hidden
                                            width={120}
                                            height={120}
                                            className="text-green-700/80 dark:text-green-300/80 rev_icon"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}