import { CaretDownIcon, CaretSortIcon, CaretUpIcon } from "@radix-ui/react-icons";
import { useMemo, useState } from "react";
import { Link, NavLink, useParams } from "react-router";


import { createLangPathByParam, langByParam } from "~/common/shared/lang";
import { formatTimestamp } from "~/site/utils/time";
import SITE_CONFIG from "~/site/site.config";
import { sortArrayOfObjects } from "~/site/utils/arrays";
import { valueToRgb } from "~/site/utils/colors";
import { decimalToScore } from "~/site/utils/numbers";
import { truncateString } from "~/site/utils/strings";
import { getDomainFromURL } from "~/site/utils/urls";
import UrlWithLinebreaks from "../core/other/urlWithLInebreaks";
import { MIN_SCORE_S_TO_DISPLAY_URL_AS_LINK } from "../audit/report/report_configuration_for_view";
import type { SortDirection, SortType } from "../../../../types/site";
import { SpriteIcon } from "~/site/icons/svgSprite";


type ThRowItem = {
    initialPosition: number
    rowSpan?: number,
    colSpan?: number,
    className?: string,
    label: string
}

type TdRowItem = {
    initialPosition: number;
    name_space: string;
    className?: string;
    type?: "text" | "link";
    special_case?: string;
    key: number;
    name_space_2?: string
};

