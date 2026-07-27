import { createElement, type ReactElement } from "react";

import { valueToRgb } from "~/site/utils/colors";

// --- Shared constants

const ARC_START_DEG = 225;
const ARC_SPAN_DEG = 270;

const THEME = {
    dark: {
        bg: "#111111",
        border: "#2d2d2d",
        text: "#ffffff",
        subtext: "#eeeeee",
        chip: "#bbb",
        meterBg: "#111111",
        track: "#222222",
        scoreText: "#ffffff",
        labelText: "#ddd",
    },
    light: {
        bg: "#ffffff",
        border: "#e4e4e7",
        text: "#18181b",
        subtext: "#222222",
        chip: "#555",
        meterBg: "#ffffff",
        track: "#d4d4d8",
        scoreText: "#18181b",
        labelText: "#333",
    },
} as const;

const fontSans = `'Mada Variable', 'Mada', 'Source Sans Pro', 'Source Sans 3', 'Segoe UI', -apple-system, BlinkMacSystemFont, Tahoma, 'Geeza Pro', 'Arial Nova', sans-serif`;
const fontMono = `'Ubuntu Sans Mono Variable', 'Ubuntu Mono', 'SF Mono', 'Segoe UI Mono', Menlo, Monaco, Consolas, 'Liberation Mono', monospace`;

// An <img>-referenced svg (the `auto` theme) resolves fonts on its own, with no
// access to the host page's webfonts — only locally installed families apply.
// Carrying the full stack there is dead weight, so it gets a compact one.
const fontSansCompact = `system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`;
const fontMonoCompact = `ui-monospace, Menlo, Consolas, monospace`;

const fontSizeChipBase = 6;
const fontSizeTextBase = 4.5;
const fontSizeTagBase = 6;

const chipText = "webaudits.org"

// Box metrics of the badge, in px. The embed carries no CSS at all, so these
// drive the <svg> geometry instead of padding/gap/flex declarations.
const BORDER = 1;
const RADIUS = 14;
const PAD_Y = 10;
const PAD_L = 10;
const PAD_R = 18;
const COL_GAP = 12;
const LINE_GAP = 3;

type ThemeTokens = typeof THEME[keyof typeof THEME];

