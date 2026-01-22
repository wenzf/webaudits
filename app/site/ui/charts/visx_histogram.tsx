import { Bar } from '@visx/shape';
import { scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import clsx from 'clsx';

import { createDataForHistogram } from '~/site/utils/data';


const defaultMargin = { top: 20, right: 20, bottom: 40, left: 60 };


export const HistogramWithVariableBins = ({
    width = 600,
    height = 400,
    margin = defaultMargin,
    barData,
    indicatorValueEnum,
    locTxt
}: {
    width?: number
    height?: number
    barData?: any
    margin?: any,
    indicatorValueEnum: "SLOW" | "AVERAGE" | "FAST"
    locTxt: Record<string, any>
}) => {
    if (width < 10 || height < 10) return null;

    const da = createDataForHistogram(barData.distribution)

    const data = da.bars
    const percentile = barData.percentile

    const xScale = scaleLinear({
        domain: [0, Math.max(da.xMax, percentile * 1.1)],
        range: [margin.left, width - margin.right],
    });

    const yScale = scaleLinear({
        domain: [0, da.yMax * 1.1],
        range: [height - margin.bottom, margin.top],
    });

    const xMax = width - margin.left - margin.right;
    const yMax = height - margin.top - margin.bottom;

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            aria-label={locTxt?.aria_labels_and_titles?.crux_histogram?.aria_label}
            className='bg-white/50 dark:bg-black/50 ring ring-neutral-200 dark:ring-neutral-800 w-full'
        >
            <title>{locTxt?.aria_labels_and_titles?.crux_histogram?.title}</title>
            <Group>
                <GridRows
                    scale={yScale}
                    width={xMax}
                    left={margin.left}
                    top={0}
                    stroke="#7777775c"
                />
                {data.map((d, i) => {
                    const barX = xScale(d.min);
                    const barY = yScale(d.density);
                    const barWidth = xScale(d.max) - xScale(d.min);
                    const barHeight = height - margin.bottom - barY;
                    if (barWidth < 0 || barHeight < 0 || isNaN(barX) || isNaN(barY)) return null;

                    return (
                        <Bar
                            key={`bar-${i}`}
                            x={barX}
                            y={barY}
                            width={barWidth}
                            height={barHeight}
                            className='fill-neutral-200/70 dark:fill-neutral-800/70 stroke-neutral-600/80 dark:stroke-neutral-400/80'
                            strokeWidth={1}

                        />
                    );
                })}
                <g style={{ transform: 'translateX(60px)' }}>
                    <AxisLeft
                        scale={yScale}
                        label={locTxt.diagrams.di_percentile}
                        numTicks={5}
                        labelProps={{ className: 'fill-neutral-800 dark:fill-neutral-200' }}
                        tickLineProps={{ className: 'fill-neutral-800 dark:fill-neutral-200' }}
                        tickLabelProps={{ className: 'fill-neutral-800 dark:fill-neutral-200 font-mono' }}
                    />
                </g>

                <AxisBottom
                    tickFormat={(e) => e.toString()}
                    scale={xScale}
                    top={height - margin.bottom}
                    label="ms"
                    numTicks={5}
                    labelProps={{ className: 'fill-neutral-800 dark:fill-neutral-200' }}
                    tickLineProps={{ className: 'fill-neutral-800 dark:fill-neutral-200' }}
                    tickLabelProps={{ className: 'fill-neutral-800 dark:fill-neutral-200 font-mono' }}
                />
                <rect
                    x={xScale(percentile)}
                    y={margin.bottom - margin.top}
                    height={yMax}
                    width={3}
                    className={clsx({
                        "stroke-red-500/50 fill-red-500/40": indicatorValueEnum === "SLOW",
                        "stroke-orange-500/50 fill-orange-500/40": indicatorValueEnum === "AVERAGE",
                        "stroke-green-500/50 fill-green-500/40": indicatorValueEnum === "FAST",
                    })}

                />
            </Group>
        </svg>
    );
};