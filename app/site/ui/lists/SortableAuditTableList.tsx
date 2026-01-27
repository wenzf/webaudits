import { CaretDownIcon, CaretSortIcon, CaretUpIcon, Link1Icon } from "@radix-ui/react-icons";
import { useMemo, useState } from "react";
import { Link, NavLink, useParams } from "react-router";

import type { SortDirection, SortType } from "types/site";
import { createLangPathByParam, langByParam } from "~/common/shared/lang";
import { formatTimestamp } from "~/site/utils/time";
import SITE_CONFIG from "~/site/site.config";
import { sortArrayOfObjects } from "~/site/utils/arrays";
import { valueToRgb } from "~/site/utils/colors";
import { decimalToScore } from "~/site/utils/numbers";
import { truncateString } from "~/site/utils/strings";
import { getDomainFromURL } from "~/site/utils/urls";


type SortSettings = {
    direction: SortDirection
    focusItemKey: keyof Omit<ReducedAuditData, "pk">
    focusItemDataType: SortType

}

const SortHeader = ({
    thisKey,
    thisDataType,
    sortSettings,
    setter,
    locTxt
}: {
    thisKey: keyof Omit<ReducedAuditData, "pk">
    thisDataType: "number" | "string"
    sortSettings: SortSettings
    setter: (s: SortSettings) => void,
    locTxt: Record<string, Record<string, Record<string, string>>>
}) => {
    const { direction, focusItemKey } = sortSettings
    let view: "none" | "asc" | "desc" = "none"
    if (thisKey === focusItemKey) {
        view = direction
    }

    const onHandleClick = (direction: "asc" | "desc") => {
        setter({
            direction,
            focusItemKey: thisKey,
            focusItemDataType: thisDataType
        })
    }


    return (
        <th>
            <div className="flex justify-center [&_button]:flex [&_button]:w-full [&_button]:justify-center ">
                {view === "none" && (
                    <button
                        style={{ padding: 0 }}
                        type="button"
                        onClick={() => onHandleClick("asc")}
                    >
                        <CaretSortIcon width={22} height={22}
                            aria-label={locTxt.audit_lists.table_labels.asc} />
                    </button>
                )}
                {view === "asc" && (
                    <button
                        style={{ padding: 0 }}
                        type="button"
                        onClick={() => onHandleClick("desc")}
                    >
                        <CaretUpIcon width={22} height={22}
                            aria-label={locTxt.audit_lists.table_labels.desc} />

                    </button>
                )}
                {view === "desc" && (
                    <button
                        style={{ padding: 0 }}
                        onClick={() => onHandleClick("asc")}
                        type="button"
                    >
                        <CaretDownIcon width={22} height={22}
                            aria-label={locTxt.audit_lists.table_labels.asc} />
                    </button>
                )}
            </div>
        </th>
    )

}


const sortableItemsConfig: [SortSettings["focusItemKey"], SortType][] = [
    ["created_at", "number"],
    ["domain", "string"],
    ["score", "number"],
    ["score_e", "number"],
    ["score_c", "number"],
    ["score_o", "number"],
    ["score_s", "number"],
    ["final_url", "string"],
]


