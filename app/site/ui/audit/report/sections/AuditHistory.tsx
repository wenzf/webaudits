import clsx from "clsx";
import { useParams, useRouteLoaderData } from "react-router";
import * as Accordion from '@radix-ui/react-accordion';

import { formatTimestamp } from "~/site/utils/time";
import { langByParam } from "~/common/shared/lang";
import { titleToAnchor } from "~/site/utils/urls";
import { LvlHeader } from "~/site/ui/core/other/text_elements";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { decimalToScore } from "~/site/utils/numbers";


export default function AuditHistory({ archive }: {
    archive: PageAuditArchive
}) {
    const { locTxt } = useRouteLoaderData('site/routes/pages/audits_ecos_v1_id')
    const { lang } = useParams()
    const { lang_html } = langByParam(lang)
    const anchor = titleToAnchor(locTxt.sidebar_labels.sl_history)

    return (
        <section
            data-position={anchor}
            id={anchor}
            className={clsx("my-12 pt-12 mb-36 md:mb-48")}
        >
            <LvlHeader
                content={locTxt.audit_section_titles.ast_history}
                lvl={0}
                anchorLink={anchor}
            />

            <table className="table_1 mt-12">
                <caption>{locTxt.history_section.hs_caption_summary}</caption>
                <tbody>
                    <tr>
                        <th>{locTxt.history_section.hs_mean}</th>
                        <td className="font-mono">{decimalToScore(archive.score)}</td>
                    </tr>
                    <tr>
                        <th>{locTxt.history_section.hs_n}</th>
                        <td className="font-mono">{archive.count}</td>
                    </tr>
                </tbody>
            </table>

            <div className="mt-8 mb-12">
                <Accordion.Root
                    className=""
                    type="single"
                    collapsible
                >
                    <Accordion.Item value="item-1">
                        <Accordion.Header className="flex">
                            <Accordion.Trigger
                                className={"group flex h-[45px] flex-1 cursor-pointer items-center justify-between px-2 bg-neutral-50 dark:bg-neutral-950 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded inset-ring inset-ring-neutral-300 dark:inset-ring-neutral-700"}
                            >
                                {locTxt.accordions.previous_results}
                                <ChevronDownIcon
                                    width={20} height={20}
                                    className="text-neutral-900 dark:text-neutral-100 transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
                                    aria-hidden
                                />
                            </Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Content>
                            <div className="overflow-x-auto">
                                <table className="table_1 mt-12">
                                    <caption>{locTxt.history_section.hs_caption_past_audits}</caption>
                                    <thead>
                                        <tr>
                                            <th rowSpan={2}>{locTxt.table_labels.tl_time}</th>
                                            <th rowSpan={2}>{locTxt.table_labels.tl_wsga_score_v1}</th>
                                            <th colSpan={4}>{locTxt.table_labels.tl_sub_scores}</th>
                                        </tr>
                                        <tr>
                                            <th>{locTxt.table_labels.tl_clean}</th>
                                            <th>{locTxt.table_labels.tl_efficient}</th>
                                            <th>{locTxt.table_labels.tl_open}</th>
                                            <th>{locTxt.table_labels.tl_safe}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {archive.archive.map(([t, s, c, e, o, h], ind) => (
                                            <tr key={ind}>
                                                <td>{formatTimestamp(t, lang_html, {
                                                    year: "2-digit", month: "numeric", day: "numeric"
                                                }, "Europe/London")?.readable}</td>
                                                <td className="font-mono">{decimalToScore(s)}</td>
                                                <td className="font-mono">{decimalToScore(c)}</td>
                                                <td className="font-mono">{decimalToScore(e)}</td>
                                                <td className="font-mono">{decimalToScore(o)}</td>
                                                <td className="font-mono">{decimalToScore(h)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Accordion.Content>
                    </Accordion.Item>
                </Accordion.Root>
            </div>
        </section>
    )
}