import { valueToRgb } from "~/site/utils/colors";

// --- Shared constants 

const ARC_START_DEG = 225;
const ARC_SPAN_DEG = 270;

const THEME = {
    dark: {
        bg: "#111111",
        border: "#2d2d2d",
        borderHover: "#555555",
        text: "#ffffff",
        subtext: "#eeeeee",
        chip: "#bbb",
        shadow: "0 2px 8px rgba(0,0,0,0.5)",
        shadowHover: "0 6px 20px rgba(0,0,0,0.7)",
        meterBg: "#111111",
        track: "#222222",
        scoreText: "#ffffff",
        labelText: "#ddd",
    },
    light: {
        bg: "#ffffff",
        border: "#e4e4e7",
        borderHover: "#a1a1aa",
        text: "#18181b",
        subtext: "#222222",
        chip: "#555",
        shadow: "0 1px 4px rgba(0,0,0,0.1)",
        shadowHover: "0 4px 14px rgba(0,0,0,0.15)",
        meterBg: "#ffffff",
        track: "#d4d4d8",
        scoreText: "#18181b",
        labelText: "#333",
    },
} as const;

const fontSans = `'Mada Variable', 'Mada', 'Source Sans Pro', 'Source Sans 3', 'Segoe UI', -apple-system, BlinkMacSystemFont, Tahoma, 'Geeza Pro', 'Arial Nova', sans-serif`;
const fontMono = `'Ubuntu Sans Mono Variable', 'Ubuntu Mono', 'SF Mono', 'Segoe UI Mono', Menlo, Monaco, Consolas, 'Liberation Mono', monospace`;

const fontSizeChipBase = 6;
const fontSizeTextBase = 4.5;
const fontSizeTagBase = 6;

const chipText = "webaudits.org"

type ThemeTokens = typeof THEME[keyof typeof THEME];

