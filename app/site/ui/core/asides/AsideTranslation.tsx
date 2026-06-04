import { Link, useRouteLoaderData } from "react-router"
import type { AISource, SiteLangs } from "../../../../../types/site"
import { enumeratedBinding } from "~/site/utils/strings"
import LanguageIconSVG from "~/site/icons/languageIconSVG"

export default function AsideTranslation({ source_lang, target_lang, ai_translated, ai_translation_reviewed, id }: {
    source_lang: SiteLangs["lang_code"]
    target_lang: SiteLangs["lang_code"]
    ai_translated?: AISource[],
    ai_translation_reviewed?: boolean
    id?: string
}) {
    const { locTxt: { translated_content } } = useRouteLoaderData('site/routes/layouts/site_layout')
    let base_txt = ""
    if (ai_translated?.length) {
        if (ai_translation_reviewed) {
            base_txt = translated_content.translation_txt_ai_reviewed
        } else {
            base_txt = translated_content.translation_txt_ai
        }
    } else {
        base_txt = translated_content.translation_txt
    }

    const source_lang_clear_text = translated_content?.source_langs?.[source_lang]
    const target_lang_clear_text = translated_content?.target_langs?.[target_lang]

    base_txt = base_txt.replace('{{source_language}}', source_lang_clear_text ?? '')
    base_txt = base_txt.replace('{{target_language}}', target_lang_clear_text ?? '')

    let base_txt_split: string[] = []


    if (ai_translated) {
        base_txt_split = base_txt.split("{{models}}")
    }


    return (
        <aside {...id && { id }}
            className="max-w-[680px] my-12 p-3 rounded text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800"
        >
            <div className="flex gap-3 items-center justify-between pr-2">

                <h2
                    className="text-lg sm:text-xl font-semibold text-neutral-700 dark:text-neutral-300"
                >{translated_content.translated_about_title}</h2>
                <LanguageIconSVG aria-hidden width={24} height={24} className="w-6 h-auto sm:w-7 text-neutral-600 dark:text-neutral-400" />
            </div>

            <p className="my-2 text-sm">
                {(ai_translated && base_txt_split?.length === 2) ? (
                    <>
                        {base_txt_split[0]}
                        {ai_translated.map((it, ind) => (
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

                                {enumeratedBinding({ and: translated_content.and, ind, arr: ai_translated })}
                            </span>
                        ))}
                        {base_txt_split[1]}
                        .
                    </>
                ) : base_txt}
            </p>


        </aside>
    )
}