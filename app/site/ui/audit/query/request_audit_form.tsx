import { useEffect, useRef, useState, type BaseSyntheticEvent } from "react";
import { useFetcher, useLoaderData, useNavigate, useParams, useRouteLoaderData, useSearchParams } from "react-router";
import clsx from "clsx";

import { createLangPathByParam } from "~/common/shared/lang";
import SITE_CONFIG from "~/site/site.config";
import LoadingDialog from "./wait_for_audit_result_dialog";
import AuditErrorMessage from "./audit_error_msg";
import { CONFIG_API_LIMIT_DURATION, CONFIG_API_LIMIT_NUMBER } from "~/audit_api/v1/audit.config";
import { msToFullHours } from "~/site/utils/numbers";
import MarkdownWithCustomElements from "~/site/shared/markdown";


export default function RequestAuditForm({ locTxt }: { locTxt: Record<string, any> }) {
    const {
        PAGE_CONFIG: { NS_AUDITS_LAYOUT, NS_ECOS_V1_LAYOUT } } = SITE_CONFIG
    const fetcher = useFetcher({ key: 'query_audit2' })
    const navigate = useNavigate()
    const { lang } = useParams()
    const textInputRef = useRef<HTMLInputElement | null>(null)
    const honeypotRef = useRef<HTMLInputElement | null>(null)
    const [showLoadingDialog, setShowLoadingDialog] = useState(false)
    const [errorMessage, setErrorMessage] = useState<null
        | "default" | "could_not_load_page" | "unable_to_process_request">(null)
    const [isNotUrl, setIsNotUrl] = useState(false)
    const [params] = useSearchParams()
    const { is_bot } = useRouteLoaderData('root')
    const { csrfLike } = useRouteLoaderData('site/routes/layouts/site_layout')
    const loaderData = useLoaderData()
    const urlFromParam = params.get('auditURL')
    const durationInHousrs = msToFullHours(CONFIG_API_LIMIT_DURATION)
    const numberOfRequests = loaderData?.requestCounter?.currentCount
    const islimitReached = !loaderData?.requestCounter?.isAllowed

    const doFetch = (e?: BaseSyntheticEvent) => {
        if (e) e.preventDefault()
        if (is_bot) return
        if (islimitReached) return

        if (fetcher?.data) fetcher.reset()

        setErrorMessage(null)
        const urlInput = textInputRef.current?.value?.trim()?.toLowerCase() ?? ''
        let probablyUrl

        if (!urlInput.startsWith('https://') && !urlInput.startsWith('http://')) {
            probablyUrl = 'https://' + urlInput
        } else {
            probablyUrl = urlInput
        }

        if (probablyUrl.includes('.') &&
            !probablyUrl.startsWith('.') &&
            !probablyUrl.endsWith('.')) {

            const sps = new URLSearchParams()
            sps.set('csrf_like', csrfLike)
            sps.set('rurl', probablyUrl)
            sps.set('additional_info', honeypotRef?.current?.value ?? '')

            setShowLoadingDialog(true)
            fetcher.load(`/loader/audit-v1?${sps.toString()}`)
        } else {
            setIsNotUrl(true)
        }
    }

    useEffect(() => {
        if (urlFromParam && textInputRef.current) {
            textInputRef.current.value = urlFromParam
            doFetch()
        }

    }, [urlFromParam])

    useEffect(() => {
        if (fetcher.data?.id) {
            navigate(
                createLangPathByParam(
                    lang,
                    `/${NS_AUDITS_LAYOUT.path_fragment}/${NS_ECOS_V1_LAYOUT.path_fragment}/${fetcher.data.id}`
                ),
                {
                    state: fetcher.data?.data,
                    viewTransition: true
                })
            fetcher.reset()
        } else if (fetcher?.data?.err !== undefined) {
            let errorType = "default"
            const errorResponse = fetcher.data
            console.error({ dev_internal_error_reponse: errorResponse })

            // CATCHES
            if (errorResponse.err === "CATCH") {
                if (errorResponse?.errorCollection?.length) {
                    const collection = errorResponse.errorCollection as Record<string, any>[]

                    // PageSpeed Insights API catch
                    const possiblyLighthouseMessage = collection.find(
                        (it) => it.origin === "page_speed")
                    if (possiblyLighthouseMessage?.err === "FETCH_CATCH"
                        && possiblyLighthouseMessage?.details?.error?.code === 400) {
                        errorType = "could_not_load_page"
                    } else if (possiblyLighthouseMessage?.err === "FETCH_CATCH"
                        && possiblyLighthouseMessage?.details?.error?.code === 500) {
                        errorType = "unable_to_process_request"
                    }
                    // AbuseIPDB API catch
                    const possiblyAbuseIPDBMessage = collection.find((
                        it) => it.origin === "abuse_ipdb")
                    if (possiblyAbuseIPDBMessage?.err === "FETCH_CATCH") {
                        errorType = "abuse_ipdb_possibly_down"
                    }

                    // initial fetch catch
                    const possiblyInitialFetchMessage = collection.find((
                        it) => it.origin === "initial_fetch")
                    if (possiblyInitialFetchMessage) {
                        errorType = possiblyInitialFetchMessage?.err
                    }

                    // greencheck API catch
                    const possiblyGreencheckMessage = collection.find(
                        (it) => it.origin === "greencheck")
                    if (possiblyGreencheckMessage) {
                        if (possiblyGreencheckMessage?.err === "FETCH_CATCH") {
                            errorType = "catch_greencheck"
                        }
                    }

                    // Web Risk API catchpossiblyAbuseIPDBMessage
                    const possiblyWebRiskMessage = collection.find(
                        (it) => it.origin === "web_risk")
                    if (possiblyWebRiskMessage) {
                        if (possiblyWebRiskMessage?.err === "FETCH_429") {
                            errorType = "web_risk_quota"
                        } else if (possiblyWebRiskMessage?.err === "FETCH_CATCH") {
                            errorType = "catch_web_risk"
                        }
                    }

                    // Web Risk API catch
                    const possiblyHttpObservatoryMessage = collection.find(
                        (it) => it.origin === "http_observatory")
                    if (possiblyHttpObservatoryMessage) {
                        if (possiblyHttpObservatoryMessage?.err === "FETCH_CATCH") {
                            errorType = "catch_http_observatory"
                        }
                    }

                }
            } else if (errorResponse.err === "LIMIT" || errorResponse.err === "FETCH_429") {
                errorType = "limit"
            }
            setShowLoadingDialog(false)
            setErrorMessage(errorType as any)
            fetcher.reset()
        }
    }, [fetcher?.data])




    return (
        <>
            <div className="p-2 max-w-full">
                {is_bot && (
                    <div
                        className="text-xl p-2 max-w-2xl text-center text-amber-800 dark:text-amber-200">
                        {locTxt.form_info.bot_detected}
                    </div>
                )}
                {islimitReached && <div className="text-xl p-2 max-w-2xl text-center text-amber-800 dark:text-amber-200">
                    {locTxt.form_info.rate_limit_exceeded
                        ?.replace('{{time}}', durationInHousrs)
                        ?.replace('{{limit}}', CONFIG_API_LIMIT_NUMBER)}
                </div>}
                <fetcher.Form
                    className="border_squircle flex w-full max-w-2xl gap-1 p-1.5 flex-col md:flex-row bg-neutral-700/90 dark:bg-neutral-300/90 rounded-2xl shadow shadow-neutral-800 dark:shadow-neutral-200"
                    onSubmit={(e) => doFetch(e)}
                >
                    <div className="flex flex-col w-2xl max-w-full">
                        <label htmlFor="rurl" className="text-neutral-50 dark:text-neutral-950 p-1">
                            {isNotUrl
                                ? locTxt?.audit_entry_form?.aef_url_not_valid
                                : locTxt?.audit_entry_form?.aef_label}
                        </label>
                        <input
                            ref={textInputRef}
                            required
                            onChange={() => setIsNotUrl(false)}
                            placeholder="https://example.com"
                            id="rurl"
                            type="text"
                            name="rurl"
                            autoCorrect="off"
                            className={clsx("border_squircle p-2  text-neutral-950 dark:text-neutral-50 w-full rounded-sm md:rounded-bl-2xl outline-0 focus:rounded-2xl placeholder-neutral-700 dark:placeholder-neutral-300 duration-200",
                                {
                                    "bg-amber-100 focus:bg-amber-100 dark:bg-amber-950 dark:focus:bg-amber-950": isNotUrl,
                                    "bg-neutral-50 dark:bg-neutral-950 focus:bg-neutral-200 dark:focus:bg-neutral-800": !isNotUrl
                                }
                            )}
                        />
                    </div>

                    <div className="hp-container" aria-hidden="true">
                        <input
                            ref={honeypotRef}
                            type="text"
                            name="additional_info"
                            tabIndex={-1}
                            autoComplete="off"
                        />
                    </div>

                    <button
                        disabled={is_bot || islimitReached}
                        type="submit"
                        className="border_squircle p-2 text-neutral-200 p-2 bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-50 rounded-t-sm rounded-b-2xl md:rounded-r-2xl md:rounded-l-sm cursor-pointer hover:bg-neutral-200  hover:dark:bg-neutral-800  hover:ring-2 duration-150 focus:rounded-2xl">
                        {locTxt?.audit_entry_form?.aef_submit_button}
                    </button>

                </fetcher.Form>

                {errorMessage && (
                    <AuditErrorMessage
                        locTxt={loaderData.locTxt}
                        type={errorMessage}
                        url={textInputRef.current?.value!}
                        fetcherData={fetcher?.data}
                    />
                )}

            </div>
            <MarkdownWithCustomElements
                markup={loaderData?.locTxt?.audit_entry_form?.aef_subtxt
                    ?.replace(/{{time}}/g, durationInHousrs)
                    ?.replace('{{requests}}', numberOfRequests)
                    ?.replace('{{limit}}', CONFIG_API_LIMIT_NUMBER) ?? ''}
            />

            {showLoadingDialog && (
                <LoadingDialog
                    url={textInputRef.current?.value!}
                    fetcherState={
                        fetcher
                    }
                    locTxt={loaderData.locTxt}
                />
            )}

        </>
    )
}