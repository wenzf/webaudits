
import { Pie } from "@visx/shape";
import { Group } from "@visx/group";
import { useId, type HTMLAttributes } from "react";

import { valueToRgb } from "~/site/utils/colors";
import { clamp } from "~/site/utils/numbers";

const defaultMargin = { top: 5, right: 5, bottom: 5, left: 5 };

export type PieProps = {
    width: number;
    margin?: typeof defaultMargin;
    score: { value: number, min: number, max: number },
    figCaption?: string
    svgProps?: HTMLAttributes<SVGElement>
};

export default function VisxPieScoreMeter({
    width,
    margin = defaultMargin,
    score,
    figCaption,
    svgProps,
    title,
    aria_label
}: PieProps & { title: string, aria_label: string }) {
    const height = width * 0.5
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const radius = Math.min(innerWidth, innerHeight);
    const centerY = innerHeight;
    const centerX = innerWidth / 2;
    const top = centerY + margin.top;
    const left = centerX + margin.left;
    const normalizedSize = height + width
    const donutThickness = normalizedSize / 20;

    const id = useId()

    const data = [
        {
            value: score.value - score.min, key: 1,
            style: { fill: `rgba(${valueToRgb(score.value, score.min, score.max)} / 50%)` },
            className: '',
        },
        {
            value: score.max - score.value,
            className: 'fill-neutral-200 dark:fill-neutral-800 stroke-1 stroke-neutral-200 dark:stroke-neutral-800',
            key: 2
        }
    ]

    return (
        <svg
            id={id}
            width={width}
            height={height * 2}
            viewBox={`0 0 ${width} ${height * 2}`}
            focusable={false}
            aria-label={aria_label}
            {...svgProps}
        >
            <title>{title}</title>
            <rect
                width={width}
                height={height * 2}
                className="svg_link_rect fill-white/80 dark:fill-black/80"
                rx={6}
            />
            <Group top={top} left={left} id={id + '-v'}
            >
                <Pie
                    data={data}
                    pieSort={(i) => i.key}
                    pieValue={(d) => d.value}
                    padAngle={normalizedSize / 10000}

                    outerRadius={radius}
                    cornerRadius={normalizedSize / 100}
                    innerRadius={radius - donutThickness}
                    startAngle={- (Math.PI / 1.5)}
                    endAngle={(Math.PI / 1.5)}
                >
                    {(pie) => {
                        return pie.arcs.map((arc, index) => {
                            const { key, className, style } = arc.data;
                            const arcPath = pie.path(arc);
                            if (!arcPath) return null
                            return (
                                <path
                                    style={style}
                                    key={`arc-${key}-${index}`}
                                    d={arcPath}
                                    className={className}
                                />
                            );
                        });
                    }}
                </Pie>

                <text fontSize={normalizedSize / 10}
                    fontFamily="'Ubuntu Sans Mono', monospace"
                    textAnchor="middle"
                    className="fill-neutral-900 dark:fill-neutral-100"
                >
                    {score.value}
                </text>
                <text
                    textAnchor="middle"
                    y={(height * 1.5) / 2}
                    fontSize={clamp(normalizedSize / 12, 11, 44)}
                    className="fill-neutral-900 dark:fill-neutral-100"
                >
                    {figCaption}
                </text>
            </Group>
        </svg>

    );
}