function insertAdditionalColumns(
    topTrRow: ThRowItem[],
    tdRow: TdRowItem[],
    additionalCols: AdditionalCol[] = []
): {
    updatedTopTrRow: ThRowItem[];
    updatedTdRow: TdRowItem[];
} {
    // 1. Create shallow copies to keep the function pure
    let updatedTopTrRow = [...topTrRow];
    let updatedTdRow = [...tdRow];

    // 2. Sort right-to-left to prevent index shifting bugs
    const sortedAdditionalCols = [...additionalCols].sort(
        (a, b) => b.col_position_insert_before - a.col_position_insert_before
    );

    // 3. Loop and insert into both arrays
    sortedAdditionalCols.forEach((col) => {
        const targetPosition = col.col_position_insert_before;

        // --- Handle Header Row (topTrRow) ---
        const headerInsertIndex = updatedTopTrRow.findIndex(
            (item) => item.initialPosition === targetPosition
        );

        const newHeaderItem: ThRowItem = {
            initialPosition: targetPosition,
            label: col.col_label,
            className: col.td_classname,
            rowSpan: 3
        };

        if (headerInsertIndex !== -1) {
            updatedTopTrRow.splice(headerInsertIndex, 0, newHeaderItem);
        } else {
            updatedTopTrRow.push(newHeaderItem);
        }

        // --- Handle Data Row (tdRow) ---
        const tdInsertIndex = updatedTdRow.findIndex(
            (item) => item.initialPosition === targetPosition
        );

        const newTdItem: TdRowItem = {
            initialPosition: targetPosition,
            name_space: col.data_namespace,
            className: col.td_classname,
            type: col.td_type,
            // Generate a unique key fallback if your rendering relies on it
            key: Date.now() + Math.random(),
        };

        if (tdInsertIndex !== -1) {
            updatedTdRow.splice(tdInsertIndex, 0, newTdItem);
        } else {
            updatedTdRow.push(newTdItem);
        }
    });

    return {
        updatedTopTrRow,
        updatedTdRow
    };

}

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
    locTxt,
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
                        style={{ padding: "3px" }}
                        type="button"
                        onClick={() => onHandleClick("asc")}
                        aria-sort="none"
                        aria-label={locTxt.audit_lists.table_labels.asc}
                        className="hover:bg-neutral-300 dark:hover:bg-neutral-700 hover:rounded"
                    >
                        <CaretSortIcon width={22} height={22} aria-hidden focusable="false" />
                    </button>
                )}
                {view === "asc" && (
                    <button
                        style={{ padding: "3px" }}
                        type="button"
                        onClick={() => onHandleClick("desc")}
                        aria-sort="ascending"
                        aria-label={locTxt.audit_lists.table_labels.desc}
                        className="hover:bg-neutral-300 dark:hover:bg-neutral-700 hover:rounded"
                    >
                        <CaretUpIcon width={22} height={22} aria-hidden focusable="false" />
                    </button>
                )}
                {view === "desc" && (
                    <button
                        style={{ padding: "3px" }}
                        onClick={() => onHandleClick("asc")}
                        type="button"
                        aria-sort="descending"
                        aria-label={locTxt.audit_lists.table_labels.asc}
                        className="hover:bg-neutral-300 dark:hover:bg-neutral-700 hover:rounded"
                    >
                        <CaretDownIcon width={22} height={22} aria-hidden focusable="false" />
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

type AdditionalCol = {
    col_position_insert_before: number
    col_label: string
    data_namespace: string
    td_classname?: string
    td_type: "text" | "link",
}


export type SortableAuditTableListProps = {
    tableCaption: string
    listData: (ReducedAuditData & unknown)[],
    defaultSortSettings: SortSettings
    locTxt: Record<string, Record<string, Record<string, string>>>,
    withSchema?: boolean
    additionalCols?: AdditionalCol[],
    itemProp?: "mentions" | "mainEntity" | string
}

export default function SortableAuditTableList({
    listData,
    tableCaption,
    defaultSortSettings,
    locTxt,
    withSchema = true,
    additionalCols,
    itemProp = "mainEntity"

}: SortableAuditTableListProps) {

    const { lang } = useParams()
    const { lang_html } = langByParam(lang)
    const { PAGE_CONFIG: { NS_AUDITS_LAYOUT, NS_ECOS_V1_LAYOUT } } = SITE_CONFIG
    const [sortSettings, setSortSettings] = useState<SortSettings>(defaultSortSettings)
    const now = Date.now()



    const data = useMemo(() => {
        let outp: (Omit<ReducedAuditData, "pk"> & any)[] = []
        for (let i = 0; i < listData.length; i += 1) {
            const it = listData[i]
            const score = decimalToScore(it.score)
            const score_e = decimalToScore(it.score_e)
            const score_c = decimalToScore(it.score_c)
            const score_o = decimalToScore(it.score_o)
            const score_s = decimalToScore(it.score_s)
            // const created_at = it.created_at
            // const final_url = it.final_url
            // const sk = it.sk
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

            const final_url_truncated = truncateString(it?.final_url ?? '')
            const domain = getDomainFromURL(it?.final_url ?? '')

            const score_style = {
                boxShadow: `inset 0 0 0 1px rgba(${valueToRgb(it.score, 0, 1)} / 0.35)`,
                backgroundColor: `rgba(${valueToRgb(it.score, 0, 1)} / 0.035)`
            }

            outp = [
                ...outp, {
                    ...it,
                    // sk,
                    domain,
                    score,
                    score_c,
                    score_e,
                    score_o,
                    score_s,
                    //  final_url,
                    // created_at,
                    audit_report_url,
                    audit_time_readable,
                    final_url_truncated,
                    audit_time_iso,
                    score_style
                }]
        }



        let topTrRow: ThRowItem[] = [
            { initialPosition: 0, rowSpan: 3, label: locTxt.audit_lists.table_labels.position },
            { initialPosition: 1, rowSpan: 2, label: locTxt.audit_lists.table_labels.date },
            { initialPosition: 2, rowSpan: 2, label: locTxt.audit_lists.table_labels.domain, className: "w-36" },
            { initialPosition: 3, colSpan: 5, label: locTxt.audit_lists.table_labels.scores },
            { initialPosition: 4, rowSpan: 2, label: locTxt.audit_lists.table_labels.url_page, className: "w-64" },
            { initialPosition: 5, rowSpan: 3, label: locTxt.audit_lists.table_labels.url_audit_report }
        ]


        let tdRow: TdRowItem[] = [
            { key: 11, initialPosition: 0, name_space: "", special_case: "position_counter" },
            { key: 12, initialPosition: 1, name_space: "audit_time_readable" },
            { key: 13, initialPosition: 2, name_space: "", special_case: "_domain" },
            { key: 14, initialPosition: 3, name_space: "", special_case: "score" },
            { key: 15, initialPosition: 4, name_space: "score_e", className: "font-mono text-right" },
            { key: 16, initialPosition: 5, name_space: "score_c", className: "font-mono text-right" },
            { key: 17, initialPosition: 6, name_space: "score_o", className: "font-mono text-right" },
            { key: 18, initialPosition: 7, name_space: "score_s", className: "font-mono text-right" },
            { key: 20, initialPosition: 8, name_space: "", special_case: "conditional_link" },
            { key: 21, initialPosition: 9, name_space: "", special_case: "audit_link" },
        ]


        if (additionalCols?.length) {
            const {
                updatedTdRow,
                updatedTopTrRow
            } = insertAdditionalColumns(topTrRow, tdRow, additionalCols);
            topTrRow = updatedTopTrRow
            tdRow = updatedTdRow

        }


        const list = sortArrayOfObjects(
            outp,
            sortSettings.focusItemKey,
            sortSettings.direction,
            sortSettings.focusItemDataType
        )

        return {
            list,
            topTrRow,
            tdRow
        }
    }, [listData, sortSettings])

    return (
        <table className="table_1 min-w-5xl lg:min-w-full escape_md_1_art"
            //itemProp="mainEntity"
            itemProp={itemProp} itemScope itemType="https://schema.org/ItemList"
        >
            <caption itemProp="description">
                {tableCaption}
                <meta itemProp="numberOfItems" content="100" />
                <link itemProp="itemListOrder" href="https://schema.org/ItemListOrderDescending" />
            </caption>
            <thead>
                <tr>
                    {data.topTrRow.map((it, ind) => (
                        <th scope="col"
                            {...it.rowSpan && { rowSpan: it.rowSpan }}
                            {...it.colSpan && { colSpan: it.colSpan }}
                            {...it.className && { className: it.className }}
                            key={it.initialPosition + ind}>{it.label}</th>
                    ))}

                    {/**
 *                     <th scope="col" rowSpan={3}>{locTxt.audit_lists.table_labels.position}</th>
                    <th scope="col" rowSpan={2}>{locTxt.audit_lists.table_labels.date}</th>
                    <th scope="col" className="w-36" rowSpan={2}>{locTxt.audit_lists.table_labels.domain}</th>
                    <th scope="col" colSpan={5}>{locTxt.audit_lists.table_labels.scores}</th>
                    <th scope="col" rowSpan={2} className="w-64">{locTxt.audit_lists.table_labels.url_page}</th>
                    <th scope="col" rowSpan={3}>{locTxt.audit_lists.table_labels.url_audit_report}</th>
 */}

                </tr>
                <tr>
                    <th scope="col">{locTxt.audit_lists.table_labels.score_main}</th>
                    <th scope="col">{locTxt.audit_lists.table_labels.score_e}</th>
                    <th scope="col">{locTxt.audit_lists.table_labels.score_c}</th>
                    <th scope="col">{locTxt.audit_lists.table_labels.score_o}</th>
                    <th scope="col">{locTxt.audit_lists.table_labels.score_s}</th>
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

                {data.list.map((it, idx) => (
                    <tr key={it.sk + it.created_at}
                        itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem"
                    >

                        {data.tdRow.map((row_config, rowIdx) => {
                            const key = row_config.key + rowIdx
                            const name_space = row_config.name_space as any
                            const special_case = row_config.special_case
                            if (special_case) {
                                if (special_case === "position_counter") {
                                    return <td key={key}>{idx + 1}</td>
                                } else if (special_case === "audit_time_readable") {
                                    return (
                                        <td key={key} className="text-center">
                                            <time dateTime={it.audit_time_iso}>{it.audit_time_readable}</time>
                                            <meta itemProp="position" content={(idx + 1).toString()} />
                                        </td>
                                    )
                                } else if (special_case === "conditional_link") {
                                    return (
                                        <td key={key} className="md_1 w-64 overflow-hidden">
                                            {it.score_s > MIN_SCORE_S_TO_DISPLAY_URL_AS_LINK ? (
                                                <Link
                                                    className="break-all"
                                                    to={it.final_url}
                                                    target="_blank"
                                                    rel="noreferrer noopener nofollow"
                                                >
                                                    {it.final_url_truncated}
                                                </Link>
                                            ) : (
                                                <div className="overflow-x-scroll text-sm text-red-900 dark:text-red-100 wrap-break-word">
                                                    {it.final_url.replaceAll('.', '[.]')}
                                                </div>

                                            )}

                                        </td>
                                    )
                                } else if (special_case === "audit_link") {
                                    return (
                                        <td key={key}
                                            itemProp="item" itemScope itemType="https://schema.org/Report"
                                        >
                                            <NavLink
                                                className="flex justify-center p-2 hover:bg-neutral-300 hover:dark:bg-neutral-700 active:bg-neutral-400 dark:active:bg-neutral-600"
                                                itemProp="url"
                                                viewTransition
                                                to={it.audit_report_url!}
                                                aria-label={locTxt.audit_lists.table_labels.to_audit}
                                            >
                                                <SpriteIcon
                                                    name="svg-use-link1"
                                                />
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
                                    )
                                } else if (special_case === "_domain") {
                                    return (<td key={key} className="min-w-44 wrap-break-word">
                                        <UrlWithLinebreaks url={it.domain ?? ''} />
                                    </td>)
                                } else if (special_case === "score") {
                                    return (
                                        <td key={key} className="font-mono text-right" style={{ ...it.score_style }}>
                                            {it.score}
                                        </td>
                                    )
                                }
                            } else {
                                const type = row_config.type
                                if (type) {

                                    if (type === "text") {
                                        return (
                                            <td key={key}>{it[name_space]}</td>
                                        )
                                    } else if (type === "link" && typeof row_config.name_space_2 === "string") {
                                        return (
                                            <td key={key}>
                                                <Link to={it[row_config.name_space_2]}>
                                                    {it[name_space]}
                                                </Link>
                                            </td>
                                        )
                                    }
                                } else {
                                    return (
                                        <td key={key} {...row_config.className && { className: row_config.className }}>

                                            {it[row_config.name_space]}
                                        </td>
                                    )
                                }
                            }
                        })}

                        {/**
                                            <td>{idx + 1}</td>
                        <td className="text-center">
                            <time dateTime={it.audit_time_iso}>{it.audit_time_readable}</time>
                            <meta itemProp="position" content={(idx + 1).toString()} />
                        </td>
                        <td className="min-w-44 wrap-break-word">
                            <UrlWithLinebreaks url={it.domain ?? ''} />
                        </td>
                        <td className="font-mono text-right" style={{ ...it.score_style }}>
                            {it.score}
                        </td>
                        <td className="font-mono text-right">{it.score_e}</td>
                        <td className="font-mono text-right">{it.score_c}</td>
                        <td className="font-mono text-right">{it.score_o}</td>
                        <td className="font-mono text-right">{it.score_s}</td>
                        <td className="md_1 w-64 overflow-hidden">
                            {it.score_s > MIN_SCORE_S_TO_DISPLAY_URL_AS_LINK ? (
                                <Link
                                    className="break-all"
                                    to={it.final_url}
                                    target="_blank"
                                    rel="noreferrer noopener nofollow"
                                >
                                    {it.final_url_truncated}
                                </Link>
                            ) : (
                                <div className="overflow-x-scroll text-sm text-red-900 dark:text-red-100 wrap-break-word">
                                    {it.final_url.replaceAll('.', '[.]')}
                                </div>

                            )}

                        </td>
                        <td
                            itemProp="item" itemScope itemType="https://schema.org/Report"
                        >
                            <NavLink
                                className="flex justify-center p-2 hover:bg-neutral-300 hover:dark:bg-neutral-700 active:bg-neutral-400 dark:active:bg-neutral-600"
                                itemProp="url"
                                viewTransition
                                to={it.audit_report_url!}
                                aria-label={locTxt.audit_lists.table_labels.to_audit}
                            >
                                <SpriteIcon
                                    name="svg-use-link1"
                                />
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

 */}

                    </tr>
                ))}
            </tbody>

        </table>
    )

}