function arcD(cx: number, cy: number, r: number, startDeg: number, sweepDeg: number): string {
    const toXY = (deg: number) => {
        const rad = ((deg - 90) * Math.PI) / 180;
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    };
    const s = toXY(startDeg), e = toXY(startDeg + sweepDeg);
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${sweepDeg > 180 ? 1 : 0} 1 ${e.x} ${e.y}`;
}

// --- badge

export type EmbedTheme = "dark" | "light" | "auto";
export type EmbedFormat = "html" | "jsx";

export interface BuildEmbedParams {
    score: number;
    minValue?: number;
    maxValue?: number;
    auditName: string; // ECOS 
    badgeTitle: string; // ECOS Audit
    tagline?: string;
    href: string;
    theme: EmbedTheme;
    meterSize: number;
    format: EmbedFormat;
}

// --- geometry

interface Geometry {
    size: number; sw: number; cx: number; cy: number; r: number;
    clamped: number; filled: number; arcColor: string;
}

const n = (v: number) => parseFloat(v.toFixed(4));

function geom(score: number, minValue: number, maxValue: number, size: number): Geometry {
    const sw = size * 0.085;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - sw / 2 - 2;
    const clamped = Math.min(maxValue, Math.max(minValue, score));
    const filled = ((clamped - minValue) / (maxValue - minValue)) * ARC_SPAN_DEG;
    const arcColor = `rgb(${valueToRgb(clamped, minValue, maxValue)})`;
    return { size, sw, cx, cy, r, clamped, filled, arcColor };
}

// -- svg builders

function svgHTML(g: Geometry, mt: ThemeTokens, auditName: string): string {
    const fill = g.filled > 0.5
        ? `<path d="${arcD(g.cx, g.cy, g.r, ARC_START_DEG, g.filled)}" fill="none" stroke="${g.arcColor}" stroke-width="${n(g.sw)}" stroke-linecap="round"/>`
        : "";
    return (
        `<svg width="${g.size}" height="${g.size}" viewBox="0 0 ${g.size} ${g.size}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${auditName}: ${Math.round(g.clamped)}" style="display:block;flex-shrink:0">` +
        `<rect x="0" y="0" width="${g.size}" height="${g.size}" fill="${mt.meterBg}" rx="${n(g.size * 0.07)}"/>` +
        `<path d="${arcD(g.cx, g.cy, g.r, ARC_START_DEG, ARC_SPAN_DEG)}" fill="none" stroke="${mt.track}" stroke-width="${n(g.sw)}" stroke-linecap="round"/>` +
        fill +
        `<text x="${g.cx}" y="${n(g.cy - g.size * 0.04)}" text-anchor="middle" dominant-baseline="central" font-size="${n(g.size * 0.24)}" font-weight="400" font-family="${fontMono}" fill="${mt.scoreText}">${Math.round(g.clamped)}</text>` +
        `<text x="${g.cx}" y="${n(g.cy + g.size * 0.195)}" text-anchor="middle" dominant-baseline="central" font-size="${n(g.size * 0.11)}" font-weight="400" font-family="${fontSans}" fill="${mt.labelText}" letter-spacing="0.04em">${auditName}</text>` +
        `</svg>`
    );
}

function svgJSX(g: Geometry, mt: ThemeTokens, auditName: string): string {
    const fill = g.filled > 0.5
        ? `<path d="${arcD(g.cx, g.cy, g.r, ARC_START_DEG, g.filled)}" fill="none" stroke="${g.arcColor}" strokeWidth={${n(g.sw)}} strokeLinecap="round"/>`
        : "";
    return (
        `<svg width={${g.size}} height={${g.size}} viewBox="0 0 ${g.size} ${g.size}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${auditName}: ${Math.round(g.clamped)}" style={{display:"block",flexShrink:0}}>` +
        `<rect x={0} y={0} width={${g.size}} height={${g.size}} fill="${mt.meterBg}" rx={${n(g.size * 0.07)}}/>` +
        `<path d="${arcD(g.cx, g.cy, g.r, ARC_START_DEG, ARC_SPAN_DEG)}" fill="none" stroke="${mt.track}" strokeWidth={${n(g.sw)}} strokeLinecap="round"/>` +
        fill +
        `<text x={${g.cx}} y={${n(g.cy - g.size * 0.04)}} textAnchor="middle" dominantBaseline="central" fontSize={${n(g.size * 0.24)}} fontWeight={400} fontFamily="${fontMono}" fill="${mt.scoreText}">{${Math.round(g.clamped)}}</text>` +
        `<text x={${g.cx}} y={${n(g.cy + g.size * 0.195)}} textAnchor="middle" dominantBaseline="central" fontSize={${n(g.size * 0.11)}} fontWeight={400} fontFamily="${fontSans}" fill="${mt.labelText}" letterSpacing="0.04em">${auditName}</text>` +
        `</svg>`
    );
}

// --- style helpers 

function inlineStyle(obj: Record<string, string | number>): string {
    return Object.entries(obj)
        .map(([k, v]) => `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}:${v}`)
        .join(";");
}

function jsxStyle(obj: Record<string, string | number>): string {
    return `{{${Object.entries(obj).map(([k, v]) => `${k}:${typeof v === "string" ? `"${v}"` : v}`).join(",")}}}`;
}

// --- markup

export function buildEmbedHTML({
    score,
    minValue = 0,
    maxValue = 100,
    auditName,
    badgeTitle,
    tagline,
    href,
    theme,
    meterSize = 88,
    format,
}: BuildEmbedParams): string {
    return format === "jsx"
        ? embedJSX({ score, minValue, maxValue, auditName, badgeTitle, tagline, href, theme, meterSize, format })
        : embedHTML({ score, minValue, maxValue, auditName, badgeTitle, tagline, href, theme, meterSize, format });
}

// --- html markup

function embedHTML({ score, minValue, maxValue, auditName, badgeTitle, tagline, href, theme, meterSize }: BuildEmbedParams): string {
    const uid = `wab-${Math.random().toString(36).slice(2, 9)}`;
    const g = geom(score, minValue!, maxValue!, meterSize);
    const fontSizeChip = Math.round(meterSize / fontSizeChipBase);
    const fontSizeText = Math.round(meterSize / fontSizeTextBase);
    const fontSizeTag = Math.round(meterSize / fontSizeTagBase);

    const linkBase = inlineStyle({ display: "inline-flex", alignItems: "center", gap: "12px", padding: "10px 18px 10px 10px", borderRadius: "14px", textDecoration: "none", fontFamily: fontSans, transition: "box-shadow .15s,border-color .15s" });
    const metaStyle = inlineStyle({ display: "flex", flexDirection: "column", gap: "3px" });
    const chipStyle = inlineStyle({ fontSize: `${fontSizeChip}px`, fontWeight: "400", letterSpacing: ".07em", lineHeight: "1" });
    const nameStyle = inlineStyle({ fontSize: `${fontSizeText}px`, fontWeight: "600", lineHeight: "1.3" });
    const tagStyle = inlineStyle({ fontSize: `${fontSizeTag}px`, fontWeight: "300", lineHeight: "1" });

    if (theme !== "auto") {
        const tk = THEME[theme];
        const tag = tagline ? `<span style="${tagStyle};color:${tk.subtext}">${tagline}</span>` : "";
        const css =
            `#${uid}{border:1px solid ${tk.border};background:${tk.bg};color:${tk.text};box-shadow:${tk.shadow}}` +
            `#${uid}:hover{box-shadow:${tk.shadowHover};border-color:${tk.borderHover}}` +
            `#${uid}:focus-visible{outline:2px solid ${g.arcColor};outline-offset:3px;border-color:${tk.borderHover}}`;
        return (
            `<style>${css}</style>` +
            `<a id="${uid}" href="${href}" target="_blank" rel="noopener noreferrer" style="${linkBase}" aria-label="${badgeTitle} audit score">` +
            svgHTML(g, tk, auditName) +
            `<span style="${metaStyle}">` +
            `<span style="${chipStyle};color:${tk.chip}">${chipText}</span>` +
            `<span style="${nameStyle};color:${tk.text}">${badgeTitle}</span>` +
            tag +
            `</span>` +
            `</a>`
        );
    }

    // auto
    const D = THEME.dark, L = THEME.light;
    const tL = `--${uid}-bg:${L.bg};--${uid}-b:${L.border};--${uid}-bh:${L.borderHover};--${uid}-tx:${L.text};--${uid}-st:${L.subtext};--${uid}-ch:${L.chip};--${uid}-s:${L.shadow};--${uid}-sh:${L.shadowHover}`;
    const tD = `--${uid}-bg:${D.bg};--${uid}-b:${D.border};--${uid}-bh:${D.borderHover};--${uid}-tx:${D.text};--${uid}-st:${D.subtext};--${uid}-ch:${D.chip};--${uid}-s:${D.shadow};--${uid}-sh:${D.shadowHover}`;
    const cL = `${uid}-l`, cD = `${uid}-d`;
    const tag = tagline ? `<span style="${tagStyle};color:var(--${uid}-st)">${tagline}</span>` : "";
    const css =
        `#${uid}{${tL}}` +
        `@media(prefers-color-scheme:dark){#${uid}{${tD}}}` +
        `.dark #${uid},.dark-theme #${uid},.theme-dark #${uid}{${tD}}` +
        `.light #${uid},.light-theme #${uid},.theme-light #${uid}{${tL}}` +
        `#${uid}{border:1px solid var(--${uid}-b);background:var(--${uid}-bg);color:var(--${uid}-tx);box-shadow:var(--${uid}-s)}` +
        `#${uid}:hover{box-shadow:var(--${uid}-sh);border-color:var(--${uid}-bh)}` +
        `#${uid}:focus-visible{outline:2px solid ${g.arcColor};outline-offset:3px;border-color:var(--${uid}-bh)}` +
        `.${cL}{display:block}.${cD}{display:none}` +
        `@media(prefers-color-scheme:dark){.${cL}{display:none}.${cD}{display:block}}` +
        `.dark .${cL},.dark-theme .${cL},.theme-dark .${cL}{display:none}` +
        `.dark .${cD},.dark-theme .${cD},.theme-dark .${cD}{display:block}` +
        `.light .${cL},.light-theme .${cL},.theme-light .${cL}{display:block}` +
        `.light .${cD},.light-theme .${cD},.theme-light .${cD}{display:none}`;
    return (
        `<style>${css}</style>` +
        `<a id="${uid}" href="${href}" target="_blank" rel="noopener noreferrer" style="${linkBase}" aria-label="${badgeTitle} audit score">` +
        `<span class="${cL}">${svgHTML(g, L, auditName)}</span>` +
        `<span class="${cD}">${svgHTML(g, D, auditName)}</span>` +
        `<span style="${metaStyle}">` +
        `<span style="${chipStyle};color:var(--${uid}-ch)">${chipText}</span>` +
        `<span style="${nameStyle};color:var(--${uid}-tx)">${badgeTitle}</span>` +
        tag +
        `</span>` +
        `</a>`
    );
}