export default function SortableAuditTableList({
    listData,
    tableCaption,
    defaultSortSettings,
    locTxt,
    withSchema = true
}: {
    tableCaption: string
    listData: ReducedAuditData[],
    defaultSortSettings: SortSettings
    locTxt: Record<string, Record<string, Record<string, string>>>,
    withSchema?: boolean
}) {
    const { lang } = useParams()
    const { lang_html } = langByParam(lang)
    const { PAGE_CONFIG: { NS_AUDITS_LAYOUT, NS_ECOS_V1_LAYOUT } } = SITE_CONFIG
    const [sortSettings, setSortSettings] = useState<SortSettings>(defaultSortSettings)
    const now = Date.now()

    const data = useMemo(() => {
        let outp: Omit<ReducedAuditData, "pk">[] = []
        for (let i = 0; i < listData.length; i += 1) {
            const it = listData[i]
            const score = decimalToScore(it.score)
            const score_e = decimalToScore(it.score_e)
            const score_c = decimalToScore(it.score_c)
            const score_o = decimalToScore(it.score_o)
            const score_s = decimalToScore(it.score_s)
            const created_at = it.created_at
            const final_url = it.final_url
            const sk = it.sk
            const audit_report_url = createLangPathByParam(lang,
                `/${NS_AUDITS_LAYOUT.path_fragment}/${NS_ECOS_V1_LAYOUT.path_fragment}/${it.sk}`)


            const audit_time_obj = formatTimestamp(it.created_at, lang_html, {
                year: "2-digit", month: "numeric", day: "numeric"
            }, "Europe/London")

            const date_today = formatTimestamp(now, lang_html, {
                year: "2-digit", month: "numeric", day: "numeric"
            }, "Europe/London")


            const audit_time_readable = audit_time_obj?.readable === date_today?.readable
                ? (locTxt.audit_lists.today as any)
                : audit_time_obj?.readable;
            const audit_time_iso = audit_time_obj?.ISO

            const final_url_truncated = truncateString(it.final_url)
            const domain = getDomainFromURL(it.final_url)

            const score_style = {
                boxShadow: `inset 0 0 0 1px rgba(${valueToRgb(it.score, 0, 1)} / 0.35)`,
                backgroundColor: `rgba(${valueToRgb(it.score, 0, 1)} / 0.035)`
            }

            outp = [
                ...outp, {
                    sk, domain,
                    score, score_c, score_e, score_o, score_s,
                    final_url, created_at, audit_report_url,
                    audit_time_readable, final_url_truncated,
                    audit_time_iso, score_style
                }]
        }

        return sortArrayOfObjects(
            outp,
            sortSettings.focusItemKey,
            sortSettings.direction,
            sortSettings.focusItemDataType
        )
    }, [listData, sortSettings])


    return (
        <table className="table_1 min-w-5xl"
            itemProp="mainEntity" itemScope itemType="https://schema.org/ItemList"
        >
            <caption itemProp="description">
                {tableCaption}
                <meta itemProp="numberOfItems" content="100" />
                <link itemProp="itemListOrder" href="https://schema.org/ItemListOrderDescending" />
            </caption>
            <thead>
                <tr>
                    <th rowSpan={3}>{locTxt.audit_lists.table_labels.position}</th>
                    <th rowSpan={2}>{locTxt.audit_lists.table_labels.date}</th>
                    <th className="w-36" rowSpan={2}>{locTxt.audit_lists.table_labels.domain}</th>
                    <th colSpan={5}>{locTxt.audit_lists.table_labels.scores}</th>
                    <th rowSpan={2} className="w-64">{locTxt.audit_lists.table_labels.url_page}</th>
                    <th rowSpan={3}>{locTxt.audit_lists.table_labels.url_audit_report}</th>
                </tr>
                <tr>
                    <th>{locTxt.audit_lists.table_labels.score_main}</th>
                    <th>{locTxt.audit_lists.table_labels.score_e}</th>
                    <th>{locTxt.audit_lists.table_labels.score_c}</th>
                    <th>{locTxt.audit_lists.table_labels.score_o}</th>
                    <th>{locTxt.audit_lists.table_labels.score_s}</th>
                </tr>
                <tr>
                    {sortableItemsConfig.map((h) => (
                        <SortHeader
                            locTxt={locTxt}
                            key={h[0]} setter={setSortSettings}
                            thisDataType={h[1]}
                            thisKey={h[0]}
                            sortSettings={sortSettings}
                        />
                    ))}

                </tr>
            </thead>

            <tbody>
                {data.map((it, idx) => (
                    <tr key={it.sk + it.created_at}
                        itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem"
                    >
                        <td>{idx + 1}</td>
                        <td className="text-center">
                            <time dateTime={it.audit_time_iso}>{it.audit_time_readable}</time>
                            <meta itemProp="position" content={(idx + 1).toString()} />
                        </td>
                        <td className="break-all min-w-44">{it.domain}</td>
                        <td className="font-mono text-right" style={{ ...it.score_style }}>
                            {it.score}
                        </td>
                        <td className="font-mono text-right">{it.score_e}</td>
                        <td className="font-mono text-right">{it.score_c}</td>
                        <td className="font-mono text-right">{it.score_o}</td>
                        <td className="font-mono text-right">{it.score_s}</td>
                        <td className="md_1 w-64 overflow-hidden">
                            {it.score_s > 50 ? (
                                <Link
                                    className="break-all"
                                    to={it.final_url}
                                    target="_blank"
                                    rel="noreferrer noopener nofollow"
                                >
                                    {it.final_url_truncated}
                                </Link>
                            ) : (
                                <div className="overflow-x-scroll text-sm text-red-900 dark:text-red-100">
                                    {it.final_url.replaceAll('.', '[.]')}
                                </div>

                            )}

                        </td>
                        <td style={{ padding: 0 }}
                            itemProp="item" itemScope itemType="https://schema.org/Report"
                        >
                            <NavLink
                                className="flex justify-center p-2 hover:bg-neutral-300 hover:dark:bg-neutral-700 active:bg-neutral-400 dark:active:bg-neutral-600"
                                itemProp="url"
                                viewTransition
                                to={it.audit_report_url!}
                            >
                                <Link1Icon
                                    aria-label={locTxt.audit_lists.table_labels.to_audit}
                                    className="flex" />
                            </NavLink>
                            <span itemProp="about" itemScope itemType="https://schema.org/WebSite">
                                <link itemProp="url" href={it.final_url} />
                            </span>
                            <meta itemProp="datePublished" content={it.audit_time_iso} />
                            <span itemProp="additionalProperty"
                                itemScope itemType="https://schema.org/PropertyValue">
                                <meta itemProp="name" content={locTxt.audit_lists.table_labels.score_main} />
                                <meta itemProp="value" content={it.score.toString()} />
                                <meta itemProp="maxValue" content="100" />
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>

        </table>
    )

}