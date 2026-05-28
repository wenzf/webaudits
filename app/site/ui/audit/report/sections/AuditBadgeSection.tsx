import { useParams, useRouteLoaderData } from "react-router";
import * as Slider from '@radix-ui/react-slider'
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

import { titleToAnchor } from "~/site/utils/urls";
import { LvlHeader } from "~/site/ui/core/other/text_elements";
import { decimalToScore } from "~/site/utils/numbers";
import { localizedPath } from "~/common/shared/lang";
import AuditBadgePreview, { buildEmbedHTML } from "../AuditBadge";
import MarkdownWithCustomElements from "~/common/shared/markdown";


function getKilobytes(str: string, decimals = 2): number {
    return parseFloat((new Blob([str]).size / 1024).toFixed(decimals));
}

export default function AuditBadgeSection({ auditResult }: { auditResult: PageAuditResult }) {
    const { locTxt } = useRouteLoaderData('site/routes/pages/audits_ecos_v1_id')
    const params = useParams()
    const [generatedMarkup, setGeneratedMarkup] = useState<null | string>(null)
    const [didCopy, setDidCopy] = useState(false)
    const copyTimeOutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const score = decimalToScore(auditResult.score)
    const href = "https://webaudits.org" + localizedPath(params.lang, "NS_ECOS_V1_ID", params)

    const [badgeSettings, setBadgeSettings] = useState<{
        theme: "light" | "dark" | "auto",
        outputFormat: "html" | "jsx",
        meterSize: number
    }>({ theme: "auto", outputFormat: "html", meterSize: 88 })


    const onGenerateMarkup = async () => {
        const markup = buildEmbedHTML({
            score,
            meterSize: badgeSettings.meterSize,
            format: badgeSettings.outputFormat,
            auditName: "ECOS",
            badgeTitle: "ECOS Audit",
            href,
            theme: badgeSettings.theme,
            tagline: "Efficent • Clean • Open • Safe"
        })

        setGeneratedMarkup(markup)
        if (typeof navigator === "object") await navigator.clipboard.writeText(markup);
        setDidCopy(true)
        copyTimeOutRef.current = setTimeout(() => setDidCopy(false), 3000)
    }


    useEffect(() => {
        return () => {
            if (copyTimeOutRef.current) clearTimeout(copyTimeOutRef.current)
        }
    }, [])


    return (
        <section
            id={titleToAnchor(locTxt.sidebar_labels.sl_badge)}
            data-position={titleToAnchor(locTxt.sidebar_labels.sl_badge)}
            className="my-12 pt-12 mb-36 md:mb-48 p-1"
        >
            <LvlHeader
                itemProp="name"
                content={locTxt.audit_section_titles.ast_badge}
                lvl={0}
                anchorLink={titleToAnchor(locTxt.sidebar_labels.sl_badge)}
            />

            <div className="md_1" itemProp="description">
                <p className="pt-4 pb-8">{locTxt.audit_section_descriptions.asd_badge}</p>
                <div className="flex flex-col md:flex-row">
                    <div className="flex flex-col gap-4 mb-12 w-full md:max-w-md">
                        <div className="flex gap-4 justify-between items-center border-t border-t-neutral-300 dark:border-t-neutral-700 pt-4">
                            <div className="font-medium">{locTxt.badge.color_theme_label}</div>
                            <div className="inline-flex gap-2 p-1 ring ring-neutral-200 dark:ring-neutral-800 rounded-sm"
                                aria-describedby="desc-theme-badge"
                            >
                                {[
                                    ["light", locTxt.badge.color_theme_light],
                                    ["dark", locTxt.badge.color_theme_dark],
                                    ["auto", locTxt.badge.color_theme_system]].map((it) => (
                                        <button
                                            className={clsx("b_1 reg ri", {
                                                active: badgeSettings.theme === it[0]
                                            })}
                                            disabled={badgeSettings.theme === it[0]}
                                            type="button"
                                            key={it[0]}
                                            onClick={() => setBadgeSettings(
                                                (prev) => ({ ...prev, theme: it[0] as any }))}>
                                            {it[1]}
                                        </button>
                                    ))}
                            </div>
                        </div>

                        <div className="text-sm" id="desc-theme-badge">
                            <MarkdownWithCustomElements markup={locTxt.badge.color_theme_desc} />
                        </div>

                        <div className="flex gap-4 justify-between items-center border-t border-t-neutral-300 dark:border-t-neutral-700 pt-4">
                            <div className="font-medium">{locTxt.badge.code_format_label}</div>
                            <div className="inline-flex gap-2 p-1 ring ring-neutral-200 dark:ring-neutral-800 rounded-sm"
                                aria-describedby="desc-outputformat-badge"
                            >
                                {[["html", "HTML"], ["jsx", "React / jsx"]].map((it) => (
                                    <button
                                        className={clsx("b_1 reg ri", {
                                            active: badgeSettings.outputFormat === it[0]
                                        })}
                                        disabled={badgeSettings.outputFormat === it[0]}
                                        type="button"
                                        key={it[0]}

                                        onClick={() => setBadgeSettings(
                                            (prev) => ({ ...prev, outputFormat: it[0] as any }))}>
                                        {it[1]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="text-sm" id="desc-outputformat-badge">
                            <MarkdownWithCustomElements markup={locTxt.badge.code_format_desc} />
                        </div>

                        <div className="flex gap-4 justify-between items-center border-t border-t-neutral-300 dark:border-t-neutral-700 pt-4">
                            <span className="font-medium">
                                {locTxt.badge.size}
                            </span>
                            <Slider.Root
                                className="relative flex h-5 w-[200px] touch-none select-none items-center"
                                defaultValue={[badgeSettings.meterSize]}
                                max={140}
                                min={60}
                                step={1}
                                onValueChange={(e) => setBadgeSettings((prev) => ({
                                    ...prev, meterSize: e[0]
                                }))}
                            >
                                <Slider.Track className="relative h-[3px] grow rounded-full bg-neutral-800/50 dark:bg-neutral-200/50">
                                    <Slider.Range className="absolute h-full rounded-full bg-neutral-800 dark:bg-neutral-200" />
                                </Slider.Track>
                                <Slider.Thumb
                                    aria-label={locTxt.badge.size}
                                    className="block size-5 duration-200 rounded-full bg-neutral-700/90 dark:bg-neutral-300/90 shadow-xs hover:bg-neutral-800 hover:dark:bg-neutral-200 focus:outline-none focus-visible:bg-blue-700 dark:focus-visible:bg-blue-300 cursor-pointer"
                                />
                            </Slider.Root>
                        </div>

                        <div className="border-t border-t-neutral-300 dark:border-t-neutral-700 pt-4">
                            <button type="button"
                                className="b_1 reg ri"
                                onClick={() => onGenerateMarkup()}>
                                {didCopy ? locTxt.badge.code_copied_to_clipboard : locTxt.badge.generate_code}
                            </button>
                        </div>

                        {generatedMarkup ? (
                            <div>
                                <div><code>({getKilobytes(generatedMarkup)} KB)</code></div>
                                <textarea
                                    id="generated-markup"
                                    value={generatedMarkup}
                                    readOnly
                                    className="w-full resize font-mono text-sm bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
                                    rows={10}
                                />
                            </div>
                        ) : null}

                    </div>

                    <div className="flex justify-center grow items-center">
                        <div>
                            <AuditBadgePreview
                                score={score}
                                badgeTitle="ECOS Audit"
                                meterSize={badgeSettings.meterSize}
                                auditName="ECOS"
                                tagline="Efficent • Clean • Open • Safe"
                                href={href}
                                theme={badgeSettings.theme}
                            />
                        </div>
                    </div>
                </div>
            </div>

        </section>
    )
}