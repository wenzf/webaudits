import { Pie, arc as d3Arc } from "@visx/shape";
import { scaleOrdinal } from "@visx/scale";
import { Group } from "@visx/group";
import { useId } from "react";


export const VisxDonutWithPie = ({ ...props }: VisxDonutProps & { aria_label: string, title: string }) => {
    const {
        donutThickness = 35,
        width,
        height,
        margin = { top: 48, right: 32, bottom: 48, left: 32 },
        dataDonut,
        dataPie = [],
        aria_label, title
    } = props;
    const uid = useId()

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const radius = Math.min(innerWidth, innerHeight) / 2;
    const centerY = innerHeight / 2;
    const centerX = innerWidth / 2;

    const outerDonutInnerRadius = radius - donutThickness;
    const innerPieGap = 15;
    const innerPieOuterRadius = outerDonutInnerRadius - innerPieGap;
    const innerPieInnerRadius = 0;

    const labelArc = d3Arc()
        .innerRadius(radius + 15)
        .outerRadius(radius + 15);

    const getDonutColor = scaleOrdinal({
        range: ["fill-blue-500/50", " fill-red-500/50", "fill-green-500/50",
            "fill-yellow-500/50", "fill-sky-500/50", "fill-orange-500", "fill-slate-500/50",]
    });

    const getInnerColor = scaleOrdinal({
        range: ["fill-neutral-200/50 dark:fill-neutral-800/50",
            "fill-neutral-200 dark:fill-neutral-800"]
    });

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto bg-white/50 dark:bg-black/50 ring ring-neutral-200 dark:ring-neutral-800"

            aria-label={aria_label}
        >
            <title>{title}</title>
            <Group top={centerY + margin.top} left={centerX + margin.left}>

                <Pie
                    data={dataDonut}
                    pieValue={(d) => d.relative}
                    outerRadius={radius}
                    innerRadius={radius - donutThickness}
                    padAngle={0.02}
                >
                    {({ arcs, path }) => {
                        const labelHeight = 18; // Minimum vertical space per label

                        // calculate the "natural" positions
                        const labelData = arcs.map((arc, i) => {
                            const [centroidX, centroidY] = path.centroid(arc)
                            const [labelX, labelY] = labelArc.centroid(arc)
                            const midAngle = (arc.startAngle + arc.endAngle) / 2
                            const isRightSide = midAngle < Math.PI

                            return {
                                index: i,
                                arc,
                                isRightSide,
                                originalY: labelY,
                                x: labelX,
                                y: labelY, // adjusted
                                centroidX,
                                centroidY
                            };
                        });

                        // adjust y positions to prevent overlap
                        [true, false].forEach((side) => {
                            const sideLabels = labelData
                                .filter((d) => d.isRightSide === side)
                                .sort((a, b) => a.y - b.y)

                            for (let i = 1; i < sideLabels.length; i += 1) {
                                const prev = sideLabels[i - 1]
                                const curr = sideLabels[i]
                                if (curr.y - prev.y < labelHeight) {
                                    curr.y = prev.y + labelHeight;
                                }
                            }
                        });

                        return (
                            <g>
                                {labelData.map((d) => {
                                    const xOffset = d.isRightSide ? 25 : -25
                                    const points = [
                                        [d.centroidX, d.centroidY],
                                        [d.x, d.y], // adjusted bend point
                                        [d.x + xOffset, d.y] // final horizontal line
                                    ];

                                    return (
                                        <g key={`label-${d.index}-${uid}`}>
                                            <path d={path(d.arc)!}
                                                className={getDonutColor(d.arc.data.key)}
                                            />
                                            <polyline
                                                points={points.map((p) => p.join(",")).join(" ")}
                                                fill="none"
                                                className="stroke-neutral-900 dark:stroke-neutral-100"
                                                strokeWidth={1}
                                            />
                                            <text
                                                x={d.x + xOffset + (d.isRightSide ? 5 : -5)}
                                                y={d.y}
                                                dy=".33em"
                                                textAnchor={d.isRightSide ? "start" : "end"}
                                                fontSize={12}
                                                className="fill-neutral-800 dark:fill-neutral-200"
                                            >
                                                {d.arc.data.label} ({d.arc.data.relative}%)
                                            </text>
                                        </g>
                                    );
                                })}
                            </g>
                        );
                    }}
                </Pie>

                <Pie
                    data={dataPie}
                    pieValue={(d) => d.relative}
                    outerRadius={innerPieOuterRadius}
                    innerRadius={innerPieInnerRadius}
                >
                    {({ arcs, path }) => (
                        <g>
                            {arcs.map((arc, i) => {
                                const [centroidX, centroidY] = path.centroid(arc);
                                return (
                                    <g key={`inner-pie-${i}-${uid}`}>
                                        <path
                                            d={path(arc)!}
                                            className={`stroke-neutral-50 dark:stroke-neutral-950 ${getInnerColor(arc.data.label)}`}
                                            strokeWidth={4}
                                        />
                                        <text
                                            x={centroidX}
                                            y={centroidY}
                                            dy=".33em" // Vertically center
                                            className="fill-neutral-950 dark:fill-neutral-50"
                                            fontSize={12}
                                            fontWeight={300}
                                            textAnchor="middle"
                                            pointerEvents="none"
                                        >
                                            {arc.data.label} ({arc.data.relative}%)
                                        </text>
                                    </g>
                                )
                            })}
                        </g>
                    )}
                </Pie>

            </Group>
        </svg>
    );
};