// --- jsx / react markup


function embedJSX({ score, minValue, maxValue, auditName, badgeTitle, tagline, href, theme, meterSize }: BuildEmbedParams): string {
    const uid = `wab-${Math.random().toString(36).slice(2, 9)}`;
    const g = geom(score, minValue!, maxValue!, meterSize);
    const fontSizeChip = Math.round(meterSize / fontSizeChipBase);
    const fontSizeText = Math.round(meterSize / fontSizeTextBase);
    const fontSizeTag = Math.round(meterSize / fontSizeTagBase);

    const metaStyle = `{{display:"flex",flexDirection:"column",gap:3}}`;
    const chipStyleObj = `{{fontSize:${fontSizeChip},fontWeight:400,letterSpacing:"0.07em",lineHeight:1}}`;
    const nameStyleObj = `{{fontSize:${fontSizeText},fontWeight:600,lineHeight:1.3}}`;
    const tagStyleObj = `{{fontSize:${fontSizeTag},fontWeight:300,lineHeight:1}}`;

    if (theme !== "auto") {
        const tk = THEME[theme];
        const tag = tagline
            ? `    <span style=${tagStyleObj.replace("}}", `,color:"${tk.subtext}"}}`)}>${tagline}</span>\n`
            : "";
        const css =
            `.${uid}{display:inline-flex;align-items:center;gap:12px;padding:10px 18px 10px 10px;border-radius:14px;text-decoration:none;font-family:${fontSans};transition:box-shadow .15s,border-color .15s;border:1px solid ${tk.border};background:${tk.bg};color:${tk.text};box-shadow:${tk.shadow};outline:none}` +
            `.${uid}:hover{box-shadow:${tk.shadowHover};border-color:${tk.borderHover}}` +
            `.${uid}:focus-visible{outline:2px solid ${g.arcColor};outline-offset:3px;border-color:${tk.borderHover}}`;
        return (
            `<>\n` +
            `<style>{\`${css}\`}</style>\n` +
            `<a className="${uid}" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${badgeTitle} audit score">\n` +
            `  ${svgJSX(g, tk, auditName)}\n` +
            `  <span style=${metaStyle}>\n` +
            `    <span style=${chipStyleObj.replace("}}", `,color:"${tk.chip}"}}`)}>${chipText}</span>\n` +
            `    <span style=${nameStyleObj.replace("}}", `,color:"${tk.text}"}}`)}>${badgeTitle}</span>\n` +
            tag +
            `  </span>\n` +
            `</a>\n</>`
        );
    }

    // auto
    const D = THEME.dark, L = THEME.light;
    const cL = `${uid}-l`, cD = `${uid}-d`, wrap = `${uid}-w`;
    const tL = `--${uid}-bg:${L.bg};--${uid}-b:${L.border};--${uid}-bh:${L.borderHover};--${uid}-tx:${L.text};--${uid}-st:${L.subtext};--${uid}-ch:${L.chip};--${uid}-s:${L.shadow};--${uid}-sh:${L.shadowHover}`;
    const tD = `--${uid}-bg:${D.bg};--${uid}-b:${D.border};--${uid}-bh:${D.borderHover};--${uid}-tx:${D.text};--${uid}-st:${D.subtext};--${uid}-ch:${D.chip};--${uid}-s:${D.shadow};--${uid}-sh:${D.shadowHover}`;
    const tag = tagline
        ? `    <span style=${tagStyleObj.replace("}}", `,color:\`var(--${uid}-st)\`}}`)}>${tagline}</span>\n`
        : "";
    const css =
        `.${wrap}{${tL}}` +
        `@media(prefers-color-scheme:dark){.${wrap}{${tD}}}` +
        `.dark .${wrap},.dark-theme .${wrap},.theme-dark .${wrap}{${tD}}` +
        `.light .${wrap},.light-theme .${wrap},.theme-light .${wrap}{${tL}}` +
        `.${uid}{display:inline-flex;align-items:center;gap:12px;padding:10px 18px 10px 10px;border-radius:14px;text-decoration:none;font-family:${fontSans};transition:box-shadow .15s,border-color .15s;border:1px solid var(--${uid}-b);background:var(--${uid}-bg);color:var(--${uid}-tx);box-shadow:var(--${uid}-s);outline:none}` +
        `.${uid}:hover{box-shadow:var(--${uid}-sh);border-color:var(--${uid}-bh)}` +
        `.${uid}:focus-visible{outline:2px solid ${g.arcColor};outline-offset:3px;border-color:var(--${uid}-bh)}` +
        `.${cL}{display:block}.${cD}{display:none}` +
        `@media(prefers-color-scheme:dark){.${cL}{display:none}.${cD}{display:block}}` +
        `.dark .${cL},.dark-theme .${cL},.theme-dark .${cL}{display:none}` +
        `.dark .${cD},.dark-theme .${cD},.theme-dark .${cD}{display:block}` +
        `.light .${cL},.light-theme .${cL},.theme-light .${cL}{display:block}` +
        `.light .${cD},.light-theme .${cD},.theme-light .${cD}{display:none}`;
    return (
        `<>\n` +
        `<style>{\`${css}\`}</style>\n` +
        `<span className="${wrap}">\n` +
        `  <a className="${uid}" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${badgeTitle} audit score">\n` +
        `    <span className="${cL}">${svgJSX(g, L, auditName)}</span>\n` +
        `    <span className="${cD}">${svgJSX(g, D, auditName)}</span>\n` +
        `    <span style=${metaStyle}>\n` +
        `      <span style=${chipStyleObj.replace("}}", `,color:\`var(--${uid}-ch)\`}}`)}>${chipText}</span>\n` +
        `      <span style=${nameStyleObj.replace("}}", `,color:\`var(--${uid}-tx)\`}}`)}>${badgeTitle}</span>\n` +
        tag +
        `    </span>\n` +
        `  </a>\n` +
        `</span>\n</>`
    );
}

// --- preview badge 

export type PreviewTheme = "dark" | "light" | "auto";

export interface AuditBadgePreviewProps {
    score: number;
    minValue?: number;
    maxValue?: number;
    auditName: string;
    badgeTitle: string;
    tagline?: string;
    href: string;
    theme?: PreviewTheme;
    meterSize?: number;
}

function Meter({ score, minValue, maxValue, auditName, mt, size }: {
    score: number; minValue: number; maxValue: number;
    auditName: string; mt: ThemeTokens; size: number;
}) {
    const sw = size * 0.085;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - sw / 2 - 2;
    const clamped = Math.min(maxValue, Math.max(minValue, score));
    const filled = ((clamped - minValue) / (maxValue - minValue)) * ARC_SPAN_DEG;
    const arcColor = `rgb(${valueToRgb(clamped, minValue, maxValue)})`;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
            role="img" aria-label={`${auditName}: ${Math.round(clamped)}`}
            style={{ display: "block", flexShrink: 0 }}>
            <rect x={0} y={0} width={size} height={size} fill={mt.meterBg} rx={size * 0.07} />
            <path d={arcD(cx, cy, r, ARC_START_DEG, ARC_SPAN_DEG)}
                fill="none" stroke={mt.track} strokeWidth={sw} strokeLinecap="round" />
            {filled > 0.5 && (
                <path d={arcD(cx, cy, r, ARC_START_DEG, filled)}
                    fill="none" stroke={arcColor} strokeWidth={sw} strokeLinecap="round" />
            )}
            <text x={cx} y={cy - size * 0.04} textAnchor="middle" dominantBaseline="central"
                fontSize={size * 0.24} fontWeight={400} fontFamily={fontMono} fill={mt.scoreText}>
                {Math.round(clamped)}
            </text>
            <text x={cx} y={cy + size * 0.195} textAnchor="middle" dominantBaseline="central"
                fontSize={size * 0.11} fontWeight={400} fontFamily={fontSans}
                fill={mt.labelText} letterSpacing="0.04em">
                {auditName}
            </text>
        </svg>
    );
}

export function AuditBadgePreview({
    score,
    minValue = 0,
    maxValue = 100,
    auditName,
    badgeTitle,
    tagline,
    href,
    theme = "auto",
    meterSize = 88,
}: AuditBadgePreviewProps) {
    const resolvedTheme = theme === "auto" ? "light" : theme;
    const t = THEME[resolvedTheme];
    const arcColor = `rgb(${valueToRgb(Math.min(maxValue, Math.max(minValue, score)), minValue, maxValue)})`;
    const fontSizeChip = Math.round(meterSize / fontSizeChipBase);
    const fontSizeText = Math.round(meterSize / fontSizeTextBase);
    const fontSizeTag = Math.round(meterSize / fontSizeTagBase);

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${badgeTitle} audit score: ${score}`}
            className="audit-badge-preview"
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 18px 10px 10px",
                borderRadius: 14,
                textDecoration: "none",
                fontFamily: fontSans,
                transition: "box-shadow 0.15s, border-color 0.15s",
                border: `1px solid ${t.border}`,
                background: t.bg,
                color: t.text,
                boxShadow: t.shadow,
                ["--badge-arc-color" as string]: arcColor,
            }}
        >
            <Meter
                score={score} minValue={minValue} maxValue={maxValue}
                auditName={auditName} mt={t} size={meterSize}
            />
            <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{
                    fontSize: fontSizeChip, fontWeight: 400,
                    letterSpacing: "0.07em", color: t.chip, lineHeight: 1
                }}>
                    ${chipText}
                </span>
                <span style={{
                    fontSize: fontSizeText, fontWeight: 600,
                    color: t.text, lineHeight: 1.3
                }}>
                    {badgeTitle}
                </span>
                {tagline && (
                    <span style={{
                        fontSize: fontSizeTag, fontWeight: 300,
                        color: t.subtext, lineHeight: 1
                    }}>
                        {tagline}
                    </span>
                )}
            </span>
        </a>
    );
}

export default AuditBadgePreview;