function arcD(cx: number, cy: number, r: number, startDeg: number, sweepDeg: number): string {
    const toXY = (deg: number) => {
        const rad = ((deg - 90) * Math.PI) / 180;
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    };
    const s = toXY(startDeg), e = toXY(startDeg + sweepDeg);
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${sweepDeg > 180 ? 1 : 0} 1 ${e.x} ${e.y}`;
}

// --- element tree
//
// The embed must survive a strict Content-Security-Policy: `style-src 'self'`
// blocks both <style> elements and style="" attributes, which would leave the
// badge completely unstyled on the host page. Everything is therefore drawn as
// one <svg> using presentation attributes, which CSP does not govern.
//
// One tree is built per badge and rendered three ways — HTML string, JSX
// string, React element — so the copy/paste embed and the on-page preview can
// never drift apart.

type Attrs = Record<string, string | number>;
type Node = El | string;

interface El {
    tag: string;
    attrs: Attrs;
    kids: Node[] | null;
}

const el = (tag: string, attrs: Attrs, kids: Node[] | null = null): El => ({ tag, attrs, kids });

const escText = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escAttr = (v: string) => escText(v).replace(/"/g, "&quot;");

// HTML void elements take no trailing slash; svg children do.
const HTML_VOID = new Set(["img", "source"]);

function toHTML(node: Node): string {
    if (typeof node === "string") return escText(node);
    const attrs = Object.entries(node.attrs).map(([k, v]) => ` ${k}="${escAttr(String(v))}"`).join("");
    if (node.kids === null) return `<${node.tag}${attrs}${HTML_VOID.has(node.tag) ? "" : "/"}>`;
    return `<${node.tag}${attrs}>${node.kids.map(toHTML).join("")}</${node.tag}>`;
}

// aria-*/data-*/xmlns keep their hyphens in JSX; every other attribute is
// camelCased. A few have no hyphen to camelCase from and must be spelled out.
const JSX_ATTR: Record<string, string> = { class: "className", srcset: "srcSet" };

const jsxAttrName = (k: string) =>
    JSX_ATTR[k] ?? (/^(aria-|data-|xmlns)/.test(k) ? k
        : k.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()));

function toJSX(node: Node, depth = 0): string {
    const pad = "  ".repeat(depth);
    if (typeof node === "string") return pad + escText(node).replace(/[{}]/g, (c) => `{"${c}"}`);
    const attrs = Object.entries(node.attrs).map(([k, v]) => ` ${jsxAttrName(k)}="${escAttr(String(v))}"`).join("");
    if (node.kids === null) return `${pad}<${node.tag}${attrs}/>`;
    if (node.kids.every((k) => typeof k === "string")) {
        const text = node.kids.map((k) => escText(k as string).replace(/[{}]/g, (c) => `{"${c}"}`)).join("");
        return `${pad}<${node.tag}${attrs}>${text}</${node.tag}>`;
    }
    const kids = node.kids.map((k) => toJSX(k, depth + 1)).join("\n");
    return `${pad}<${node.tag}${attrs}>\n${kids}\n${pad}</${node.tag}>`;
}

function toReact(node: Node, extraProps: Record<string, unknown> = {}, key = 0): ReactElement | string {
    if (typeof node === "string") return node;
    const props: Record<string, unknown> = { key, ...extraProps };
    for (const [k, v] of Object.entries(node.attrs)) props[jsxAttrName(k)] = v;
    return createElement(node.tag, props, node.kids?.map((k, i) => toReact(k, {}, i)));
}

// --- text metrics
//
// Without CSS there is no flex box to size the badge, so the text column has to
// be measured up front. Advance widths are approximated per character in em
// units — close enough for a sans-serif stack, and deliberately generous so the
// text never gets clipped by the svg viewport.

const NARROW = "iljtfrI!|'\".,:;()[]{}";
const WIDE = "mwMW@%";

function charEm(ch: string): number {
    if (ch === " ") return 0.26;
    if (NARROW.includes(ch)) return 0.30;
    if (WIDE.includes(ch)) return 0.86;
    if (ch >= "A" && ch <= "Z") return 0.64;
    if (ch >= "0" && ch <= "9") return 0.56;
    if (ch.charCodeAt(0) > 127) return 0.60;
    return 0.53;
}

function textWidth(text: string, fontSize: number, weight = 400, letterSpacingEm = 0): number {
    let em = 0;
    for (const ch of text) em += charEm(ch);
    const weightFactor = weight >= 600 ? 1.05 : weight <= 300 ? 0.98 : 1;
    return (em * weightFactor + letterSpacingEm * [...text].length) * fontSize;
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

// --- badge svg

interface Fonts { sans: string; mono: string }

function meterNodes(g: Geometry, mt: ThemeTokens, auditName: string, f: Fonts): Node[] {
    const nodes: Node[] = [
        el("rect", { x: 0, y: 0, width: g.size, height: g.size, fill: mt.meterBg, rx: n(g.size * 0.07) }),
        el("path", {
            d: arcD(g.cx, g.cy, g.r, ARC_START_DEG, ARC_SPAN_DEG),
            fill: "none", stroke: mt.track, "stroke-width": n(g.sw), "stroke-linecap": "round",
        }),
    ];
    if (g.filled > 0.5) {
        nodes.push(el("path", {
            d: arcD(g.cx, g.cy, g.r, ARC_START_DEG, g.filled),
            fill: "none", stroke: g.arcColor, "stroke-width": n(g.sw), "stroke-linecap": "round",
        }));
    }
    nodes.push(el("text", {
        x: g.cx, y: n(g.cy - g.size * 0.04), "text-anchor": "middle", "dominant-baseline": "central",
        "font-size": n(g.size * 0.24), "font-weight": 400, "font-family": f.mono, fill: mt.scoreText,
    }, [String(Math.round(g.clamped))]));
    nodes.push(el("text", {
        x: g.cx, y: n(g.cy + g.size * 0.195), "text-anchor": "middle", "dominant-baseline": "central",
        "font-size": n(g.size * 0.11), "font-weight": 400, "font-family": f.sans, fill: mt.labelText,
        "letter-spacing": "0.04em",
    }, [auditName]));
    return nodes;
}

interface BadgeParams {
    score: number;
    minValue: number;
    maxValue: number;
    auditName: string;
    badgeTitle: string;
    tagline?: string;
    meterSize: number;
}

function badgeSVG(p: BadgeParams, mt: ThemeTokens, label: string, f: Fonts): El {
    const g = geom(p.score, p.minValue, p.maxValue, p.meterSize);
    const fontSizeChip = Math.round(p.meterSize / fontSizeChipBase);
    const fontSizeText = Math.round(p.meterSize / fontSizeTextBase);
    const fontSizeTag = Math.round(p.meterSize / fontSizeTagBase);

    const chipLH = fontSizeChip;
    const nameLH = Math.round(fontSizeText * 1.3);
    const tagLH = fontSizeTag;
    const textH = chipLH + LINE_GAP + nameLH + (p.tagline ? LINE_GAP + tagLH : 0);
    const textW = Math.ceil(Math.max(
        textWidth(chipText, fontSizeChip, 400, 0.07),
        textWidth(p.badgeTitle, fontSizeText, 600),
        p.tagline ? textWidth(p.tagline, fontSizeTag, 300) : 0,
    ) * 1.04);

    const W = BORDER * 2 + PAD_L + p.meterSize + COL_GAP + textW + PAD_R;
    const H = BORDER * 2 + PAD_Y * 2 + Math.max(p.meterSize, textH);

    const meterX = BORDER + PAD_L;
    const meterY = n((H - p.meterSize) / 2);
    const textX = meterX + p.meterSize + COL_GAP;
    const textTop = (H - textH) / 2;

    const line = (cy: number, size: number, weight: number, fill: string, text: string, tracking?: string) =>
        el("text", {
            x: textX, y: n(cy), "dominant-baseline": "central",
            "font-size": size, "font-weight": weight, "font-family": f.sans, fill,
            ...(tracking ? { "letter-spacing": tracking } : {}),
        }, [text]);

    const kids: Node[] = [
        el("rect", {
            x: n(BORDER / 2), y: n(BORDER / 2), width: n(W - BORDER), height: n(H - BORDER),
            rx: RADIUS, fill: mt.bg, stroke: mt.border, "stroke-width": BORDER,
        }),
        el("g", { transform: `translate(${meterX} ${meterY})` }, meterNodes(g, mt, p.auditName, f)),
        line(textTop + chipLH / 2, fontSizeChip, 400, mt.chip, chipText, "0.07em"),
        line(textTop + chipLH + LINE_GAP + nameLH / 2, fontSizeText, 600, mt.text, p.badgeTitle),
    ];
    if (p.tagline) {
        kids.push(line(textTop + chipLH + LINE_GAP + nameLH + LINE_GAP + tagLH / 2, fontSizeTag, 300, mt.subtext, p.tagline));
    }

    return el("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: W, height: H, viewBox: `0 0 ${W} ${H}`,
        role: "img", "aria-label": label,
    }, kids);
}

// --- markup

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

const dataURI = (svg: El) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(toHTML(svg))}`;

function embedTree(p: Required<Pick<BuildEmbedParams, "score" | "minValue" | "maxValue" | "auditName" | "badgeTitle" | "href" | "theme" | "meterSize">> & { tagline?: string }): El {
    const badge: BadgeParams = {
        score: p.score, minValue: p.minValue, maxValue: p.maxValue,
        auditName: p.auditName, badgeTitle: p.badgeTitle, tagline: p.tagline, meterSize: p.meterSize,
    };
    const label = `${p.badgeTitle}: ${Math.round(Math.min(p.maxValue, Math.max(p.minValue, p.score)))} of ${p.maxValue}`;
    const anchor = (kids: Node[]) => el("a", {
        href: p.href, target: "_blank", rel: "noopener noreferrer", "aria-label": label,
    }, kids);

    if (p.theme !== "auto") {
        // Inline svg: nothing to block, nothing to load.
        const svg = badgeSVG(badge, THEME[p.theme], label, { sans: fontSans, mono: fontMono });
        svg.attrs["aria-hidden"] = "true";
        delete svg.attrs.role;
        delete svg.attrs["aria-label"];
        return anchor([svg]);
    }

    // `prefers-color-scheme` needs a media query, and every CSS carrier is
    // blocked under a strict policy. <picture> resolves it in markup instead.
    const compact: Fonts = { sans: fontSansCompact, mono: fontMonoCompact };
    const light = badgeSVG(badge, THEME.light, label, compact);
    const dark = badgeSVG(badge, THEME.dark, label, compact);
    return anchor([
        el("picture", {}, [
            el("source", { media: "(prefers-color-scheme: dark)", srcset: dataURI(dark) }),
            el("img", {
                src: dataURI(light), width: light.attrs.width, height: light.attrs.height, alt: label,
            }),
        ]),
    ]);
}

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
    const tree = embedTree({ score, minValue, maxValue, auditName, badgeTitle, tagline, href, theme, meterSize });
    return format === "jsx" ? toJSX(tree) : toHTML(tree);
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
    const arcColor = `rgb(${valueToRgb(Math.min(maxValue, Math.max(minValue, score)), minValue, maxValue)})`;
    const tree = embedTree({ score, minValue, maxValue, auditName, badgeTitle, tagline, href, theme, meterSize });
    // Same tree the visitor copies — the preview cannot drift from the embed.
    return toReact(tree, {
        className: "audit-badge-preview",
        style: { ["--badge-arc-color" as string]: arcColor },
    }) as ReactElement;
}

export default AuditBadgePreview;
