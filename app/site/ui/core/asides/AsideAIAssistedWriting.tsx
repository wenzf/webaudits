import { Link } from "react-router";
import type { AISource } from "../../../../../types/site";
import { enumeratedBinding } from "~/site/utils/strings";
import CpuIconSVG from "~/site/icons/cpuIconSVG";

export default function AsideAIAssistedWriting({ id, tools, locs }: {
    id?: string,
    tools: AISource[],
    locs: {
        ai_assisted_about_title: string,
        ai_assisted_txt: string,
        and: string
    } | Record<string, string>
}) {
    const split_ai_assistance_aside = locs.ai_assisted_txt.split("{{models}}")
    return (
        <aside
            {...id?.length && { id }}
            className="max-w-[680px] my-12 p-3 rounded text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800" 
            >
            <div className="flex gap-3 items-center justify-between pr-2">

                <h2
                    className="text-lg sm:text-xl font-semibold text-neutral-700 dark:text-neutral-300"
                >{locs.ai_assisted_about_title}</h2>
                                <CpuIconSVG aria-hidden width={24} height={24} className="w-6 h-auto sm:w-7 text-neutral-600 dark:text-neutral-400" />
            </div>
            <p className="mt-2 text-sm">
                {split_ai_assistance_aside[0]}
                {tools.map((it, ind) => (
                    <span key={it.llm_name}>
                        <span
                            className="font-mono font-semibold text-xs tracking-tight whitespace-nowrap"
                            style={{ wordSpacing: "-0.25em" }}
                        >
                            {it.llm_name}
                        </span>
                        {" "}
                        (
                        <span
                            className="font-mono text-xs tracking-tight whitespace-nowrap"
                            style={{ wordSpacing: "-0.25em" }}
                        >
                            {it.llm_version}
                        </span>

                        {", "}
                        <Link className="md_art_a" target="_blank" rel="noreferrer nooppener" to={it.llm_vendor_url}>{it.llm_vendor_name}</Link>)

                        {enumeratedBinding({ and: locs.and, ind, arr: tools })}
                    </span>
                ))}
                {" "}
                {split_ai_assistance_aside[1]}
            </p>
        </aside>
    )
}